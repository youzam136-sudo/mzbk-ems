import type { TableHeaderCell, TableRow } from '../types/table';

export type ExcelExportSheet = {
  name: string;
  headers?: string[];
  headerRows?: TableHeaderCell[][];
  rows: TableRow[];
};

type ExcelWorkbookOptions = {
  fileName: string;
  sheets: ExcelExportSheet[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeFileName(fileName: string) {
  const safeName = fileName.replace(/[\\/:*?"<>|]/g, '_').trim();
  return safeName.toLowerCase().endsWith('.xls') ? safeName : `${safeName || 'export'}.xls`;
}

function normalizeSheetName(sheetName: string) {
  return sheetName.replace(/[\\/*?:[\]]/g, ' ').trim().slice(0, 31) || 'Sheet';
}

function stringifyCell(cell: TableRow[number]) {
  if (cell === null || cell === undefined || typeof cell === 'boolean') return '';
  if (typeof cell === 'string' || typeof cell === 'number') return String(cell);
  return '';
}

function renderHeaderRows(sheet: ExcelExportSheet) {
  if (sheet.headerRows?.length) {
    return sheet.headerRows
      .map((headerRow) => {
        const cells = headerRow
          .map((cell) => {
            const colSpan = cell.colSpan ? ` colspan="${cell.colSpan}"` : '';
            const rowSpan = cell.rowSpan ? ` rowspan="${cell.rowSpan}"` : '';
            return `<th${colSpan}${rowSpan}>${escapeHtml(cell.label)}</th>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');
  }

  if (sheet.headers?.length) {
    return `<tr>${sheet.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`;
  }

  return '';
}

function renderSheet(sheet: ExcelExportSheet) {
  const rows = sheet.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(stringifyCell(cell))}</td>`).join('')}</tr>`)
    .join('');

  return `
    <h2>${escapeHtml(normalizeSheetName(sheet.name))}</h2>
    <table border="1">
      <thead>${renderHeaderRows(sheet)}</thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

/*
 * 필요: 화면 표 데이터를 별도 라이브러리 없이 Excel에서 열 수 있는 파일로 저장한다.
 * 연결: ExcelSaveButton과 feature별 table view model.
 * 설명: 실제 서버 엑셀 생성이 아니라 퍼블리싱용 브라우저 다운로드이며, 병합 헤더는 HTML 표로 보존한다.
 * 수정: 파일 포맷을 xlsx로 바꾸려면 이 유틸만 교체한다.
 */
export function downloadExcelWorkbook({ fileName, sheets }: ExcelWorkbookOptions) {
  if (!sheets.length) return;

  const body = sheets.map(renderSheet).join('<br />');
  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; }
          th, td { padding: 6px 10px; text-align: center; mso-number-format: "\\@"; }
          th { font-weight: 700; background: #e8eef8; }
        </style>
      </head>
      <body>${body}</body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = normalizeFileName(fileName);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
