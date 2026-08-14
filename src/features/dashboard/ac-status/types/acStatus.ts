import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';

export type AcStatusLatestItem = {
  label: string;
  value: string;
};

export type AcStatusChartData = {
  labels: string[];
  supplyTemperatureSeries: number[];
  returnTemperatureSeries: number[];
  humiditySeries: number[];
};

export type AcStatusTableData = {
  ariaLabel: string;
  minWidth: number;
  headerRows: TableHeaderCell[][];
  rows: TableRow[];
};

export type AcStatusPageData = {
  latestItems: AcStatusLatestItem[];
  chart: AcStatusChartData;
  table: AcStatusTableData;
};
