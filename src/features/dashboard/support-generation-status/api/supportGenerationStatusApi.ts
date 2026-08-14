import { monitoringApi } from '../../../../shared/api/monitoringApi';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import { PREVIEW_MOCK_ENABLED, mockSupportGenerationStatus } from '../../../../shared/api/previewMockData';

export type SupportGenerationStatusResponse = {
    essLatest: ApiRecord;
    diesel1Latest: ApiRecord;
    diesel2Latest: ApiRecord;
    essStatusList: ApiRecord[];
    diesel1StatusList: ApiRecord[];
    diesel2StatusList: ApiRecord[];
};

export const supportGenerationStatusApi = {
    async getStatus(): Promise<SupportGenerationStatusResponse> {
          try {
                  const [essLatest, diesel1Latest, diesel2Latest, essStatusList, diesel1StatusList, diesel2StatusList] = await Promise.all([
                            monitoringApi.getLatest<ApiRecord>('ess'),
                            monitoringApi.getLatest<ApiRecord>('diesel1'),
                            monitoringApi.getLatest<ApiRecord>('diesel2'),
                            monitoringApi.getStatus<ApiRecord>('ess'),
                            monitoringApi.getStatus<ApiRecord>('diesel1'),
                            monitoringApi.getStatus<ApiRecord>('diesel2')
                          ]);

            return {
                      essLatest,
                      diesel1Latest,
                      diesel2Latest,
                      essStatusList: Array.isArray(essStatusList) ? essStatusList : [],
                      diesel1StatusList: Array.isArray(diesel1StatusList) ? diesel1StatusList : [],
                      diesel2StatusList: Array.isArray(diesel2StatusList) ? diesel2StatusList : []
            };
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockSupportGenerationStatus as unknown as SupportGenerationStatusResponse;
                  }
                  throw error;
          }
    }
};
