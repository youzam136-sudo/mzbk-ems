import { ChartSummaryPanel } from '../../../../shared/ui/ChartSummaryPanel';
import type { PcsChargeDischargeChartData, PcsChargeDischargeSummaryData } from '../types/pcsChargeDischargeStatus';

type PcsChargeDischargeSummarySectionProps = {
  summary: PcsChargeDischargeSummaryData;
  chart: PcsChargeDischargeChartData;
};

/*
 * 필요: PCS 충방전 상단 패널을 API view model과 연결한다.
 * 연결: ChartSummaryPanel, usePcsChargeDischargeStatus.
 * 설명: 충전/방전 series 값만 전달하고, 도넛/요약/차트 레이아웃은 공통 컴포넌트가 담당한다.
 * 수정: 충전/방전 기준값은 adapter에서 조정한다.
 */
export function PcsChargeDischargeSummarySection({ summary, chart }: PcsChargeDischargeSummarySectionProps) {
  return (
    <ChartSummaryPanel
      donutTitle="충방전 비중"
      donutData={summary.donutData}
      donutLegendLabels={summary.donutLegendLabels}
      donutColors={summary.donutColors}
      summaryAriaLabel="PCS 충방전 요약"
      summaryColumns={summary.columns}
      summaryMetrics={summary.metrics}
      chartLabels={chart.labels}
      chartYAxisName="Total kWh"
      chartSeries={[
        { name: '충전 표시', type: 'bar', stack: 'charge', data: chart.chargeSeries },
        { name: '방전 표시', type: 'bar', stack: 'charge', data: chart.dischargeSeries, color: '#d20000' }
      ]}
    />
  );
}
