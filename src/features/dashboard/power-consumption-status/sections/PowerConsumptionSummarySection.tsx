import { ChartSummaryPanel } from '../../../../shared/ui/ChartSummaryPanel';
import type { PowerConsumptionSummaryData, PowerConsumptionTrendChartData } from '../types/powerConsumptionStatus';

type PowerConsumptionSummarySectionProps = {
  summary: PowerConsumptionSummaryData;
  trendChart: PowerConsumptionTrendChartData;
};

/*
 * 필요: 전력 소비 현황 상단 패널을 API view model과 연결한다.
 * 연결: ChartSummaryPanel, usePowerConsumptionStatus.
 * 설명: 도넛/요약/차트 공통 형태를 유지하고 값만 adapter에서 받은 데이터로 렌더링한다.
 * 수정: 전력 소비 chart series 구성은 adapter에서 조정한다.
 */
export function PowerConsumptionSummarySection({ summary, trendChart }: PowerConsumptionSummarySectionProps) {
  return (
    <ChartSummaryPanel
      donutTitle="전력 소비 비중"
      donutData={summary.donutData}
      donutLegendLabels={summary.donutLegendLabels}
      donutColors={summary.donutColors}
      summaryAriaLabel="전력 소비 현황 요약"
      summaryColumns={summary.columns}
      summaryMetrics={summary.metrics}
      chartLabels={trendChart.labels}
      chartYAxisName="Total kWh"
      chartSeries={[
        { name: '전체 소비량', type: 'bar', data: trendChart.totalDemandSeries },
        { name: 'PF', type: 'line', data: trendChart.pfSeries, color: '#f3f6ff' }
      ]}
    />
  );
}
