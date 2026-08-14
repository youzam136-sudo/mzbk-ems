import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { EChartsOption, EChartsType } from 'echarts';
import { FULL_DAY_TIME_CHART_MAX_WIDTH, HOURLY_CHART_SLOT_WIDTH } from '../utils/hourlyChartSlots';
import './BaseChart.css';

type BaseChartProps = {
  option: EChartsOption;
  height?: number;
  minWidth?: number | string;
  maxWidth?: number | string;
  scrollable?: boolean;
  fullDay?: boolean;
  categoryCount?: number;
  scrollToCurrentTime?: boolean;
  legendItems?: ChartLegendItem[];
  yAxisLabel?: string;
  axisLegendGap?: number;
  legendGap?: number;
  scrollIndicatorTopGap?: number;
  scrollIndicatorBottomGap?: number;
  categoryDataZoomGridBottom?: number;
  categoryDataZoomHeight?: number;
  categoryDataZoomBottom?: number;
  categoryDataZoomLegendGap?: number;
  className?: string;
};

export type ChartLegendItem = {
  name: string;
  type?: 'bar' | 'line';
  color?: string;
};

type LegendOptionLike = {
  show?: boolean;
  data?: unknown;
  selectedMode?: boolean | 'single' | 'multiple';
  selected?: Record<string, boolean>;
  [key: string]: unknown;
};

const COMMON_CONTENT_GAP_CSS_VAR = '--mzbk-common-content-gap';
export const BASE_CHART_AXIS_LEGEND_GAP = 24;
export const BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM = 64;
export const BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT = 3;
export const BASE_CHART_CATEGORY_DATA_ZOOM_BOTTOM = 23;
export const BASE_CHART_HISTORY_CATEGORY_DATA_ZOOM_BOTTOM = 44;
export const BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP = 4;
const DEFAULT_AXIS_LEGEND_GAP = BASE_CHART_AXIS_LEGEND_GAP;
const CATEGORY_ZOOM_GRID_BOTTOM = BASE_CHART_CATEGORY_DATA_ZOOM_GRID_BOTTOM;
const CATEGORY_ZOOM_SLIDER_BOTTOM = BASE_CHART_CATEGORY_DATA_ZOOM_BOTTOM;
const CATEGORY_ZOOM_SLIDER_HEIGHT = BASE_CHART_CATEGORY_DATA_ZOOM_HEIGHT;
const CATEGORY_ZOOM_LEGEND_GAP = BASE_CHART_CATEGORY_DATA_ZOOM_LEGEND_GAP;
const CATEGORY_CHART_SLOT_WIDTH = HOURLY_CHART_SLOT_WIDTH;
const CATEGORY_SLIDER_IDLE_TRACK = 'rgba(150, 160, 182, 0.06)';
const CATEGORY_SLIDER_IDLE_FILL = 'rgba(150, 160, 182, 0.18)';
const CATEGORY_SLIDER_ACTIVE_TRACK = 'rgba(150, 160, 182, 0.11)';
const CATEGORY_SLIDER_ACTIVE_FILL = 'rgba(150, 160, 182, 0.38)';
const CHART_ANIMATION_DURATION_MS = 850;
const MOBILE_CATEGORY_AXIS_MAX_WIDTH = 720;
const MOBILE_CATEGORY_GRID_LEFT = 54;
const MOBILE_CATEGORY_GRID_RIGHT = 8;
const MOBILE_CATEGORY_AXIS_FONT_SIZE = 11;
const MOBILE_Y_AXIS_NAME_GAP = 6;
const MOBILE_SINGLE_BAR_CATEGORY_SLOT_WIDTH = 48;

type AxisOptionLike = {
  data?: unknown[];
  axisLabel?: AxisLabelOptionLike | AxisLabelOptionLike[];
  [key: string]: unknown;
};

type AxisLabelOptionLike = {
  show?: boolean;
  margin?: unknown;
  fontSize?: unknown;
  formatter?: unknown;
  hideOverlap?: boolean;
  interval?: unknown;
  [key: string]: unknown;
};

type GridOptionLike = {
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  [key: string]: unknown;
};

type DataZoomOptionLike = {
  type?: string;
  xAxisIndex?: number;
  startValue?: number;
  endValue?: number;
  [key: string]: unknown;
};

type ValueAxisOptionLike = {
  type?: string;
  min?: unknown;
  max?: unknown;
  interval?: unknown;
  splitNumber?: unknown;
  [key: string]: unknown;
};

type SeriesOptionLike = {
  id?: unknown;
  name?: unknown;
  data?: unknown[];
  type?: unknown;
  [key: string]: unknown;
};

type ZrDisplayElementLike = {
  type?: string;
  style?: { text?: unknown };
  getBoundingRect?: () => { x: number; y: number; width: number; height: number };
  transformCoordToGlobal?: (x: number, y: number) => [number, number];
};

function getFirstOptionItem<T>(value: T | T[] | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getOptionNumber(value: unknown, baseValue?: number) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.endsWith('%') && baseValue !== undefined) {
    const percentage = Number.parseFloat(trimmedValue);

    return Number.isFinite(percentage) ? (baseValue * percentage) / 100 : undefined;
  }

  const numericValue = Number.parseFloat(trimmedValue);

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function formatMobileCategoryAxisLabel(value: unknown) {
  const text = String(value ?? '').trim();
  const dateTimeMatch = text.match(/^(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:[ T](\d{1,2}:\d{2})(?::\d{2})?)?$/);

  if (dateTimeMatch) {
    const month = dateTimeMatch[2].padStart(2, '0');
    const day = dateTimeMatch[3].padStart(2, '0');
    const time = dateTimeMatch[4];

    return time ? `${month}.${day}\n${time}` : `${month}.${day}`;
  }

  const slashDateTimeMatch = text.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:[ T](\d{1,2}:\d{2})(?::\d{2})?)?$/);

  if (slashDateTimeMatch) {
    const month = slashDateTimeMatch[2].padStart(2, '0');
    const day = slashDateTimeMatch[3].padStart(2, '0');
    const time = slashDateTimeMatch[4];

    return time ? `${month}.${day}\n${time}` : `${month}.${day}`;
  }

  const timeMatch = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  return text;
}

function getAxisLabelTextCandidates(option: EChartsOption) {
  const xAxis = getFirstOptionItem((option as { xAxis?: AxisOptionLike | AxisOptionLike[] }).xAxis);
  const labels = new Set<string>();

  (xAxis?.data ?? []).forEach((label) => {
    const labelText = String(label);
    labels.add(labelText);

    const fullHourMatch = labelText.match(/^(\d{2}):00$/);
    if (fullHourMatch) {
      labels.add(fullHourMatch[1]);
    }
  });

  return labels;
}

function getCategoryAxisCount(option: EChartsOption) {
  const xAxis = getFirstOptionItem((option as { xAxis?: AxisOptionLike | AxisOptionLike[] }).xAxis);

  return Array.isArray(xAxis?.data) ? xAxis.data.length : 0;
}

function getDataZoomItems(option: EChartsOption) {
  const dataZoom = (option as { dataZoom?: DataZoomOptionLike | DataZoomOptionLike[] }).dataZoom;

  if (!dataZoom) {
    return [];
  }

  return Array.isArray(dataZoom) ? dataZoom : [dataZoom];
}

function getCategorySliderColorPatch(active: boolean) {
  return {
    backgroundColor: active ? CATEGORY_SLIDER_ACTIVE_TRACK : CATEGORY_SLIDER_IDLE_TRACK,
    fillerColor: active ? CATEGORY_SLIDER_ACTIVE_FILL : CATEGORY_SLIDER_IDLE_FILL
  };
}

function getSeriesValue(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }

  if (Array.isArray(value)) {
    const lastValue = value.at(-1);
    return typeof lastValue === 'number' ? lastValue : null;
  }

  if (value && typeof value === 'object' && 'value' in value) {
    const nestedValue = (value as { value?: unknown }).value;

    return typeof nestedValue === 'number' ? nestedValue : null;
  }

  return null;
}

function hasFiniteSeriesValue(option: EChartsOption) {
  const seriesItems = ((option as { series?: SeriesOptionLike | SeriesOptionLike[] }).series ?? []) as SeriesOptionLike | SeriesOptionLike[];
  const seriesList = Array.isArray(seriesItems) ? seriesItems : [seriesItems];

  return seriesList.some((series) => (series.data ?? []).some((value) => {
    const numericValue = getSeriesValue(value);
    return typeof numericValue === 'number' && Number.isFinite(numericValue);
  }));
}

function readRootPixelVariable(name: string, fallback: number) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawValue = window.getComputedStyle(document.documentElement).getPropertyValue(name);
  const numericValue = Number.parseFloat(rawValue);

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function getSeriesIdentity(series: SeriesOptionLike, index: number) {
  if (typeof series.id === 'string' || typeof series.id === 'number') {
    return series.id;
  }

  const type = typeof series.type === 'string' ? series.type : 'series';
  const name = typeof series.name === 'string' || typeof series.name === 'number' ? series.name : index;

  return `base-chart-${type}-${name}`;
}

function withStableDataIdentity(data: unknown[] | undefined) {
  if (!Array.isArray(data)) {
    return data;
  }

  return data.map((item) => {
    if (!item || typeof item !== 'object' || 'id' in item || !('name' in item)) {
      return item;
    }

    const name = (item as { name?: unknown }).name;

    if (typeof name !== 'string' && typeof name !== 'number') {
      return item;
    }

    return { ...item, id: String(name) };
  });
}

function hasRenderableValue(data: unknown[] | undefined) {
  return (data ?? []).some((item) => {
    if (typeof item === 'number') {
      return Number.isFinite(item);
    }

    if (item && typeof item === 'object' && 'value' in item) {
      const value = (item as { value?: unknown }).value;
      return typeof value === 'number' && Number.isFinite(value);
    }

    return item !== null && item !== undefined;
  });
}

function getRenderableBarSeriesCount(option: EChartsOption) {
  const seriesItems = (option as { series?: SeriesOptionLike | SeriesOptionLike[] }).series;

  if (!seriesItems) {
    return 0;
  }

  return (Array.isArray(seriesItems) ? seriesItems : [seriesItems]).filter((series) => series.type === 'bar' && hasRenderableValue(series.data)).length;
}

function withSeriesAnimationDefaults(option: EChartsOption): EChartsOption {
  const seriesItems = (option as { series?: SeriesOptionLike | SeriesOptionLike[] }).series;

  if (!seriesItems) {
    return option;
  }

  const patchSeries = (series: SeriesOptionLike, index: number) => ({
    ...series,
    id: getSeriesIdentity(series, index),
    data: withStableDataIdentity(series.data),
    animation: true,
    animationDuration: CHART_ANIMATION_DURATION_MS,
    animationDurationUpdate: CHART_ANIMATION_DURATION_MS,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut'
  });

  return {
    ...option,
    series: Array.isArray(seriesItems) ? seriesItems.map(patchSeries) : patchSeries(seriesItems, 0)
  } as EChartsOption;
}

function withValueAxisFallback(option: EChartsOption): EChartsOption {
  if (hasFiniteSeriesValue(option)) {
    return option;
  }

  const yAxis = (option as { yAxis?: ValueAxisOptionLike | ValueAxisOptionLike[] }).yAxis;
  const patchAxis = (axis: ValueAxisOptionLike = {}) => ({
    ...axis,
    type: axis.type ?? 'value',
    min: typeof axis.min === 'number' ? axis.min : 0,
    max: typeof axis.max === 'number' ? axis.max : 100,
    interval: typeof axis.interval === 'number' ? axis.interval : 20,
    splitNumber: typeof axis.splitNumber === 'number' ? axis.splitNumber : 5
  });

  return {
    ...option,
    yAxis: Array.isArray(yAxis) ? yAxis.map((axis) => patchAxis(axis)) : patchAxis(yAxis)
  } as EChartsOption;
}

function withVisibleCategoryAxisLabels(option: EChartsOption, enabled: boolean, compactMobile: boolean): EChartsOption {
  if (!enabled) {
    return option;
  }

  const xAxis = (option as { xAxis?: AxisOptionLike | AxisOptionLike[] }).xAxis;
  const patchAxis = (axis: AxisOptionLike = {}) => {
    const axisLabel = axis.axisLabel;
    const patchAxisLabel = (label: AxisLabelOptionLike = {}) => {
      const fontSize = getOptionNumber(label.fontSize);

      return {
        ...label,
        interval: 0,
        hideOverlap: compactMobile ? true : label.hideOverlap,
        ...(compactMobile
          ? {
              formatter: label.formatter ?? formatMobileCategoryAxisLabel,
              fontSize: typeof fontSize === 'number' ? Math.min(fontSize, MOBILE_CATEGORY_AXIS_FONT_SIZE) : MOBILE_CATEGORY_AXIS_FONT_SIZE
            }
          : {})
      };
    };

    return {
      ...axis,
      axisLabel: Array.isArray(axisLabel) ? axisLabel.map((label) => patchAxisLabel(label)) : patchAxisLabel(axisLabel)
    };
  };

  return {
    ...option,
    xAxis: Array.isArray(xAxis) ? xAxis.map((axis) => patchAxis(axis)) : patchAxis(xAxis)
  } as EChartsOption;
}

function withMobileCategoryGrid(option: EChartsOption, enabled: boolean): EChartsOption {
  if (!enabled) {
    return option;
  }

  const grid = (option as { grid?: GridOptionLike | GridOptionLike[] }).grid;
  const patchGrid = (gridOption: GridOptionLike = {}) => ({
    ...gridOption,
    left: Math.min(getOptionNumber(gridOption.left) ?? MOBILE_CATEGORY_GRID_LEFT, MOBILE_CATEGORY_GRID_LEFT),
    right: Math.min(getOptionNumber(gridOption.right) ?? MOBILE_CATEGORY_GRID_RIGHT, MOBILE_CATEGORY_GRID_RIGHT)
  });

  return {
    ...option,
    grid: Array.isArray(grid) ? grid.map((gridOption) => patchGrid(gridOption)) : patchGrid(grid)
  } as EChartsOption;
}

function withMobileYAxisName(option: EChartsOption, enabled: boolean, yAxisLabel: string | undefined): EChartsOption {
  if (!enabled || !yAxisLabel) {
    return option;
  }

  const yAxis = (option as { yAxis?: ValueAxisOptionLike | ValueAxisOptionLike[] }).yAxis;
  const name = yAxisLabel.split(' ').filter(Boolean).join('\n');
  const patchAxis = (axis: ValueAxisOptionLike = {}) => ({
    ...axis,
    name,
    nameLocation: 'end',
    nameGap: MOBILE_Y_AXIS_NAME_GAP,
    nameRotate: 0,
    nameTextStyle: {
      color: '#d6ddea',
      fontSize: 12,
      fontWeight: 300,
      lineHeight: 12,
      align: 'right',
      padding: [0, 0, 2, 0],
      ...((axis.nameTextStyle as Record<string, unknown> | undefined) ?? {})
    }
  });

  return {
    ...option,
    yAxis: Array.isArray(yAxis) ? yAxis.map((axis) => patchAxis(axis)) : patchAxis(yAxis)
  } as EChartsOption;
}

function withNativeChartAnimation(option: EChartsOption): EChartsOption {
  return {
    ...withSeriesAnimationDefaults(option),
    animation: true,
    animationDuration: CHART_ANIMATION_DURATION_MS,
    animationDurationUpdate: CHART_ANIMATION_DURATION_MS,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
    animationThreshold: 2000
  };
}

function withCategoryDataZoom(
  option: EChartsOption,
  enabled: boolean,
  totalCount: number,
  visibleCount: number,
  alignToCurrentHour: boolean,
  layout: {
    gridBottom: number;
    sliderBottom: number;
    sliderHeight: number;
    sliderLeft: number;
    sliderRight: number;
  }
): EChartsOption {
  if (!enabled || totalCount <= visibleCount) {
    return {
      ...option,
      dataZoom: []
    } as EChartsOption;
  }

  const currentHour = new Date().getHours();
  const resolvedVisibleCount = Math.min(totalCount, visibleCount);
  const resolvedMaxStartValue = Math.max(0, totalCount - resolvedVisibleCount);
  const startValue = alignToCurrentHour ? Math.min(resolvedMaxStartValue, Math.max(0, currentHour - Math.floor(resolvedVisibleCount / 2))) : 0;
  const endValue = Math.min(totalCount - 1, startValue + resolvedVisibleCount - 1);
  const existingDataZoom = getDataZoomItems(option).filter((item) => item.type !== 'inside' && item.type !== 'slider');
  const grid = (option as { grid?: GridOptionLike | GridOptionLike[] }).grid;
  const patchGrid = (gridOption: GridOptionLike = {}) => ({
    ...gridOption,
    bottom: Math.max(getOptionNumber(gridOption.bottom) ?? 0, layout.gridBottom)
  });

  return {
    ...option,
    grid: Array.isArray(grid) ? grid.map((gridOption) => patchGrid(gridOption)) : patchGrid(grid),
    dataZoom: [
      ...existingDataZoom,
      {
        type: 'inside',
        xAxisIndex: 0,
        startValue,
        endValue,
        zoomLock: true,
        filterMode: 'none',
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        preventDefaultMouseMove: true
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        startValue,
        endValue,
        zoomLock: true,
        filterMode: 'none',
        realtime: true,
        height: layout.sliderHeight,
        bottom: layout.sliderBottom,
        left: layout.sliderLeft,
        right: layout.sliderRight,
        borderColor: 'transparent',
        backgroundColor: CATEGORY_SLIDER_IDLE_TRACK,
        fillerColor: CATEGORY_SLIDER_IDLE_FILL,
        handleSize: 0,
        moveHandleSize: 0,
        handleStyle: {
          color: 'rgba(214, 221, 234, 0.42)',
          borderColor: 'rgba(214, 221, 234, 0.24)'
        },
        moveHandleStyle: {
          color: 'rgba(214, 221, 234, 0.26)'
        },
        emphasis: {
          fillerColor: CATEGORY_SLIDER_ACTIVE_FILL
        },
        brushSelect: false,
        showDetail: false,
        showDataShadow: false,
        dataBackground: {
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 }
        },
        selectedDataBackground: {
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0 }
        },
        textStyle: { color: 'transparent' }
      }
    ] as EChartsOption['dataZoom']
  };
}

function getEstimatedAxisLabelBottom(chartElement: HTMLElement, option: EChartsOption) {
  const xAxis = getFirstOptionItem((option as { xAxis?: AxisOptionLike | AxisOptionLike[] }).xAxis);
  const axisLabel = getFirstOptionItem(xAxis?.axisLabel);

  if (!xAxis || axisLabel?.show === false) {
    return null;
  }

  const grid = getFirstOptionItem((option as { grid?: GridOptionLike | GridOptionLike[] }).grid);
  const chartHeight = chartElement.clientHeight;
  const bottomInset = getOptionNumber(grid?.bottom, chartHeight) ?? 0;
  const labelMargin = getOptionNumber(axisLabel?.margin) ?? 8;
  const labelFontSize = getOptionNumber(axisLabel?.fontSize) ?? 12;
  const labelBottom = chartHeight - bottomInset + labelMargin + labelFontSize;

  return Math.min(chartHeight, Math.max(0, labelBottom));
}

function getAxisLabelBottom(chart: EChartsType, chartElement: HTMLElement, option: EChartsOption) {
  const labelCandidates = getAxisLabelTextCandidates(option);

  if (labelCandidates.size === 0) {
    return getEstimatedAxisLabelBottom(chartElement, option);
  }

  const displayList = ((chart as unknown as { getZr?: () => { storage?: { getDisplayList?: () => unknown[] } } }).getZr?.().storage?.getDisplayList?.() ??
    []) as ZrDisplayElementLike[];
  let labelBottom = Number.NEGATIVE_INFINITY;

  displayList.forEach((element) => {
    const text = String(element.style?.text ?? '');

    if (!labelCandidates.has(text)) {
      return;
    }

    const rect = element.getBoundingRect?.();
    if (!rect) {
      return;
    }

    const bottomPoint = element.transformCoordToGlobal?.(rect.x, rect.y + rect.height);
    labelBottom = Math.max(labelBottom, bottomPoint?.[1] ?? rect.y + rect.height);
  });

  return Number.isFinite(labelBottom) ? labelBottom : getEstimatedAxisLabelBottom(chartElement, option);
}

function withLegendSelection(option: EChartsOption, legendItems: ChartLegendItem[] | undefined, disabledLegends: Set<string>): EChartsOption {
  if (!legendItems || legendItems.length === 0) {
    return option;
  }

  const selected = Object.fromEntries(legendItems.map((item) => [item.name, !disabledLegends.has(item.name)]));
  const data = legendItems.map((item) => item.name);
  const legend = option.legend as LegendOptionLike | LegendOptionLike[] | undefined;

  if (Array.isArray(legend)) {
    return {
      ...option,
      legend: legend.map((item) => ({
        ...item,
        data: item.data ?? data,
        selectedMode: item.selectedMode ?? true,
        selected: { ...((item.selected as Record<string, boolean> | undefined) ?? {}), ...selected }
      })) as EChartsOption['legend']
    };
  }

  return {
    ...option,
    legend: {
      ...(legend ?? {}),
      show: legend?.show ?? false,
      data: legend?.data ?? data,
      selectedMode: legend?.selectedMode ?? true,
      selected: { ...((legend?.selected as Record<string, boolean> | undefined) ?? {}), ...selected }
    } as EChartsOption['legend']
  };
}

/*
 * 필요: Apache ECharts Community 차트를 화면마다 같은 래퍼로 렌더링한다.
 * 연결: 각 feature summary/result section의 ECharts option.
 * 설명: 데이터와 옵션은 section에서 받고, resize와 로딩 표시는 공통 처리한다.
 * 수정: 차트 높이, 최소 폭, 스크롤 여부는 호출부 props에서 조정한다.
 */
export function BaseChart({
  option,
  height = 320,
  minWidth,
  maxWidth,
  scrollable = false,
  fullDay = false,
  categoryCount,
  scrollToCurrentTime = false,
  legendItems,
  yAxisLabel,
  axisLegendGap,
  legendGap,
  scrollIndicatorTopGap,
  scrollIndicatorBottomGap,
  categoryDataZoomGridBottom,
  categoryDataZoomHeight,
  categoryDataZoomBottom,
  categoryDataZoomLegendGap,
  className = ''
}: BaseChartProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<EChartsType | null>(null);
  const latestOptionRef = useRef<EChartsOption>({ aria: { enabled: true }, ...option });
  const latestViewportWidthRef = useRef(0);
  const resizeFrameRef = useRef<number | null>(null);
  const layoutResizeTimersRef = useRef<number[]>([]);
  const layoutWatchIntervalRef = useRef<number | null>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const dragStateRef = useRef({
    isPointerDown: false,
    startX: 0,
    scrollLeft: 0
  });
  const [loading, setLoading] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [disabledLegends, setDisabledLegends] = useState<Set<string>>(() => new Set());
  const [axisLegendStyle, setAxisLegendStyle] = useState<{ marginTop: number; marginBottom: number } | undefined>(undefined);
  const [scrollIndicatorStyle, setScrollIndicatorStyle] = useState<
    { width: number; left: number; canScrollLeft: boolean; canScrollRight: boolean } | undefined
  >(undefined);
  const [chartViewportWidth, setChartViewportWidth] = useState(0);
  const [rootContentGap, setRootContentGap] = useState(DEFAULT_AXIS_LEGEND_GAP);
  // 24시간 차트는 2560 기준 폭을 유지하고, 좁은 화면에서는 그래프 본체만 스크롤한다.
  const isChartScrollable = scrollable;
  const shouldScrollToCurrentTime = scrollToCurrentTime;
  const categoryMinWidth =
    typeof categoryCount === 'number' && categoryCount > 0 ? Math.min(FULL_DAY_TIME_CHART_MAX_WIDTH, categoryCount * CATEGORY_CHART_SLOT_WIDTH) : undefined;
  const categoryAxisCount = categoryCount ?? getCategoryAxisCount(option);
  const renderableBarSeriesCount = getRenderableBarSeriesCount(option);
  const mobileCategorySlotWidth = renderableBarSeriesCount > 1 ? CATEGORY_CHART_SLOT_WIDTH : MOBILE_SINGLE_BAR_CATEGORY_SLOT_WIDTH;
  const shouldUseMobileCategoryLayout = chartViewportWidth > 0 && chartViewportWidth <= MOBILE_CATEGORY_AXIS_MAX_WIDTH && (fullDay || Boolean(categoryCount));
  const categorySlotWidth = shouldUseMobileCategoryLayout ? mobileCategorySlotWidth : fullDay ? FULL_DAY_TIME_CHART_MAX_WIDTH / 24 : CATEGORY_CHART_SLOT_WIDTH;
  const measuredViewportWidth = chartViewportWidth || (fullDay ? FULL_DAY_TIME_CHART_MAX_WIDTH : Number.POSITIVE_INFINITY);
  const measuredCategoryPlotWidth = shouldUseMobileCategoryLayout
    ? Math.max(1, measuredViewportWidth - MOBILE_CATEGORY_GRID_LEFT - MOBILE_CATEGORY_GRID_RIGHT)
    : measuredViewportWidth;
  const visibleCategoryCount = Math.max(1, Math.min(categoryAxisCount, Math.floor(measuredCategoryPlotWidth / categorySlotWidth)));
  const shouldUseCategoryDataZoom = chartViewportWidth > 0 && !scrollable && categoryAxisCount > visibleCategoryCount && (fullDay || Boolean(categoryCount));
  const numericMinWidth = typeof minWidth === 'number' ? minWidth : undefined;
  const resolvedMinWidth = shouldUseCategoryDataZoom || fullDay ? '100%' : categoryMinWidth ? Math.max(numericMinWidth ?? 0, categoryMinWidth) : minWidth;
  const resolvedMaxWidth = fullDay ? FULL_DAY_TIME_CHART_MAX_WIDTH : categoryMinWidth ? FULL_DAY_TIME_CHART_MAX_WIDTH : maxWidth;
  const chartMinWidth = typeof resolvedMinWidth === 'number' ? `${resolvedMinWidth}px` : resolvedMinWidth;
  const chartMaxWidth = typeof resolvedMaxWidth === 'number' ? `${resolvedMaxWidth}px` : resolvedMaxWidth;
  const yAxisLabelLines = yAxisLabel?.split(' ').filter(Boolean) ?? [];
  const resolvedAxisLegendGap = legendGap ?? axisLegendGap ?? rootContentGap;
  const resolvedCategoryDataZoomGridBottom = categoryDataZoomGridBottom ?? CATEGORY_ZOOM_GRID_BOTTOM;
  const resolvedCategoryDataZoomHeight = categoryDataZoomHeight ?? CATEGORY_ZOOM_SLIDER_HEIGHT;
  const resolvedCategoryDataZoomBottom = categoryDataZoomBottom ?? CATEGORY_ZOOM_SLIDER_BOTTOM;
  const resolvedCategoryDataZoomLegendGap = categoryDataZoomLegendGap ?? CATEGORY_ZOOM_LEGEND_GAP;
  const categoryDataZoomGrid = getFirstOptionItem((option as { grid?: GridOptionLike | GridOptionLike[] }).grid);
  const categoryDataZoomSliderLeft = shouldUseMobileCategoryLayout ? MOBILE_CATEGORY_GRID_LEFT : getOptionNumber(categoryDataZoomGrid?.left, chartViewportWidth) ?? 0;
  const categoryDataZoomSliderRight = shouldUseMobileCategoryLayout ? MOBILE_CATEGORY_GRID_RIGHT : getOptionNumber(categoryDataZoomGrid?.right, chartViewportWidth) ?? 0;
  const categoryDataZoomLayout = useMemo(
    () => ({
      gridBottom: resolvedCategoryDataZoomGridBottom,
      sliderBottom: resolvedCategoryDataZoomBottom,
      sliderHeight: resolvedCategoryDataZoomHeight,
      sliderLeft: categoryDataZoomSliderLeft,
      sliderRight: categoryDataZoomSliderRight
    }),
    [
      categoryDataZoomSliderLeft,
      categoryDataZoomSliderRight,
      resolvedCategoryDataZoomBottom,
      resolvedCategoryDataZoomGridBottom,
      resolvedCategoryDataZoomHeight,
      resolvedCategoryDataZoomLegendGap
    ]
  );
  const fixedLegendStyle = useMemo(
    () => (legendGap === undefined ? undefined : ({ marginTop: legendGap, marginBottom: 0 } satisfies CSSProperties)),
    [legendGap]
  );
  const scrollIndicatorLayoutStyle = useMemo(
    () =>
      ({
        '--chart-scroll-indicator-top-gap': `${scrollIndicatorTopGap ?? 4}px`,
        '--chart-scroll-indicator-bottom-gap': `${scrollIndicatorBottomGap ?? 8}px`
      }) as CSSProperties,
    [scrollIndicatorBottomGap, scrollIndicatorTopGap]
  );
  const categoryDataZoomCueStyle = useMemo(
    () =>
      ({
        '--chart-category-datazoom-bottom': `${categoryDataZoomLayout.sliderBottom}px`,
        '--chart-category-datazoom-height': `${categoryDataZoomLayout.sliderHeight}px`,
        '--chart-category-datazoom-left': `${categoryDataZoomLayout.sliderLeft}px`,
        '--chart-category-datazoom-right': `${categoryDataZoomLayout.sliderRight}px`
      }) as CSSProperties,
    [categoryDataZoomLayout]
  );
  const legendKey = legendItems?.map((item) => item.name).join('|') ?? '';
  const optionWithLegendSelection = useMemo(
    () => withLegendSelection(option, legendItems, disabledLegends),
    [disabledLegends, legendItems, option]
  );
  const chartOption = useMemo<EChartsOption>(
    () =>
      withCategoryDataZoom(
        withNativeChartAnimation(
          withMobileCategoryGrid(
            withMobileYAxisName(
              withVisibleCategoryAxisLabels(
                withValueAxisFallback({ aria: { enabled: true }, ...optionWithLegendSelection }),
                fullDay || Boolean(categoryCount),
                shouldUseMobileCategoryLayout
              ),
              shouldUseMobileCategoryLayout,
              yAxisLabel
            ),
            shouldUseMobileCategoryLayout
          )
        ),
        shouldUseCategoryDataZoom,
        categoryAxisCount,
        visibleCategoryCount,
        shouldScrollToCurrentTime,
        categoryDataZoomLayout
      ),
    [
      categoryAxisCount,
      categoryDataZoomLayout,
      optionWithLegendSelection,
      shouldScrollToCurrentTime,
      shouldUseCategoryDataZoom,
      shouldUseMobileCategoryLayout,
      visibleCategoryCount,
      yAxisLabel
    ]
  );
  const updateScrollIndicator = useCallback(() => {
    if (!scrollRef.current || scrollRef.current.scrollWidth <= scrollRef.current.clientWidth) {
      setScrollIndicatorStyle(undefined);
      return;
    }

    const { clientWidth, scrollLeft, scrollWidth } = scrollRef.current;
    const width = Math.max(32, (clientWidth / scrollWidth) * clientWidth);
    const maxLeft = clientWidth - width;
    const maxScrollLeft = scrollWidth - clientWidth;
    const left = maxLeft <= 0 ? 0 : (scrollLeft / maxScrollLeft) * maxLeft;

    setScrollIndicatorStyle((previousStyle) => {
      const nextStyle = {
        width: Math.round(width),
        left: Math.round(left),
        canScrollLeft: scrollLeft > 2,
        canScrollRight: scrollLeft < maxScrollLeft - 2
      };
      return previousStyle?.width === nextStyle.width &&
        previousStyle.left === nextStyle.left &&
        previousStyle.canScrollLeft === nextStyle.canScrollLeft &&
        previousStyle.canScrollRight === nextStyle.canScrollRight
        ? previousStyle
        : nextStyle;
    });
  }, []);
  const updateAxisLegendStyle = useCallback(() => {
    if (!chartInstanceRef.current || !chartRef.current || !legendItems?.length || !(latestOptionRef.current as { xAxis?: unknown }).xAxis) {
      setAxisLegendStyle(undefined);
      return;
    }

    const labelBottom = getAxisLabelBottom(chartInstanceRef.current, chartRef.current, latestOptionRef.current);

    if (labelBottom === null) {
      setAxisLegendStyle(undefined);
      return;
    }

    const innerBottomGap = Math.max(0, chartRef.current.clientHeight - labelBottom);
    const nextStyle = { marginTop: Math.round(resolvedAxisLegendGap - innerBottomGap), marginBottom: 0 };

    setAxisLegendStyle((previousStyle) =>
      previousStyle?.marginTop === nextStyle.marginTop && previousStyle.marginBottom === nextStyle.marginBottom ? previousStyle : nextStyle
    );
  }, [legendItems?.length, resolvedAxisLegendGap]);
  const requestChartResize = useCallback(() => {
    if (resizeFrameRef.current !== null) {
      return;
    }

    resizeFrameRef.current = window.requestAnimationFrame(() => {
      resizeFrameRef.current = null;
      const nextViewportWidth = scrollRef.current?.clientWidth ?? chartRef.current?.clientWidth ?? rootRef.current?.clientWidth ?? 0;
      const nextViewportHeight = chartRef.current?.clientHeight ?? 0;
      latestViewportWidthRef.current = nextViewportWidth;
      setChartViewportWidth((previousWidth) => (previousWidth === nextViewportWidth ? previousWidth : nextViewportWidth));
      chartInstanceRef.current?.resize({
        width: nextViewportWidth || undefined,
        height: nextViewportHeight || undefined
      });
      updateScrollIndicator();
      updateAxisLegendStyle();
    });
  }, [updateAxisLegendStyle, updateScrollIndicator]);
  const requestLayoutRefresh = useCallback(() => {
    layoutResizeTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    layoutResizeTimersRef.current = [];
    requestChartResize();
    [80, 180, 360, 700, 1100].forEach((delay) => {
      const timerId = window.setTimeout(() => {
        requestChartResize();
      }, delay);
      layoutResizeTimersRef.current.push(timerId);
    });
  }, [requestChartResize]);
  const setCategorySliderActive = useCallback((active: boolean) => {
    const chart = chartInstanceRef.current;

    if (!chart || !shouldUseCategoryDataZoom) {
      return;
    }

    const currentOption = chart.getOption() as { dataZoom?: DataZoomOptionLike[] };
    const dataZoom = currentOption.dataZoom ?? [];

    if (!dataZoom.some((item) => item.type === 'slider')) {
      return;
    }

    chart.setOption(
      {
        dataZoom: dataZoom.map((item) => (item.type === 'slider' ? { ...item, ...getCategorySliderColorPatch(active) } : item))
      },
      false
    );
  }, [shouldUseCategoryDataZoom]);
  useEffect(() => {
    setDisabledLegends(new Set());
  }, [legendKey]);

  useEffect(() => {
    setRootContentGap(readRootPixelVariable(COMMON_CONTENT_GAP_CSS_VAR, DEFAULT_AXIS_LEGEND_GAP));
  }, []);

  useEffect(() => {
    if (!isChartScrollable || !shouldScrollToCurrentTime || !scrollRef.current) {
      return;
    }

    const scrollElement = scrollRef.current;
    const currentHour = new Date().getHours();
    const contentWidth = scrollElement.scrollWidth;
    const slotWidth = contentWidth >= HOURLY_CHART_SLOT_WIDTH * 24 ? contentWidth / 24 : HOURLY_CHART_SLOT_WIDTH;
    const targetLeft = currentHour * slotWidth - scrollElement.clientWidth * 0.55;

    scrollElement.scrollLeft = Math.max(0, targetLeft);
  }, [chartMinWidth, isChartScrollable, shouldScrollToCurrentTime]);

  useEffect(
    () => () => {
      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      if (resizeFrameRef.current !== null) {
        window.cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
      if (layoutWatchIntervalRef.current !== null) {
        window.clearInterval(layoutWatchIntervalRef.current);
        layoutWatchIntervalRef.current = null;
      }
      layoutResizeTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      layoutResizeTimersRef.current = [];
    },
    []
  );

  const handleScroll = () => {
    if (!isChartScrollable) {
      return;
    }

    if (!isScrollingRef.current) {
      isScrollingRef.current = true;
      setIsScrolling(true);
    }

    updateScrollIndicator();

    if (scrollIdleTimerRef.current !== null) {
      window.clearTimeout(scrollIdleTimerRef.current);
    }

    scrollIdleTimerRef.current = window.setTimeout(() => {
      isScrollingRef.current = false;
      setIsScrolling(false);
      scrollIdleTimerRef.current = null;
    }, 700);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldUseCategoryDataZoom) {
      setCategorySliderActive(true);
      return;
    }

    if (!isChartScrollable || !scrollRef.current || scrollRef.current.scrollWidth <= scrollRef.current.clientWidth) {
      return;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      isPointerDown: true,
      startX: event.clientX,
      scrollLeft: scrollRef.current.scrollLeft
    };
    setIsDragging(true);
    updateScrollIndicator();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isPointerDown || !scrollRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    scrollRef.current.scrollLeft = dragStateRef.current.scrollLeft - deltaX;
    updateScrollIndicator();
    event.preventDefault();
  };

  const stopDragScroll = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldUseCategoryDataZoom) {
      setCategorySliderActive(false);
      return;
    }

    if (!dragStateRef.current.isPointerDown) {
      return;
    }

    dragStateRef.current.isPointerDown = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };
  const handlePointerLeave = () => {
    if (shouldUseCategoryDataZoom) {
      setCategorySliderActive(false);
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    setLoading(true);

    const handlePrintResize = () => {
      requestLayoutRefresh();
    };

    window.addEventListener('resize', requestLayoutRefresh);
    window.addEventListener('orientationchange', requestLayoutRefresh);
    window.visualViewport?.addEventListener('resize', requestLayoutRefresh);
    document.addEventListener('click', requestLayoutRefresh, true);
    document.addEventListener('pointerup', requestLayoutRefresh, true);
    document.addEventListener('transitionend', requestLayoutRefresh, true);
    document.addEventListener('animationend', requestLayoutRefresh, true);
    window.addEventListener('beforeprint', handlePrintResize);
    window.addEventListener('afterprint', handlePrintResize);
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(requestLayoutRefresh);
      if (rootRef.current) {
        resizeObserver.observe(rootRef.current);
      }
      resizeObserver.observe(chartRef.current);
      if (scrollRef.current) {
        resizeObserver.observe(scrollRef.current);
      }
      if (chartRef.current.parentElement) {
        resizeObserver.observe(chartRef.current.parentElement);
      }
    }
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(requestLayoutRefresh);
      mutationObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });
    }
    layoutWatchIntervalRef.current = window.setInterval(() => {
      const viewportWidth = scrollRef.current?.clientWidth ?? chartRef.current?.clientWidth ?? rootRef.current?.clientWidth ?? 0;
      const canvasWidth = chartRef.current?.querySelector('canvas')?.getBoundingClientRect().width ?? 0;

      if (Math.abs(viewportWidth - latestViewportWidthRef.current) > 1 || (canvasWidth > 0 && Math.abs(canvasWidth - viewportWidth) > 1)) {
        requestLayoutRefresh();
      }
    }, 250);

    // ECharts는 무거운 라이브러리라 차트 영역에서만 지연 로딩한다.
    import('echarts').then((echarts) => {
      if (!chartRef.current || disposed) return;

      const chart = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
      chartInstanceRef.current = chart;
      chart.setOption(latestOptionRef.current, true);
      setLoading(false);
      requestLayoutRefresh();
    });

    return () => {
      disposed = true;
      window.removeEventListener('resize', requestLayoutRefresh);
      window.removeEventListener('orientationchange', requestLayoutRefresh);
      window.visualViewport?.removeEventListener('resize', requestLayoutRefresh);
      document.removeEventListener('click', requestLayoutRefresh, true);
      document.removeEventListener('pointerup', requestLayoutRefresh, true);
      document.removeEventListener('transitionend', requestLayoutRefresh, true);
      document.removeEventListener('animationend', requestLayoutRefresh, true);
      window.removeEventListener('beforeprint', handlePrintResize);
      window.removeEventListener('afterprint', handlePrintResize);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      if (layoutWatchIntervalRef.current !== null) {
        window.clearInterval(layoutWatchIntervalRef.current);
        layoutWatchIntervalRef.current = null;
      }
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, [requestLayoutRefresh]);

  useEffect(() => {
    latestOptionRef.current = chartOption;
    chartInstanceRef.current?.setOption(chartOption, { replaceMerge: ['dataZoom'] });
    requestLayoutRefresh();
    window.requestAnimationFrame(() => window.requestAnimationFrame(updateAxisLegendStyle));
  }, [chartOption, requestLayoutRefresh, updateAxisLegendStyle]);

  useEffect(() => {
    requestLayoutRefresh();
  }, [chartMaxWidth, chartMinWidth, height, requestLayoutRefresh]);

  return (
    <div ref={rootRef} className="chart-shell">
      <div className={`chart-frame ${yAxisLabel ? 'chart-frame--with-y-axis-label' : ''}`.trim()}>
        {yAxisLabel && (
          <span className="chart-fixed-y-axis-label" aria-hidden="true">
            {yAxisLabelLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
        )}
        <div
          ref={scrollRef}
          className={`chart-box ${isChartScrollable ? 'chart-box--scroll' : ''} ${isScrolling ? 'chart-box--scrolling' : ''} ${isDragging ? 'chart-box--dragging' : ''}`.trim()}
          onScroll={handleScroll}
          onPointerDownCapture={handlePointerDown}
          onPointerMoveCapture={handlePointerMove}
          onPointerUpCapture={stopDragScroll}
          onPointerCancelCapture={stopDragScroll}
          onPointerLeave={handlePointerLeave}
        >
          {loading && (
            <div className="chart__loading" role="status" aria-live="polite">
              <span className="chart__loading-text">
                차트 불러오는중
                <span className="chart__loading-dots" aria-hidden="true">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </span>
              <span className="chart__loading-bar" aria-hidden="true" />
            </div>
          )}
          <div
            ref={chartRef}
            className={`chart ${className}`.trim()}
            style={{ width: '100%', height, minWidth: chartMinWidth, maxWidth: chartMaxWidth }}
          />
          {shouldUseCategoryDataZoom && (
            <span className="chart-category-datazoom-cues" style={categoryDataZoomCueStyle} aria-hidden="true">
              <span className="chart-category-datazoom-cue chart-category-datazoom-cue--left" />
              <span className="chart-category-datazoom-cue chart-category-datazoom-cue--right" />
            </span>
          )}
        </div>
        {isChartScrollable && scrollIndicatorStyle && (
          <span className={`chart-scroll-indicator ${isScrolling || isDragging ? 'is-active' : ''}`} style={scrollIndicatorLayoutStyle} aria-hidden="true">
            {scrollIndicatorStyle.canScrollLeft && (
              <span className="chart-scroll-indicator__cue chart-scroll-indicator__cue--left" />
            )}
            <span
              className="chart-scroll-indicator__thumb"
              style={{ width: scrollIndicatorStyle.width, transform: `translateX(${scrollIndicatorStyle.left}px)` }}
            />
            {scrollIndicatorStyle.canScrollRight && (
              <span className="chart-scroll-indicator__cue chart-scroll-indicator__cue--right" />
            )}
          </span>
        )}
      </div>
      {legendItems && legendItems.length > 0 && (
        <div className="chart-fixed-legend" aria-label="차트 범례" style={axisLegendStyle ?? fixedLegendStyle}>
          {legendItems.map((item, index) => (
            <button
              type="button"
              className={`chart-fixed-legend__item ${disabledLegends.has(item.name) ? 'is-disabled' : ''}`.trim()}
              key={`${item.name}-${index}`}
              aria-pressed={!disabledLegends.has(item.name)}
              onClick={() => {
                setDisabledLegends((previous) => {
                  const next = new Set(previous);

                  if (next.has(item.name)) {
                    next.delete(item.name);
                  } else {
                    next.add(item.name);
                  }

                  return next;
                });
              }}
            >
              <span
                className={`chart-fixed-legend__marker chart-fixed-legend__marker--${item.type ?? 'bar'}`}
                style={{ backgroundColor: (item.type ?? 'bar') === 'bar' ? item.color : undefined }}
              >
                {(item.type ?? 'bar') === 'line' && (
                  <span className="chart-fixed-legend__line" style={{ backgroundColor: item.color }} />
                )}
              </span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
