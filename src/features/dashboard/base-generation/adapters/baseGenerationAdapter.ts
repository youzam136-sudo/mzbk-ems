import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { BaseGenerationPageData } from '../types/baseGeneration';
import type { BaseGenerationStatusResponse, GridStatusResponseDto } from '../api/baseGenerationApi';
import type { MonitoringDetailDto, MonitoringTargetDto } from '../../../../shared/api/monitoringApi';

type NumberLike = string | number | null | undefined;

const EMPTY_VALUE = '-';
const SUMMARY_COLORS = ['#25b6fe', '#f3f6ff'];

const powerTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: 'POWER', colSpan: 3 },
    { label: 'PF', rowSpan: 2 },
    { label: 'ACTIVE.ACCM', colSpan: 4 },
    { label: 'REACTIVE.ACCM', colSpan: 4 }
  ],
  [
    { label: 'ACTIVE' },
    { label: 'REACTIVE' },
    { label: 'APPARENT' },
    { label: 'DAY' },
    { label: 'WEEK' },
    { label: 'MON' },
    { label: 'TOT' },
    { label: 'DAY' },
    { label: 'WEEK' },
    { label: 'MON' },
    { label: 'TOT' }
  ]
];

const inverterTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 3 },
    { label: 'DC', colSpan: 3 },
    { label: 'AC', colSpan: 13 },
    { label: 'PF', rowSpan: 3 }
  ],
  [
    { label: 'P', rowSpan: 2 },
    { label: 'V', rowSpan: 2 },
    { label: 'A', rowSpan: 2 },
    { label: 'P', colSpan: 4 },
    { label: 'V', colSpan: 3 },
    { label: 'A', colSpan: 3 },
    { label: 'Frequency', colSpan: 3 }
  ],
  [
    { label: 'TOT' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' },
    { label: 'L12' },
    { label: 'L23' },
    { label: 'L32' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' }
  ]
];

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

function formatPowerFactor(value: NumberLike) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return EMPTY_VALUE;
  }

  return numericValue > 1 ? (numericValue / 100).toFixed(2) : numericValue.toFixed(2);
}

function toChartNumber(value: NumberLike) {
  return toNumber(value) ?? 0;
}

function getTimeLabel(row: GridStatusResponseDto) {
  const time = getRawValue(row.esmtOperTime);

  if (time.length >= 5) {
    return time.slice(0, 5);
  }

  return time || EMPTY_VALUE;
}

function getSortedRows(rows: GridStatusResponseDto[]) {
  return [...rows].sort((a, b) => {
    const aKey = `${getRawValue(a.esmtOperYmd)} ${getRawValue(a.esmtOperTime)}`;
    const bKey = `${getRawValue(b.esmtOperYmd)} ${getRawValue(b.esmtOperTime)}`;

    return aKey.localeCompare(bKey);
  });
}

function getDisplayRows(response: BaseGenerationStatusResponse) {
  const rows = getSortedRows(response.statusList);

  if (rows.length > 0) {
    return rows;
  }

  return response.latest ? [response.latest] : [];
}

function createPowerTableRows(rows: GridStatusResponseDto[]): TableRow[] {
  return rows.map((row) => [
    getTimeLabel(row),
    formatNumber(row.baAtpTot),
    formatNumber(row.baRtpTot),
    formatNumber(row.baArpTot),
    formatPowerFactor(row.baPfTot),
    formatNumber(row.baAtpDayAccm),
    formatNumber(row.baAtpWeekAccm),
    formatNumber(row.baAtpMonAccm),
    formatNumber(row.baAtpTotAccm),
    formatNumber(row.baRtpDayAccm),
    formatNumber(row.baRtpWeekAccm),
    formatNumber(row.baRtpMonAccm),
    formatNumber(row.baRtpTotAccm)
  ]);
}

function createInverterTableRows(rows: GridStatusResponseDto[]): TableRow[] {
  return rows.map((row) => [
    getTimeLabel(row),
    formatNumber(row.baAtpTot),
    formatNumber(row.baPtpvL12),
    formatNumber(row.baPaL1),
    formatNumber(row.baAtpTot),
    formatNumber(row.baAtpL1),
    formatNumber(row.baAtpL2),
    formatNumber(row.baAtpL3),
    formatNumber(row.baPtpvL12),
    formatNumber(row.baPtpvL23),
    formatNumber(row.baPtpvL31),
    formatNumber(row.baPaL1),
    formatNumber(row.baPaL2),
    formatNumber(row.baPaL3),
    formatNumber(row.baPfrL1),
    formatNumber(row.baPfrL2),
    formatNumber(row.baPfrL3),
    formatPowerFactor(row.baPfTot)
  ]);
}

function createTargetOptions(targets: MonitoringTargetDto[]) {
  return targets
    .map((target, index) => {
      const value = getRawValue(target.targetId) || `target-${index + 1}`;
      const label = getRawValue(target.targetName) || `대상 #${index + 1}`;

      return { label, value };
    })
    .filter((option) => option.value);
}

function createDetailTableRows(details: MonitoringDetailDto[]): TableRow[] {
  return details.map((detail) => [
    getTimeLabel({ esmtOperTime: detail.operTime }),
    formatNumber(detail.detailValue1),
    formatNumber(detail.detailValue2),
    formatNumber(detail.detailValue3),
    formatNumber(detail.detailValue1),
    formatNumber(detail.detailValue2),
    formatNumber(detail.detailValue3),
    formatNumber(detail.detailValue4),
    formatNumber(detail.detailValue2),
    formatNumber(detail.detailValue3),
    formatNumber(detail.detailValue4),
    formatNumber(detail.detailValue1),
    formatNumber(detail.detailValue2),
    formatNumber(detail.detailValue3),
    formatNumber(detail.detailValue4),
    formatNumber(detail.detailValue5),
    formatNumber(detail.detailValue5),
    formatNumber(detail.detailValue5)
  ]);
}

/*
 * 필요: GRID API DTO를 기저발전 공통 화면 ViewModel로 변환한다.
 * 연결: useBaseGenerationStatus, BaseGenerationSummarySection, BaseGenerationTableSection.
 * 설명: 컴포넌트에는 API 필드명과 fallback 규칙을 두지 않고, targetList/detail 값을 화면 계약으로 바꾼다.
 * 수정: 기저발전 API 필드 의미나 상세 표 매핑이 바뀌면 이 adapter의 매핑만 먼저 조정한다.
 */
export function toBaseGenerationPageData(response: BaseGenerationStatusResponse): BaseGenerationPageData {
  const rows = getDisplayRows(response);
  const latest = response.latest ?? rows.at(-1) ?? null;
  const activeTotal = latest?.baAtpTot;
  const reactiveTotal = latest?.baRtpTot;
  const targetOptions = createTargetOptions(response.targetList);
  const detailRows = response.detailList.length ? createDetailTableRows(response.detailList) : createInverterTableRows(rows);

  return {
    summary: {
      columns: ['Total', 'GRID'],
      metrics: [
        { label: '발전비중(%)', values: ['100.0', formatNumber(latest?.lgldGbcd ?? 100)] },
        { label: '발전량(kWh)', values: [formatNumber(activeTotal), formatNumber(activeTotal)] }
      ],
      donutData: [
        { name: '유효전력', value: toChartNumber(activeTotal) },
        { name: '무효전력', value: toChartNumber(reactiveTotal) }
      ],
      donutLegendLabels: ['유효전력', '무효전력'],
      donutColors: SUMMARY_COLORS
    },
    trendChart: {
      labels: rows.map((row) => getTimeLabel(row)),
      totalOutputSeries: rows.map((row) => toChartNumber(row.baAtpTot)),
      lineSeries: rows.map((row) => toChartNumber(row.baRtpTot))
    },
    tables: {
      powerTable: {
        ariaLabel: '기저발전 운전 상세 현황',
        minWidth: 1280,
        headerRows: powerTableHeaderRows,
        rows: createPowerTableRows(rows.slice(-5)),
        allRows: createPowerTableRows(rows)
      },
      inverterTable: {
        ariaLabel: '기저발전 GRID 상세 내역',
        minWidth: 1880,
        defaultExpanded: true,
        defaultEquipmentValue: response.selectedTargetId || targetOptions[0]?.value || 'grid-1',
        equipmentOptions: targetOptions.length ? targetOptions : [{ label: 'GRID #1', value: 'grid-1' }],
        headerRows: inverterTableHeaderRows,
        rows: detailRows
      }
    },
    targetOptions,
    selectedTargetId: response.selectedTargetId
  };
}
