import { useEffect, useMemo, useState } from 'react';
import type { EChartsOption } from 'echarts';
import { flushSync } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { ApiError } from '../../shared/api/apiClient';
import type { ApiRecord } from '../../shared/api/apiDataUtils';
import { formatApiNumber, getRawValue, readApiField, toChartNumber } from '../../shared/api/apiDataUtils';
import { monitoringApi, type ReportPeriodResource } from '../../shared/api/monitoringApi';
import type { TableHeaderCell, TableRow } from '../../shared/types/table';
import { ActionButton } from '../../shared/ui/ActionButton';
import {
  BASE_CHART_AXIS_LEGEND_GAP,
  BASE_CHART_CATEGORY_DATA_ZOOM_BOTTOM,
  BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM,
  BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT,
  BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP,
  BaseChart
} from '../../shared/ui/BaseChart';
import { BasicTable } from '../../shared/ui/BasicTable';
import { DataTableCard } from '../../shared/ui/DataTableCard';
import { SearchConditionBar, type SearchConditionCriteria } from '../../shared/ui/SearchConditionBar';
import { PageCard } from '../../shared/ui/PageCard';
import { PageDataLoadingFallback } from '../../shared/ui/PageDataLoadingFallback';
import { PageHeading } from '../../shared/ui/PageHeading';
import { isTodayDate } from '../../shared/utils/hourlyChartSlots';
import './OperationReportPage.css';

const reportTabs = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const;

type ReportTab = (typeof reportTabs)[number];

type ReportField = {
  label: string;
  key: string;
};

type ReportTooltipParam = {
  axisValueLabel?: string;
  marker?: unknown;
  seriesName?: string;
  value?: number | string | null | Array<number | string | null>;
  data?: number | null | { value?: number | null; reportValue?: number | null };
};

type ReportChartRow = ApiRecord | null;
type ReportChartValue = number | null;

type ReportConfig = {
  title: string;
  resource: ReportPeriodResource;
  firstBarField: ReportField;
  secondBarField: ReportField;
  lineField: ReportField;
  fields: ReportField[];
};

const reportTabResourceMap: Record<ReportTab, ReportPeriodResource> = {
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
  Yearly: 'yearly'
};

const reportResourceTabMap: Record<ReportPeriodResource, ReportTab> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly'
};

const reportSearchOptions = [
  { value: 'Daily', inputType: 'date' },
  { value: 'Weekly', inputType: 'dateRange' },
  { value: 'Monthly', label: 'Month', inputType: 'month' },
  { value: 'Yearly', inputType: 'year' }
] as const;

const reportPrintTitles: Record<ReportTab, string> = {
  Daily: 'Daily Operation Report',
  Weekly: 'Weekly Operation Report',
  Monthly: 'Monthly Operation Report',
  Yearly: 'Yearly Operation Report'
};

const reportChartColors = ['#2f9cff', '#f7c978', '#f3f6ff'];
const reportDailyHourLabels = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const reportDailyHourDisplayLabels = reportDailyHourLabels.map((hour) => `${hour}:00`);
const REPORT_MOBILE_QUERY = '(max-width: 720px)';

function formatReportDateValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addReportDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getDateKeysInRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const keys: string[] = [];
  let cursor = start;

  while (cursor <= end) {
    keys.push(formatReportDateValue(cursor));
    cursor = addReportDays(cursor, 1);
  }

  return keys;
}

const operationReportFields: ReportField[] = [
  { label: 'DATE', key: 'baseDate' },
  { label: 'BASE MAX', key: 'maxBasePower' },
  { label: 'BASE MIN', key: 'minBasePower' },
  { label: 'BASE AVG', key: 'avgBasePower' },
  { label: 'ASSIST MAX', key: 'maxAssistPower' },
  { label: 'ASSIST AVG', key: 'avgAssistPower' },
  { label: 'STANDBY MAX', key: 'maxStandbyPower' },
  { label: 'STANDBY AVG', key: 'avgStandbyPower' },
  { label: 'DISPATCH MAX', key: 'maxDispatchPower' },
  { label: 'DISPATCH AVG', key: 'avgDispatchPower' },
  { label: 'SOC AVG', key: 'avgSoc' }
];

function getReportField(key: string) {
  const field = operationReportFields.find((candidate) => candidate.key === key);

  if (!field) {
    throw new Error(`OperationReportResponse field is not configured: ${key}`);
  }

  return field;
}

function getReportChartAxisScale(...seriesList: ReportChartValue[][]) {
  const values = seriesList.flat().filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  const maxValue = Math.max(0, ...values);

  if (maxValue <= 0) {
    return { max: 100, interval: 20 };
  }

  const roughInterval = maxValue / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughInterval));
  const intervalMultiplier = [1, 2, 2.5, 5, 10].find((multiplier) => multiplier * magnitude >= roughInterval) ?? 10;
  const interval = intervalMultiplier * magnitude;
  const axisMax = Math.max(100, interval * Math.ceil(maxValue / interval));

  return { max: axisMax, interval };
}

function getReportRatioVisualValue(value: number | null, axisMax: number) {
  if (value === null) {
    return null;
  }

  return Number(((Math.max(0, Math.min(100, value)) / 100) * axisMax).toFixed(2));
}

function getTooltipValue(param: ReportTooltipParam) {
  if (typeof param.data === 'object' && param.data && typeof param.data.reportValue === 'number') {
    return param.data.reportValue;
  }

  if (Array.isArray(param.value)) {
    return param.value.at(-1);
  }

  return param.value;
}

function formatReportChartTooltip(params: unknown) {
  const paramList = (Array.isArray(params) ? params : [params]) as ReportTooltipParam[];
  const title = paramList[0]?.axisValueLabel ?? '';
  const rows = paramList.filter((param) => getTooltipValue(param) !== null && getTooltipValue(param) !== undefined).map((param) => {
    const value = getTooltipValue(param);

    return `${String(param.marker ?? '')} ${param.seriesName ?? ''}<span style="float:right;margin-left:20px;font-weight:700">${formatApiNumber(value)}</span>`;
  });

  return [title, ...rows].join('<br/>');
}

function useReportMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(REPORT_MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(REPORT_MOBILE_QUERY);
    const updateMobileViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateMobileViewport();
    mediaQuery.addEventListener('change', updateMobileViewport);

    return () => mediaQuery.removeEventListener('change', updateMobileViewport);
  }, []);

  return isMobileViewport;
}

const reportConfigs: Record<ReportPeriodResource, ReportConfig> = {
  daily: {
    title: '일간 운전 보고서',
    resource: 'daily',
    firstBarField: getReportField('avgBasePower'),
    secondBarField: getReportField('avgDispatchPower'),
    lineField: getReportField('avgSoc'),
    fields: operationReportFields
  },
  weekly: {
    title: '주간 운전 보고서',
    resource: 'weekly',
    firstBarField: getReportField('avgBasePower'),
    secondBarField: getReportField('avgDispatchPower'),
    lineField: getReportField('avgSoc'),
    fields: operationReportFields
  },
  monthly: {
    title: '월간 운전 보고서',
    resource: 'monthly',
    firstBarField: getReportField('avgBasePower'),
    secondBarField: getReportField('avgDispatchPower'),
    lineField: getReportField('avgSoc'),
    fields: operationReportFields
  },
  yearly: {
    title: '연간 운전 보고서',
    resource: 'yearly',
    firstBarField: getReportField('avgBasePower'),
    secondBarField: getReportField('avgDispatchPower'),
    lineField: getReportField('avgSoc'),
    fields: operationReportFields
  }
};

const reportDemandSupplyHeaderRows: TableHeaderCell[][] = [
  [{ label: 'Power Demand & Supply', colSpan: 10 }],
  [
    { label: 'Generation', colSpan: 5 },
    { label: 'Consumption', colSpan: 5 }
  ],
  [
    { label: 'Maximum', colSpan: 2 },
    { label: 'Minimum', colSpan: 2 },
    { label: 'Average' },
    { label: 'Maximum', colSpan: 2 },
    { label: 'Minimum', colSpan: 2 },
    { label: 'Average' }
  ],
  [
    { label: 'QTY' },
    { label: 'Time' },
    { label: 'QTY' },
    { label: 'Time' },
    { label: 'QTY' },
    { label: 'QTY' },
    { label: 'Time' },
    { label: 'QTY' },
    { label: 'Time' },
    { label: 'QTY' }
  ]
];

const reportDetailHeaderRows: TableHeaderCell[][] = [
  [
    { label: 'TIME', rowSpan: 3 },
    { label: 'Total', colSpan: 3 },
    { label: 'PV', rowSpan: 3 },
    { label: 'Generator', colSpan: 3 },
    { label: 'Bat', colSpan: 1 },
    { label: 'Consumption', colSpan: 8 }
  ],
  [
    { label: 'Gen' },
    { label: 'Consumption' },
    { label: 'Use Rate' },
    { label: '#1', rowSpan: 2 },
    { label: '#2', rowSpan: 2 },
    { label: 'SubTot', rowSpan: 2 },
    { label: 'Discharge', rowSpan: 2 },
    { label: 'Consumer', colSpan: 5 },
    { label: 'SubTot', rowSpan: 2 },
    { label: 'Bat', colSpan: 1 },
    { label: 'Sub Total', rowSpan: 2 }
  ],
  [
    { label: 'Gen(kWh)' },
    { label: 'Use(kWh)' },
    { label: 'Urate(%)' },
    { label: 'BANK 1' },
    { label: 'BANK 2' },
    { label: 'BANK 3' },
    { label: 'BANK 4' },
    { label: 'BANK 5' },
    { label: 'Charge' }
  ]
];

function getResourceFromPath(pathname: string): ReportPeriodResource {
  const resource = pathname.split('/').filter(Boolean).at(-1);

  if (resource === 'weekly' || resource === 'monthly' || resource === 'yearly') {
    return resource;
  }

  return 'daily';
}

function getReportType(resource: ReportPeriodResource) {
  if (resource === 'weekly') return 'WEEKLY';
  if (resource === 'monthly') return 'MONTHLY';
  if (resource === 'yearly') return 'YEARLY';

  return 'DAILY';
}

function createDefaultReportCriteria(mode: ReportTab): SearchConditionCriteria<ReportTab> {
  const today = new Date();
  const year = String(today.getFullYear());
  const month = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const date = `${month}-${String(today.getDate()).padStart(2, '0')}`;
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const formatDate = (value: Date) =>
    `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

  if (mode === 'Daily') {
    return {
      mode,
      startDate: date,
      endDate: date,
      year,
      month
    };
  }

  if (mode === 'Weekly') {
    return {
      mode,
      startDate: formatDate(weekStart),
      endDate: formatDate(weekEnd),
      year,
      month
    };
  }

  if (mode === 'Yearly') {
    return {
      mode,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      year,
      month
    };
  }

  return {
    mode,
    startDate: `${month}-01`,
    endDate: `${month}-${String(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()).padStart(2, '0')}`,
    year,
    month
  };
}

function getMonthKeysInDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [];
  }

  const keys: string[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endMonth) {
    keys.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return keys;
}

function getReportRowDateKey(row: ApiRecord) {
  const label = getReportDateLabel(row);
  const match = label.match(/\d{4}-\d{2}-\d{2}/);

  return match?.[0] ?? null;
}

function isDateWithinRange(dateText: string | null, startDate: string, endDate: string) {
  return Boolean(dateText && dateText >= startDate && dateText <= endDate);
}

async function getWeeklyDurationReportRows(criteria: SearchConditionCriteria<ReportTab>) {
  const monthKeys = getMonthKeysInDateRange(criteria.startDate, criteria.endDate);
  const monthlyRows = await Promise.all(
    monthKeys.map((monthKey) =>
      monitoringApi.getReport<ApiRecord>('monthly', {
        reportType: 'MONTHLY',
        baseYear: monthKey.slice(0, 4),
        baseMonth: monthKey
      })
    )
  );

  return monthlyRows.flat().filter((row) => isDateWithinRange(getReportRowDateKey(row), criteria.startDate, criteria.endDate));
}

function getReportDateLabel(row: ApiRecord) {
  return getRawValue(row.baseDate) || getRawValue(row.operYmd) || '-';
}

function getReportTimeLabel(row: ApiRecord) {
  const baseLabel = getRawValue(row.baseLabel) || getRawValue(row.label);

  if (baseLabel) {
    return baseLabel;
  }

  const time = getRawValue(row.esmtOperTime) || getRawValue(row.operTime);

  if (time.length >= 5) {
    return time.slice(0, 5);
  }

  return time || '-';
}

function getReportHourSlot(row: ApiRecord) {
  const label = getReportTimeLabel(row);
  const match = label.match(/^(\d{1,2})/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return null;
  }

  return String(hour).padStart(2, '0');
}

function buildReportChartRows(rows: ApiRecord[], criteria: SearchConditionCriteria<ReportTab>): ReportChartRow[] {
  if (criteria.mode !== 'Daily' && criteria.mode !== 'Weekly') {
    return rows;
  }

  if (criteria.mode === 'Weekly') {
    const rowByDate = new Map<string, ApiRecord>();

    rows.forEach((row) => {
      const dateKey = getReportRowDateKey(row);

      if (dateKey) {
        rowByDate.set(dateKey, row);
      }
    });

    return getDateKeysInRange(criteria.startDate, criteria.endDate).map((dateKey) => rowByDate.get(dateKey) ?? null);
  }

  const rowByHour = new Map<string, ApiRecord>();

  rows.forEach((row) => {
    const hour = getReportHourSlot(row);

    if (hour) {
      rowByHour.set(hour, row);
    }
  });

  return reportDailyHourLabels.map((hour) => rowByHour.get(hour) ?? null);
}

function getReportChartValue(row: ReportChartRow, key: string): ReportChartValue {
  if (!row) {
    return null;
  }

  return toChartNumber(readApiField(row, key));
}

function getReportDisplayLabel(row: ApiRecord, mode: ReportTab) {
  return mode === 'Daily' ? getReportTimeLabel(row) : getReportDateLabel(row);
}

function sortReportRows(rows: ApiRecord[], mode: ReportTab) {
  return [...rows].sort((a, b) => getReportDisplayLabel(a, mode).localeCompare(getReportDisplayLabel(b, mode)));
}

function buildDetailTableRows(rows: ApiRecord[], mode: ReportTab): TableRow[] {
  return rows.map((row) =>
    [
      getReportDisplayLabel(row, mode),
      formatApiNumber(readApiField(row, 'avgBasePower')),
      formatApiNumber(readApiField(row, 'avgDispatchPower')),
      formatApiNumber(readApiField(row, 'avgSoc')),
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-',
      '-'
    ]
  );
}

function getSummarySourceRow(rows: ApiRecord[]) {
  return rows[0] ?? {};
}

function buildDemandSupplyRows(row: ApiRecord): TableRow[] {
  return [
    [
      formatApiNumber(readApiField(row, 'maxBasePower')),
      '-',
      formatApiNumber(readApiField(row, 'minBasePower')),
      '-',
      formatApiNumber(readApiField(row, 'avgBasePower')),
      formatApiNumber(readApiField(row, 'maxDispatchPower')),
      '-',
      formatApiNumber(readApiField(row, 'minDispatchPower')),
      '-',
      formatApiNumber(readApiField(row, 'avgDispatchPower'))
    ]
  ];
}

function ReportSummaryValueTable({
  row,
  criteria
}: {
  row: ApiRecord;
  criteria: SearchConditionCriteria<ReportTab>;
}) {
  const dateLabel =
    criteria.mode === 'Daily'
      ? criteria.startDate
      : criteria.mode === 'Monthly'
        ? criteria.month
        : criteria.mode === 'Yearly'
          ? criteria.year
          : `${criteria.startDate} ~ ${criteria.endDate}`;

  return (
    <table className="report-summary-value-table" aria-label="리포트 요약 값">
      <thead>
        <tr>
          <th className="report-summary-value-table__header" rowSpan={2} scope="rowgroup">
            Date
          </th>
          <th className="report-summary-value-table__label report-summary-value-table__label--group" colSpan={3} scope="colgroup">
            Summary
          </th>
        </tr>
        <tr>
          <th className="report-summary-value-table__label" scope="col">Generation</th>
          <th className="report-summary-value-table__label" scope="col">Consumption</th>
          <th className="report-summary-value-table__label" scope="col">Use Rate</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="report-summary-value-table__value">{dateLabel || getReportDateLabel(row)}</td>
          <td className="report-summary-value-table__value">{formatApiNumber(readApiField(row, 'avgBasePower'))}</td>
          <td className="report-summary-value-table__value">{formatApiNumber(readApiField(row, 'avgDispatchPower'))}</td>
          <td className="report-summary-value-table__value">{formatApiNumber(readApiField(row, 'avgSoc'))}</td>
        </tr>
      </tbody>
    </table>
  );
}

/*
 * 필요: 리포트 화면은 v2 report API의 보고서 타입 기준으로 검색, 요약, 그래프, 상세 데이터를 표시한다.
 * 연결: /report/daily, /report/weekly, /report/monthly, /report/yearly, SearchConditionBar, BasicTable, BaseChart, DataTableCard.
 * 설명: 검색 조건 선택만 바꾸고, 표시 차트 구조는 공통 컴포넌트로 고정한다.
 * 수정: report 응답 필드가 바뀌면 reportConfigs와 summary builder만 조정한다.
 */
export function OperationReportPage() {
  const location = useLocation();
  const pathResource = getResourceFromPath(location.pathname);
  const [searchCriteria, setSearchCriteria] = useState<SearchConditionCriteria<ReportTab>>(() =>
    createDefaultReportCriteria(reportResourceTabMap[pathResource])
  );
  const [rows, setRows] = useState<ApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPrintMode, setIsPrintMode] = useState(false);
  const isMobileViewport = useReportMobileViewport();

  const resource = reportTabResourceMap[searchCriteria.mode];
  const config = reportConfigs[resource];

  useEffect(() => {
    setSearchCriteria(createDefaultReportCriteria(reportResourceTabMap[pathResource]));
  }, [pathResource]);

  useEffect(() => {
    let mounted = true;

    async function loadReport() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const nextRows =
          config.resource === 'weekly'
            ? await getWeeklyDurationReportRows(searchCriteria)
            : await monitoringApi.getReport<ApiRecord>(config.resource, {
                startDate: searchCriteria.startDate,
                endDate: searchCriteria.endDate,
                reportType: getReportType(config.resource),
                baseYear: searchCriteria.year,
                baseMonth: searchCriteria.month
              });

        if (!mounted) {
          return;
        }

        setRows(sortReportRows(nextRows, searchCriteria.mode));
      } catch (error) {
        if (!mounted) {
          return;
        }

        setRows([]);
        setErrorMessage(error instanceof ApiError ? error.message : '리포트 데이터를 불러오지 못했습니다.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      mounted = false;
    };
  }, [config.resource, searchCriteria.endDate, searchCriteria.mode, searchCriteria.month, searchCriteria.startDate, searchCriteria.year]);

  useEffect(() => {
    const enablePrintMode = () => setIsPrintMode(true);
    const disablePrintMode = () => setIsPrintMode(false);

    window.addEventListener('beforeprint', enablePrintMode);
    window.addEventListener('afterprint', disablePrintMode);

    return () => {
      window.removeEventListener('beforeprint', enablePrintMode);
      window.removeEventListener('afterprint', disablePrintMode);
    };
  }, []);

  const chartRows = useMemo(() => buildReportChartRows(rows, searchCriteria), [rows, searchCriteria]);
  const labels = useMemo(
    () =>
      searchCriteria.mode === 'Daily'
        ? reportDailyHourDisplayLabels
        : searchCriteria.mode === 'Weekly'
          ? getDateKeysInRange(searchCriteria.startDate, searchCriteria.endDate)
          : rows.map((row) => getReportDisplayLabel(row, searchCriteria.mode)),
    [rows, searchCriteria.endDate, searchCriteria.mode, searchCriteria.startDate]
  );
  const firstBarSeries = useMemo(() => chartRows.map((row) => getReportChartValue(row, config.firstBarField.key)), [chartRows, config.firstBarField]);
  const secondBarSeries = useMemo(() => chartRows.map((row) => getReportChartValue(row, config.secondBarField.key)), [chartRows, config.secondBarField]);
  const hasSecondBarData = useMemo(() => secondBarSeries.some((value) => typeof value === 'number' && Number.isFinite(value)), [secondBarSeries]);
  const lineSeries = useMemo(() => chartRows.map((row) => getReportChartValue(row, config.lineField.key)), [chartRows, config.lineField]);
  const chartAxisScale = useMemo(() => getReportChartAxisScale(firstBarSeries, secondBarSeries), [firstBarSeries, secondBarSeries]);
  const normalizedLineSeries = useMemo(
    () => lineSeries.map((value) => ({ value: getReportRatioVisualValue(value, chartAxisScale.max), reportValue: value })),
    [chartAxisScale.max, lineSeries]
  );
  const detailRows = useMemo(() => buildDetailTableRows(rows, searchCriteria.mode), [rows, searchCriteria.mode]);
  const summarySourceRow = useMemo(() => getSummarySourceRow(rows), [rows]);
  const demandSupplyRows = useMemo(() => buildDemandSupplyRows(summarySourceRow), [summarySourceRow]);
  const printTitle = reportPrintTitles[searchCriteria.mode];
  const isDailyChart = searchCriteria.mode === 'Daily';
  const mobileDateLabelInterval = Math.max(0, Math.ceil(labels.length / 3) - 1);
  const shouldScrollDailyChartToCurrentTime = isDailyChart && !isPrintMode && isTodayDate(searchCriteria.startDate);
  const reportChartLegendItems = useMemo(
    () => [
      { name: config.firstBarField.label, type: 'bar' as const, color: reportChartColors[0] },
      { name: config.secondBarField.label, type: 'bar' as const, color: reportChartColors[1] },
      { name: config.lineField.label, type: 'line' as const, color: reportChartColors[2] }
    ],
    [config.firstBarField.label, config.lineField.label, config.secondBarField.label]
  );

  const handlePrintReport = () => {
    flushSync(() => setIsPrintMode(true));
    window.setTimeout(() => window.print(), 120);
  };

  const chartOption = useMemo<EChartsOption>(
    () => ({
      color: reportChartColors,
      tooltip: { trigger: 'axis', formatter: formatReportChartTooltip },
      legend: {
        show: false,
        selectedMode: true
      },
      grid: {
        left: isPrintMode ? 32 : 64,
        right: isPrintMode ? 4 : 24,
        top: isPrintMode ? 18 : 24,
        bottom: isPrintMode ? 26 : 24,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          color: '#aab3c5',
          fontSize: isPrintMode ? 6 : isMobileViewport && !isDailyChart ? 10 : 12,
          interval: isDailyChart ? 0 : isMobileViewport ? mobileDateLabelInterval : 'auto'
        },
        axisLine: { lineStyle: { color: '#2f3a52' } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: chartAxisScale.max,
        interval: chartAxisScale.interval,
        axisLabel: { color: '#cfd6e8', fontSize: isPrintMode ? 6 : 12, align: 'right', width: isPrintMode ? 24 : 56, margin: isPrintMode ? 4 : 8 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      series: [
        {
          name: config.firstBarField.label,
          type: 'bar',
          barWidth: isPrintMode ? 10 : isDailyChart ? 30 : 28,
          barGap: hasSecondBarData ? (isDailyChart ? '14%' : '18%') : '-100%',
          barCategoryGap: hasSecondBarData ? (isDailyChart ? '44%' : '36%') : '52%',
          data: firstBarSeries
        },
        {
          name: config.secondBarField.label,
          type: 'bar',
          barWidth: isPrintMode ? 10 : isDailyChart ? 30 : 28,
          barGap: isDailyChart ? '14%' : '18%',
          barCategoryGap: isDailyChart ? '44%' : '36%',
          data: hasSecondBarData ? secondBarSeries : []
        },
        {
          name: config.lineField.label,
          type: 'line',
          smooth: false,
          lineStyle: { color: reportChartColors[2], width: 2 },
          itemStyle: { color: '#ffffff', borderColor: reportChartColors[2], borderWidth: 2 },
          symbolSize: isPrintMode ? 4 : 9,
          data: normalizedLineSeries
        }
      ]
    }),
    [
      chartAxisScale.interval,
      chartAxisScale.max,
      config.firstBarField.label,
      config.lineField.label,
      config.secondBarField.label,
      firstBarSeries,
      hasSecondBarData,
      isDailyChart,
      isMobileViewport,
      isPrintMode,
      labels,
      mobileDateLabelInterval,
      normalizedLineSeries,
      searchCriteria.mode,
      secondBarSeries
    ]
  );

  return (
    <div className="page-stack operation-report-page">
      <PageHeading title={config.title} />

      <section className="report-search-section" aria-label="리포트 조회 조건">
        <SearchConditionBar
          key={searchCriteria.mode}
          modes={reportSearchOptions}
          defaultMode={searchCriteria.mode}
          align="left"
          className="report-search-bar"
          defaultStartDate={searchCriteria.startDate}
          defaultEndDate={searchCriteria.endDate}
          defaultYear={searchCriteria.year}
          defaultMonth={searchCriteria.month}
          dateRangeLimitDays={30}
          weekNavigationMode="Weekly"
          onSearch={setSearchCriteria}
        />
      </section>

      {isLoading && <PageDataLoadingFallback title={config.title} />}
      {!isLoading && errorMessage && <div role="alert" className="report-message">{errorMessage}</div>}
      {!isLoading && !errorMessage && (
        <div className="report-print-area">
          <h2 className="report-print-title">{printTitle}</h2>

          <div className="report-print-section-label">1. Summary</div>
          <PageCard
            title="Summary"
            className="report-summary-card"
            ariaLabel={`${config.title} 요약`}
            actions={<ActionButton variant="primary" className="report-summary-card__print" onClick={handlePrintReport}>Print</ActionButton>}
          >
            <div className="report-summary-card__tables">
              <ReportSummaryValueTable row={summarySourceRow} criteria={searchCriteria} />
              <BasicTable
                className="report-demand-supply-table"
                ariaLabel="Power Demand & Supply"
                headerRows={reportDemandSupplyHeaderRows}
                rows={demandSupplyRows}
                minWidth={980}
              />
            </div>
          </PageCard>

          <div className="report-print-section-label">2. Moving Graph</div>
          <PageCard className="report-chart-card" ariaLabel={`${config.title} 그래프`}>
            <div className="report-chart-title">Power Generation &amp; Consumption</div>
            <BaseChart
              option={chartOption}
              height={isPrintMode ? 170 : 300}
              minWidth="100%"
              maxWidth={isPrintMode ? '100%' : 2560}
              fullDay={isDailyChart && !isPrintMode}
              scrollToCurrentTime={shouldScrollDailyChartToCurrentTime}
              categoryCount={!isDailyChart && !isPrintMode ? labels.length : undefined}
              legendItems={reportChartLegendItems}
              yAxisLabel="kWh"
              axisLegendGap={BASE_CHART_AXIS_LEGEND_GAP}
              categoryDataZoomGridBottom={BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM}
              categoryDataZoomHeight={BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT}
              categoryDataZoomBottom={BASE_CHART_CATEGORY_DATA_ZOOM_BOTTOM}
              categoryDataZoomLegendGap={BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP}
              scrollIndicatorTopGap={2}
              scrollIndicatorBottomGap={2}
            />
          </PageCard>

          <div className="report-print-section-label">3. Detail Data</div>
          <DataTableCard
            title="Detail Data"
            className="report-detail-card"
            ariaLabel={`${config.title} 상세 데이터`}
            headerRows={reportDetailHeaderRows}
            rows={detailRows}
            excel={{ fileName: `${config.title}_${searchCriteria.mode}`, sheetName: 'Detail Data' }}
          />
        </div>
      )}
    </div>
  );
}
