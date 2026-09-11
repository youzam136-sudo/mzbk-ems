import { useMemo } from 'react';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { isSingleDayRange } from '../../../../shared/utils/hourlyChartSlots';
import type { SupportGenerationHistoryMode } from '../types/supportGenerationHistory';

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function buildDateLabels(criteria: SearchConditionCriteria<SupportGenerationHistoryMode>) {
  if (isSingleDayRange(criteria.startDate, criteria.endDate)) {
    return Array.from({ length: 6 }, (_, i) => `${String(i * 4).padStart(2, '0')}:00`);
  }

  const start = new Date(criteria.startDate || criteria.endDate || Date.now());
  const labels: string[] = [];
  const dayCount = criteria.mode === 'Year' ? 12 : 8;
  const stepDays = criteria.mode === 'Year' ? 30 : 1;

  for (let i = 0; i < dayCount; i += 1) {
    const date = new Date(start);
    date.setDate(date.getDate() + i * stepDays);
    labels.push(criteria.mode === 'Year' ? `${date.getMonth() + 1}월` : `${date.getMonth() + 1}/${date.getDate()}`);
  }

  return labels;
}

const DIESEL_LABELS = ['Diesel #1', 'Diesel #2'];
const DIESEL_IDS = ['diesel-1', 'diesel-2'];

const detailHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: '유효[kWh]', rowSpan: 2 },
    { label: '지상/진상', rowSpan: 2 },
    { label: 'PF[%]', rowSpan: 2 },
    { label: 'V[V]', rowSpan: 2 },
    { label: 'A[A]', rowSpan: 2 },
    { label: '주파수[Hz]', rowSpan: 2 },
    { label: 'TMP[°C]', colSpan: 2 },
    { label: 'Oil[Bar]', rowSpan: 2 },
    { label: 'RPM', rowSpan: 2 },
    { label: 'Fuel[%]', rowSpan: 2 }
  ],
  [{ label: 'COOL' }, { label: 'OIL' }]
];

export type SupportGenerationHistoryData = {
  labels: string[];
  totalSeries: number[];
  dieselLineSeries: { name: string; data: number[] }[];
  summary: { columns: string[]; metrics: { label: string; values: string[] }[] };
  operationTable: { ariaLabel: string; minWidth: number; headerRows: TableHeaderCell[][]; rows: TableRow[] };
  equipmentOptions: { label: string; value: string }[];
  detailByEquipment: Record<string, { stat: { max: string; min: string; avg: string }; rows: TableRow[] }>;
};

const operationHeaderRows: TableHeaderCell[][] = [
  [{ label: 'Time', rowSpan: 2 }, ...DIESEL_LABELS.map((label) => ({ label, colSpan: 5 }))],
  DIESEL_LABELS.flatMap(() => [
    { label: '유효[kWh]' },
    { label: 'V[V]' },
    { label: 'A[A]' },
    { label: '주파수[Hz]' },
    { label: 'PF[%]' }
  ])
];

/*
 * 필요: 보조발전(디젤1/2) 이력 화면의 요약/차트/운전표/상세 데이터를 검색 조건에 맞춰 만든다.
 * 연결: SupportGenerationHistoryResultSection.
 * 설명: 실제 이력 API가 디젤별 데이터를 아직 못 주기 때문에, 검색 조건에 따라 결정적으로 생성한 미리보기 데이터를 쓴다.
 * 수정: 실제 API가 준비되면 이 훅 내부를 fetch 기반으로 교체하고 반환 타입은 유지한다.
 */
export function useSupportGenerationHistoryData(criteria: SearchConditionCriteria<SupportGenerationHistoryMode>) {
  return useMemo<SupportGenerationHistoryData>(() => {
    const labels = buildDateLabels(criteria);
    const stopped = [false, true];

    const perDieselSeries = DIESEL_IDS.map((_, index) =>
      labels.map((_, dayIndex) => (stopped[index] ? 0 : Number((640 + index * 40 + dayIndex * 12).toFixed(1))))
    );
    const totalSeries = labels.map((_, dayIndex) => perDieselSeries.reduce((sum, series) => sum + series[dayIndex], 0));
    const latestTotals = perDieselSeries.map((series) => series.reduce((sum, value) => sum + value, 0));
    const grandTotal = latestTotals.reduce((sum, value) => sum + value, 0);

    const operationRows: TableRow[] = labels.map((label, dayIndex) => [
      label,
      ...DIESEL_IDS.flatMap((_, index) =>
        stopped[index]
          ? ['0.0', '0.0', '0.0', '0.0', '0.0']
          : [
              formatNumber(perDieselSeries[index][dayIndex]),
              '380.2',
              formatNumber(90.4 + index * 2 + dayIndex),
              '60.0',
              '0.95'
            ]
      )
    ]);

    const detailByEquipment = Object.fromEntries(
      DIESEL_IDS.map((id, index) => {
        const series = perDieselSeries[index];
        const max = Math.max(...series);
        const min = Math.min(...series);
        const avg = series.reduce((sum, value) => sum + value, 0) / series.length;

        const rows: TableRow[] = labels.map((label, dayIndex) =>
          stopped[index]
            ? [label, '0.0', '-', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0', '0.0', '0']
            : [
                label,
                formatNumber(series[dayIndex]),
                '지상',
                '0.95',
                '380.2',
                formatNumber(90.4 + index * 2 + dayIndex),
                '60.0',
                formatNumber(78.4 + index),
                formatNumber(84.1 + index),
                '4.2',
                '1800',
                formatNumber(82 - index * 6, 0)
              ]
        );

        return [id, { stat: { max: formatNumber(max), min: formatNumber(min), avg: formatNumber(avg) }, rows }];
      })
    );

    return {
      labels,
      totalSeries,
      dieselLineSeries: DIESEL_LABELS.map((name, index) => ({ name, data: perDieselSeries[index] })),
      summary: {
        columns: ['Total', ...DIESEL_LABELS],
        metrics: [
          {
            label: '비중[%]',
            values: ['100.0', ...latestTotals.map((value) => (grandTotal > 0 ? formatNumber((value / grandTotal) * 100) : '-'))]
          },
          { label: '발전량[kWh]', values: [formatNumber(grandTotal), ...latestTotals.map((value) => formatNumber(value))] }
        ]
      },
      operationTable: {
        ariaLabel: '보조발전 이력 운전 상세',
        minWidth: 900,
        headerRows: operationHeaderRows,
        rows: operationRows
      },
      equipmentOptions: DIESEL_LABELS.map((label, index) => ({ label, value: DIESEL_IDS[index] })),
      detailByEquipment
    };
  }, [criteria]);
}

export { detailHeaderRows };
