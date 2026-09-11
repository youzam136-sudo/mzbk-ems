import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';

/*
 * 필요: 전력 소비 현황 API 기반 view model 계약을 정의한다.
 * 연결: powerConsumptionStatusAdapter, PowerConsumptionSummarySection, PowerConsumptionTableSection.
 * 설명: 전력 소비 전용 API가 없어 현재는 monitoring 계열 API 값을 화면 구조에 맞춰 변환한다.
 * 수정: 전력 소비 전용 endpoint가 확정되면 adapter와 api 파일만 먼저 교체한다.
 */
export type PowerConsumptionSummaryMetric = {
  label: string;
  values: string[];
};

export type PowerConsumptionDistributionItem = {
  name: string;
  value: number;
};

export type PowerConsumptionTrendLineSeries = {
  name: string;
  data: number[];
};

export type PowerConsumptionTrendChartData = {
  labels: string[];
  totalDemandSeries: number[];
  bankLineSeries: PowerConsumptionTrendLineSeries[];
};

export type PowerConsumptionSummaryData = {
  columns: string[];
  metrics: PowerConsumptionSummaryMetric[];
  donutData: PowerConsumptionDistributionItem[];
  donutLegendLabels: string[];
  donutColors: string[];
};

export type PowerConsumptionOperationTableData = {
  ariaLabel: string;
  minWidth: number;
  headerRows: TableHeaderCell[][];
  rows: TableRow[];
  allRows?: TableRow[];
};

export type PowerConsumptionDetailTableData = {
  ariaLabel: string;
  minWidth: number;
  headerRows: TableHeaderCell[][];
  rowsByEquipment: Record<string, TableRow[]>;
  equipmentOptions: { label: string; value: string }[];
  defaultEquipmentValue: string;
  defaultExpanded: boolean;
};

export type PowerConsumptionPageData = {
  summary: PowerConsumptionSummaryData;
  trendChart: PowerConsumptionTrendChartData;
  operationTable: PowerConsumptionOperationTableData;
  detailTable: PowerConsumptionDetailTableData;
};
