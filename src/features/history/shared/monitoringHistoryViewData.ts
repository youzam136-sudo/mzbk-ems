import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../shared/api/apiClient';
import {
  EMPTY_API_VALUE,
  formatApiNumber,
  getDateLabel,
  getTimeLabel,
  readApiField,
  sortByDateTime,
  toNumber,
  toChartNumber
} from '../../../shared/api/apiDataUtils';
import type { ApiRecord } from '../../../shared/api/apiDataUtils';
import { getPageContents, monitoringApi, type MonitoringResource, type MonitoringSearchRequest } from '../../../shared/api/monitoringApi';
import type { TableHeaderCell, TableRow } from '../../../shared/types/table';
import type { SearchConditionCriteria } from '../../../shared/ui/SearchConditionBar';
import { FULL_DAY_TIME_LABELS, getHourlySlotLabel, normalizeHourLabel } from '../../../shared/utils/hourlyChartSlots';

type HistoryField = {
  label: string;
  key: string;
};

export type MonitoringHistoryConfig<TMetric extends string, TMode extends string> = {
  resource: MonitoringResource;
  metrics: readonly TMetric[];
  tableTitle: string;
  minWidth: number;
  barField: string;
  lineField?: string;
  fields: HistoryField[];
  searchCriteria: SearchConditionCriteria<TMode>;
};

export type MonitoringHistoryViewData<TMetric extends string> = {
  labels: string[];
  barSeriesByMetric: Record<TMetric, Array<number | null>>;
  lineSeriesByMetric: Record<TMetric, Array<number | null>>;
  metricTabs: readonly TMetric[];
  table: {
    ariaLabel: string;
    minWidth: number;
    headerRows: TableHeaderCell[][];
    rows: TableRow[];
  };
};

type MonitoringHistoryState<TMetric extends string> = {
  data: MonitoringHistoryViewData<TMetric> | null;
  isLoading: boolean;
  errorMessage: string;
};

function normalizeDateLabel(date: string) {
  return date.replace(/-/g, '.');
}

function normalizeDateKey(value: string | undefined) {
  const match = String(value ?? '').match(/(\d{4})[-.](\d{2})[-.](\d{2})/);

  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

function formatDateKey(dateKey: string) {
  return dateKey.replace(/-/g, '.');
}

function getHistoryPeriodType(mode: string): MonitoringSearchRequest['periodType'] {
  if (mode === 'Year') {
    return 'YEAR';
  }

  if (mode === 'Month') {
    return 'MONTH';
  }

  return 'PERIOD';
}

function buildHistoryQueries(criteria: SearchConditionCriteria<string>): MonitoringSearchRequest[] {
  const isSingleDay = normalizeDateKey(criteria.startDate) === normalizeDateKey(criteria.endDate);
  const outputUnit: MonitoringSearchRequest['outputUnit'] = criteria.mode === 'Year' ? 'MONTH' : isSingleDay ? 'HOUR' : 'DAY';

  return [
    {
      startDate: criteria.startDate,
      endDate: criteria.endDate,
      periodType: getHistoryPeriodType(criteria.mode),
      outputUnit,
      page: 1,
      size: 500
    }
  ];
}

function getDateKeyRange(startDate?: string, endDate?: string) {
  const startKey = normalizeDateKey(startDate);
  const endKey = normalizeDateKey(endDate);

  if (!startKey || !endKey) {
    return [];
  }

  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return [];
  }

  const keys: string[] = [];
  const current = new Date(start);

  while (current <= end && keys.length < 370) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    keys.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return keys;
}

function getMonthDateKeyRange(month?: string) {
  const match = String(month ?? '').match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return [];
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return [];
  }

  const today = new Date();
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === monthIndex;
  const end = isCurrentMonth ? new Date(year, monthIndex, today.getDate()) : monthEnd;

  return getDateKeyRange(formatDateKey(`${year}-${String(monthIndex + 1).padStart(2, '0')}-01`), formatDateKey(`${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`));
}

function getLabel(row: ApiRecord, mode: string) {
  const date = getDateLabel(row);
  const time = getTimeLabel(row);

  if (date === EMPTY_API_VALUE) {
    return time;
  }

  if (mode === 'Year') {
    return normalizeDateLabel(date.slice(0, 7));
  }

  if (mode === 'Month') {
    return normalizeDateLabel(date);
  }

  return time !== EMPTY_API_VALUE ? `${normalizeDateLabel(date)} ${time}` : normalizeDateLabel(date);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function min(values: number[]) {
  return values.length > 0 ? Math.min(...values) : 0;
}

function max(values: number[]) {
  return values.length > 0 ? Math.max(...values) : 0;
}

function getMetricSuffix(metric: string) {
  if (metric.startsWith('Min')) return 'min';
  if (metric.startsWith('AVG')) return 'avg';

  return 'max';
}

function getMetricField(field: string, metric: string) {
  return `${field}__${getMetricSuffix(metric)}`;
}

function getMetricSourceField(metric: string, defaultField: string, dischargeField?: string) {
  if (metric.includes(' D ') && dischargeField) {
    return dischargeField;
  }

  return defaultField;
}

function groupRowsByLabel(rows: ApiRecord[], mode: string, fields: HistoryField[]) {
  const groups = new Map<string, ApiRecord[]>();

  rows.forEach((row) => {
    const label = getLabel(row, mode);
    const currentRows = groups.get(label) ?? [];
    currentRows.push(row);
    groups.set(label, currentRows);
  });

  return Array.from(groups.entries()).map(([label, groupedRows]) => {
    const firstRow = groupedRows[0] ?? {};
    const groupedRecord: ApiRecord = {
      label,
      esmtOperYmd: getDateLabel(firstRow),
      esmtOperTime: getTimeLabel(firstRow)
    };

    fields.forEach((field) => {
      const values = groupedRows.map((row) => toChartNumber(readApiField(row, field.key)));
      groupedRecord[field.key] = average(values);
      groupedRecord[getMetricField(field.key, 'Max')] = max(values);
      groupedRecord[getMetricField(field.key, 'Min')] = min(values);
      groupedRecord[getMetricField(field.key, 'AVG')] = average(values);
    });

    return groupedRecord;
  });
}

function buildSeriesByMetric<TMetric extends string>(metrics: readonly TMetric[], rows: ApiRecord[], field: string, dischargeField?: string) {
  return metrics.reduce<Record<TMetric, Array<number | null>>>((seriesByMetric, metric) => {
    const sourceField = getMetricSourceField(metric, field, dischargeField);
    seriesByMetric[metric] = rows.map((row) => toNumber(readApiField(row, getMetricField(sourceField, metric))));
    return seriesByMetric;
  }, {} as Record<TMetric, Array<number | null>>);
}

function getHourlyDateKeys(rows: ApiRecord[], fallbackStartDate?: string, fallbackEndDate?: string) {
  const rangeKeys = getDateKeyRange(fallbackStartDate, fallbackEndDate);

  if (rangeKeys.length > 0) {
    return rangeKeys;
  }

  const rowKeys = Array.from(
    new Set(
      rows
        .map((row) => normalizeDateKey(String(row.label ?? '')) || normalizeDateKey(getDateLabel(row)))
        .filter(Boolean)
    )
  );

  return rowKeys.length > 0 ? rowKeys : [normalizeDateKey(fallbackStartDate) || normalizeDateKey(fallbackEndDate)].filter(Boolean);
}

function isHourlyChartMode(mode: string, startDate?: string, endDate?: string) {
  return mode !== 'Year' && mode !== 'Month' && normalizeDateKey(startDate) === normalizeDateKey(endDate);
}

function buildHourlyChartRows(rows: ApiRecord[], mode: string, fallbackStartDate?: string, fallbackEndDate?: string) {
  if (!isHourlyChartMode(mode, fallbackStartDate, fallbackEndDate)) {
    return rows;
  }

  const dateKeys = getHourlyDateKeys(rows, fallbackStartDate, fallbackEndDate);
  const rowsBySlot = new Map<string, ApiRecord>();

  rows.forEach((row) => {
    const dateKey = normalizeDateKey(String(row.label ?? '')) || normalizeDateKey(getDateLabel(row)) || normalizeDateKey(fallbackStartDate);
    const hourLabel = normalizeHourLabel(String(row.label ?? getTimeLabel(row)));
    const slotKey = `${dateKey} ${hourLabel}`;

    if (dateKey && hourLabel !== EMPTY_API_VALUE && !rowsBySlot.has(slotKey)) {
      rowsBySlot.set(slotKey, row);
    }
  });

  return dateKeys.flatMap((dateKey) =>
    FULL_DAY_TIME_LABELS.map((timeLabel) => {
      const displayDate = formatDateKey(dateKey);
      const row = rowsBySlot.get(`${dateKey} ${timeLabel}`);

      if (row) {
        return {
          ...row,
          label: getHourlySlotLabel(displayDate, timeLabel)
        };
      }

      // 차트 축은 조회 기간의 날짜별 24시간을 모두 보여주되, 없는 시간대 값은 API 값이 없음을 null로 유지한다.
      return {
        label: getHourlySlotLabel(displayDate, timeLabel),
        esmtOperYmd: dateKey,
        esmtOperTime: timeLabel
      };
    })
  );
}

function buildDailySlotChartRows(rows: ApiRecord[], criteria: SearchConditionCriteria<string>) {
  if (isHourlyChartMode(criteria.mode, criteria.startDate, criteria.endDate) || criteria.mode === 'Year') {
    return rows;
  }

  const dateKeys = criteria.mode === 'Month' ? getMonthDateKeyRange(criteria.month) : getDateKeyRange(criteria.startDate, criteria.endDate);

  if (dateKeys.length === 0) {
    return rows;
  }

  const rowsByDate = new Map<string, ApiRecord>();

  rows.forEach((row) => {
    const dateKey = normalizeDateKey(String(row.label ?? '')) || normalizeDateKey(getDateLabel(row));

    if (dateKey && !rowsByDate.has(dateKey)) {
      rowsByDate.set(dateKey, row);
    }
  });

  return dateKeys.map((dateKey) => {
    const row = rowsByDate.get(dateKey);
    const label = formatDateKey(dateKey);

    return row ? { ...row, label } : { label, esmtOperYmd: dateKey };
  });
}

function buildHourlySeriesByMetric<TMetric extends string>(metrics: readonly TMetric[], rows: ApiRecord[], field: string, dischargeField?: string) {
  return metrics.reduce<Record<TMetric, Array<number | null>>>((seriesByMetric, metric) => {
    const sourceField = getMetricSourceField(metric, field, dischargeField);
    seriesByMetric[metric] = rows.map((row) => toNumber(readApiField(row, getMetricField(sourceField, metric))));
    return seriesByMetric;
  }, {} as Record<TMetric, Array<number | null>>);
}

function buildHistoryViewData<TMetric extends string, TMode extends string>(
  config: MonitoringHistoryConfig<TMetric, TMode>,
  rows: ApiRecord[]
): MonitoringHistoryViewData<TMetric> {
  const sortedRows = sortByDateTime(rows);
  const valueFields = [
    { label: 'BAR', key: config.barField },
    { label: 'LINE', key: config.lineField ?? config.barField },
    ...config.fields
  ];
  const groupedRows = groupRowsByLabel(sortedRows, config.searchCriteria.mode, valueFields);
  const hourlyChartRows = buildHourlyChartRows(groupedRows, config.searchCriteria.mode, config.searchCriteria.startDate, config.searchCriteria.endDate);
  const chartRows = buildDailySlotChartRows(hourlyChartRows, config.searchCriteria);
  const labels = chartRows.map((row) => String(row.label ?? EMPTY_API_VALUE));
  const headerRows: TableHeaderCell[][] = [[{ label: 'DATE' }, ...config.fields.map((field) => ({ label: field.label }))]];
  const tableRows = groupedRows.map((row) => [
    String(row.label ?? EMPTY_API_VALUE),
    ...config.fields.map((field) => formatApiNumber(readApiField(row, field.key)))
  ]);

  return {
    labels,
    barSeriesByMetric: isHourlyChartMode(config.searchCriteria.mode, config.searchCriteria.startDate, config.searchCriteria.endDate)
      ? buildHourlySeriesByMetric(config.metrics, chartRows, config.barField, config.lineField)
      : buildSeriesByMetric(config.metrics, chartRows, config.barField, config.lineField),
    lineSeriesByMetric: isHourlyChartMode(config.searchCriteria.mode, config.searchCriteria.startDate, config.searchCriteria.endDate)
      ? buildHourlySeriesByMetric(config.metrics, chartRows, config.lineField ?? config.barField)
      : buildSeriesByMetric(config.metrics, chartRows, config.lineField ?? config.barField),
    metricTabs: config.metrics,
    table: {
      ariaLabel: config.tableTitle,
      minWidth: config.minWidth,
      headerRows,
      rows: tableRows.length > 0 ? tableRows : [[EMPTY_API_VALUE]]
    }
  };
}

/*
 * 필요: 이력 화면들이 같은 조회/변환 흐름으로 API 데이터를 사용하게 한다.
 * 연결: monitoring history API, history result sections, 공통 차트/테이블.
 * 설명: resource와 필드 목록만 화면별로 받고 로딩, 오류, 기간별 집계는 공통 처리한다.
 * 수정: API 필드가 변경되면 각 화면 config의 resource/fields만 조정한다.
 */
export function useMonitoringHistoryViewData<TMetric extends string, TMode extends string>(
  config: MonitoringHistoryConfig<TMetric, TMode>
) {
  const [state, setState] = useState<MonitoringHistoryState<TMetric>>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  const queries = useMemo(
    () => buildHistoryQueries(config.searchCriteria),
    [config.searchCriteria.endDate, config.searchCriteria.mode, config.searchCriteria.startDate]
  );

  useEffect(() => {
    let mounted = true;

    async function loadHistory() {
      setState((currentState) => ({ ...currentState, isLoading: true, errorMessage: '' }));

      try {
        const responses = await Promise.all(queries.map((query) => monitoringApi.getHistory<ApiRecord>(config.resource, query)));
        const rows = responses.flatMap((response) => getPageContents(response));
        const data = buildHistoryViewData(config, rows);

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : '이력 데이터를 불러오지 못했습니다.';
        setState({ data: null, isLoading: false, errorMessage: message });
      }
    }

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [config, queries]);

  return state;
}
