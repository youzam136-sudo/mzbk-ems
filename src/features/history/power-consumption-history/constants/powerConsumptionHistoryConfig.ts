import type { PowerConsumptionHistoryMetric, PowerConsumptionHistoryMode } from '../types/powerConsumptionHistory';

export const powerConsumptionHistoryModes: readonly { value: PowerConsumptionHistoryMode; label: string; inputType?: 'date' | 'dateRange' | 'month' | 'year' }[] = [
  { value: 'Day', label: 'DAY', inputType: 'date' },
  { value: 'Month', label: 'Month' },
  { value: 'Year', label: 'Year' },
  { value: 'Duration', label: 'Duration' }
];
export const powerConsumptionHistoryMetrics: readonly PowerConsumptionHistoryMetric[] = ['Max kWh', 'Min kWh', 'AVG kWh'];

export const powerConsumptionHistoryDefaultCriteria = {
  mode: 'Month' as PowerConsumptionHistoryMode,
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};
