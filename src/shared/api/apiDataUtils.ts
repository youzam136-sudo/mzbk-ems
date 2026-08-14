import type { TableRow } from '../types/table';

export type ApiScalar = string | number | null | undefined;
export type ApiRecord = Record<string, ApiScalar>;

export const EMPTY_API_VALUE = '-';

export function getRawValue(value: ApiScalar) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

export function toNumber(value: ApiScalar) {
  const rawValue = getRawValue(value).replace(/,/g, '');

  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getFractionDigits(value: ApiScalar, fallbackDigits: number) {
  const rawValue = getRawValue(value);
  const fractionPart = rawValue.includes('.') ? rawValue.split('.')[1] : '';

  return fractionPart ? Math.min(fractionPart.length, 2) : fallbackDigits;
}

export function formatApiNumber(value: ApiScalar, fallbackDigits = 1) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return EMPTY_API_VALUE;
  }

  const fractionDigits = getFractionDigits(value, fallbackDigits);

  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(numericValue);
}

export function formatApiUnit(value: ApiScalar, unit: string, fallbackDigits = 1) {
  const formattedValue = formatApiNumber(value, fallbackDigits);

  return formattedValue === EMPTY_API_VALUE ? formattedValue : `${formattedValue}${unit}`;
}

export function formatApiPercent(value: ApiScalar) {
  return formatApiNumber(value);
}

export function formatApiPowerFactor(value: ApiScalar) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return EMPTY_API_VALUE;
  }

  return numericValue > 1 ? (numericValue / 100).toFixed(2) : numericValue.toFixed(2);
}

export function toChartNumber(value: ApiScalar) {
  return toNumber(value) ?? 0;
}

export function readApiField<T extends ApiRecord>(source: T | null | undefined, key: keyof T | string) {
  return source?.[key as keyof T];
}

export function getTimeLabel(row: ApiRecord) {
  const time = getRawValue(row.esmtOperTime);

  if (time.length >= 5) {
    return time.slice(0, 5);
  }

  return time || EMPTY_API_VALUE;
}

export function getDateLabel(row: ApiRecord) {
  return getRawValue(row.baseDate) || getRawValue(row.esmtOperYmd) || EMPTY_API_VALUE;
}

export function sortByDateTime<T extends ApiRecord>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const aKey = `${getRawValue(a.esmtOperYmd)} ${getRawValue(a.esmtOperTime)}`;
    const bKey = `${getRawValue(b.esmtOperYmd)} ${getRawValue(b.esmtOperTime)}`;

    return aKey.localeCompare(bKey);
  });
}

export function createBlankRows(rowCount: number, columnCount: number, firstColumnValue = EMPTY_API_VALUE): TableRow[] {
  return Array.from({ length: rowCount }, (_, index) => [
    index === 0 ? firstColumnValue : firstColumnValue,
    ...Array.from({ length: Math.max(columnCount - 1, 0) }, () => EMPTY_API_VALUE)
  ]);
}

export function sumApiNumbers(values: ApiScalar[]) {
  return values.reduce<number>((sum, value) => sum + (toNumber(value) ?? 0), 0);
}

export function formatShare(value: ApiScalar, total: number) {
  const numericValue = toNumber(value) ?? 0;

  if (!total) {
    return '0.0';
  }

  return ((numericValue / total) * 100).toFixed(1);
}
