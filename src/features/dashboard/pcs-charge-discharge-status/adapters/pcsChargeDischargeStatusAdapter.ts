import {
  EMPTY_API_VALUE,
  formatApiNumber,
  formatShare,
  getTimeLabel,
  readApiField,
  sortByDateTime,
  sumApiNumbers,
  toChartNumber
} from '../../../../shared/api/apiDataUtils';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { PcsChargeDischargePageData } from '../types/pcsChargeDischargeStatus';
import type { PcsChargeDischargeStatusResponse } from '../api/pcsChargeDischargeStatusApi';

const SUMMARY_COLORS = ['#25b6fe', '#d20000'];

const pcsTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 2 },
    { label: 'ESS PCS', colSpan: 4 },
    { label: 'ESS BATT', colSpan: 9 }
  ],
  [
    { label: 'OPER' },
    { label: 'AC A' },
    { label: 'AC V' },
    { label: 'AC P' },
    { label: 'OPER BSC' },
    { label: 'SoC (BSC)' },
    { label: 'SoH (BSC)' },
    { label: 'DC V (BSC)' },
    { label: 'DC A (BSC)' },
    { label: 'RACK (AVG) V' },
    { label: 'RACK (AVG) A' },
    { label: 'CELL (AVG) V' },
    { label: 'TEMP (AVG)' }
  ]
];

const batteryTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 3 },
    { label: 'RACK', colSpan: 8 },
    { label: 'CELL', colSpan: 8 },
    { label: 'PACK', colSpan: 2 }
  ],
  [
    { label: 'V', colSpan: 4 },
    { label: 'A', colSpan: 4 },
    { label: 'V', colSpan: 4 },
    { label: 'A', colSpan: 4 },
    { label: 'TEMP', colSpan: 2 }
  ],
  [
    { label: 'MAX' },
    { label: 'MIN' },
    { label: 'MAX #' },
    { label: 'MIN #' },
    { label: 'MAX' },
    { label: 'MIN' },
    { label: 'MAX #' },
    { label: 'MIN #' },
    { label: 'MAX' },
    { label: 'MIN' },
    { label: 'MAX #' },
    { label: 'MIN #' },
    { label: 'MAX' },
    { label: 'MIN' },
    { label: 'MAX #' },
    { label: 'MIN #' },
    { label: 'MAX' },
    { label: 'MAX #' }
  ]
];

function getRowsByTime(...rowSets: ApiRecord[][]) {
  const mergedRows = new Map<string, Record<string, ApiRecord>>();

  rowSets.forEach((rows, rowSetIndex) => {
    sortByDateTime(rows).forEach((row) => {
      const key = getTimeLabel(row);
      const mergedRow = mergedRows.get(key) ?? {};
      mergedRow[`set${rowSetIndex}`] = row;
      mergedRows.set(key, mergedRow);
    });
  });

  return Array.from(mergedRows.entries()).map(([time, value]) => ({ time, value }));
}

function createPcsTableRows(response: PcsChargeDischargeStatusResponse): TableRow[] {
  return getRowsByTime(response.pcsStatusList, response.batteryStatusList).map(({ time, value }) => {
    const pcs = value.set0;
    const battery = value.set1;

    return [
      time,
      readApiField(pcs, 'pcsOperStatus') ?? EMPTY_API_VALUE,
      formatApiNumber(readApiField(pcs, 'pcsPaL1')),
      formatApiNumber(readApiField(pcs, 'pcsPtpvL12')),
      formatApiNumber(readApiField(pcs, 'pcsAtpTot')),
      readApiField(pcs, 'pcsOperStatus') ?? EMPTY_API_VALUE,
      formatApiNumber(readApiField(battery, 'batAvgSoc')),
      formatApiNumber(readApiField(battery, 'batAvgSoh')),
      formatApiNumber(readApiField(battery, 'batAvgDcv')),
      formatApiNumber(readApiField(battery, 'batAvgDca')),
      formatApiNumber(readApiField(battery, 'batAvgRakv')),
      formatApiNumber(readApiField(battery, 'batAvgRaka')),
      formatApiNumber(readApiField(battery, 'batAvgCelv')),
      formatApiNumber(readApiField(battery, 'batAvgPaktmp'))
    ];
  });
}

function createBatteryTableRows(response: PcsChargeDischargeStatusResponse): TableRow[] {
  return sortByDateTime(response.batteryStatusList).map((row) => [
    getTimeLabel(row),
    formatApiNumber(readApiField(row, 'batMaxRakv')),
    formatApiNumber(readApiField(row, 'batMinRakv')),
    formatApiNumber(readApiField(row, 'maxRakvRakno')),
    formatApiNumber(readApiField(row, 'minRakvRakno')),
    formatApiNumber(readApiField(row, 'batMaxRaka')),
    formatApiNumber(readApiField(row, 'batMinRaka')),
    formatApiNumber(readApiField(row, 'maxRakaRakno')),
    formatApiNumber(readApiField(row, 'minRakaRakno')),
    formatApiNumber(readApiField(row, 'batMaxCelv')),
    formatApiNumber(readApiField(row, 'batMinCelv')),
    formatApiNumber(readApiField(row, 'maxCelvRakno')),
    formatApiNumber(readApiField(row, 'minCelvRakno')),
    formatApiNumber(readApiField(row, 'batMaxRaka')),
    formatApiNumber(readApiField(row, 'batMinRaka')),
    formatApiNumber(readApiField(row, 'maxRakaRakno')),
    formatApiNumber(readApiField(row, 'minRakaRakno')),
    formatApiNumber(readApiField(row, 'batMaxPaktmp')),
    formatApiNumber(readApiField(row, 'maxPaktmpRakno'))
  ]);
}

/*
 * 필요: PCS/Battery API 응답을 충방전 화면의 공통 패널/표 데이터로 변환한다.
 * 연결: usePcsChargeDischargeStatus, PcsChargeDischargeSummarySection, PcsChargeDischargeTableSection.
 * 설명: PCS 유효전력을 충전 축, DC 전력을 방전 축으로 분리해 현재 API 값 기반 그래프를 만든다.
 * 수정: 충전/방전 판정 기준이 확정되면 chargeSeries/dischargeSeries 매핑만 교체한다.
 */
export function toPcsChargeDischargePageData(response: PcsChargeDischargeStatusResponse): PcsChargeDischargePageData {
  const chargeTotal = readApiField(response.pcsLatest, 'pcsAtpTot');
  const dischargeTotal = readApiField(response.pcsLatest, 'pcsDcP');
  const total = sumApiNumbers([chargeTotal, dischargeTotal]);
  const rowsByTime = getRowsByTime(response.pcsStatusList, response.batteryStatusList);
  const pcsRows = createPcsTableRows(response);
  const batteryRows = createBatteryTableRows(response);

  return {
    summary: {
      columns: ['Total', 'PCS', 'Battery'],
      metrics: [
        { label: '비중(%)', values: ['100.0', formatShare(chargeTotal, total), formatShare(dischargeTotal, total)] },
        { label: '발전량(kWh)', values: [formatApiNumber(total), formatApiNumber(chargeTotal), formatApiNumber(dischargeTotal)] }
      ],
      donutData: [
        { name: '충전 표시', value: toChartNumber(chargeTotal) },
        { name: '방전 표시', value: toChartNumber(dischargeTotal) }
      ],
      donutLegendLabels: ['충전 표시', '방전 표시'],
      donutColors: SUMMARY_COLORS
    },
    chart: {
      labels: rowsByTime.map(({ time }) => time),
      chargeSeries: rowsByTime.map(({ value }) => toChartNumber(readApiField(value.set0, 'pcsAtpTot'))),
      dischargeSeries: rowsByTime.map(({ value }) => -Math.abs(toChartNumber(readApiField(value.set0, 'pcsDcP'))))
    },
    pcsTable: {
      ariaLabel: 'PCS 충방전 ESS PCS 상세 내역',
      minWidth: 1380,
      headerRows: pcsTableHeaderRows,
      rows: pcsRows.length > 0 ? pcsRows : [[EMPTY_API_VALUE]]
    },
    batteryTable: {
      ariaLabel: 'PCS 충방전 BATTERY 상세 내역',
      minWidth: 1560,
      headerRows: batteryTableHeaderRows,
      rows: batteryRows.length > 0 ? batteryRows : [[EMPTY_API_VALUE]]
    }
  };
}
