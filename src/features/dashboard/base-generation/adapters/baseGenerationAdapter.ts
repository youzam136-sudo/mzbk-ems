import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { BaseGenerationPageData } from '../types/baseGeneration';
import type { BaseGenerationStatusResponse, GridStatusResponseDto, InverterStringDetailDto } from '../api/baseGenerationApi';
import type { MonitoringTargetDto } from '../../../../shared/api/monitoringApi';

type NumberLike = string | number | null | undefined;

const EMPTY_VALUE = '-';
const DONUT_PALETTE = ['#f2994a', '#9aa3ae', '#2f80ed', '#27ae60', '#eb5757', '#9b51e0', '#56ccf2'];

function getRawValue(value: NumberLike) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toNumber(value: NumberLike) {
  const rawValue = getRawValue(value).replace(/,/g, '');

  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getFractionDigits(value: NumberLike, fallbackDigits = 1) {
  const rawValue = getRawValue(value);
  const fractionPart = rawValue.includes('.') ? rawValue.split('.')[1] : '';

  return fractionPart ? Math.min(fractionPart.length, 2) : fallbackDigits;
}

function formatNumber(value: NumberLike, fallbackDigits = 1) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return EMPTY_VALUE;
  }

  const fractionDigits = getFractionDigits(value, fallbackDigits);

  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(numericValue);
}

function toChartNumber(value: NumberLike) {
  return toNumber(value) ?? 0;
}

function getTimeLabel(row: { esmtOperTime?: NumberLike; operTime?: NumberLike }) {
  const time = getRawValue(row.esmtOperTime ?? row.operTime);

  if (time.length >= 5) {
    return time.slice(0, 5);
  }

  return time || EMPTY_VALUE;
}

function getTargetLabel(target: MonitoringTargetDto, index: number) {
  return getRawValue(target.targetName) || `IVT${index + 1}`;
}

/*
 * 필요: 인버터(타겟) N개를 컬럼으로 갖는 운전 상세 표의 2단 헤더를 만든다.
 * 연결: toBaseGenerationPageData.
 * 설명: 타겟 수가 바뀌어도(7개가 아니어도) 그대로 대응하도록 targetList 길이 기준으로 동적 생성한다.
 */
function createPowerTableHeaderRows(targets: MonitoringTargetDto[]): TableHeaderCell[][] {
  return [
    [{ label: 'Time', rowSpan: 2 }, ...targets.map((target, index) => ({ label: getTargetLabel(target, index), colSpan: 2 }))],
    targets.flatMap(() => [{ label: '상태' }, { label: '전력[kW]' }])
  ];
}

/*
 * 필요: 시간대별로 각 인버터의 상태/전력을 한 행에 나열한 운전 상세 표 데이터를 만든다.
 * 연결: toBaseGenerationPageData.
 * 설명: targetSeriesMap이 없는(실제 API가 아직 인버터별 시계열을 못 주는) 경우 전체 열을 '-'로 채운다.
 */
function createPowerTableRows(
  timeLabels: string[],
  targets: MonitoringTargetDto[],
  targetSeriesMap: Record<string, GridStatusResponseDto[]> | undefined
): TableRow[] {
  return timeLabels.map((time, rowIndex) => [
    time,
    ...targets.flatMap((target) => {
      const series = targetSeriesMap?.[getRawValue(target.targetId)];
      const point = series?.[rowIndex];
      return [getRawValue(point?.status) || EMPTY_VALUE, formatNumber(point?.baAtpTot)];
    })
  ]);
}

const inverterDetailHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: '상태', rowSpan: 2 },
    { label: '전력[kW]', colSpan: 2 },
    { label: '누계전력[kWh]', colSpan: 2 },
    { label: 'STRING', colSpan: 9 }
  ],
  [
    { label: '유효' },
    { label: '무효' },
    { label: 'DAY' },
    { label: 'Total' },
    { label: 'P[kW] Max' },
    { label: 'P[kW] Min' },
    { label: 'P[kW] AVG' },
    { label: 'V[V] Max' },
    { label: 'V[V] Min' },
    { label: 'V[V] AVG' },
    { label: 'A[A] Max' },
    { label: 'A[A] Min' },
    { label: 'A[A] AVG' }
  ]
];

function createInverterDetailRows(details: InverterStringDetailDto[]): TableRow[] {
  return details.map((detail) => [
    getTimeLabel(detail),
    getRawValue(detail.status) || EMPTY_VALUE,
    formatNumber(detail.activePower),
    formatNumber(detail.reactivePower),
    formatNumber(detail.dayAccm),
    formatNumber(detail.totalAccm),
    formatNumber(detail.stringPMax),
    formatNumber(detail.stringPMin),
    formatNumber(detail.stringPAvg),
    formatNumber(detail.stringVMax),
    formatNumber(detail.stringVMin),
    formatNumber(detail.stringVAvg),
    formatNumber(detail.stringAMax),
    formatNumber(detail.stringAMin),
    formatNumber(detail.stringAAvg)
  ]);
}

function createTargetOptions(targets: MonitoringTargetDto[]) {
  return targets
    .map((target, index) => {
      const value = getRawValue(target.targetId) || `target-${index + 1}`;
      const label = getTargetLabel(target, index);

      return { label, value };
    })
    .filter((option) => option.value);
}

/*
 * 필요: GRID/인버터 API DTO를 기저발전(태양광) 화면 ViewModel로 변환한다.
 * 연결: useBaseGenerationStatus, BaseGenerationSummarySection, BaseGenerationTableSection.
 * 설명: 2026.08.31 워크샵 반영 스펙 — 인버터(IVT1~N) 개별 상태/전력 표 + STRING 상세 통계로 구조 변경.
 * 수정: 인버터 개수나 STRING 통계 필드가 바뀌면 이 adapter의 매핑만 먼저 조정한다.
 */
export function toBaseGenerationPageData(response: BaseGenerationStatusResponse): BaseGenerationPageData {
  const targets = response.targetList;
  const targetOptions = createTargetOptions(targets);
  const timeLabels = response.statusList.map((row) => getTimeLabel(row));
  const totalSeries = response.statusList.map((row) => toChartNumber(row.baAtpTot));
  const latestTotal = totalSeries.at(-1) ?? toChartNumber(response.latest?.baAtpTot);

  const perTargetLatest = targets.map((target) => {
    const series = response.targetSeriesMap?.[getRawValue(target.targetId)];
    return toChartNumber(series?.at(-1)?.baAtpTot);
  });

  return {
    summary: {
      columns: ['Total', ...targets.map((target, index) => getTargetLabel(target, index))],
      metrics: [
        {
          label: '비중[%]',
          values: [
            '100.0',
            ...perTargetLatest.map((value) => (latestTotal > 0 ? formatNumber((value / latestTotal) * 100) : EMPTY_VALUE))
          ]
        },
        { label: '전력[kW]', values: [formatNumber(latestTotal), ...perTargetLatest.map((value) => formatNumber(value))] }
      ],
      donutData: targets.map((target, index) => ({ name: getTargetLabel(target, index), value: perTargetLatest[index] ?? 0 })),
      donutLegendLabels: targets.map((target, index) => getTargetLabel(target, index)),
      donutColors: DONUT_PALETTE
    },
    trendChart: {
      labels: timeLabels,
      totalOutputSeries: totalSeries,
      lineSeries: targets.map((target, index) => ({
        name: getTargetLabel(target, index),
        data: (response.targetSeriesMap?.[getRawValue(target.targetId)] ?? []).map((point) => toChartNumber(point.baAtpTot))
      }))
    },
    tables: {
      powerTable: {
        ariaLabel: '기저발전 운전 상세 현황',
        minWidth: Math.max(1280, 160 + targets.length * 160),
        headerRows: createPowerTableHeaderRows(targets),
        rows: createPowerTableRows(timeLabels, targets, response.targetSeriesMap),
        allRows: createPowerTableRows(timeLabels, targets, response.targetSeriesMap)
      },
      inverterTable: {
        ariaLabel: '기저발전 인버터 상세 내역',
        minWidth: 1680,
        defaultExpanded: true,
        defaultEquipmentValue: response.selectedTargetId || targetOptions[0]?.value || 'ivt-1',
        equipmentOptions: targetOptions.length ? targetOptions : [{ label: 'IVT1', value: 'ivt-1' }],
        headerRows: inverterDetailHeaderRows,
        rows: createInverterDetailRows(response.detailList)
      }
    },
    targetOptions,
    selectedTargetId: response.selectedTargetId
  };
}
