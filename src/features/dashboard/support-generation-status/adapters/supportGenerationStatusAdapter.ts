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
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { SupportGenerationPageData } from '../types/supportGenerationStatus';
import type { SupportGenerationStatusResponse } from '../api/supportGenerationStatusApi';

const TABLE_MIN_WIDTH = 1620;
const SUMMARY_COLORS = ['#25b6fe', '#396985', '#cdced2'];

const supportTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 3 },
    { label: 'Diesel #1', colSpan: 5 },
    { label: 'Diesel #2', colSpan: 5 },
    { label: 'PCS ( Discharge )', colSpan: 8 }
  ],
  [
    { label: 'P', colSpan: 4 },
    { label: 'PF', rowSpan: 2 },
    { label: 'P', colSpan: 4 },
    { label: 'PF', rowSpan: 2 },
    { label: 'P', colSpan: 4 },
    { label: 'PE', colSpan: 4 }
  ],
  [
    { label: 'TOT' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' },
    { label: 'TOT' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' },
    { label: 'TOT' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' },
    { label: 'TOT' },
    { label: 'L1' },
    { label: 'L2' },
    { label: 'L3' }
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

function createTableRows(response: SupportGenerationStatusResponse): TableRow[] {
  const rowsByTime = getRowsByTime(response.diesel1StatusList, response.diesel2StatusList, response.essStatusList);

  return rowsByTime.map(({ time, value }) => {
    const diesel1 = value.set0;
    const diesel2 = value.set1;
    const ess = value.set2;

    return [
      time,
      formatApiNumber(readApiField(diesel1, 'dslAtpTot')),
      formatApiNumber(readApiField(diesel1, 'dslAtpL1')),
      formatApiNumber(readApiField(diesel1, 'dslAtpL2')),
      formatApiNumber(readApiField(diesel1, 'dslAtpL3')),
      formatApiPowerFactor(readApiField(diesel1, 'dslPfTot')),
      formatApiNumber(readApiField(diesel2, 'dslAtpTot')),
      formatApiNumber(readApiField(diesel2, 'dslAtpL1')),
      formatApiNumber(readApiField(diesel2, 'dslAtpL2')),
      formatApiNumber(readApiField(diesel2, 'dslAtpL3')),
      formatApiPowerFactor(readApiField(diesel2, 'dslPfTot')),
      formatApiNumber(readApiField(ess, 'essAtpTot')),
      formatApiNumber(readApiField(ess, 'essAtpL1')),
      formatApiNumber(readApiField(ess, 'essAtpL2')),
      formatApiNumber(readApiField(ess, 'essAtpL3')),
      formatApiNumber(readApiField(ess, 'essRtpTot')),
      formatApiNumber(readApiField(ess, 'essRtpTot')),
      formatApiNumber(readApiField(ess, 'essArpTot')),
      formatApiPowerFactor(readApiField(ess, 'essPfTot'))
    ];
  });
}

/*
 * 필요: 보조 발전현황 API 응답을 기존 공통 그래프/표 컴포넌트 계약으로 변환한다.
 * 연결: useSupportGenerationStatus, SupportGenerationSummarySection, SupportGenerationDetailTableSection.
 * 설명: Diesel #1, Diesel #2, ESS 값을 합산해 보조발전 Total을 만들고, 빈 값은 '-'로 고정한다.
 * 수정: 보조발전의 장비 구성이 바뀌면 summaryColumns와 row 매핑만 조정한다.
 */
export function toSupportGenerationPageData(response: SupportGenerationStatusResponse): SupportGenerationPageData {
  const diesel1Total = readApiField(response.diesel1Latest, 'dslAtpTot');
  const diesel2Total = readApiField(response.diesel2Latest, 'dslAtpTot');
  const essTotal = readApiField(response.essLatest, 'essAtpTot');
  const total = sumApiNumbers([diesel1Total, diesel2Total, essTotal]);
  const rowsByTime = getRowsByTime(response.diesel1StatusList, response.diesel2StatusList, response.essStatusList);
  const tableRows = createTableRows(response);

  return {
    summary: {
      columns: ['Total', 'Diesel #1', 'Diesel #2', 'Battery D.Charge'],
      metrics: [
        {
          label: '발전비중(%)',
          values: ['100.0', formatShare(diesel1Total, total), formatShare(diesel2Total, total), formatShare(essTotal, total)]
        },
        {
          label: '발전량(kWh)',
          values: [formatApiNumber(total), formatApiNumber(diesel1Total), formatApiNumber(diesel2Total), formatApiNumber(essTotal)]
        }
      ],
      donutData: [
        { name: 'Diesel #1', value: toChartNumber(diesel1Total) },
        { name: 'Diesel #2', value: toChartNumber(diesel2Total) },
        { name: 'ESS', value: toChartNumber(essTotal) }
      ],
      donutLegendLabels: ['Diesel #1', 'Diesel #2', 'ESS'],
      donutColors: SUMMARY_COLORS
    },
    trendChart: {
      labels: rowsByTime.map(({ time }) => time),
      totalOutputSeries: rowsByTime.map(({ value }) =>
        sumApiNumbers([
          readApiField(value.set0, 'dslAtpTot'),
          readApiField(value.set1, 'dslAtpTot'),
          readApiField(value.set2, 'essAtpTot')
        ])
      ),
      dieselOutputSeries: rowsByTime.map(({ value }) =>
        sumApiNumbers([readApiField(value.set0, 'dslAtpTot'), readApiField(value.set1, 'dslAtpTot')])
      ),
      batteryOutputSeries: rowsByTime.map(({ value }) => toChartNumber(readApiField(value.set2, 'essAtpTot')))
    },
    table: {
      ariaLabel: '보조 발전현황 디젤 상세 내역',
      minWidth: TABLE_MIN_WIDTH,
      defaultExpanded: true,
      defaultEquipmentValue: 'diesel-1',
      equipmentOptions: [
        { label: 'Diesel #1', value: 'diesel-1' },
        { label: 'Diesel #2', value: 'diesel-2' }
      ],
      headerRows: supportTableHeaderRows,
      rows: tableRows.length > 0 ? tableRows : [[EMPTY_API_VALUE]]
    }
  };
}
