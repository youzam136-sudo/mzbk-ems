import { useEffect, useMemo, useState } from 'react';
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
import type {
  MonitoringHistoryMetric,
  MonitoringHistoryMode,
  MonitoringResourceHistoryPageConfig
} from '../constants/monitoringResourceHistoryConfig';
import '../styles/MonitoringResourceHistoryPage.css';

type MonitoringResourceHistoryResultSectionProps = {
  config: MonitoringResourceHistoryPageConfig;
  searchCriteria: SearchConditionCriteria<MonitoringHistoryMode>;
  searchedAt: string;
};

/*
 * 필요: status/history API가 있는 monitoring 이력 화면을 하나의 차트/테이블 구조로 출력한다.
 * 연결: monitoring history API, MetricTabs, BaseChart, DataTableCard.
 * 설명: 리소스별 차이는 config의 필드명과 차트명만 바꾸고 화면 구조는 같은 동작을 유지한다.
 */
export function MonitoringResourceHistoryResultSection({
  config,
  searchCriteria,
  searchedAt
}: MonitoringResourceHistoryResultSectionProps) {
  const [metric, setMetric] = useState<MonitoringHistoryMetric>(config.metrics[0] ?? 'Max kWh');
  const isHourlyChart = isSingleDayRange(searchCriteria.startDate, searchCriteria.endDate);
  const shouldScrollToCurrentTime = isHourlyChart && isTodayDate(searchCriteria.startDate);
  const historyConfig = useMemo(
    () => ({
      resource: config.resource,
      metrics: config.metrics,
      tableTitle: config.tableTitle,
      minWidth: config.minWidth,
      barField: config.barField,
      lineField: config.lineField,
      fields: config.fields,
      searchCriteria
    }),
    [config, searchCriteria]
  );
  const { data, isLoading, errorMessage } = useMonitoringHistoryViewData(historyConfig);

  useEffect(() => {
    setMetric(config.metrics[0] ?? 'Max kWh');
  }, [config]);

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
          name: config.chartBarName,
          type: 'bar',
          barWidth: 44,
          data: data?.barSeriesByMetric[metric] ?? []
        },
        {
          name: config.chartLineName,
          type: 'line',
          smooth: false,
          data: data?.lineSeriesByMetric[metric] ?? []
        }
      ]
    }),
    [config.chartBarName, config.chartLineName, data, metric]
  );

  return (
    <>
    <PageCard className="monitoring-history-result monitoring-history-result--chart">
      <MetricTabs ariaLabel={`${config.title} 지표`} value={metric} options={config.metrics} onChange={setMetric} />
      <div className="sr-only" aria-live="polite">
        조회 조건: {searchCriteria.mode} / {searchCriteria.startDate || '-'} ~ {searchCriteria.endDate || '-'} / 조회 시각: {searchedAt}
      </div>

      {isLoading && <PageDataLoadingFallback title={config.title} />}
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
              { name: config.chartBarName, type: 'bar', color: '#2f9cff' },
              { name: config.chartLineName, type: 'line', color: '#f3f6ff' }
            ]}
          />
      )}
    </PageCard>
      {!isLoading && data && (
        <DataTableCard
          className="monitoring-history-result__table-card"
          ariaLabel={data.table.ariaLabel}
          headerRows={data.table.headerRows}
          rows={data.table.rows}
          minWidth={data.table.minWidth}
          excel={{ fileName: `${config.excelFileName}_${searchCriteria.mode}`, sheetName: config.tableTitle }}
        />
      )}
    </>
  );
}
