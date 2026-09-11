import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { BaseChart } from '../../../../shared/ui/BaseChart';
import { PageCard } from '../../../../shared/ui/PageCard';
import { SummaryMatrix } from '../../../../shared/ui/SummaryMatrix';
import type { PcsChargeDischargeChartData, PcsChargeDischargeSummaryData } from '../types/pcsChargeDischargeStatus';
import '../styles/PcsChargeDischargeSummarySection.css';

const CHART_FONT_FAMILY = 'NotoSansKR-Regular, Noto Sans KR, Malgun Gothic, sans-serif';

type PcsChargeDischargeSummarySectionProps = {
  summary: PcsChargeDischargeSummaryData;
  chart: PcsChargeDischargeChartData;
};

/*
 * 필요: 충방전 현황 상단 패널 — 다른 발전 화면과 달리 도넛이 없고 MAX/MIN/AVG 표 + SoC(%) 듀얼축 차트를 쓴다.
 * 연결: usePcsChargeDischargeStatus.
 * 설명: 충전은 막대(+), 방전은 막대(-)로 kWh 축에, SoC(%)는 꺾은선으로 % 축(오른쪽)에 그린다.
 * 수정: 충전/방전 판정 기준이나 SoC 매핑은 adapter에서 조정한다.
 */
export function PcsChargeDischargeSummarySection({ summary, chart }: PcsChargeDischargeSummarySectionProps) {
  const chartOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      tooltip: { trigger: 'axis' },
      legend: {
        bottom: 0,
        textStyle: { color: '#d6ddea', fontFamily: CHART_FONT_FAMILY, fontSize: 13, fontWeight: 300 }
      },
      grid: { left: 56, right: 56, top: 24, bottom: 64, containLabel: false },
      xAxis: {
        type: 'category',
        data: chart.labels,
        axisTick: { show: false },
        axisLabel: { color: '#b8c2d8', fontFamily: CHART_FONT_FAMILY, fontSize: 13, fontWeight: 300 },
        axisLine: { lineStyle: { color: '#354057' } }
      },
      yAxis: [
        {
          type: 'value',
          name: 'kWh',
          nameTextStyle: { color: '#b8c2d8' },
          axisLabel: { color: '#b8c2d8' },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        {
          type: 'value',
          name: '%',
          nameTextStyle: { color: '#b8c2d8' },
          axisLabel: { color: '#b8c2d8' },
          axisLine: { show: false },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '충전 표시',
          type: 'bar',
          stack: 'charge',
          yAxisIndex: 0,
          barMaxWidth: 32,
          itemStyle: { color: '#25b6fe' },
          data: chart.chargeSeries
        },
        {
          name: '방전 표시',
          type: 'bar',
          stack: 'charge',
          yAxisIndex: 0,
          barMaxWidth: 32,
          itemStyle: { color: '#d20000' },
          data: chart.dischargeSeries
        },
        {
          name: 'SoC(%)',
          type: 'line',
          step: 'end',
          yAxisIndex: 1,
          showSymbol: false,
          lineStyle: { color: '#25affa', width: 2 },
          data: chart.socSeries
        }
      ]
    }),
    [chart.labels, chart.chargeSeries, chart.dischargeSeries, chart.socSeries]
  );

  return (
    <PageCard className="card--tight pcs-charge-summary">
      <SummaryMatrix
        ariaLabel="PCS 충방전 요약"
        columns={['MAX[kWh]', 'MIN[kWh]', 'AVG[kWh]']}
        metrics={summary.rows.map((row) => ({ label: row.label, values: [row.max, row.min, row.avg] }))}
        minWidth={420}
        className="pcs-charge-summary__matrix"
      />

      <div className="pcs-charge-summary__chart">
        <BaseChart option={chartOption} height={300} />
      </div>
    </PageCard>
  );
}
