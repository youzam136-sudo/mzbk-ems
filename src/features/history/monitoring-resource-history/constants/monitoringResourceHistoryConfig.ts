import type { MonitoringResource } from '../../../../shared/api/monitoringApi';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';

export type MonitoringHistoryMode = 'Year' | 'Month' | 'Duration';
export type MonitoringHistoryMetric = 'Max kWh' | 'Min kWh' | 'AVG kWh' | 'Max D kWh' | 'Min D kWh' | 'AVG D kWh';

type HistoryField = {
  label: string;
  key: string;
};

export type MonitoringResourceHistoryPageConfig = {
  title: string;
  resource: MonitoringResource;
  metrics: readonly MonitoringHistoryMetric[];
  tableTitle: string;
  excelFileName: string;
  minWidth: number;
  chartBarName: string;
  chartLineName: string;
  barField: string;
  lineField: string;
  fields: HistoryField[];
  defaultCriteria: SearchConditionCriteria<MonitoringHistoryMode>;
};

const defaultCriteria: SearchConditionCriteria<MonitoringHistoryMode> = {
  mode: 'Month',
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};

const baseMetrics: readonly MonitoringHistoryMetric[] = ['Max kWh', 'Min kWh', 'AVG kWh'];
const storageMetrics: readonly MonitoringHistoryMetric[] = ['Max kWh', 'Min kWh', 'AVG kWh', 'Max D kWh', 'Min D kWh', 'AVG D kWh'];

export const monitoringResourceHistoryPageConfigs: Record<string, MonitoringResourceHistoryPageConfig> = {
  '/history/grid': {
    title: 'GRID 이력',
    resource: 'grid',
    metrics: baseMetrics,
    tableTitle: 'GRID 이력',
    excelFileName: 'GRID_이력',
    minWidth: 1280,
    chartBarName: '유효전력',
    chartLineName: '무효전력',
    barField: 'baAtpTot',
    lineField: 'baRtpTot',
    fields: [
      { label: 'ACTIVE POWER', key: 'baAtpTot' },
      { label: 'REACTIVE POWER', key: 'baRtpTot' },
      { label: 'APPARENT POWER', key: 'baArpTot' },
      { label: 'PF', key: 'baPfTot' },
      { label: 'V L12', key: 'baPtpvL12' },
      { label: 'A L1', key: 'baPaL1' },
      { label: 'FR L1', key: 'baPfrL1' }
    ],
    defaultCriteria
  },
  '/history/ess': {
    title: 'ESS 이력',
    resource: 'ess',
    metrics: storageMetrics,
    tableTitle: 'ESS 이력',
    excelFileName: 'ESS_이력',
    minWidth: 1280,
    chartBarName: '충방전량',
    chartLineName: '무효전력',
    barField: 'essAtpTot',
    lineField: 'essRtpTot',
    fields: [
      { label: 'ACTIVE POWER', key: 'essAtpTot' },
      { label: 'REACTIVE POWER', key: 'essRtpTot' },
      { label: 'APPARENT POWER', key: 'essArpTot' },
      { label: 'PF', key: 'essPfTot' },
      { label: 'SOC', key: 'essPlntSoc' },
      { label: '방전량', key: 'besDhgCapa' },
      { label: '충전량', key: 'besChgCapa' }
    ],
    defaultCriteria
  },
  '/history/pcs': {
    title: 'PCS 이력',
    resource: 'pcs',
    metrics: storageMetrics,
    tableTitle: 'PCS 이력',
    excelFileName: 'PCS_이력',
    minWidth: 1380,
    chartBarName: '유효전력',
    chartLineName: '무효전력',
    barField: 'pcsAtpTot',
    lineField: 'pcsRtpTot',
    fields: [
      { label: 'ACTIVE POWER', key: 'pcsAtpTot' },
      { label: 'REACTIVE POWER', key: 'pcsRtpTot' },
      { label: 'APPARENT POWER', key: 'pcsArpTot' },
      { label: 'PF', key: 'pcsPfTot' },
      { label: 'DC P', key: 'pcsDcP' },
      { label: 'DC V', key: 'pcsDcV' },
      { label: 'DC A', key: 'pcsDcA' },
      { label: 'FR', key: 'pcsFr' }
    ],
    defaultCriteria
  },
  '/history/battery': {
    title: '배터리 이력',
    resource: 'battery',
    metrics: storageMetrics,
    tableTitle: '배터리 이력',
    excelFileName: '배터리_이력',
    minWidth: 1480,
    chartBarName: 'SOC',
    chartLineName: 'SOH',
    barField: 'batAvgSoc',
    lineField: 'batAvgSoh',
    fields: [
      { label: 'SOC', key: 'batAvgSoc' },
      { label: 'SOH', key: 'batAvgSoh' },
      { label: 'DC V', key: 'batAvgDcv' },
      { label: 'DC A', key: 'batAvgDca' },
      { label: 'RACK V MAX', key: 'batMaxRakv' },
      { label: 'RACK V AVG', key: 'batAvgRakv' },
      { label: 'RACK V MIN', key: 'batMinRakv' },
      { label: 'PACK TEMP MAX', key: 'batMaxPaktmp' },
      { label: 'PACK TEMP AVG', key: 'batAvgPaktmp' },
      { label: 'PACK TEMP MIN', key: 'batMinPaktmp' }
    ],
    defaultCriteria
  },
  '/history/diesel1': {
    title: '디젤1 이력',
    resource: 'diesel1',
    metrics: baseMetrics,
    tableTitle: '디젤1 이력',
    excelFileName: '디젤1_이력',
    minWidth: 1480,
    chartBarName: '유효전력',
    chartLineName: '무효전력',
    barField: 'dslAtpTot',
    lineField: 'dslRtpTot',
    fields: [
      { label: 'ACTIVE POWER', key: 'dslAtpTot' },
      { label: 'REACTIVE POWER', key: 'dslRtpTot' },
      { label: 'APPARENT POWER', key: 'dslArpTot' },
      { label: 'PF', key: 'dslPfTot' },
      { label: 'RPM', key: 'dslEgnRpm' },
      { label: 'FUEL', key: 'dslFuelLvl' },
      { label: 'COOL TMP', key: 'dslClntTmp' },
      { label: 'OIL TMP', key: 'dslOilTmp' },
      { label: 'OIL PRESS', key: 'dslOilPrsr' }
    ],
    defaultCriteria
  },
  '/history/diesel2': {
    title: '디젤2 이력',
    resource: 'diesel2',
    metrics: baseMetrics,
    tableTitle: '디젤2 이력',
    excelFileName: '디젤2_이력',
    minWidth: 1480,
    chartBarName: '유효전력',
    chartLineName: '무효전력',
    barField: 'dslAtpTot',
    lineField: 'dslRtpTot',
    fields: [
      { label: 'ACTIVE POWER', key: 'dslAtpTot' },
      { label: 'REACTIVE POWER', key: 'dslRtpTot' },
      { label: 'APPARENT POWER', key: 'dslArpTot' },
      { label: 'PF', key: 'dslPfTot' },
      { label: 'RPM', key: 'dslEgnRpm' },
      { label: 'FUEL', key: 'dslFuelLvl' },
      { label: 'COOL TMP', key: 'dslClntTmp' },
      { label: 'OIL TMP', key: 'dslOilTmp' },
      { label: 'OIL PRESS', key: 'dslOilPrsr' }
    ],
    defaultCriteria
  },
  '/history/ac': {
    title: '공조기 이력',
    resource: 'ac',
    metrics: baseMetrics,
    tableTitle: '공조기 이력',
    excelFileName: '공조기_이력',
    minWidth: 1280,
    chartBarName: '급기온도',
    chartLineName: '환기습도',
    barField: 'acSuplyAirtmp',
    lineField: 'acRtnAirhum',
    fields: [
      { label: '운전상태', key: 'acOperStuscd' },
      { label: '냉난방상태', key: 'acHeatStuscd' },
      { label: '급기온도', key: 'acSuplyAirtmp' },
      { label: '환기온도', key: 'acRtnAirtmp' },
      { label: '환기습도', key: 'acRtnAirhum' },
      { label: '응축기온도', key: 'acCndsrTmp' },
      { label: '증발기온도', key: 'acEvprtTmp' },
      { label: '가동시간', key: 'acRunTime' }
    ],
    defaultCriteria
  }
};

function createHistoryAliasConfig(basePath: string, title: string, tableTitle: string, excelFileName: string) {
  const baseConfig = monitoringResourceHistoryPageConfigs[basePath];

  return {
    ...baseConfig,
    title,
    tableTitle,
    excelFileName
  };
}

// API 메뉴 URL과 기존 이력 화면 config를 연결해 임시 중복 메뉴 없이 같은 화면 구조를 재사용한다.
monitoringResourceHistoryPageConfigs['/analysis/base/plant/history'] = createHistoryAliasConfig(
  '/history/grid',
  '기저전력 개별 운영이력',
  '기저전력 개별 운영이력',
  '기저전력_개별_운영이력'
);
monitoringResourceHistoryPageConfigs['/analysis/base/total/history'] = createHistoryAliasConfig(
  '/history/grid',
  '기저전력 통합 운영이력',
  '기저전력 통합 운영이력',
  '기저전력_통합_운영이력'
);
monitoringResourceHistoryPageConfigs['/analysis/assist/history'] = createHistoryAliasConfig(
  '/history/ess',
  '보조전력 운영이력',
  '보조전력 운영이력',
  '보조전력_운영이력'
);
monitoringResourceHistoryPageConfigs['/analysis/standby/history'] = createHistoryAliasConfig(
  '/history/pcs',
  '예비전력 운영이력',
  '예비전력 운영이력',
  '예비전력_운영이력'
);
monitoringResourceHistoryPageConfigs['/analysis/dispatch/history'] = createHistoryAliasConfig(
  '/history/power-consumption',
  '전력급전 운영이력',
  '전력급전 운영이력',
  '전력급전_운영이력'
);

export const monitoringResourceHistoryModes: readonly MonitoringHistoryMode[] = ['Year', 'Month', 'Duration'];
