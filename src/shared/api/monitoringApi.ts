import { apiClient } from './apiClient';
import type { ApiRecord, ApiScalar } from './apiDataUtils';

export type MonitoringResource = 'grid' | 'ess' | 'pcs' | 'battery' | 'diesel1' | 'diesel2' | 'ac';
export type MonitoringDomain = 'base-total' | 'base-plant' | 'assist' | 'standby' | 'dispatch';
export type ReportPeriodResource = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReportResource = MonitoringResource | ReportPeriodResource;

export type ApiPageResponse<T> = {
  contents?: T[];
  totalCount?: number;
  page?: number;
  size?: number;
  totalPage?: number;
};

export type MonitoringSearchRequest = {
  operYmd?: string;
  operTime?: string;
  searchDateType?: 'YEAR' | 'MONTH' | 'PERIOD';
  startDate?: string;
  endDate?: string;
  reportType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  periodType?: 'YEAR' | 'MONTH' | 'PERIOD';
  outputUnit?: 'HOUR' | 'DAY' | 'MONTH';
  page?: number;
  size?: number;
};

export type ReportSearchRequest = MonitoringSearchRequest & {
  operYmd?: string;
  baseYear?: string;
  baseMonth?: string;
  baseWeek?: string;
};

export type MonitoringChartDto = {
  baseLabel?: ApiScalar;
  barValue?: ApiScalar;
  barName?: ApiScalar;
  barValue1?: ApiScalar;
  barValue2?: ApiScalar;
  labelTime?: ApiScalar;
  lineName1?: ApiScalar;
  lineName2?: ApiScalar;
  lineValue1?: ApiScalar;
  lineValue2?: ApiScalar;
  lineValue3?: ApiScalar;
  operTime?: ApiScalar;
  operYmd?: ApiScalar;
  outputUnit?: ApiScalar;
  targetId?: ApiScalar;
  targetName?: ApiScalar;
};

export type MonitoringLatestDto = {
  operTime?: ApiScalar;
  operYmd?: ApiScalar;
  ratio1?: ApiScalar;
  ratio2?: ApiScalar;
  remark?: ApiScalar;
  value1?: ApiScalar;
  value2?: ApiScalar;
  value3?: ApiScalar;
};

export type MonitoringTableDto = {
  baseLabel?: ApiScalar;
  chargeKwh?: ApiScalar;
  current?: ApiScalar;
  detailYn?: ApiScalar;
  dischargeKwh?: ApiScalar;
  frequency?: ApiScalar;
  oilPress?: ApiScalar;
  operTime?: ApiScalar;
  operYmd?: ApiScalar;
  pf?: ApiScalar;
  powerKwh?: ApiScalar;
  rpm?: ApiScalar;
  rowNo?: ApiScalar;
  soc?: ApiScalar;
  soh?: ApiScalar;
  tankLevel?: ApiScalar;
  targetId?: ApiScalar;
  targetName?: ApiScalar;
  temperature?: ApiScalar;
  value1?: ApiScalar;
  value2?: ApiScalar;
  value3?: ApiScalar;
  value4?: ApiScalar;
  voltage?: ApiScalar;
};

export type MonitoringTargetDto = {
  targetId?: ApiScalar;
  targetName?: ApiScalar;
};

export type MonitoringDetailDto = {
  detailText1?: ApiScalar;
  detailText2?: ApiScalar;
  detailText3?: ApiScalar;
  detailValue1?: ApiScalar;
  detailValue2?: ApiScalar;
  detailValue3?: ApiScalar;
  detailValue4?: ApiScalar;
  detailValue5?: ApiScalar;
  operTime?: ApiScalar;
  operYmd?: ApiScalar;
  targetId?: ApiScalar;
  targetName?: ApiScalar;
};

export type MonitoringResponseDto = {
  chartList?: MonitoringChartDto[];
  latest?: MonitoringLatestDto;
  outputUnit?: ApiScalar;
  pageTitle?: ApiScalar;
  powerFlowType?: ApiScalar;
  summary?: ApiRecord;
  tableList?: MonitoringTableDto[];
  targetList?: MonitoringTargetDto[];
};

const MONITORING_DOMAIN_PATHS: Record<MonitoringDomain, string> = {
  'base-total': '/monitoring/baseline',
  'base-plant': '/monitoring/baseline',
  assist: '/monitoring/peak-respond',
  standby: '/monitoring/reserved',
  dispatch: '/monitoring/power-supply'
};

const MONITORING_DETAIL_DOMAIN_PATHS: Record<MonitoringDomain, string> = {
  'base-total': '/monitoring/baseline/detail',
  'base-plant': '/monitoring/baseline/detail',
  assist: '/monitoring/peak-respond/detail',
  standby: '/monitoring/reserved/detail',
  dispatch: '/monitoring/power-supply/detail'
};

const LEGACY_RESOURCE_DOMAIN: Record<MonitoringResource, MonitoringDomain> = {
  grid: 'base-total',
  ess: 'assist',
  diesel1: 'assist',
  diesel2: 'assist',
  pcs: 'standby',
  battery: 'standby',
  ac: 'dispatch'
};

const TREND_RESOURCE_PATHS: Record<MonitoringResource, string> = {
  grid: '/trend/baseline',
  ess: '/trend/peak-respond',
  pcs: '/trend/reserved',
  battery: '/trend/reserved',
  diesel1: '/trend/peak-respond',
  diesel2: '/trend/peak-respond',
  ac: '/trend/power-supply'
};

const RESOURCE_MATCHERS: Record<MonitoringResource, string[]> = {
  grid: ['grid', 'base', 'total', 'ivt', 'inverter'],
  ess: ['ess', 'battery', 'bat', 'batt'],
  pcs: ['pcs'],
  battery: ['battery', 'bat', 'batt'],
  diesel1: ['diesel1', 'diesel #1', 'diesel 1', 'dsl1', 'dsl #1'],
  diesel2: ['diesel2', 'diesel #2', 'diesel 2', 'dsl2', 'dsl #2'],
  ac: ['ac', 'a/c', 'air']
};

function toQueryString(params?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

function getTrendSearchDateType(params?: MonitoringSearchRequest): 'YEAR' | 'MONTH' | 'PERIOD' {
  if (params?.searchDateType) {
    return params.searchDateType;
  }

  if (params?.periodType) {
    return params.periodType;
  }

  if (params?.reportType === 'YEARLY') return 'YEAR';
  if (params?.reportType === 'MONTHLY') return 'MONTH';

  return 'PERIOD';
}

function toMonitoringQuery(params?: MonitoringSearchRequest) {
  return {
    operYmd: params?.operYmd ?? params?.startDate,
    operTime: params?.operTime
  };
}

function toTrendQuery(params?: MonitoringSearchRequest) {
  return {
    searchDateType: getTrendSearchDateType(params),
    startDate: params?.startDate,
    endDate: params?.endDate
  };
}

function normalizeBaseMonth(value?: string) {
  if (!value) {
    return undefined;
  }

  const month = value.includes('-') ? value.split('-').at(-1) : value;

  return month?.padStart(2, '0');
}

function getIsoWeek(dateText?: string) {
  if (!dateText) {
    return undefined;
  }

  const date = new Date(`${dateText}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return String(week).padStart(2, '0');
}

function toReportQuery(period: ReportPeriodResource, params?: ReportSearchRequest) {
  if (!params) {
    return undefined;
  }

  if (period === 'daily') {
    return {
      operYmd: params.operYmd ?? params.startDate
    };
  }

  if (period === 'weekly') {
    return {
      baseYear: params.baseYear ?? params.startDate?.slice(0, 4),
      baseWeek: params.baseWeek ?? getIsoWeek(params.startDate)
    };
  }

  if (period === 'monthly') {
    return {
      baseYear: params.baseYear ?? params.baseMonth?.slice(0, 4),
      baseMonth: normalizeBaseMonth(params.baseMonth)
    };
  }

  return {
    baseYear: params.baseYear ?? params.startDate?.slice(0, 4)
  };
}

function getReportPeriod(resource: ReportResource, params?: ReportSearchRequest): ReportPeriodResource {
  if (resource === 'daily' || resource === 'weekly' || resource === 'monthly' || resource === 'yearly') {
    return resource;
  }

  if (params?.reportType === 'WEEKLY') return 'weekly';
  if (params?.reportType === 'MONTHLY') return 'monthly';
  if (params?.reportType === 'YEARLY') return 'yearly';

  return 'daily';
}

export function getPageContents<T>(response: ApiPageResponse<T> | T[] | undefined) {
  if (Array.isArray(response)) {
    return response;
  }

  return response?.contents ?? [];
}

export function getMonitoringDomainPath(domain: MonitoringDomain) {
  return MONITORING_DOMAIN_PATHS[domain];
}

function normalizeToken(value: ApiScalar) {
  return String(value ?? '').trim().toLowerCase();
}

function matchesResource(row: Pick<MonitoringChartDto, 'targetId' | 'targetName'>, resource: MonitoringResource) {
  const label = `${normalizeToken(row.targetId)} ${normalizeToken(row.targetName)}`;

  if (!label.trim()) {
    return true;
  }

  return RESOURCE_MATCHERS[resource].some((keyword) => label.includes(keyword));
}

function firstValue(...values: ApiScalar[]): ApiScalar {
  return values.find((value) => value !== null && value !== undefined && String(value).trim() !== '');
}

function getSplitValue(value: ApiScalar, divisor: number) {
  const numericValue = Number(String(value ?? '').replace(/,/g, ''));

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return Number((numericValue / divisor).toFixed(2));
}

function readLatestValue(latest: MonitoringLatestDto | undefined, index: 1 | 2 | 3) {
  if (index === 1) return latest?.value1;
  if (index === 2) return latest?.value2;

  return latest?.value3;
}

function createCommonRecord(row: MonitoringChartDto | MonitoringTableDto | MonitoringLatestDto, latest?: MonitoringLatestDto): ApiRecord {
  const chartRow = row as MonitoringChartDto;
  const tableRow = row as MonitoringTableDto;
  const activeValue = firstValue(
    chartRow.barValue1,
    chartRow.barValue,
    tableRow.value1,
    tableRow.powerKwh,
    tableRow.chargeKwh,
    readLatestValue(latest, 1),
    readLatestValue(row as MonitoringLatestDto, 1)
  );
  const reactiveValue = firstValue(
    chartRow.lineValue1,
    tableRow.value2,
    tableRow.dischargeKwh,
    tableRow.current,
    readLatestValue(latest, 2),
    readLatestValue(row as MonitoringLatestDto, 2)
  );
  const apparentValue = firstValue(
    chartRow.barValue2,
    chartRow.lineValue2,
    tableRow.value3,
    tableRow.voltage,
    readLatestValue(latest, 3),
    readLatestValue(row as MonitoringLatestDto, 3)
  );
  const pfValue = firstValue(chartRow.lineValue2, tableRow.pf, chartRow.lineValue1, latest?.ratio1, (row as MonitoringLatestDto).ratio1);
  const ratioValue = firstValue(chartRow.lineValue3, tableRow.soc, tableRow.soh, tableRow.temperature, latest?.ratio2, (row as MonitoringLatestDto).ratio2, 100);
  const baseLabel = firstValue(chartRow.baseLabel, tableRow.baseLabel);

  return {
    esmtOperYmd: firstValue(chartRow.operYmd, tableRow.operYmd, baseLabel, (row as MonitoringLatestDto).operYmd, latest?.operYmd),
    esmtOperTime: firstValue(chartRow.labelTime, chartRow.operTime, tableRow.operTime, baseLabel, (row as MonitoringLatestDto).operTime, latest?.operTime),
    baseDate: firstValue(chartRow.operYmd, tableRow.operYmd, baseLabel, (row as MonitoringLatestDto).operYmd, latest?.operYmd),
    label: baseLabel,
    rowNo: tableRow.rowNo,
    targetId: firstValue(chartRow.targetId, tableRow.targetId),
    targetName: firstValue(chartRow.targetName, tableRow.targetName),
    activeValue,
    reactiveValue,
    apparentValue,
    pfValue,
    ratioValue,
    maxBasePower: activeValue,
    minBasePower: activeValue,
    avgBasePower: activeValue,
    maxAssistPower: reactiveValue,
    avgAssistPower: reactiveValue,
    maxStandbyPower: apparentValue,
    avgStandbyPower: apparentValue,
    maxDispatchPower: firstValue(apparentValue, reactiveValue),
    minDispatchPower: firstValue(apparentValue, reactiveValue),
    avgDispatchPower: firstValue(apparentValue, reactiveValue),
    avgSoc: firstValue(chartRow.lineValue1, tableRow.soc, ratioValue),
    remark: firstValue((row as MonitoringLatestDto).remark, latest?.remark)
  };
}

function withBaseFields(record: ApiRecord): ApiRecord {
  const activeValue = record.activeValue;
  const reactiveValue = record.reactiveValue;
  const apparentValue = record.apparentValue;
  const pfValue = record.pfValue;

  return {
    ...record,
    baAtpTot: activeValue,
    baRtpTot: reactiveValue,
    baArpTot: apparentValue,
    baPfTot: pfValue,
    baAtpDayAccm: activeValue,
    baAtpWeekAccm: activeValue,
    baAtpMonAccm: activeValue,
    baAtpTotAccm: activeValue,
    baRtpDayAccm: reactiveValue,
    baRtpWeekAccm: reactiveValue,
    baRtpMonAccm: reactiveValue,
    baRtpTotAccm: reactiveValue,
    baAtpL1: getSplitValue(activeValue, 3),
    baAtpL2: getSplitValue(activeValue, 3),
    baAtpL3: getSplitValue(activeValue, 3),
    baPtpvL12: reactiveValue,
    baPtpvL23: reactiveValue,
    baPtpvL31: reactiveValue,
    baPtpvL1n: reactiveValue,
    baPtpvL2n: reactiveValue,
    baPtptL3n: reactiveValue,
    baPfrL1: pfValue,
    baPfrL2: pfValue,
    baPfrL3: pfValue,
    baPaL1: getSplitValue(apparentValue, 3),
    baPaL2: getSplitValue(apparentValue, 3),
    baPaL3: getSplitValue(apparentValue, 3),
    lgldGbcd: record.ratioValue
  };
}

function withEssFields(record: ApiRecord): ApiRecord {
  const activeValue = record.activeValue;
  const reactiveValue = record.reactiveValue;
  const apparentValue = record.apparentValue;
  const pfValue = record.pfValue;

  return {
    ...record,
    essAtpTot: activeValue,
    essRtpTot: reactiveValue,
    essArpTot: apparentValue,
    essPfTot: pfValue,
    essAtpDayAccm: activeValue,
    essAtpTotAccm: activeValue,
    essAtpL1: getSplitValue(activeValue, 3),
    essAtpL2: getSplitValue(activeValue, 3),
    essAtpL3: getSplitValue(activeValue, 3),
    essRtpL1: getSplitValue(reactiveValue, 3),
    essRtpL2: getSplitValue(reactiveValue, 3),
    essRtpL3: getSplitValue(reactiveValue, 3),
    essPtpvL12: reactiveValue,
    essPtpvL23: reactiveValue,
    essPtpvL31: reactiveValue,
    essPfrL1: pfValue,
    essPfrL2: pfValue,
    essPfrL3: pfValue,
    essPaL1: getSplitValue(apparentValue, 3),
    essPaL2: getSplitValue(apparentValue, 3),
    essPaL3: getSplitValue(apparentValue, 3),
    essPlntSoc: record.ratioValue
  };
}

function withPcsFields(record: ApiRecord): ApiRecord {
  const activeValue = record.activeValue;
  const reactiveValue = record.reactiveValue;
  const apparentValue = record.apparentValue;
  const pfValue = record.pfValue;

  return {
    ...record,
    pcsOperStatus: firstValue(record.remark, '01'),
    pcsAtpTot: activeValue,
    pcsRtpTot: reactiveValue,
    pcsArpTot: apparentValue,
    pcsPfTot: pfValue,
    pcsAtpDayAccm: activeValue,
    pcsAtpMonAccm: activeValue,
    pcsDcP: reactiveValue,
    pcsDcA: apparentValue,
    pcsDcV: activeValue,
    pcsFr: pfValue,
    pcsPaL1: getSplitValue(apparentValue, 3),
    pcsPaL2: getSplitValue(apparentValue, 3),
    pcsPaL3: getSplitValue(apparentValue, 3),
    pcsPtpvL12: activeValue,
    pcsPtpvL23: activeValue,
    pcsPtpvL31: activeValue,
    pcsMdlTemp: record.ratioValue,
    pcsAbntTemp: record.ratioValue,
    pcsCbntTemp: record.ratioValue
  };
}

function withBatteryFields(record: ApiRecord): ApiRecord {
  const activeValue = record.activeValue;
  const reactiveValue = record.reactiveValue;
  const apparentValue = record.apparentValue;

  return {
    ...record,
    batAvgSoc: activeValue,
    batAvgSoh: reactiveValue,
    batAvgDcv: activeValue,
    batAvgDca: reactiveValue,
    batAvgRakv: activeValue,
    batMaxRakv: activeValue,
    batMinRakv: getSplitValue(activeValue, 2),
    batAvgRaka: reactiveValue,
    batMaxRaka: reactiveValue,
    batMinRaka: getSplitValue(reactiveValue, 2),
    batAvgCelv: apparentValue,
    batMaxCelv: apparentValue,
    batMinCelv: getSplitValue(apparentValue, 2),
    batAvgPaktmp: record.ratioValue,
    batMaxPaktmp: record.ratioValue,
    batMinPaktmp: getSplitValue(record.ratioValue, 2),
    maxRakvRakno: record.targetName,
    minRakvRakno: record.targetName,
    maxRakaRakno: record.targetName,
    minRakaRakno: record.targetName,
    maxCelvRakno: record.targetName,
    minCelvRakno: record.targetName,
    maxPaktmpRakno: record.targetName
  };
}

function withDieselFields(record: ApiRecord): ApiRecord {
  const activeValue = record.activeValue;
  const reactiveValue = record.reactiveValue;
  const apparentValue = record.apparentValue;
  const pfValue = record.pfValue;

  return {
    ...record,
    dslAtpTot: activeValue,
    dslRtpTot: reactiveValue,
    dslArpTot: apparentValue,
    dslPfTot: pfValue,
    dslAtpDayAccm: activeValue,
    dslAtpTotAccm: activeValue,
    dslAtpL1: getSplitValue(activeValue, 3),
    dslAtpL2: getSplitValue(activeValue, 3),
    dslAtpL3: getSplitValue(activeValue, 3),
    dslPtpvL12: activeValue,
    dslPtpvL23: activeValue,
    dslPtpvL31: activeValue,
    dslPfrL1: pfValue,
    dslPfrL2: pfValue,
    dslPfrL3: pfValue,
    dslPaL1: getSplitValue(apparentValue, 3),
    dslPaL2: getSplitValue(apparentValue, 3),
    dslPaL3: getSplitValue(apparentValue, 3),
    dslEgnRpm: reactiveValue,
    dslClntTmp: record.ratioValue,
    dslOilPrsr: pfValue,
    dslOilTmp: record.ratioValue,
    dslFuelLvl: record.ratioValue
  };
}

function withAcFields(record: ApiRecord): ApiRecord {
  return {
    ...record,
    acOperStuscd: firstValue(record.remark, '01'),
    acSuplyAirtmp: record.activeValue,
    acRtnAirtmp: record.reactiveValue,
    acRtnAirhum: record.apparentValue
  };
}

function toLegacyRecord(row: MonitoringChartDto | MonitoringTableDto | MonitoringLatestDto, resource: MonitoringResource, latest?: MonitoringLatestDto): ApiRecord {
  const original = row as ApiRecord;
  const record = createCommonRecord(row, latest);
  const resourceRecord: ApiRecord = {
    ...record,
    ...original
  };

  if (resource === 'grid') {
    resourceRecord.activeValue = firstValue(resourceRecord.activeValue, original.powerKwh, original.barValue, original.baAtpTot, original.totalBasePower, original.baseAtpTot);
    resourceRecord.reactiveValue = firstValue(resourceRecord.reactiveValue, original.current, original.lineValue1, original.baRtpTot);
    resourceRecord.apparentValue = firstValue(resourceRecord.apparentValue, original.voltage, original.lineValue2, original.baArpTot);
    resourceRecord.pfValue = firstValue(resourceRecord.pfValue, original.pf, original.baPfTot);
    resourceRecord.ratioValue = firstValue(resourceRecord.ratioValue, original.lgldGbcd);
    return { ...withBaseFields(resourceRecord), ...original };
  }

  if (resource === 'ess') {
    resourceRecord.activeValue = firstValue(resourceRecord.activeValue, original.powerKwh, original.barValue, original.essAtpTot, original.totalAssistPower, original.assistAtpTot);
    resourceRecord.reactiveValue = firstValue(resourceRecord.reactiveValue, original.current, original.lineValue1, original.essRtpTot);
    resourceRecord.apparentValue = firstValue(resourceRecord.apparentValue, original.voltage, original.lineValue2, original.essArpTot);
    resourceRecord.pfValue = firstValue(resourceRecord.pfValue, original.pf, original.essPfTot);
    resourceRecord.ratioValue = firstValue(resourceRecord.ratioValue, original.soc, original.essPlntSoc, original.besSocRatio, original.avgSoc);
    return { ...withEssFields(resourceRecord), ...original };
  }

  if (resource === 'pcs') {
    resourceRecord.activeValue = firstValue(resourceRecord.activeValue, original.chargeKwh, original.powerKwh, original.barValue, original.pcsAtpTot, original.totalDispatchPower, original.dispatchAtpTot);
    resourceRecord.reactiveValue = firstValue(resourceRecord.reactiveValue, original.dischargeKwh, original.lineValue1, original.pcsRtpTot, original.pcsDcP);
    resourceRecord.apparentValue = firstValue(resourceRecord.apparentValue, original.voltage, original.lineValue2, original.pcsArpTot, original.pcsDcA);
    resourceRecord.pfValue = firstValue(resourceRecord.pfValue, original.frequency, original.pf, original.pcsPfTot, original.pcsFr);
    resourceRecord.ratioValue = firstValue(resourceRecord.ratioValue, original.current, original.pcsDcV);
    return { ...withPcsFields(resourceRecord), ...original };
  }

  if (resource === 'battery') {
    resourceRecord.activeValue = firstValue(resourceRecord.activeValue, original.soc, original.batterySoc, original.avgSoc, original.besSocRatio);
    resourceRecord.reactiveValue = firstValue(resourceRecord.reactiveValue, original.soh, original.avgSoh);
    resourceRecord.apparentValue = firstValue(resourceRecord.apparentValue, original.voltage, original.pcsDcV);
    resourceRecord.ratioValue = firstValue(resourceRecord.ratioValue, original.temperature, original.avgTemperature);
    return { ...withBatteryFields(resourceRecord), ...original };
  }

  if (resource === 'diesel1' || resource === 'diesel2') {
    resourceRecord.activeValue = firstValue(resourceRecord.activeValue, original.powerKwh, original.barValue, original.dslAtpTot, original.totalStandbyPower, original.standbyAtpTot);
    resourceRecord.reactiveValue = firstValue(resourceRecord.reactiveValue, original.current, original.lineValue1, original.dslRtpTot);
    resourceRecord.apparentValue = firstValue(resourceRecord.apparentValue, original.voltage, original.lineValue2, original.dslArpTot);
    resourceRecord.pfValue = firstValue(resourceRecord.pfValue, original.pf, original.dslPfTot);
    resourceRecord.ratioValue = firstValue(resourceRecord.ratioValue, original.tankLevel, original.dslFuelLvl, original.avgTankLevel);
    return { ...withDieselFields(resourceRecord), ...original };
  }

  resourceRecord.activeValue = firstValue(resourceRecord.activeValue, original.temperature, original.acSuplyAirtmp, original.pcsDcP);
  resourceRecord.reactiveValue = firstValue(resourceRecord.reactiveValue, original.current, original.acRtnAirtmp, original.pcsDcA);
  resourceRecord.apparentValue = firstValue(resourceRecord.apparentValue, original.voltage, original.acRtnAirhum, original.pcsDcV);
  return { ...withAcFields(resourceRecord), ...original };
}

function getMonitoringRows(response: MonitoringResponseDto | undefined, resource: MonitoringResource) {
  const chartRows = response?.chartList ?? [];
  const tableRows = response?.tableList ?? [];
  const rowCount = Math.max(chartRows.length, tableRows.length);
  const sourceRows =
    rowCount > 0
      ? Array.from({ length: rowCount }, (_, index) => ({
          ...(tableRows[index] ?? {}),
          ...(chartRows[index] ?? {})
        }))
      : [];
  const matchedRows = sourceRows.filter((row) => matchesResource(row, resource));
  const rows = matchedRows.length > 0 ? matchedRows : sourceRows;

  return rows.map((row) => toLegacyRecord(row, resource, response?.latest));
}

function getMonitoringLatest(response: MonitoringResponseDto | undefined, resource: MonitoringResource) {
  const latestRow = response?.latest;

  if (latestRow) {
    return toLegacyRecord(latestRow, resource, latestRow);
  }

  return getMonitoringRows(response, resource).at(-1) ?? {};
}

export function toLegacyMonitoringRows(response: MonitoringResponseDto | undefined, resource: MonitoringResource) {
  return getMonitoringRows(response, resource);
}

export function toLegacyMonitoringLatest(response: MonitoringResponseDto | undefined, resource: MonitoringResource) {
  return getMonitoringLatest(response, resource);
}

export const monitoringApi = {
  getData<T = MonitoringResponseDto>(domain: MonitoringDomain, params?: MonitoringSearchRequest) {
    return apiClient<T>(`${getMonitoringDomainPath(domain)}${toQueryString(toMonitoringQuery(params))}`, { operationName: '모니터링 현재값 조회' });
  },
  async getDetail<T = MonitoringDetailDto[]>(domain: MonitoringDomain, targetIdOrParams?: string | MonitoringSearchRequest) {
    const params = typeof targetIdOrParams === 'string' ? undefined : targetIdOrParams;
    const response = await apiClient<MonitoringResponseDto>(`${MONITORING_DETAIL_DOMAIN_PATHS[domain]}${toQueryString(toMonitoringQuery(params))}`, {
      operationName: '모니터링 상세 조회'
    });

    return toLegacyMonitoringRows(response, 'grid') as T;
  },
  getExcel(domain: MonitoringDomain) {
    return apiClient<Blob>(`/excel/${domain}`, { operationName: '엑셀 다운로드' });
  },
  getDashboardStatus<T extends ApiRecord>(mode: 'total' | 'plant' = 'total', params?: MonitoringSearchRequest) {
    const path = mode === 'plant' ? '/dashboard/individual' : '/dashboard/integrated';

    return apiClient<T>(`${path}${toQueryString(toMonitoringQuery(params))}`, { operationName: '대시보드 조회' });
  },
  async getDashboard<T extends ApiRecord>() {
    const response = await this.getDashboardStatus<ApiRecord>('total');

    return toLegacyMonitoringLatest({ latest: response as MonitoringLatestDto }, 'grid') as T;
  },
  async getLatest<T extends ApiRecord>(resource: MonitoringResource) {
    const response = await this.getData<MonitoringResponseDto>(LEGACY_RESOURCE_DOMAIN[resource]);

    return toLegacyMonitoringLatest(response, resource) as T;
  },
  async getStatus<T extends ApiRecord>(resource: MonitoringResource, params?: MonitoringSearchRequest) {
    const response = await this.getData<MonitoringResponseDto>(LEGACY_RESOURCE_DOMAIN[resource], params);

    return toLegacyMonitoringRows(response, resource) as T[];
  },
  async getHistory<T extends ApiRecord>(resource: MonitoringResource, params?: MonitoringSearchRequest) {
    const response = await apiClient<MonitoringResponseDto>(`${TREND_RESOURCE_PATHS[resource]}${toQueryString(toTrendQuery(params))}`, {
      operationName: '이력 조회'
    });

    return toLegacyMonitoringRows(response, resource) as T[];
  },
  async getReport<T extends ApiRecord>(resource: ReportResource, params?: ReportSearchRequest) {
    const period = getReportPeriod(resource, params);
    const response = await apiClient<MonitoringResponseDto>(`/report/${period}${toQueryString(toReportQuery(period, params))}`, { operationName: '보고서 조회' });

    return toLegacyMonitoringRows(response, 'grid') as T[];
  }
};
