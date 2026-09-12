import {
  formatApiNumber,
  formatApiPowerFactor,
  formatShare,
  getTimeLabel,
  readApiField,
  sortByDateTime,
  sumApiNumbers,
  toChartNumber
} from '../../../../shared/api/apiDataUtils';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { SupportGenerationPageData } from '../types/supportGenerationStatus';
import type { SupportGenerationStatusResponse } from '../api/supportGenerationStatusApi';

const OPERATION_TABLE_MIN_WIDTH = 900;
const DETAIL_TABLE_MIN_WIDTH = 1680;
const SUMMARY_COLORS = ['#25b6fe', '#cdced2'];

const operationTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 2 },
    { label: 'Diesel #1', colSpan: 6 },
    { label: 'Diesel #2', colSpan: 6 }
  ],
  [
    { label: '상태' },
    { label: '유효[kW]' },
    { label: 'V[V]' },
    { label: 'A[A]' },
    { label: '주파수[Hz]' },
    { label: 'PF[%]' },
    { label: '상태' },
    { label: '유효[kW]' },
    { label: 'V[V]' },
    { label: 'A[A]' },
    { label: '주파수[Hz]' },
    { label: 'PF[%]' }
  ]
];

const detailTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'Time', rowSpan: 2 },
    { label: '상태', rowSpan: 2 },
    { label: 'Power', colSpan: 9 },
    { label: 'TMP[°C]', colSpan: 2 },
    { label: 'Oil[Bar]', rowSpan: 2 },
    { label: 'RPM', rowSpan: 2 },
    { label: 'Fuel[%]', rowSpan: 2 }
  ],
  [
    { label: '유효[kW]' },
    { label: '무효[kW]' },
    { label: '피상[kW]' },
    { label: 'PF[%]' },
    { label: '지상/진상' },
    { label: 'DAY[kWh]' },
    { label: 'V[V]' },
    { label: 'A[A]' },
    { label: '주파수[Hz]' },
    { label: 'COOL' },
    { label: 'OIL' }
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

function createOperationTableRows(response: SupportGenerationStatusResponse): TableRow[] {
  const rowsByTime = getRowsByTime(response.diesel1StatusList, response.diesel2StatusList);

  return rowsByTime.map(({ time, value }) => {
    const diesel1 = value.set0;
    const diesel2 = value.set1;

    return [
      time,
      String(readApiField(diesel1, 'dslStat') ?? '-'),
      formatApiNumber(readApiField(diesel1, 'dslAtpTot')),
      formatApiNumber(readApiField(diesel1, 'dslVtg')),
      formatApiNumber(readApiField(diesel1, 'dslCur')),
      formatApiNumber(readApiField(diesel1, 'dslFreq')),
      formatApiPowerFactor(readApiField(diesel1, 'dslPfTot')),
      String(readApiField(diesel2, 'dslStat') ?? '-'),
      formatApiNumber(readApiField(diesel2, 'dslAtpTot')),
      formatApiNumber(readApiField(diesel2, 'dslVtg')),
      formatApiNumber(readApiField(diesel2, 'dslCur')),
      formatApiNumber(readApiField(diesel2, 'dslFreq')),
      formatApiPowerFactor(readApiField(diesel2, 'dslPfTot'))
    ];
  });
}

function createDetailRows(detailList: ApiRecord[]): TableRow[] {
  return sortByDateTime(detailList).map((row) => [
    getTimeLabel(row),
    String(readApiField(row, 'dslStat') ?? '-'),
    formatApiNumber(readApiField(row, 'dslAtpTot')),
    formatApiNumber(readApiField(row, 'dslRtpTot')),
    formatApiNumber(readApiField(row, 'dslArpTot')),
    formatApiPowerFactor(readApiField(row, 'dslPfTot')),
    String(readApiField(row, 'dslLeadLag') ?? '-'),
    formatApiNumber(readApiField(row, 'dslAtpDayAccm')),
    formatApiNumber(readApiField(row, 'dslVtg')),
    formatApiNumber(readApiField(row, 'dslCur')),
    formatApiNumber(readApiField(row, 'dslFreq')),
    formatApiNumber(readApiField(row, 'dslCoolTemp')),
    formatApiNumber(readApiField(row, 'dslOilTemp')),
    formatApiNumber(readApiField(row, 'dslOilPress')),
    formatApiNumber(readApiField(row, 'dslRpm'), 0),
    formatApiNumber(readApiField(row, 'dslFuel'), 0)
  ]);
}

/*
 * 필요: 보조 발전현황(디젤) API 응답을 화면 컴포넌트 계약으로 변환한다.
 * 연결: useSupportGenerationStatus, SupportGenerationSummarySection, SupportGenerationDetailTableSection.
 * 설명: 2026.08.31 워크샵 반영 스펙 — 운전 상세 표(디젤1/2 단순 6컬럼)와 장비별 상세 표(STRING/TMP/OIL/RPM/Fuel)를 분리했다.
 * 수정: 디젤 API 필드명이 바뀌면 이 adapter의 매핑만 먼저 조정한다.
 */
export function toSupportGenerationPageData(response: SupportGenerationStatusResponse): SupportGenerationPageData {
  const diesel1Total = readApiField(response.diesel1Latest, 'dslAtpTot');
  const diesel2Total = readApiField(response.diesel2Latest, 'dslAtpTot');
  const dieselTotal = sumApiNumbers([diesel1Total, diesel2Total]);
  const rowsByTime = getRowsByTime(response.diesel1StatusList, response.diesel2StatusList);
  const operationRows = createOperationTableRows(response);

  return {
    summary: {
      columns: ['Total', 'Diesel #1', 'Diesel #2'],
      metrics: [
        {
          label: '비중[%]',
          values: ['100.0', formatShare(diesel1Total, dieselTotal), formatShare(diesel2Total, dieselTotal)]
        },
        {
          label: '전력[kW]',
          values: [formatApiNumber(dieselTotal), formatApiNumber(diesel1Total), formatApiNumber(diesel2Total)]
        }
      ],
      donutData: [
        { name: 'Diesel #1', value: toChartNumber(diesel1Total) },
        { name: 'Diesel #2', value: toChartNumber(diesel2Total) }
      ],
      donutLegendLabels: ['Diesel #1', 'Diesel #2'],
      donutColors: SUMMARY_COLORS
    },
    trendChart: {
      labels: rowsByTime.map(({ time }) => time),
      totalOutputSeries: rowsByTime.map(({ value }) =>
        sumApiNumbers([readApiField(value.set0, 'dslAtpTot'), readApiField(value.set1, 'dslAtpTot')])
      ),
      diesel1OutputSeries: rowsByTime.map(({ value }) => toChartNumber(readApiField(value.set0, 'dslAtpTot'))),
      diesel2OutputSeries: rowsByTime.map(({ value }) => toChartNumber(readApiField(value.set1, 'dslAtpTot')))
    },
    operationTable: {
      ariaLabel: '보조 발전현황 운전 상세 현황',
      minWidth: OPERATION_TABLE_MIN_WIDTH,
      headerRows: operationTableHeaderRows,
      rows: operationRows,
      allRows: operationRows
    },
    detailTable: {
      ariaLabel: '보조 발전현황 장비 상세 내역',
      minWidth: DETAIL_TABLE_MIN_WIDTH,
      defaultExpanded: true,
      defaultEquipmentValue: 'diesel-1',
      equipmentOptions: [
        { label: 'Diesel #1', value: 'diesel-1' },
        { label: 'Diesel #2', value: 'diesel-2' }
      ],
      headerRows: detailTableHeaderRows,
      rowsByEquipment: {
        'diesel-1': createDetailRows(response.diesel1Detail),
        'diesel-2': createDetailRows(response.diesel2Detail)
      }
    }
  };
}
