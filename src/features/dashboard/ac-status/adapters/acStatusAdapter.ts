import {
  EMPTY_API_VALUE,
  formatApiNumber,
  getTimeLabel,
  readApiField,
  sortByDateTime,
  toChartNumber
} from '../../../../shared/api/apiDataUtils';
import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';
import type { AcStatusResponse, AcStatusResponseDto } from '../api/acStatusApi';
import type { AcStatusPageData } from '../types/acStatus';

const acTableHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME' },
    { label: '상태' },
    { label: '급기 온도(℃)' },
    { label: '환기 온도(℃)' },
    { label: '습도(%)' }
  ]
];

function formatStatusCode(value: unknown) {
  const status = String(value ?? '').trim();

  if (!status) return EMPTY_API_VALUE;
  if (status === '01') return '정상';
  if (status === '02') return '주의';
  if (status === '03') return '경고';

  return status;
}

function createTableRows(rows: AcStatusResponseDto[]): TableRow[] {
  return rows.map((row) => [
    getTimeLabel(row),
    formatStatusCode(readApiField(row, 'acOperStuscd')),
    formatApiNumber(readApiField(row, 'acSuplyAirtmp')),
    formatApiNumber(readApiField(row, 'acRtnAirtmp')),
    formatApiNumber(readApiField(row, 'acRtnAirhum'))
  ]);
}

/*
 * 필요: 공조기 API 응답을 최신 상태, 온도/습도 차트, 상세 표 데이터로 변환한다.
 * 연결: useAcStatus, AcStatusPage.
 * 설명: 값이 없으면 '-'만 표시하고 임의 숫자나 임의 라벨을 만들지 않는다.
 * 수정: 공조기 전용 설계가 추가되면 chart series와 latestItems만 먼저 조정한다.
 */
export function toAcStatusPageData(response: AcStatusResponse): AcStatusPageData {
  const rows = sortByDateTime(response.statusList);
  const latest = response.latest ?? rows.at(-1) ?? null;
  const tableRows = createTableRows(rows.length > 0 ? rows : latest ? [latest] : []);

  return {
    latestItems: [
      { label: 'A/C 상태', value: formatStatusCode(readApiField(latest, 'acOperStuscd')) },
      { label: 'A/C 배출공기 온도', value: `${formatApiNumber(readApiField(latest, 'acSuplyAirtmp'))}℃` },
      { label: '온도', value: `${formatApiNumber(readApiField(latest, 'acRtnAirtmp'))}℃` },
      { label: '습도', value: `${formatApiNumber(readApiField(latest, 'acRtnAirhum'))}%` }
    ],
    chart: {
      labels: rows.map((row) => getTimeLabel(row)),
      supplyTemperatureSeries: rows.map((row) => toChartNumber(readApiField(row, 'acSuplyAirtmp'))),
      returnTemperatureSeries: rows.map((row) => toChartNumber(readApiField(row, 'acRtnAirtmp'))),
      humiditySeries: rows.map((row) => toChartNumber(readApiField(row, 'acRtnAirhum')))
    },
    table: {
      ariaLabel: '공조기 상세 현황',
      minWidth: 860,
      headerRows: acTableHeaderRows,
      rows: tableRows.length > 0 ? tableRows : [[EMPTY_API_VALUE]]
    }
  };
}
