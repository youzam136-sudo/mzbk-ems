import { useMemo } from 'react';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { isSingleDayRange } from '../../../../shared/utils/hourlyChartSlots';
import type { PcsChargeDischargeHistoryMode } from '../types/pcsChargeDischargeHistory';

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

function buildDateLabels(criteria: SearchConditionCriteria<PcsChargeDischargeHistoryMode>) {
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

const operationHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: 'PCS', colSpan: 3 },
    { label: 'SoC[%]', rowSpan: 2 },
    { label: 'SoH[%]', rowSpan: 2 },
    { label: 'DC V[V]', rowSpan: 2 },
    { label: 'DC A[A]', rowSpan: 2 },
    { label: 'RACK', colSpan: 2 },
    { label: 'CELL', colSpan: 2 },
    { label: 'TMP[°C]', rowSpan: 2 }
  ],
  [
    { label: 'AC A[A]' },
    { label: 'AC V[V]' },
    { label: 'AC P[kWh]' },
    { label: 'V[V]' },
    { label: 'A[A]' },
    { label: 'V[V]' },
    { label: 'A[A]' }
  ]
];

const detailHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 3 },
    { label: 'RACK', colSpan: 8 },
    { label: 'CELL', colSpan: 8 },
    { label: 'PACK', colSpan: 2 }
  ],
  [
    { label: 'V[V]', colSpan: 4 },
    { label: 'A[A]', colSpan: 4 },
    { label: 'V[V]', colSpan: 4 },
    { label: 'A[A]', colSpan: 4 },
    { label: 'TMP[°C]', colSpan: 2 }
  ],
  [
    { label: 'Max' }, { label: 'Min' }, { label: 'Max [No]' }, { label: 'Min [No]' },
    { label: 'Max' }, { label: 'Min' }, { label: 'Max [No]' }, { label: 'Min [No]' },
    { label: 'Max' }, { label: 'Min' }, { label: 'Max [No]' }, { label: 'Min [No]' },
    { label: 'Max' }, { label: 'Min' }, { label: 'Max [No]' }, { label: 'Min [No]' },
    { label: 'Max' }, { label: 'Max [No]' }
  ]
];

function computeStat(values: number[]) {
  const nonZero = values.filter((value) => value > 0);
  if (nonZero.length === 0) {
    return { max: '-', min: '-', avg: '-' };
  }
  const max = Math.max(...nonZero);
  const min = Math.min(...nonZero);
  const avg = nonZero.reduce((sum, value) => sum + value, 0) / nonZero.length;
  return { max: formatNumber(max), min: formatNumber(min), avg: formatNumber(avg) };
}

export type PcsChargeDischargeHistoryData = {
  labels: string[];
  chargeSeries: number[];
  dischargeSeries: number[];
  socSeries: number[];
  summary: { label: string; max: string; min: string; avg: string }[];
  operationTable: { ariaLabel: string; minWidth: number; headerRows: TableHeaderCell[][]; rows: TableRow[] };
  detailTable: { ariaLabel: string; minWidth: number; headerRows: TableHeaderCell[][]; rows: TableRow[] };
};

/*
 * 필요: 충방전 이력 화면의 MAX/MIN/AVG 요약, 듀얼축 차트, 운전표, RACK/CELL/PACK 상세표를 검색 조건에 맞춰 만든다.
 * 연결: PcsChargeDischargeHistoryResultSection.
 * 설명: 실제 이력 API 연동 전까지 검색 조건에 따라 결정적으로 생성한 미리보기 데이터를 쓴다.
 * 수정: 실제 API가 준비되면 이 훅 내부를 fetch 기반으로 교체하고 반환 타입은 유지한다.
 */
export function usePcsChargeDischargeHistoryData(criteria: SearchConditionCriteria<PcsChargeDischargeHistoryMode>) {
  return useMemo<PcsChargeDischargeHistoryData>(() => {
    const labels = buildDateLabels(criteria);

    const chargeSeries = labels.map((_, i) => (i % 3 !== 2 ? Number((42 + i * 6).toFixed(1)) : 0));
    const dischargeMagnitude = labels.map((_, i) => (i % 3 === 2 ? Number((28 + i * 4).toFixed(1)) : 0));
    const dischargeSeries = dischargeMagnitude.map((value) => -value);
    const socSeries = labels.map((_, i) => Number((52 + i * 4).toFixed(1)));

    const chargeStat = computeStat(chargeSeries);
    const dischargeStat = computeStat(dischargeMagnitude);

    const operationRows: TableRow[] = labels.map((label, i) => [
      label,
      formatNumber(90.4 + i),
      '380.2',
      formatNumber(chargeSeries[i] || dischargeMagnitude[i]),
      formatNumber(52 + i * 4),
      '96.0',
      '809.2',
      formatNumber(40.3 + i),
      '483.6',
      formatNumber(118.9 + i),
      '3.65',
      formatNumber(118.9 + i),
      formatNumber(24.3 + i * 0.2)
    ]);

    const detailRows: TableRow[] = labels.map((label, i) => [
      label,
      '486.2', '480.9', '3', '1',
      formatNumber(124.6 + i), formatNumber(112.1 + i), '2', '4',
      '3.68', '3.61', '5', '2',
      formatNumber(124.6 + i), formatNumber(112.1 + i), '6', '3',
      formatNumber(25.8 + i * 0.2), '4'
    ]);

    return {
      labels,
      chargeSeries,
      dischargeSeries,
      socSeries,
      summary: [
        { label: '충전', max: chargeStat.max, min: chargeStat.min, avg: chargeStat.avg },
        { label: '방전', max: dischargeStat.max, min: dischargeStat.min, avg: dischargeStat.avg }
      ],
      operationTable: {
        ariaLabel: 'PCS 충방전 이력 운전 상세',
        minWidth: 1280,
        headerRows: operationHeaderRows,
        rows: operationRows
      },
      detailTable: {
        ariaLabel: 'PCS 충방전 이력 BATTERY 상세',
        minWidth: 1680,
        headerRows: detailHeaderRows,
        rows: detailRows
      }
    };
  }, [criteria]);
}
