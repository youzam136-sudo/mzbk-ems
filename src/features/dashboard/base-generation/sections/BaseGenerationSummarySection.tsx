import { ChartSummaryPanel } from '../../../../shared/ui/ChartSummaryPanel';
import type { BaseGenerationSummaryData, BaseGenerationTrendChartData } from '../types/baseGeneration';

type BaseGenerationSummarySectionProps = {
  summary: BaseGenerationSummaryData;
  trendChart: BaseGenerationTrendChartData;
};

/*
 * 필요: 기저발전 상단 그래프 패널을 공통 ChartSummaryPanel 데이터로 연결한다.
 * 연결: ChartSummaryPanel, useBaseGenerationStatus.
 * 설명: 그래프 개수와 막대/선 타입만 ViewModel로 넘기고 레이아웃/폰트/범례는 공통 컴포넌트가 담당한다.
 * 수정: 기저발전 값과 series 구성은 adapter에서 조정한다.
 */
export function BaseGenerationSummarySection({ summary, trendChart }: BaseGenerationSummarySectionProps) {
  return (
    <ChartSummaryPanel
      donutTitle="발전 비중"
      donutData={summary.donutData}
      donutLegendLabels={summary.donutLegendLabels}
      donutColors={summary.donutColors}
      summaryAriaLabel="기저발전 요약"
      summaryColumns={summary.columns}
      summaryMetrics={summary.metrics}
      chartLabels={trendChart.labels}
      chartYAxisName="Total kWh"
      chartSeries={[
        { name: '유효전력', type: 'bar', data: trendChart.totalOutputSeries },
        { name: '무효전력', type: 'line', data: trendChart.lineSeries, color: '#f3f6ff' }
      ]}
    />
  );
}
