import { ChartSummaryPanel } from '../../../../shared/ui/ChartSummaryPanel';
import type { SupportGenerationSummaryData, SupportGenerationTrendChartData } from '../types/supportGenerationStatus';

type SupportGenerationSummarySectionProps = {
  summary: SupportGenerationSummaryData;
  trendChart: SupportGenerationTrendChartData;
};

/*
 * 필요: 보조 발전현황 상단 그래프 패널을 API view model과 연결한다.
 * 연결: ChartSummaryPanel, useSupportGenerationStatus.
 * 설명: 그래프 종류와 series 값만 전달하고, 공통 배치/폰트/범례는 ChartSummaryPanel이 유지한다.
 * 수정: 보조발전 값과 series 구성은 adapter에서 조정한다.
 */
export function SupportGenerationSummarySection({ summary, trendChart }: SupportGenerationSummarySectionProps) {
  return (
    <ChartSummaryPanel
      donutTitle="발전 비중"
      donutData={summary.donutData}
      donutLegendLabels={summary.donutLegendLabels}
      donutColors={summary.donutColors}
      summaryAriaLabel="보조 발전현황 요약"
      summaryColumns={summary.columns}
      summaryMetrics={summary.metrics}
      chartLabels={trendChart.labels}
      chartYAxisName="Total kWh"
      chartSeries={[
        { name: '전체 발전량', type: 'bar', data: trendChart.totalOutputSeries },
        { name: 'ESS 발전량', type: 'line', data: trendChart.batteryOutputSeries, color: '#396985' },
        { name: '디젤 발전량', type: 'line', data: trendChart.dieselOutputSeries, color: '#cdced2' }
      ]}
    />
  );
}
