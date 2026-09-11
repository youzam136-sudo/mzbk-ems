import { useMemo } from 'react';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { isSingleDayRange } from '../../../../shared/utils/hourlyChartSlots';
import type { GridBaseGenerationHistoryMode } from '../types/gridBaseGenerationHistory';

const INVERTER_COUNT = 7;

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function buildDateLabels(criteria: SearchConditionCriteria<GridBaseGenerationHistoryMode>) {
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

export type GridBaseGenerationHistoryData = {
  labels: string[];
  totalSeries: number[];
  inverterLineSeries: { name: string; data: number[] }[];
  summary: { columns: string[]; metrics: { label: string; values: string[] }[] };
  operationTable: { ariaLabel: string; minWidth: number; headerRows: TableHeaderCell[][]; rows: TableRow[] };
  equipmentOptions: { label: string; value: string }[];
  detailByInverter: Record<
    string,
    {
      stat: { max: string; min: string; avg: string };
      rows: TableRow[];
    }
  >;
};

/*
 * 필요: 기저발전(태양광 IVT1~7) 이력 화면의 요약/차트/표/상세 데이터를 검색 조건에 맞춰 만든다.
 * 연결: GridBaseGenerationHistoryResultSection.
 * 설명: 실제 이력 API가 인버터별 데이터를 아직 못 주기 때문에, 검색 조건에 따라 결정적으로 생성한 미리보기 데이터를 쓴다.
 * 수정: 실제 API가 준비되면 이 훅 내부를 fetch 기반으로 교체하고 반환 타입은 유지한다.
 */
export function useGridBaseGenerationHistoryData(criteria: SearchConditionCriteria<GridBaseGenerationHistoryMode>) {
  return useMemo<GridBaseGenerationHistoryData>(() => {
    const labels = buildDateLabels(criteria);
    const inverterIds = Array.from({ length: INVERTER_COUNT }, (_, i) => `ivt-${i + 1}`);
    const inverterLabels = inverterIds.map((_, i) => `IVT${i + 1}`);

    const perInverterSeries = inverterIds.map((_, index) =>
      labels.map((_, dayIndex) => Number((22 + index * 3 + dayIndex * 0.8).toFixed(1)))
    );
    const totalSeries = labels.map((_, dayIndex) => perInverterSeries.reduce((sum, series) => sum + series[dayIndex], 0));
    const latestTotals = perInverterSeries.map((series) => series.reduce((sum, value) => sum + value, 0));
    const grandTotal = latestTotals.reduce((sum, value) => sum + value, 0);

    const operationHeaderRows: TableHeaderCell[][] = [
      [{ label: 'Time', rowSpan: 2 }, ...inverterLabels.map((label) => ({ label: `${label}[kWh]`, colSpan: 2 }))],
      inverterLabels.flatMap(() => [{ label: 'MAX' }, { label: 'AVG' }])
    ];

    const operationRows: TableRow[] = labels.map((label, dayIndex) => [
      label,
      ...perInverterSeries.flatMap((series) => {
        const value = series[dayIndex];
        return [formatNumber(value), formatNumber(value * 0.86)];
      })
    ]);

    const detailByInverter = Object.fromEntries(
      inverterIds.map((id, index) => {
        const series = perInverterSeries[index];
        const max = Math.max(...series);
        const min = Math.min(...series);
        const avg = series.reduce((sum, value) => sum + value, 0) / series.length;

        const rows: TableRow[] = labels.map((label, dayIndex) => [
          label,
          formatNumber(series[dayIndex]),
          formatNumber(latestTotals[index] + dayIndex * 4),
          formatNumber(series[dayIndex] + 2.4),
          formatNumber(series[dayIndex] - 1.8),
          formatNumber(series[dayIndex]),
          '382.4',
          '378.1',
          '380.2',
          formatNumber(88.2 + index),
          formatNumber(85.6 + index),
          formatNumber(87.0 + index)
        ]);

        return [id, { stat: { max: formatNumber(max), min: formatNumber(min), avg: formatNumber(avg) }, rows }];
      })
    );

    return {
      labels,
      totalSeries,
      inverterLineSeries: inverterLabels.map((name, index) => ({ name, data: perInverterSeries[index] })),
      summary: {
        columns: ['Total', ...inverterLabels],
        metrics: [
          {
            label: '비중[%]',
            values: ['100.0', ...latestTotals.map((value) => (grandTotal > 0 ? formatNumber((value / grandTotal) * 100) : '-'))]
          },
          { label: '발전량[kWh]', values: [formatNumber(grandTotal), ...latestTotals.map((value) => formatNumber(value))] }
        ]
      },
      operationTable: {
        ariaLabel: '기저발전 이력 운전 상세',
        minWidth: Math.max(900, 160 + inverterIds.length * 160),
        headerRows: operationHeaderRows,
        rows: operationRows
      },
      equipmentOptions: inverterLabels.map((label, index) => ({ label, value: inverterIds[index] })),
      detailByInverter
    };
  }, [criteria]);
}
