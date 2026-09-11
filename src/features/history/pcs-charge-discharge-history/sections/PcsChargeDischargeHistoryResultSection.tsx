import { useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { BaseChart } from '../../../../shared/ui/BaseChart';
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageCard } from '../../../../shared/ui/PageCard';
import { SummaryMatrix } from '../../../../shared/ui/SummaryMatrix';
import { usePcsChargeDischargeHistoryData } from '../hooks/usePcsChargeDischargeHistoryData';
import type { PcsChargeDischargeHistoryMode } from '../types/pcsChargeDischargeHistory';
import '../styles/PcsChargeDischargeHistoryResultSection.css';

const CHART_FONT_FAMILY = 'NotoSansKR-Regular, Noto Sans KR, Malgun Gothic, sans-serif';

type PcsChargeDischargeHistoryResultSectionProps = {
  searchCriteria: SearchConditionCriteria<PcsChargeDischargeHistoryMode>;
  searchedAt: string;
};

/*
 * 필요: 충방전 이력 요약(MAX/MIN/AVG)/듀얼축 차트/운전표/BATTERY 상세를 화면에 배치한다.
 * 연결: usePcsChargeDischargeHistoryData, SummaryMatrix, BaseChart, DataTableCard.
 * 설명: 2026.08.31 워크샵 반영 스펙 — 도넛 대신 MAX/MIN/AVG 표 + SoC(%) 듀얼축 차트로 개편.
 * 수정: 상세 필드가 바뀌면 hooks/usePcsChargeDischargeHistoryData.ts만 조정한다.
 */
export function PcsChargeDischargeHistoryResultSection({ searchCriteria, searchedAt }: PcsChargeDischargeHistoryResultSectionProps) {
  const data = usePcsChargeDischargeHistoryData(searchCriteria);
  const [expanded, setExpanded] = useState(true);

  const chartOption = useMemo<EChartsOption>(
    () => ({
      textStyle: { fontFamily: CHART_FONT_FAMILY },
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: '#d6ddea', fontFamily: CHART_FONT_FAMILY, fontSize: 13, fontWeight: 300 } },
      grid: { left: 56, right: 56, top: 24, bottom: 64, containLabel: false },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisTick: { show: false },
        axisLabel: { color: '#b8c2d8', fontFamily: CHART_FONT_FAMILY, fontSize: 13, fontWeight: 300 },
        axisLine: { lineStyle: { color: '#354057' } }
      },
      yAxis: [
        { type: 'value', name: 'kWh', nameTextStyle: { color: '#b8c2d8' }, axisLabel: { color: '#b8c2d8' }, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
        { type: 'value', name: '%', nameTextStyle: { color: '#b8c2d8' }, axisLabel: { color: '#b8c2d8' }, axisLine: { show: false }, splitLine: { show: false } }
      ],
      series: [
        { name: '충전 표시', type: 'bar', stack: 'charge', yAxisIndex: 0, barMaxWidth: 32, itemStyle: { color: '#25b6fe' }, data: data.chargeSeries },
        { name: '방전 표시', type: 'bar', stack: 'charge', yAxisIndex: 0, barMaxWidth: 32, itemStyle: { color: '#d20000' }, data: data.dischargeSeries },
        { name: 'SoC(%)', type: 'line', step: 'end', yAxisIndex: 1, showSymbol: false, lineStyle: { color: '#25affa', width: 2 }, data: data.socSeries }
      ]
    }),
    [data]
  );

  return (
    <>
      <PageCard className="pcs-charge-history-result">
        <SummaryMatrix
          ariaLabel="PCS 충방전 이력 요약"
          columns={['MAX[kWh]', 'MIN[kWh]', 'AVG[kWh]']}
          metrics={data.summary.map((row) => ({ label: row.label, values: [row.max, row.min, row.avg] }))}
          minWidth={420}
        />
        <div className="sr-only" aria-live="polite">
          조회 조건: {searchCriteria.mode} / {searchCriteria.startDate || '-'} ~ {searchCriteria.endDate || '-'} / 조회 시각: {searchedAt}
        </div>
        <div className="pcs-charge-history-result__chart">
          <BaseChart option={chartOption} height={300} />
        </div>
      </PageCard>

      <DataTableCard
        className="pcs-charge-history-result__table-card"
        ariaLabel={data.operationTable.ariaLabel}
        headerRows={data.operationTable.headerRows}
        rows={data.operationTable.rows}
        minWidth={data.operationTable.minWidth}
        excel={{ fileName: `충방전_이력_운전상세_${searchCriteria.mode}`, sheetName: '운전 상세 현황' }}
      />

      <DetailToggleBar label="BATTERY 상세 내역 보기" expanded={expanded} onClick={() => setExpanded((value) => !value)} />

      <CollapsibleContent open={expanded}>
        <DataTableCard
          ariaLabel={data.detailTable.ariaLabel}
          headerRows={data.detailTable.headerRows}
          rows={data.detailTable.rows}
          minWidth={data.detailTable.minWidth}
          excel={{ fileName: `충방전_이력_BATTERY상세_${searchCriteria.mode}`, sheetName: 'BATTERY 상세 내역' }}
        />
      </CollapsibleContent>
    </>
  );
}
