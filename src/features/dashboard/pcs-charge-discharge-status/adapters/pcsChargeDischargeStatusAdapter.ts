import {
  EMPTY_API_VALUE,
  formatApiNumber,
  getTimeLabel,
  readApiField,
  sortByDateTime,
  toChartNumber
} from '../../../../shared/api/apiDataUtils';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { PcsChargeDischargePageData } from '../types/pcsChargeDischargeStatus';
import type { PcsChargeDischargeStatusResponse } from '../api/pcsChargeDischargeStatusApi';

const pcsTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 3 },
    { label: 'PCS', colSpan: 4 },
    { label: 'BATT', colSpan: 10 }
  ],
  [
    { label: '상태', rowSpan: 2 },
    { label: 'AC A[A]', rowSpan: 2 },
    { label: 'AC V[V]', rowSpan: 2 },
    { label: 'AC P[kW]', rowSpan: 2 },
    { label: '상태', rowSpan: 2 },
    { label: 'SoC[%]', rowSpan: 2 },
    { label: 'SoH[%]', rowSpan: 2 },
    { label: 'DC V[V]', rowSpan: 2 },
    { label: 'DC A[A]', rowSpan: 2 },
    { label: 'RACK (AVG)', colSpan: 2 },
    { label: 'CELL (AVG)', colSpan: 2 },
    { label: 'TMP (AVG)[°C]', rowSpan: 2 }
  ],
  [{ label: 'V[V]' }, { label: 'A[A]' }, { label: 'V[V]' }, { label: 'A[A]' }]
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
      formatApiNumber(readApiField(battery, 'batAvgCela')),
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
    formatApiNumber(readApiField(row, 'batMaxCela')),
    formatApiNumber(readApiField(row, 'batMinCela')),
    formatApiNumber(readApiField(row, 'maxCelaRakno')),
    formatApiNumber(readApiField(row, 'minCelaRakno')),
    formatApiNumber(readApiField(row, 'batMaxPaktmp')),
    formatApiNumber(readApiField(row, 'maxPaktmpRakno'))
  ]);
}

function computeStat(values: number[]) {
  const nonZero = values.filter((value) => value > 0);

  if (nonZero.length === 0) {
    return { max: EMPTY_API_VALUE, min: EMPTY_API_VALUE, avg: EMPTY_API_VALUE };
  }

  const max = Math.max(...nonZero);
  const min = Math.min(...nonZero);
  const avg = nonZero.reduce((sum, value) => sum + value, 0) / nonZero.length;

  return { max: formatApiNumber(max), min: formatApiNumber(min), avg: formatApiNumber(avg) };
}

/*
 * 필요: PCS/Battery API 응답을 충방전 화면의 공통 패널/표 데이터로 변환한다.
 * 연결: usePcsChargeDischargeStatus, PcsChargeDischargeSummarySection, PcsChargeDischargeTableSection.
 * 설명: PCS 유효전력을 충전 축, DC 전력을 방전 축으로 분리하고, SoC(%)는 배터리 값에서 가져온다.
 * 수정: 충전/방전 판정 기준이 확정되면 chargeSeries/dischargeSeries 매핑만 교체한다.
 */
export function toPcsChargeDischargePageData(response: PcsChargeDischargeStatusResponse): PcsChargeDischargePageData {
  const rowsByTime = getRowsByTime(response.pcsStatusList, response.batteryStatusList);
  const pcsRows = createPcsTableRows(response);
  const batteryRows = createBatteryTableRows(response);

  const chargeSeries = rowsByTime.map(({ value }) => Math.max(0, toChartNumber(readApiField(value.set0, 'pcsAtpTot'))));
  const dischargeMagnitudeSeries = rowsByTime.map(({ value }) => Math.abs(toChartNumber(readApiField(value.set0, 'pcsDcP'))));
  const dischargeSeries = dischargeMagnitudeSeries.map((value) => -value);
  const socSeries = rowsByTime.map(({ value }) => toChartNumber(readApiField(value.set1, 'batAvgSoc')));

  const chargeStat = computeStat(chargeSeries);
  const dischargeStat = computeStat(dischargeMagnitudeSeries);

  return {
    summary: {
      rows: [
        { label: '충전', max: chargeStat.max, min: chargeStat.min, avg: chargeStat.avg },
        { label: '방전', max: dischargeStat.max, min: dischargeStat.min, avg: dischargeStat.avg }
      ]
    },
    chart: {
      labels: rowsByTime.map(({ time }) => time),
      chargeSeries,
      dischargeSeries,
      socSeries
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
