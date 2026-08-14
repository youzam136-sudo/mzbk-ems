import { useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import {
  BASE_CHART_AXIS_LEGEND_GAP,
  BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM,
  BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT,
  BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP,
  BASE_CHART_HISTORY_CATEGORY_DATA_ZOOM_BOTTOM,
  BaseChart
} from '../../../../shared/ui/BaseChart';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { MetricTabs } from '../../../../shared/ui/MetricTabs';
import { PageCard } from '../../../../shared/ui/PageCard';
import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import { isSingleDayRange, isTodayDate } from '../../../../shared/utils/hourlyChartSlots';
import { useMonitoringHistoryViewData } from '../../shared/monitoringHistoryViewData';
import { supportGenerationHistoryMetrics } from '../constants/supportGenerationHistoryConfig';
import type { SupportGenerationHistoryMetric, SupportGenerationHistoryMode } from '../types/supportGenerationHistory';
import '../styles/SupportGenerationHistoryResultSection.css';

type SupportGenerationHistoryResultSectionProps = {
  searchCriteria: SearchConditionCriteria<SupportGenerationHistoryMode>;
  searchedAt: string;
};

/*
 * 필요: 보조발전 이력의 지표 탭, 차트, 상세 표, 엑셀 저장을 API 데이터로 구성한다.
 * 연결: useMonitoringHistoryViewData, MetricTabs, BaseChart, DataTableCard.
 * 설명: 보조발전 이력은 ESS 이력 API를 기준으로 받아 공통 history view model로 변환한다.
 * 수정: 차트 높이와 표 간격은 styles/SupportGenerationHistoryResultSection.css에서 조정한다.
 */
export function SupportGenerationHistoryResultSection({ searchCriteria, searchedAt }: SupportGenerationHistoryResultSectionProps) {
  const [metric, setMetric] = useState<SupportGenerationHistoryMetric>('Max kWh');
  const isHourlyChart = isSingleDayRange(searchCriteria.startDate, searchCriteria.endDate);
  const shouldScrollToCurrentTime = isHourlyChart && isTodayDate(searchCriteria.startDate);
  const historyConfig = useMemo(
    () => ({
      resource: 'ess' as const,
      metrics: supportGenerationHistoryMetrics,
      tableTitle: '보조발전 이력',
      minWidth: 1280,
      barField: 'essAtpTot',
      lineField: 'essRtpTot',
      fields: [
        { label: 'ACTIVE POWER', key: 'essAtpTot' },
        { label: 'REACTIVE POWER', key: 'essRtpTot' },
        { label: 'APPARENT POWER', key: 'essArpTot' },
        { label: 'PF', key: 'essPfTot' },
        { label: 'SOC', key: 'essPlntSoc' },
        { label: 'SOH', key: 'essPlntSoh' }
      ],
      searchCriteria
    }),
    [searchCriteria]
  );
  const { data, isLoading, errorMessage } = useMonitoringHistoryViewData(historyConfig);

  const chartOption = useMemo<EChartsOption>(
    () => ({
      color: ['#2f9cff', '#f3f6ff'],
      tooltip: { trigger: 'axis' },
      grid: { left: 64, right: 24, top: 22, bottom: 28, containLabel: true },
      xAxis: {
        type: 'category',
        data: data?.labels ?? [],
        axisLabel: { color: '#b8c2d8' },
        axisLine: { lineStyle: { color: '#354057' } }
      },
      yAxis: {
        type: 'value',
        name: '',
        axisLabel: { color: '#b8c2d8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      series: [
        {
          name: 'ACTIVE POWER',
          type: 'bar',
          barWidth: 44,
          data: data?.barSeriesByMetric[metric] ?? []
        },
        {
          name: 'REACTIVE POWER',
          type: 'line',
          smooth: false,
          data: data?.lineSeriesByMetric[metric] ?? []
        }
      ]
    }),
    [data, metric]
  );

  return (
    <>
    <PageCard className="support-generation-history-result support-generation-history-result--chart">
      <MetricTabs
        ariaLabel="보조발전 이력 지표"
        value={metric}
        options={supportGenerationHistoryMetrics}
        onChange={setMetric}
      />
      <div className="sr-only" aria-live="polite">
        조회 조건: {searchCriteria.mode} / {searchCriteria.startDate || '-'} ~ {searchCriteria.endDate || '-'} / 조회 시각: {searchedAt}
      </div>
      {isLoading && <PageDataLoadingFallback title="보조발전 이력" />}
      {!isLoading && errorMessage && <div role="alert">{errorMessage}</div>}
      {!isLoading && data && (
          <BaseChart
            option={chartOption}
            height={340}
            minWidth={1120}
            fullDay={isHourlyChart}
            scrollToCurrentTime={shouldScrollToCurrentTime}
            categoryCount={!isHourlyChart ? data.labels.length : undefined}
            axisLegendGap={BASE_CHART_AXIS_LEGEND_GAP}
            categoryDataZoomGridBottom={BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM}
            categoryDataZoomHeight={BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT}
            categoryDataZoomBottom={BASE_CHART_HISTORY_CATEGORY_DATA_ZOOM_BOTTOM}
            categoryDataZoomLegendGap={BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP}
            yAxisLabel="Total kWh"
            legendItems={[
              { name: 'ACTIVE POWER', type: 'bar', color: '#2f9cff' },
              { name: 'REACTIVE POWER', type: 'line', color: '#f3f6ff' }
            ]}
          />
      )}
    </PageCard>
      {!isLoading && data && (
        <DataTableCard
          className="support-generation-history-result__table-card"
          ariaLabel={data.table.ariaLabel}
          headerRows={data.table.headerRows}
          rows={data.table.rows}
          minWidth={data.table.minWidth}
          excel={{ fileName: `보조발전_이력_${searchCriteria.mode}`, sheetName: '보조발전 이력' }}
        />
      )}
    </>
  );
}
