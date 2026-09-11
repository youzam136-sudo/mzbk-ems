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
    // TEMP: 실제 API 연동 전까지 미리보기 데이터에서만 채워짐 (Diesel 상세 내역 보기 표)
    diesel1Detail: ApiRecord[];
    diesel2Detail: ApiRecord[];
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
                      diesel2StatusList: Array.isArray(diesel2StatusList) ? diesel2StatusList : [],
                      diesel1Detail: [],
                      diesel2Detail: []
            };
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockSupportGenerationStatus as unknown as SupportGenerationStatusResponse;
                  }
                  throw error;
          }
    }
};
