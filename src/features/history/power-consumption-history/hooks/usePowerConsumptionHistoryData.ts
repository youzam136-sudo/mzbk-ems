import { useMemo } from 'react';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { isSingleDayRange } from '../../../../shared/utils/hourlyChartSlots';
import type { PowerConsumptionHistoryMode } from '../types/powerConsumptionHistory';

const BANK_COUNT = 5;

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function buildDateLabels(criteria: SearchConditionCriteria<PowerConsumptionHistoryMode>) {
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

const detailHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: '유효[kW]', rowSpan: 2 },
    { label: '무효[kW]', rowSpan: 2 },
    { label: 'V[V]', rowSpan: 2 },
    { label: 'A[A]', rowSpan: 2 },
    { label: 'PF[%]', rowSpan: 2 },
    { label: 'FR[Hz]', rowSpan: 2 },
    { label: '누계', colSpan: 2 },
    { label: 'TOTAL', colSpan: 2 }
  ],
  [{ label: '유효[kWh]' }, { label: '무효[kWh]' }, { label: '유효[kWh]' }, { label: '무효[kWh]' }]
];

export type PowerConsumptionHistoryData = {
  labels: string[];
  totalSeries: number[];
  bankLineSeries: { name: string; data: number[] }[];
  summary: { columns: string[]; metrics: { label: string; values: string[] }[] };
  operationTable: { ariaLabel: string; minWidth: number; headerRows: TableHeaderCell[][]; rows: TableRow[] };
  equipmentOptions: { label: string; value: string }[];
  detailByEquipment: Record<string, { stat: { max: string; min: string; avg: string }; rows: TableRow[] }>;
};

/*
 * 필요: 전력소비(BANK1~5) 이력 화면의 요약/차트/운전표/상세 데이터를 검색 조건에 맞춰 만든다.
 * 연결: PowerConsumptionHistoryResultSection.
 * 설명: 실제 이력 API가 BANK별 데이터를 아직 못 주기 때문에, 검색 조건에 따라 결정적으로 생성한 미리보기 데이터를 쓴다.
 * 수정: 실제 API가 준비되면 이 훅 내부를 fetch 기반으로 교체하고 반환 타입은 유지한다.
 */
export function usePowerConsumptionHistoryData(criteria: SearchConditionCriteria<PowerConsumptionHistoryMode>) {
  return useMemo<PowerConsumptionHistoryData>(() => {
    const labels = buildDateLabels(criteria);
    const bankIds = Array.from({ length: BANK_COUNT }, (_, i) => `bank-${i + 1}`);
    const bankLabels = bankIds.map((_, i) => `BANK ${i + 1}`);

    const perBankSeries = bankIds.map((_, index) => labels.map((_, dayIndex) => Number((620 + index * 30 + dayIndex * 14).toFixed(1))));
    const totalSeries = labels.map((_, dayIndex) => perBankSeries.reduce((sum, series) => sum + series[dayIndex], 0));
    const latestTotals = perBankSeries.map((series) => series.reduce((sum, value) => sum + value, 0));
    const grandTotal = latestTotals.reduce((sum, value) => sum + value, 0);

    const operationHeaderRows: TableHeaderCell[][] = [
      [{ label: 'Time', rowSpan: 2 }, ...bankLabels.map((label) => ({ label, colSpan: 3 }))],
      bankLabels.flatMap(() => [{ label: '유효[kW]' }, { label: '주파수[Hz]' }, { label: 'PF[%]' }])
    ];

    const operationRows: TableRow[] = labels.map((label, dayIndex) => [
      label,
      ...perBankSeries.flatMap((series) => [formatNumber(series[dayIndex]), '60.0', '0.96'])
    ]);

    const detailByEquipment = Object.fromEntries(
      bankIds.map((id, index) => {
        const series = perBankSeries[index];
        const max = Math.max(...series);
        const min = Math.min(...series);
        const avg = series.reduce((sum, value) => sum + value, 0) / series.length;

        const rows: TableRow[] = labels.map((label, dayIndex) => [
          label,
          formatNumber(series[dayIndex]),
          formatNumber(4.1 + index * 0.1),
          '380.2',
          formatNumber(92.4 + index * 4 + dayIndex),
          '0.96',
          '60.0',
          formatNumber(series[dayIndex]),
          formatNumber(4.1 + index * 0.1),
          formatNumber(latestTotals[index] + dayIndex * 4),
          formatNumber(280 + index * 10)
        ]);

        return [id, { stat: { max: formatNumber(max), min: formatNumber(min), avg: formatNumber(avg) }, rows }];
      })
    );

    return {
      labels,
      totalSeries,
      bankLineSeries: bankLabels.map((name, index) => ({ name, data: perBankSeries[index] })),
      summary: {
        columns: ['Total', ...bankLabels],
        metrics: [
          {
            label: '비중[%]',
            values: ['100.0', ...latestTotals.map((value) => (grandTotal > 0 ? formatNumber((value / grandTotal) * 100) : '-'))]
          },
          { label: '소비량[kWh]', values: [formatNumber(grandTotal), ...latestTotals.map((value) => formatNumber(value))] }
        ]
      },
      operationTable: {
        ariaLabel: '전력소비 이력 운전 상세',
        minWidth: Math.max(900, 160 + bankIds.length * 160),
        headerRows: operationHeaderRows,
        rows: operationRows
      },
      equipmentOptions: bankLabels.map((label, index) => ({ label, value: bankIds[index] })),
      detailByEquipment
    };
  }, [criteria]);
}

export { detailHeaderRows };
