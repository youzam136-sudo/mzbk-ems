import {
  EMPTY_API_VALUE,
  formatApiNumber,
  formatApiPowerFactor,
  formatShare,
  getTimeLabel,
  readApiField,
  sortByDateTime,
  sumApiNumbers,
  toChartNumber
} from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { PowerConsumptionPageData } from '../types/powerConsumptionStatus';
import type { PowerConsumptionStatusResponse } from '../api/powerConsumptionStatusApi';

const SUMMARY_COLORS = ['#25b6fe', '#396985', '#cdced2', '#6cd6d0', '#8fa8ff'];
const BANK_LABELS = ['GRID', 'ESS', 'PCS', 'Diesel #1', 'Diesel #2'];

const powerTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 2 },
    { label: 'Gen', rowSpan: 2 },
    { label: 'TOTAL', colSpan: 2 },
    { label: 'USE Rate (%)', rowSpan: 2 },
    { label: 'BANK 1', colSpan: 3 },
    { label: 'BANK 2', colSpan: 3 },
    { label: 'BANK 3', colSpan: 3 },
    { label: 'BANK 4', colSpan: 3 },
    { label: 'BANK 5', colSpan: 3 }
  ],
  [
    { label: 'Active' },
    { label: 'Reactive' },
    { label: 'Active' },
    { label: 'Reactive' },
    { label: 'PF' },
    { label: 'Active' },
    { label: 'Reactive' },
    { label: 'PF' },
    { label: 'Active' },
    { label: 'Reactive' },
    { label: 'PF' },
    { label: 'Active' },
    { label: 'Reactive' },
    { label: 'PF' },
    { label: 'Active' },
    { label: 'Reactive' },
    { label: 'PF' }
  ]
];

const bankTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 2 },
    { label: 'BANK 1', colSpan: 3 },
    { label: 'BANK 2', colSpan: 4 },
    { label: 'BANK 3', colSpan: 3 },
    { label: 'BANK 4', colSpan: 3 },
    { label: 'BANK 5', colSpan: 3 }
  ],
  [
    { label: 'TOTAL' },
    { label: '3P' },
    { label: '1P' },
    { label: 'TOTAL' },
    { label: '3P' },
    { label: '1P' },
    { label: 'PE' },
    { label: 'TOTAL' },
    { label: '3P' },
    { label: '1P' },
    { label: 'TOTAL' },
    { label: '3P' },
    { label: '1P' },
    { label: 'TOTAL' },
    { label: '3P' },
    { label: '1P' }
  ]
];

function createPowerRows(response: PowerConsumptionStatusResponse): TableRow[] {
  return sortByDateTime(response.gridStatusList).map((row) => [
    getTimeLabel(row),
    'GRID',
    formatApiNumber(readApiField(row, 'baAtpTot')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiNumber(readApiField(row, 'lgldGbcd')),
    formatApiNumber(readApiField(row, 'baAtpTot')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiPowerFactor(readApiField(row, 'baPfTot')),
    formatApiNumber(readApiField(row, 'baAtpL1')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiPowerFactor(readApiField(row, 'baPfTot')),
    formatApiNumber(readApiField(row, 'baAtpL2')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiPowerFactor(readApiField(row, 'baPfTot')),
    formatApiNumber(readApiField(row, 'baAtpL3')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiPowerFactor(readApiField(row, 'baPfTot')),
    formatApiNumber(readApiField(row, 'baAtpTot')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiPowerFactor(readApiField(row, 'baPfTot'))
  ]);
}

function createBankRows(response: PowerConsumptionStatusResponse): TableRow[] {
  return sortByDateTime(response.gridStatusList).map((row) => [
    getTimeLabel(row),
    formatApiNumber(readApiField(row, 'baAtpTot')),
    formatApiNumber(readApiField(row, 'baAtpL1')),
    formatApiNumber(readApiField(row, 'baPtpvL1n')),
    formatApiNumber(readApiField(row, 'baAtpL2')),
    formatApiNumber(readApiField(row, 'baAtpL2')),
    formatApiNumber(readApiField(row, 'baPtpvL2n')),
    formatApiNumber(readApiField(row, 'baArpTot')),
    formatApiNumber(readApiField(row, 'baAtpL3')),
    formatApiNumber(readApiField(row, 'baAtpL3')),
    formatApiNumber(readApiField(row, 'baPtptL3n')),
    formatApiNumber(readApiField(row, 'baRtpTot')),
    formatApiNumber(readApiField(row, 'baPtpvL12')),
    formatApiNumber(readApiField(row, 'baPtpvL23')),
    formatApiNumber(readApiField(row, 'baPtpvL31')),
    formatApiNumber(readApiField(row, 'baPaL1')),
    formatApiNumber(readApiField(row, 'baPaL2'))
  ]);
}

/*
 * 필요: 전력 소비 현황을 API 최신값과 GRID 일자별 값으로 구성한다.
 * 연결: usePowerConsumptionStatus, PowerConsumptionSummarySection, PowerConsumptionTableSection.
 * 설명: 전용 API가 없어 장비별 최신 유효전력 값을 BANK 요약에 대응시키는 임시 API 매핑이다.
 * 수정: 전력 소비 API가 확정되면 summary/table 필드만 전용 DTO 기준으로 교체한다.
 */
export function toPowerConsumptionPageData(response: PowerConsumptionStatusResponse): PowerConsumptionPageData {
  const bankValues = [
    readApiField(response.gridLatest, 'baAtpTot'),
    readApiField(response.essLatest, 'essAtpTot'),
    readApiField(response.pcsLatest, 'pcsAtpTot'),
    readApiField(response.diesel1Latest, 'dslAtpTot'),
    readApiField(response.diesel2Latest, 'dslAtpTot')
  ];
  const total = sumApiNumbers(bankValues);
  const sortedRows = sortByDateTime(response.gridStatusList);
  const tableRows = createPowerRows(response);
  const bankRows = createBankRows(response);

  return {
    summary: {
      columns: ['Total', 'BANK 1', 'BANK 2', 'BANK 3', 'BANK 4', 'BANK 5'],
      metrics: [
        { label: '수요비중(%)', values: ['100.0', ...bankValues.map((value) => formatShare(value, total))] },
        { label: '수요량(kWh)', values: [formatApiNumber(total), ...bankValues.map((value) => formatApiNumber(value))] }
      ],
      donutData: bankValues.map((value, index) => ({
        name: BANK_LABELS[index],
        value: toChartNumber(value)
      })),
      donutLegendLabels: BANK_LABELS,
      donutColors: SUMMARY_COLORS
    },
    trendChart: {
      labels: sortedRows.map((row) => getTimeLabel(row)),
      totalDemandSeries: sortedRows.map((row) => toChartNumber(readApiField(row, 'baAtpTot'))),
      pfSeries: sortedRows.map((row) => toChartNumber(readApiField(row, 'baPfTot')))
    },
    table: {
      ariaLabel: '전력 소비 현황 상세 내역',
      minWidth: 1680,
      headerRows: powerTableHeaderRows,
      rows: tableRows.length > 0 ? tableRows : [[EMPTY_API_VALUE]]
    },
    bankTable: {
      ariaLabel: '전력 소비 현황 BANK 상세 내역',
      minWidth: 1420,
      headerRows: bankTableHeaderRows,
      rows: bankRows.length > 0 ? bankRows : [[EMPTY_API_VALUE]]
    }
  };
}
