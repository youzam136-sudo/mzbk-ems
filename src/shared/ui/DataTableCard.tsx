import type { ReactNode } from 'react';
import type { ExcelExportSheet } from '../utils/excelExport';
import type { TableHeaderCell, TableRow } from '../types/table';
import { BasicTable } from './BasicTable';
import { ExcelSaveButton } from './ExcelSaveButton';
import { PageCard } from './PageCard';
import './DataTableCard.css';

type DataTableCardExcel = {
  fileName: string;
  sheetName: string;
  rows?: TableRow[];
};

type DataTableCardProps = {
  title?: string;
  ariaLabel: string;
  headers?: string[];
  headerRows?: TableHeaderCell[][];
  rows: TableRow[];
  minWidth?: number | string;
  excel?: DataTableCardExcel;
  actions?: ReactNode;
  className?: string;
  tableClassName?: string;
};

/*
 * 필요: 표 패널, 액션, 엑셀 저장, BasicTable 연결을 하나의 공통 구조로 묶는다.
 * 연결: 기저발전/보조발전 상세 표와 이후 같은 형식의 현황 표.
 * 설명: 화면별 컬럼과 행은 API view model에서 받고, 카드 여백과 액션 위치는 공통 CSS로 통일한다.
 * 수정: 버튼 위치나 표 패널 공통 간격은 DataTableCard.css에서 조정한다.
 */
export function DataTableCard({
  title,
  ariaLabel,
  headers,
  headerRows,
  rows,
  minWidth,
  excel,
  actions,
  className = '',
  tableClassName = ''
}: DataTableCardProps) {
  const excelSheets: ExcelExportSheet[] | undefined = excel
    ? [
        {
          name: excel.sheetName,
          headers,
          headerRows,
          rows: excel.rows ?? rows
        }
      ]
    : undefined;

  const resolvedActions =
    actions ??
    (excel ? <ExcelSaveButton fileName={excel.fileName} sheets={excelSheets} /> : undefined);

  return (
    <PageCard title={title} actions={resolvedActions} className={`data-table-card ${className}`.trim()} ariaLabel={title || ariaLabel}>
      <BasicTable
        ariaLabel={ariaLabel}
        headers={headers}
        headerRows={headerRows}
        rows={rows}
        minWidth={minWidth}
        className={tableClassName}
      />
    </PageCard>
  );
}
