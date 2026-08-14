import type { TableHeaderCell, TableRow } from '../../../../shared/types/table';

/*
 * 필요: PCS 충방전 API 응답을 화면용 요약/차트/표 view model로 고정한다.
 * 연결: pcsChargeDischargeStatusAdapter, PcsChargeDischargeSummarySection, PcsChargeDischargeTableSection.
 * 설명: 컴포넌트는 PCS/Battery API 필드명을 모르고 이 타입만 사용한다.
 * 수정: 충전/방전 기준값이 바뀌면 adapter 매핑을 먼저 조정한다.
 */
export type PcsChargeDischargeSummaryMetric = {
  label: string;
  values: string[];
};

export type PcsChargeDischargeDistributionItem = {
  name: string;
  value: number;
};

export type PcsChargeDischargeChartData = {
  labels: string[];
  chargeSeries: number[];
  dischargeSeries: number[];
};

export type PcsChargeDischargeSummaryData = {
  columns: string[];
  metrics: PcsChargeDischargeSummaryMetric[];
  donutData: PcsChargeDischargeDistributionItem[];
  donutLegendLabels: string[];
  donutColors: string[];
};

export type PcsChargeDischargeTableData = {
  ariaLabel: string;
  minWidth: number;
  headerRows: TableHeaderCell[][];
  rows: TableRow[];
};

export type PcsChargeDischargePageData = {
  summary: PcsChargeDischargeSummaryData;
  chart: PcsChargeDischargeChartData;
  pcsTable: PcsChargeDischargeTableData;
  batteryTable: PcsChargeDischargeTableData;
};
