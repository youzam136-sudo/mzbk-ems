import { monitoringApi } from '../../../../shared/api/monitoringApi';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import { PREVIEW_MOCK_ENABLED, mockPowerConsumptionStatus } from '../../../../shared/api/previewMockData';

export type PowerConsumptionStatusResponse = {
    gridLatest: ApiRecord;
    essLatest: ApiRecord;
    pcsLatest: ApiRecord;
    diesel1Latest: ApiRecord;
    diesel2Latest: ApiRecord;
    gridStatusList: ApiRecord[];
};

export const powerConsumptionStatusApi = {
    async getStatus(): Promise<PowerConsumptionStatusResponse> {
          try {
                  const [gridLatest, essLatest, pcsLatest, diesel1Latest, diesel2Latest, gridStatusList] = await Promise.all([
                            monitoringApi.getLatest<ApiRecord>('grid'),
                            monitoringApi.getLatest<ApiRecord>('ess'),
                            monitoringApi.getLatest<ApiRecord>('pcs'),
                            monitoringApi.getLatest<ApiRecord>('diesel1'),
                            monitoringApi.getLatest<ApiRecord>('diesel2'),
                            monitoringApi.getStatus<ApiRecord>('grid')
                          ]);

            return {
                      gridLatest,
                      essLatest,
                      pcsLatest,
                      diesel1Latest,
                      diesel2Latest,
                      gridStatusList: Array.isArray(gridStatusList) ? gridStatusList : []
            };
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockPowerConsumptionStatus as unknown as PowerConsumptionStatusResponse;
                  }
                  throw error;
          }
    }
};
