import type { GridBaseGenerationHistoryMetric, GridBaseGenerationHistoryMode } from '../types/gridBaseGenerationHistory';

export const gridBaseGenerationHistoryModes: readonly GridBaseGenerationHistoryMode[] = ['Year', 'Month', 'Duration'];
export const gridBaseGenerationHistoryMetrics: readonly GridBaseGenerationHistoryMetric[] = ['Max kWh', 'Min kWh', 'AVG kWh'];

export const gridBaseGenerationHistoryDefaultCriteria = {
  mode: 'Month' as GridBaseGenerationHistoryMode,
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};
