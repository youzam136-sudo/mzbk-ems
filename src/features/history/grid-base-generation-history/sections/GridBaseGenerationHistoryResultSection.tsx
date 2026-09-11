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
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import { EquipmentSelect } from '../../../../shared/ui/EquipmentSelect';
import { ExcelSaveButton } from '../../../../shared/ui/ExcelSaveButton';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageCard } from '../../../../shared/ui/PageCard';
import { SummaryMatrix } from '../../../../shared/ui/SummaryMatrix';
import { StatChipGroup } from '../../../../shared/ui/StatChipGroup';
import { isSingleDayRange } from '../../../../shared/utils/hourlyChartSlots';
import { useGridBaseGenerationHistoryData } from '../hooks/useGridBaseGenerationHistoryData';
import type { GridBaseGenerationHistoryMode } from '../types/gridBaseGenerationHistory';
import '../styles/GridBaseGenerationHistoryResultSection.css';

const detailHeaderRows = [
  [
    { label: 'Time', rowSpan: 3 },
    { label: '전력[kWh]', colSpan: 2 },
    { label: 'STRING', colSpan: 9 }
  ],
  [
    { label: '누계', rowSpan: 2 },
    { label: 'TOTAL', rowSpan: 2 },
    { label: 'P[kW]', colSpan: 3 },
    { label: 'V[V]', colSpan: 3 },
    { label: 'A[A]', colSpan: 3 }
  ],
  [
    { label: 'Max' },
    { label: 'Min' },
    { label: 'AVG' },
    { label: 'Max' },
    { label: 'Min' },
    { label: 'AVG' },
    { label: 'Max' },
    { label: 'Min' },
    { label: 'AVG' }
  ]
];

type GridBaseGenerationHistoryResultSectionProps = {
  searchCriteria: SearchConditionCriteria<GridBaseGenerationHistoryMode>;
  searchedAt: string;
};

/*
 * 필요: 기저발전(IVT1~7) 이력 요약/차트/운전표/인버터 상세를 화면에 배치한다.
 * 연결: useGridBaseGenerationHistoryData, SummaryMatrix, BaseChart, DataTableCard.
 * 설명: 2026.08.31 워크샵 반영 스펙 — 인버터 개별 이력 구조로 전면 개편.
 * 수정: 인버터 개수나 STRING 통계 필드가 바뀌면 hooks/useGridBaseGenerationHistoryData.ts만 조정한다.
 */
export function GridBaseGenerationHistoryResultSection({ searchCriteria, searchedAt }: GridBaseGenerationHistoryResultSectionProps) {
  const data = useGridBaseGenerationHistoryData(searchCriteria);
  const [expanded, setExpanded] = useState(true);
  const [selectedInverter, setSelectedInverter] = useState(data.equipmentOptions[0]?.value ?? 'ivt-1');
  const detail = data.detailByInverter[selectedInverter];
  const isHourlyChart = isSingleDayRange(searchCriteria.startDate, searchCriteria.endDate);

  const chartOption = useMemo<EChartsOption>(
    () => ({
      color: ['#2f9cff', '#f2994a', '#27ae60', '#eb5757', '#9b51e0', '#56ccf2', '#f2c94c', '#bb6bd9'],
      tooltip: { trigger: 'axis' },
      grid: { left: 64, right: 24, top: 22, bottom: 28, containLabel: true },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisLabel: { color: '#b8c2d8' },
        axisLine: { lineStyle: { color: '#354057' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#b8c2d8' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      series: [
        { name: 'Total', type: 'bar', barWidth: 32, data: data.totalSeries },
        ...data.inverterLineSeries.map((series) => ({ name: series.name, type: 'line' as const, smooth: false, data: series.data }))
      ]
    }),
    [data]
  );

  return (
    <>
      <PageCard className="grid-base-history-result grid-base-history-result--chart">
        <SummaryMatrix ariaLabel="기저발전 이력 요약" columns={data.summary.columns} metrics={data.summary.metrics} minWidth={900} />
        <div className="sr-only" aria-live="polite">
          조회 조건: {searchCriteria.mode} / {searchCriteria.startDate || '-'} ~ {searchCriteria.endDate || '-'} / 조회 시각: {searchedAt}
        </div>
        <BaseChart
          option={chartOption}
          height={340}
          minWidth={1120}
          fullDay={isHourlyChart}
          categoryCount={!isHourlyChart ? data.labels.length : undefined}
          axisLegendGap={BASE_CHART_AXIS_LEGEND_GAP}
          categoryDataZoomGridBottom={BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM}
          categoryDataZoomHeight={BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT}
          categoryDataZoomBottom={BASE_CHART_HISTORY_CATEGORY_DATA_ZOOM_BOTTOM}
          categoryDataZoomLegendGap={BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP}
          yAxisLabel="Total kWh"
        />
      </PageCard>

      <DataTableCard
        className="grid-base-history-result__table-card"
        ariaLabel={data.operationTable.ariaLabel}
        headerRows={data.operationTable.headerRows}
        rows={data.operationTable.rows}
        minWidth={data.operationTable.minWidth}
        excel={{ fileName: `기저발전_이력_운전상세_${searchCriteria.mode}`, sheetName: '운전 상세 현황' }}
      />

      <DetailToggleBar label="인버터 상세 내역 보기" expanded={expanded} onClick={() => setExpanded((value) => !value)} />

      <CollapsibleContent open={expanded}>
        {detail && (
          <PageCard className="grid-base-history-result__detail-panel">
            <div className="grid-base-history-result__detail-header">
              <EquipmentSelect
                aria-label="기저발전 이력 인버터 선택"
                value={selectedInverter}
                onChange={(event) => setSelectedInverter(event.target.value)}
                options={data.equipmentOptions}
              />
              <StatChipGroup
                ariaLabel="선택 인버터 MAX/MIN/AVG"
                items={[
                  { label: 'MAX[kWh]', value: detail.stat.max },
                  { label: 'MIN[kWh]', value: detail.stat.min },
                  { label: 'AVG[kWh]', value: detail.stat.avg }
                ]}
              />
              <ExcelSaveButton
                fileName={`기저발전_이력_${selectedInverter}_상세`}
                sheets={[{ name: '인버터 상세 내역', headerRows: detailHeaderRows, rows: detail.rows }]}
              />
            </div>
            <DataTableCard
              ariaLabel={`${selectedInverter} 상세 내역`}
              headerRows={detailHeaderRows}
              rows={detail.rows}
              minWidth={1280}
            />
          </PageCard>
        )}
      </CollapsibleContent>
    </>
  );
}
