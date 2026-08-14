import type { PowerConsumptionHistoryMetric, PowerConsumptionHistoryMode } from '../types/powerConsumptionHistory';

export const powerConsumptionHistoryModes: readonly PowerConsumptionHistoryMode[] = ['Year', 'Month', 'Duration'];
export const powerConsumptionHistoryMetrics: readonly PowerConsumptionHistoryMetric[] = ['Max kWh', 'Min kWh', 'AVG kWh'];

export const powerConsumptionHistoryDefaultCriteria = {
  mode: 'Month' as PowerConsumptionHistoryMode,
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};
