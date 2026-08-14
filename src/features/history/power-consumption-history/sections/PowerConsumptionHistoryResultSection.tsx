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
import { powerConsumptionHistoryMetrics } from '../constants/powerConsumptionHistoryConfig';
import type { PowerConsumptionHistoryMetric, PowerConsumptionHistoryMode } from '../types/powerConsumptionHistory';
import '../styles/PowerConsumptionHistoryResultSection.css';

type PowerConsumptionHistoryResultSectionProps = {
  searchCriteria: SearchConditionCriteria<PowerConsumptionHistoryMode>;
  searchedAt: string;
};

/*
 * 필요: 전력소비 이력의 지표 탭, 차트, 표, 엑셀 저장을 API 데이터로 묶는다.
 * 연결: useMonitoringHistoryViewData, MetricTabs, BaseChart, DataTableCard.
 * 설명: 전력소비 전용 이력 endpoint 확정 전까지 GRID 이력 API를 기준 데이터로 사용한다.
 * 수정: 결과 영역 간격과 표 위치는 styles/PowerConsumptionHistoryResultSection.css에서 조정한다.
 */
export function PowerConsumptionHistoryResultSection({ searchCriteria, searchedAt }: PowerConsumptionHistoryResultSectionProps) {
  const [metric, setMetric] = useState<PowerConsumptionHistoryMetric>('Max kWh');
  const isHourlyChart = isSingleDayRange(searchCriteria.startDate, searchCriteria.endDate);
  const shouldScrollToCurrentTime = isHourlyChart && isTodayDate(searchCriteria.startDate);
  const historyConfig = useMemo(
    () => ({
      resource: 'grid' as const,
      metrics: powerConsumptionHistoryMetrics,
      tableTitle: '전력소비 이력',
      minWidth: 1280,
      barField: 'baAtpTot',
      lineField: 'baRtpTot',
      fields: [
        { label: 'TOTAL kWh', key: 'baAtpTot' },
        { label: 'Reactive', key: 'baRtpTot' },
        { label: 'PF', key: 'baPfTot' },
        { label: 'V L12', key: 'baPtpvL12' },
        { label: 'A L1', key: 'baPaL1' },
        { label: 'FR L1', key: 'baPfrL1' }
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
          name: '유효전력',
          type: 'bar',
          barWidth: 44,
          data: data?.barSeriesByMetric[metric] ?? []
        },
        {
          name: '무효전력',
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
    <PageCard className="power-consumption-history-result power-consumption-history-result--chart">
      <MetricTabs
        ariaLabel="전력소비 이력 지표"
        value={metric}
        options={powerConsumptionHistoryMetrics}
        onChange={setMetric}
      />
      <div className="sr-only" aria-live="polite">
        조회 조건: {searchCriteria.mode} / {searchCriteria.startDate || '-'} ~ {searchCriteria.endDate || '-'} / 조회 시각: {searchedAt}
      </div>
      {isLoading && <PageDataLoadingFallback title="전력소비 이력" />}
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
              { name: '유효전력', type: 'bar', color: '#2f9cff' },
              { name: '무효전력', type: 'line', color: '#f3f6ff' }
            ]}
          />
      )}
    </PageCard>
      {!isLoading && data && (
        <DataTableCard
          className="power-consumption-history-result__table-card"
          ariaLabel={data.table.ariaLabel}
          headerRows={data.table.headerRows}
          rows={data.table.rows}
          minWidth={data.table.minWidth}
          excel={{ fileName: `전력소비_이력_${searchCriteria.mode}`, sheetName: '전력소비 이력' }}
        />
      )}
    </>
  );
}
