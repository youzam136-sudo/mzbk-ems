import { formatApiNumber, formatApiPowerFactor, readApiField } from '../../../../shared/api/apiDataUtils';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { PowerConsumptionPageData } from '../types/powerConsumptionStatus';
import type { PowerConsumptionStatusResponse } from '../api/powerConsumptionStatusApi';

const EMPTY_VALUE = '-';

function getTimeLabel(row: ApiRecord) {
  const time = String(readApiField(row, 'esmtOperTime') ?? readApiField(row, 'operTime') ?? '');
  return time.length >= 5 ? time.slice(0, 5) : time || EMPTY_VALUE;
}

function toChartNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getBankLabel(bank: { targetId: string; targetName: string }, index: number) {
  return bank.targetName || `BANK ${index + 1}`;
}

function createOperationTableHeaderRows(banks: PowerConsumptionStatusResponse['bankList']): TableHeaderCell[][] {
  return [
    [{ label: 'Time', rowSpan: 2 }, ...banks.map((bank, index) => ({ label: getBankLabel(bank, index), colSpan: 3 }))],
    banks.flatMap(() => [{ label: '유효[kW]' }, { label: '주파수[Hz]' }, { label: 'PF[%]' }])
  ];
}

function createOperationTableRows(
  timeLabels: string[],
  banks: PowerConsumptionStatusResponse['bankList'],
  bankSeriesMap: Record<string, ApiRecord[]>
): TableRow[] {
  return timeLabels.map((time, rowIndex) => [
    time,
    ...banks.flatMap((bank) => {
      const point = bankSeriesMap[bank.targetId]?.[rowIndex];
      return [
        formatApiNumber(readApiField(point, 'pcActive')),
        formatApiNumber(readApiField(point, 'pcFreq')),
        formatApiPowerFactor(readApiField(point, 'pcPf'))
      ];
    })
  ]);
}

const detailTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: '상태', rowSpan: 2 },
    { label: 'V[V]', rowSpan: 2 },
    { label: 'A[A]', rowSpan: 2 },
    { label: '유효[kW]', rowSpan: 2 },
    { label: '무효[kW]', rowSpan: 2 },
    { label: 'PF[%]', rowSpan: 2 },
    { label: 'FR[Hz]', rowSpan: 2 },
    { label: 'DAY', colSpan: 2 },
    { label: 'TOTAL', colSpan: 2 }
  ],
  [{ label: '유효[kWh]' }, { label: '무효[kWh]' }, { label: '유효[kWh]' }, { label: '무효[kWh]' }]
];

function createDetailRows(detailList: ApiRecord[]): TableRow[] {
  return detailList.map((row) => [
    getTimeLabel(row),
    String(readApiField(row, 'pcStat') ?? EMPTY_VALUE),
    formatApiNumber(readApiField(row, 'pcVtg')),
    formatApiNumber(readApiField(row, 'pcCur')),
    formatApiNumber(readApiField(row, 'pcActive')),
    formatApiNumber(readApiField(row, 'pcReactive')),
    formatApiPowerFactor(readApiField(row, 'pcPf')),
    formatApiNumber(readApiField(row, 'pcFreq')),
    formatApiNumber(readApiField(row, 'pcDayActive')),
    formatApiNumber(readApiField(row, 'pcDayReactive')),
    formatApiNumber(readApiField(row, 'pcTotalActive')),
    formatApiNumber(readApiField(row, 'pcTotalReactive'))
  ]);
}

/*
 * 필요: BANK1~5 API 응답을 전력소비현황 화면 ViewModel로 변환한다.
 * 연결: usePowerConsumptionStatus, PowerConsumptionSummarySection, PowerConsumptionTableSection.
 * 설명: 2026.08.31 워크샵 반영 스펙 — GRID/ESS/PCS/Diesel을 BANK로 오용하던 예전 매핑을 걷어내고 실제 BANK1~5 구조로 교체.
 * 수정: BANK API 필드명이 바뀌면 이 adapter의 매핑만 먼저 조정한다.
 */
export function toPowerConsumptionPageData(response: PowerConsumptionStatusResponse): PowerConsumptionPageData {
  const banks = response.bankList;
  const firstBankSeries = banks[0] ? response.bankSeriesMap[banks[0].targetId] ?? [] : [];
  const timeLabels = firstBankSeries.map((row) => getTimeLabel(row));

  const perBankLatest = banks.map((bank) => toChartNumber(readApiField(response.bankSeriesMap[bank.targetId]?.at(-1), 'pcActive')));
  const totalSeries = timeLabels.map((_, rowIndex) =>
    banks.reduce((sum, bank) => sum + toChartNumber(readApiField(response.bankSeriesMap[bank.targetId]?.[rowIndex], 'pcActive')), 0)
  );
  const latestTotal = perBankLatest.reduce((sum, value) => sum + value, 0);

  const equipmentOptions = banks.map((bank, index) => ({ label: getBankLabel(bank, index), value: bank.targetId }));
  const operationRows = createOperationTableRows(timeLabels, banks, response.bankSeriesMap);

  return {
    summary: {
      columns: ['Total', ...banks.map((bank, index) => getBankLabel(bank, index))],
      metrics: [
        {
          label: '비중[%]',
          values: ['100.0', ...perBankLatest.map((value) => (latestTotal > 0 ? formatApiNumber((value / latestTotal) * 100) : EMPTY_VALUE))]
        },
        { label: '전력[kW]', values: [formatApiNumber(latestTotal), ...perBankLatest.map((value) => formatApiNumber(value))] }
      ],
      donutData: banks.map((bank, index) => ({ name: getBankLabel(bank, index), value: perBankLatest[index] ?? 0 })),
      donutLegendLabels: banks.map((bank, index) => getBankLabel(bank, index)),
      donutColors: ['#25b6fe', '#396985', '#cdced2', '#6cd6d0', '#8fa8ff']
    },
    trendChart: {
      labels: timeLabels,
      totalDemandSeries: totalSeries,
      bankLineSeries: banks.map((bank, index) => ({
        name: getBankLabel(bank, index),
        data: (response.bankSeriesMap[bank.targetId] ?? []).map((point) => toChartNumber(readApiField(point, 'pcActive')))
      }))
    },
    operationTable: {
      ariaLabel: '전력 소비 현황 운전 상세 현황',
      minWidth: Math.max(900, 160 + banks.length * 160),
      headerRows: createOperationTableHeaderRows(banks),
      rows: operationRows,
      allRows: operationRows
    },
    detailTable: {
      ariaLabel: '전력 소비 현황 BANK 상세 내역',
      minWidth: 1420,
      defaultExpanded: true,
      defaultEquipmentValue: banks[0]?.targetId ?? 'bank-1',
      equipmentOptions: equipmentOptions.length ? equipmentOptions : [{ label: 'BANK 1', value: 'bank-1' }],
      headerRows: detailTableHeaderRows,
      rowsByEquipment: Object.fromEntries(banks.map((bank) => [bank.targetId, createDetailRows(response.bankDetailByEquipment[bank.targetId] ?? [])]))
    }
  };
}
