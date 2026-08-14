import type { SupportGenerationHistoryMetric, SupportGenerationHistoryMode } from '../types/supportGenerationHistory';

export const supportGenerationHistoryModes: readonly SupportGenerationHistoryMode[] = ['Year', 'Month', 'Duration'];

export const supportGenerationHistoryMetrics: readonly SupportGenerationHistoryMetric[] = [
  'Max kWh',
  'Min kWh',
  'AVG kWh',
  'Max D kWh',
  'Min D kWh',
  'AVG D kWh'
];

export const supportGenerationHistoryDefaultCriteria = {
  mode: 'Month' as SupportGenerationHistoryMode,
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};
