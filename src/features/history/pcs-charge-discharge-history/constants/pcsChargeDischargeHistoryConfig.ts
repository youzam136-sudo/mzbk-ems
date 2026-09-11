import type { PcsChargeDischargeHistoryMetric, PcsChargeDischargeHistoryMode } from '../types/pcsChargeDischargeHistory';

export const pcsChargeDischargeHistoryModes: readonly { value: PcsChargeDischargeHistoryMode; label: string; inputType?: 'date' | 'dateRange' | 'month' | 'year' }[] = [
  { value: 'Day', label: 'DAY', inputType: 'date' },
  { value: 'Month', label: 'Month' },
  { value: 'Year', label: 'Year' },
  { value: 'Duration', label: 'Duration' }
];

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
