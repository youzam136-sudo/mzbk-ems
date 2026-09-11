import type { GridBaseGenerationHistoryMetric, GridBaseGenerationHistoryMode } from '../types/gridBaseGenerationHistory';

export const gridBaseGenerationHistoryModes: readonly { value: GridBaseGenerationHistoryMode; label: string; inputType?: 'date' | 'dateRange' | 'month' | 'year' }[] = [
  { value: 'Day', label: 'DAY', inputType: 'date' },
  { value: 'Month', label: 'Month' },
  { value: 'Year', label: 'Year' },
  { value: 'Duration', label: 'Duration' }
];
export const gridBaseGenerationHistoryMetrics: readonly GridBaseGenerationHistoryMetric[] = ['Max kWh', 'Min kWh', 'AVG kWh'];

export const gridBaseGenerationHistoryDefaultCriteria = {
  mode: 'Month' as GridBaseGenerationHistoryMode,
  startDate: '2026-05-01',
  endDate: '2026-05-31',
  year: '2026',
  month: '2026-05'
};
