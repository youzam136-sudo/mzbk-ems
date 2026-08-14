import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';

/*
 * 필요: 기저발전 API 응답을 화면 섹션에 전달할 view model 타입.
 * 연결: baseGeneration API adapter, BaseGeneration section 컴포넌트.
 * 설명: 보조발전과 같은 구조로 summary, trend chart, 상세 표 계약을 나눠 데이터 교체 위치를 맞춘다.
 * 수정: 컬럼/series/장비 옵션 구조가 바뀔 때만 이 파일을 수정한다.
 */
export type BaseGenerationSummaryMetric = {
  label: string;
  values: string[];
};

export type BaseGenerationChartDatum = {
  value: number;
  name: string;
};

export type BaseGenerationTrendChartData = {
  labels: string[];
  totalOutputSeries: number[];
  lineSeries: number[];
};

export type BaseGenerationDetailTableData = {
  ariaLabel: string;
  minWidth: number;
  headerRows: TableHeaderCell[][];
  rows: TableRow[];
  allRows?: TableRow[];
};

export type BaseGenerationEquipmentDetailTableData = BaseGenerationDetailTableData & {
  equipmentOptions: {
    label: string;
    value: string;
  }[];
  defaultEquipmentValue: string;
  defaultExpanded: boolean;
};

export type BaseGenerationTargetOption = {
  label: string;
  value: string;
};

export type BaseGenerationSummaryData = {
  columns: string[];
  metrics: BaseGenerationSummaryMetric[];
  donutData: BaseGenerationChartDatum[];
  donutLegendLabels: string[];
  donutColors: string[];
};

export type BaseGenerationTableData = {
  powerTable: BaseGenerationDetailTableData;
  inverterTable: BaseGenerationEquipmentDetailTableData;
};

export type BaseGenerationPageData = {
  summary: BaseGenerationSummaryData;
  trendChart: BaseGenerationTrendChartData;
  tables: BaseGenerationTableData;
  targetOptions: BaseGenerationTargetOption[];
  selectedTargetId: string;
};
