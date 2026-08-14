import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';

/*
 * 필요: 보조 발전현황 API 응답을 화면 컴포넌트가 쓰는 view model로 고정한다.
 * 연결: supportGenerationStatusAdapter, SupportGenerationSummarySection, SupportGenerationDetailTableSection.
 * 설명: 컴포넌트는 API 필드명을 모르고 이 타입의 요약/차트/표 데이터만 받는다.
 * 수정: API 필드가 바뀌면 adapter를 먼저 수정하고, 화면 구조 변경 시 이 타입을 조정한다.
 */
export type SupportGenerationSummaryMetric = {
  label: string;
  values: string[];
};

export type SupportGenerationDistributionItem = {
  name: string;
  value: number;
};

export type SupportGenerationTrendChartData = {
  labels: string[];
  totalOutputSeries: number[];
  batteryOutputSeries: number[];
  dieselOutputSeries: number[];
};

export type SupportGenerationSummaryData = {
  columns: string[];
  metrics: SupportGenerationSummaryMetric[];
  donutData: SupportGenerationDistributionItem[];
  donutLegendLabels: string[];
  donutColors: string[];
};

export type SupportGenerationDetailTableData = {
  ariaLabel: string;
  minWidth: number;
  headerRows: TableHeaderCell[][];
  rows: TableRow[];
  equipmentOptions: {
    label: string;
    value: string;
  }[];
  defaultEquipmentValue: string;
  defaultExpanded: boolean;
};

export type SupportGenerationPageData = {
  summary: SupportGenerationSummaryData;
  trendChart: SupportGenerationTrendChartData;
  table: SupportGenerationDetailTableData;
};
