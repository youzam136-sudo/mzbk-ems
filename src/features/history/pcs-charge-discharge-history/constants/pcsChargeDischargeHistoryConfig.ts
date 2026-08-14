import type { PcsChargeDischargeHistoryMetric, PcsChargeDischargeHistoryMode } from '../types/pcsChargeDischargeHistory';

export const pcsChargeDischargeHistoryModes: readonly PcsChargeDischargeHistoryMode[] = ['Year', 'Month', 'Duration'];

export const pcsChargeDischargeHistoryMetrics: readonly PcsChargeDischargeHistoryMetric[] = [
  'Max kWh',
  'Min kWh',
  'AVG kWh',
  'Max D kWh',
  'Min D kWh',
  'AVG D kWh'
];

export const pcsChargeDischargeHistoryDefaultCriteria = {
  mode: 'Month' as PcsChargeDischargeHistoryMode,
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};
