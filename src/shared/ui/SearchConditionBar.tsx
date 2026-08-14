import { useEffect, useRef, useState } from 'react';
import { ActionButton } from './ActionButton';
import { ConfirmActionModal } from './ConfirmActionModal';
import './SearchConditionBar.css';

export type SearchConditionInputType = 'date' | 'dateRange' | 'month' | 'year';

export type SearchConditionCriteria<T extends string> = {
  mode: T;
  startDate: string;
  endDate: string;
  year: string;
  month: string;
};

export type SearchConditionOption<T extends string> = {
  value: T;
  label?: string;
  inputType?: SearchConditionInputType;
};

type SearchConditionValues = {
  date: string;
  startDate: string;
  endDate: string;
  year: string;
  month: string;
};

type DateRangeBoundary = 'start' | 'end';

type DurationLimitWarning = {
  boundary: DateRangeBoundary;
  limitDays: number;
  requestedStartDate: string;
  requestedEndDate: string;
  adjustedStartDate: string;
  adjustedEndDate: string;
};

type SearchConditionBarProps<T extends string> = {
  modes: readonly (T | SearchConditionOption<T>)[];
  defaultMode: T;
  align?: 'left' | 'right' | 'split';
  className?: string;
  startDateLabel?: string;
  endDateLabel?: string;
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultYear?: string;
  defaultMonth?: string;
  dateRangeLimitDays?: number;
  weekNavigationMode?: T;
  onModeChange?: (mode: T) => void;
  onSearch?: (criteria: SearchConditionCriteria<T>) => void;
};

const DURATION_MAX_DAYS = 30;

function getTodayValues() {
  const today = new Date();
  const year = String(today.getFullYear());
  const month = `${year}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const date = `${month}-${String(today.getDate()).padStart(2, '0')}`;

  return { year, month, date };
}

function getLastDateOfMonth(month: string) {
  const [yearValue, monthValue] = month.split('-').map(Number);

  if (!yearValue || !monthValue) {
    return '';
  }

  const lastDate = new Date(yearValue, monthValue, 0).getDate();
  return `${month}-${String(lastDate).padStart(2, '0')}`;
}

function getFirstDateOfMonth(month: string, fallbackDate: string) {
  return month ? `${month}-01` : fallbackDate;
}

function getFirstDateOfYear(year: string, fallbackDate: string) {
  return year ? `${year}-01-01` : fallbackDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateValue(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateValue(dateValue: string) {
  if (!dateValue) {
    return null;
  }

  const date = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getInclusiveRangeDays(startDateValue: string, endDateValue: string) {
  const start = parseDateValue(startDateValue);
  const end = parseDateValue(endDateValue);

  if (!start || !end) {
    return 0;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
}

function isDateRangeOverLimit(startDateValue: string, endDateValue: string, limitDays: number) {
  return getInclusiveRangeDays(startDateValue, endDateValue) > limitDays;
}

function adjustDateRangeToLimit(
  boundary: DateRangeBoundary,
  startDateValue: string,
  endDateValue: string,
  limitDays: number
) {
  const start = parseDateValue(startDateValue);
  const end = parseDateValue(endDateValue);
  const limitOffsetDays = limitDays - 1;

  if (!start || !end) {
    return {
      startDate: startDateValue,
      endDate: endDateValue
    };
  }

  if (boundary === 'start') {
    return {
      startDate: startDateValue,
      endDate: formatDateValue(addDays(start, limitOffsetDays))
    };
  }

  return {
    startDate: formatDateValue(addDays(end, -limitOffsetDays)),
    endDate: endDateValue
  };
}

function getWeekRange(dateValue: string) {
  const baseDate = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  const day = baseDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const startDate = addDays(baseDate, mondayOffset);
  const endDate = addDays(startDate, 6);

  return {
    startDate: formatDateValue(startDate),
    endDate: formatDateValue(endDate)
  };
}

function getDefaultValuesForInputType(
  inputType: SearchConditionInputType,
  todayDate: string
): SearchConditionValues {
  // 모드를 바꾸는 순간에는 이전 선택값이 아니라 현재 일/주/월/연 기준 기본값으로 되돌린다.
  const nextDate = todayDate;
  const nextYear = nextDate.slice(0, 4);
  const nextMonth = nextDate.slice(0, 7);

  if (inputType === 'year') {
    const yearStartDate = getFirstDateOfYear(nextYear, nextDate);

    return {
      date: yearStartDate,
      startDate: yearStartDate,
      endDate: `${nextYear}-12-31`,
      year: nextYear,
      month: `${nextYear}-01`
    };
  }

  if (inputType === 'month') {
    const monthStartDate = getFirstDateOfMonth(nextMonth, nextDate);

    return {
      date: monthStartDate,
      startDate: monthStartDate,
      endDate: getLastDateOfMonth(nextMonth) || monthStartDate,
      year: nextYear,
      month: nextMonth
    };
  }

  if (inputType === 'dateRange') {
    const weekRange = getWeekRange(nextDate);

    return {
      date: nextDate,
      startDate: weekRange.startDate,
      endDate: weekRange.endDate,
      year: nextYear,
      month: nextMonth
    };
  }

  return {
    date: nextDate,
    startDate: nextDate,
    endDate: nextDate,
    year: nextYear,
    month: nextMonth
  };
}

function getInitialRange(
  defaultStartDate: string | undefined,
  defaultEndDate: string | undefined,
  initialMonth: string,
  todayDate: string,
  initialInputType: SearchConditionInputType
) {
  if (defaultStartDate || defaultEndDate) {
    return {
      startDate: defaultStartDate || todayDate,
      endDate: defaultEndDate || defaultStartDate || todayDate
    };
  }

  if (initialInputType === 'dateRange') {
    return getWeekRange(todayDate);
  }

  if (initialInputType === 'month') {
    return {
      startDate: `${initialMonth}-01`,
      endDate: getLastDateOfMonth(initialMonth) || todayDate
    };
  }

  return {
    startDate: todayDate,
    endDate: todayDate
  };
}

function normalizeOption<T extends string>(option: T | SearchConditionOption<T>): SearchConditionOption<T> {
  if (typeof option === 'string') {
    return { value: option, label: option };
  }

  return { ...option, label: option.label || option.value };
}

function getInputType(mode: string, option?: SearchConditionOption<string>): SearchConditionInputType {
  if (option?.inputType) {
    return option.inputType;
  }

  if (mode === 'Year' || mode === 'Yearly') return 'year';
  if (mode === 'Month' || mode === 'Monthly') return 'month';
  if (mode === 'Daily') return 'date';

  return 'dateRange';
}

function toCriteria<T extends string>(
  mode: T,
  inputType: SearchConditionInputType,
  values: SearchConditionValues
): SearchConditionCriteria<T> {
  if (inputType === 'year') {
    return {
      mode,
      startDate: `${values.year}-01-01`,
      endDate: `${values.year}-12-31`,
      year: values.year,
      month: values.month
    };
  }

  if (inputType === 'month') {
    return {
      mode,
      startDate: `${values.month}-01`,
      endDate: getLastDateOfMonth(values.month),
      year: values.year,
      month: values.month
    };
  }

  if (inputType === 'date') {
    const month = values.date.slice(0, 7) || values.month;
    const year = values.date.slice(0, 4) || values.year;

    return {
      mode,
      startDate: values.date,
      endDate: values.date,
      year,
      month
    };
  }

  return {
    mode,
    startDate: values.startDate,
    endDate: values.endDate,
    year: values.year,
    month: values.month
  };
}

type CalendarInputProps = {
  ariaLabel: string;
  type: 'date' | 'month';
  value: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
};

function CalendarInput({ ariaLabel, type, value, onChange, onCommit }: CalendarInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();
    input.showPicker?.();
  };

  return (
    <>
      <input
        ref={inputRef}
        aria-label={ariaLabel}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => onCommit?.(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onCommit?.(event.currentTarget.value);
          }
        }}
      />
      <button type="button" className="search-condition-bar__calendar" aria-label={`${ariaLabel} 달력 열기`} onClick={handleOpenPicker}>
        <span aria-hidden="true" />
      </button>
    </>
  );
}

export function SearchConditionBar<T extends string>({
  modes,
  defaultMode,
  align = 'right',
  className = '',
  startDateLabel = '시작일',
  endDateLabel = '종료일',
  defaultStartDate,
  defaultEndDate,
  defaultYear,
  defaultMonth,
  dateRangeLimitDays,
  weekNavigationMode,
  onModeChange,
  onSearch
}: SearchConditionBarProps<T>) {
  const todayValues = getTodayValues();
  const initialYear = defaultYear || todayValues.year;
  const initialMonth = defaultMonth || todayValues.month;
  const normalizedModes = modes.map((mode) => normalizeOption(mode));
  const initialOption = normalizedModes.find((mode) => mode.value === defaultMode);
  const initialInputType = getInputType(defaultMode, initialOption as SearchConditionOption<string> | undefined);
  const initialRange = getInitialRange(defaultStartDate, defaultEndDate, initialMonth, todayValues.date, initialInputType);
  const [selectedMode, setSelectedMode] = useState<T>(defaultMode);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [date, setDate] = useState(initialRange.startDate);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const [durationLimitWarning, setDurationLimitWarning] = useState<DurationLimitWarning | null>(null);
  const lastRangeBoundaryRef = useRef<DateRangeBoundary>('end');

  useEffect(() => {
    setSelectedMode(defaultMode);
  }, [defaultMode]);

  const selectedOption = normalizedModes.find((mode) => mode.value === selectedMode);
  const inputType = getInputType(selectedMode, selectedOption as SearchConditionOption<string> | undefined);
  const isDurationMode = String(selectedMode) === 'Duration';
  const activeDateRangeLimitDays = isDurationMode ? DURATION_MAX_DAYS : dateRangeLimitDays;
  const hasDateRangeLimit = inputType === 'dateRange' && Boolean(activeDateRangeLimitDays);
  const isWeekNavigationMode =
    inputType === 'dateRange' && weekNavigationMode !== undefined && selectedMode === weekNavigationMode;
  const currentWeekRange = getWeekRange(todayValues.date);
  const selectedWeekRange = getWeekRange(startDate || todayValues.date);
  const canGoNextWeek = isWeekNavigationMode && selectedWeekRange.startDate < currentWeekRange.startDate;

  const createCriteria = (mode: T, nextInputType = inputType) =>
    toCriteria(mode, nextInputType, { date, startDate, endDate, year, month });

  const handleModeClick = (mode: T, nextInputType: SearchConditionInputType) => {
    const nextValues = getDefaultValuesForInputType(nextInputType, todayValues.date);

    setYear(nextValues.year);
    setMonth(nextValues.month);
    setDate(nextValues.date);
    setStartDate(nextValues.startDate);
    setEndDate(nextValues.endDate);
    setSelectedMode(mode);
    onModeChange?.(mode);
    onSearch?.(toCriteria(mode, nextInputType, nextValues));
  };

  const openDateRangeLimitWarning = (
    boundary: DateRangeBoundary,
    nextStartDate: string,
    nextEndDate: string,
    limitDays: number
  ) => {
    const adjustedRange = adjustDateRangeToLimit(boundary, nextStartDate, nextEndDate, limitDays);

    setDurationLimitWarning({
      boundary,
      limitDays,
      requestedStartDate: nextStartDate,
      requestedEndDate: nextEndDate,
      adjustedStartDate: adjustedRange.startDate,
      adjustedEndDate: adjustedRange.endDate
    });
  };

  const handleDateRangeChange = (boundary: DateRangeBoundary, value: string) => {
    lastRangeBoundaryRef.current = boundary;

    if (boundary === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleDateRangeCommit = (boundary: DateRangeBoundary, value: string) => {
    const nextStartDate = boundary === 'start' ? value : startDate;
    const nextEndDate = boundary === 'end' ? value : endDate;

    lastRangeBoundaryRef.current = boundary;

    if (
      hasDateRangeLimit &&
      activeDateRangeLimitDays &&
      isDateRangeOverLimit(nextStartDate, nextEndDate, activeDateRangeLimitDays)
    ) {
      openDateRangeLimitWarning(boundary, nextStartDate, nextEndDate, activeDateRangeLimitDays);
    }
  };

  const confirmDurationLimitWarning = () => {
    if (!durationLimitWarning) {
      return;
    }

    setStartDate(durationLimitWarning.adjustedStartDate);
    setEndDate(durationLimitWarning.adjustedEndDate);
    setDurationLimitWarning(null);
  };

  const handleSubmit = () => {
    if (hasDateRangeLimit && activeDateRangeLimitDays && isDateRangeOverLimit(startDate, endDate, activeDateRangeLimitDays)) {
      openDateRangeLimitWarning(lastRangeBoundaryRef.current, startDate, endDate, activeDateRangeLimitDays);
      return;
    }

    onSearch?.(createCriteria(selectedMode));
  };

  const handleWeekNavigation = (direction: -1 | 1) => {
    const weekStart = parseDateValue(selectedWeekRange.startDate);

    if (!weekStart) {
      return;
    }

    const shiftedWeekDate = formatDateValue(addDays(weekStart, direction * 7));
    const shiftedWeekRange = getWeekRange(shiftedWeekDate);
    const nextWeekRange = shiftedWeekRange.startDate > currentWeekRange.startDate ? currentWeekRange : shiftedWeekRange;
    const nextValues: SearchConditionValues = {
      date: nextWeekRange.startDate,
      startDate: nextWeekRange.startDate,
      endDate: nextWeekRange.endDate,
      year: nextWeekRange.startDate.slice(0, 4),
      month: nextWeekRange.startDate.slice(0, 7)
    };

    setDate(nextValues.date);
    setStartDate(nextValues.startDate);
    setEndDate(nextValues.endDate);
    setYear(nextValues.year);
    setMonth(nextValues.month);
    onSearch?.(toCriteria(selectedMode, inputType, nextValues));
  };

  return (
    <>
      <form
        className={`search-condition-bar search-condition-bar--${align} ${className}`.trim()}
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <div className="search-condition-bar__modes" role="radiogroup" aria-label="조회 조건">
          {normalizedModes.map((mode) => {
            const selected = selectedMode === mode.value;
            const modeInputType = getInputType(mode.value, mode as SearchConditionOption<string>);

            return (
              <button
                key={mode.value}
                type="button"
                className={`search-condition-bar__mode ${selected ? 'is-active' : ''}`.trim()}
                aria-pressed={selected}
                onClick={() => handleModeClick(mode.value, modeInputType)}
              >
                <span className="search-condition-bar__check" aria-hidden="true">
                  ✓
                </span>
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        <div className="search-condition-bar__controls">
          {inputType === 'year' && (
            <label className="search-condition-bar__date search-condition-bar__date--year">
              <span className="sr-only">조회 연도</span>
              <input
                aria-label="조회 연도"
                type="number"
                min="2000"
                max="2099"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
            </label>
          )}

          {inputType === 'month' && (
            <label className="search-condition-bar__date search-condition-bar__date--month">
              <span className="sr-only">조회 월</span>
              <CalendarInput ariaLabel="조회 월" type="month" value={month} onChange={setMonth} />
            </label>
          )}

          {inputType === 'date' && (
            <label className="search-condition-bar__date">
              <span className="sr-only">조회 일자</span>
              <CalendarInput ariaLabel="조회 일자" type="date" value={date} onChange={setDate} />
            </label>
          )}

          {inputType === 'dateRange' && (
            <>
              {isWeekNavigationMode && (
                <button
                  type="button"
                  className="search-condition-bar__week-nav"
                  aria-label="Previous week"
                  onClick={() => handleWeekNavigation(-1)}
                >
                  <span aria-hidden="true" className="search-condition-bar__week-nav-icon search-condition-bar__week-nav-icon--prev" />
                </button>
              )}
              <label className="search-condition-bar__date">
                <span className="sr-only">{startDateLabel}</span>
                <CalendarInput
                  ariaLabel={startDateLabel}
                  type="date"
                  value={startDate}
                  onChange={(value) => handleDateRangeChange('start', value)}
                  onCommit={(value) => handleDateRangeCommit('start', value)}
                />
              </label>
              <span className="search-condition-bar__dash">~</span>
              <label className="search-condition-bar__date">
                <span className="sr-only">{endDateLabel}</span>
                <CalendarInput
                  ariaLabel={endDateLabel}
                  type="date"
                  value={endDate}
                  onChange={(value) => handleDateRangeChange('end', value)}
                  onCommit={(value) => handleDateRangeCommit('end', value)}
                />
              </label>
              {isWeekNavigationMode && (
                <button
                  type="button"
                  className="search-condition-bar__week-nav"
                  aria-label="Next week"
                  disabled={!canGoNextWeek}
                  onClick={() => handleWeekNavigation(1)}
                >
                  <span aria-hidden="true" className="search-condition-bar__week-nav-icon search-condition-bar__week-nav-icon--next" />
                </button>
              )}
            </>
          )}

          <ActionButton type="submit" variant="primary" className="search-condition-bar__button">
            조회
          </ActionButton>
        </div>
      </form>

      <ConfirmActionModal
        open={Boolean(durationLimitWarning)}
        tone="warning"
        title="조회 기간 확인"
        description={
          durationLimitWarning
            ? `조회 기간은 최대 ${durationLimitWarning.limitDays}일까지만 선택할 수 있습니다.\n요청 기간 ${durationLimitWarning.requestedStartDate} ~ ${durationLimitWarning.requestedEndDate}를 ${durationLimitWarning.adjustedStartDate} ~ ${durationLimitWarning.adjustedEndDate}로 변경합니다.`
            : ''
        }
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={confirmDurationLimitWarning}
        onCancel={() => setDurationLimitWarning(null)}
      />
    </>
  );
}
