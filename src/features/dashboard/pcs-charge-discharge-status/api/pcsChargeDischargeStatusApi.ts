import { monitoringApi } from '../../../../shared/api/monitoringApi';
import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import { PREVIEW_MOCK_ENABLED, mockPcsChargeDischargeStatus } from '../../../../shared/api/previewMockData';

export type PcsChargeDischargeStatusResponse = {
    pcsLatest: ApiRecord;
    batteryLatest: ApiRecord;
    pcsStatusList: ApiRecord[];
    batteryStatusList: ApiRecord[];
};

export const pcsChargeDischargeStatusApi = {
    async getStatus(): Promise<PcsChargeDischargeStatusResponse> {
          try {
                  const [pcsLatest, batteryLatest, pcsStatusList, batteryStatusList] = await Promise.all([
                            monitoringApi.getLatest<ApiRecord>('pcs'),
                            monitoringApi.getLatest<ApiRecord>('battery'),
                            monitoringApi.getStatus<ApiRecord>('pcs'),
                            monitoringApi.getStatus<ApiRecord>('battery')
                          ]);

            return {
                      pcsLatest,
                      batteryLatest,
                      pcsStatusList: Array.isArray(pcsStatusList) ? pcsStatusList : [],
                      batteryStatusList: Array.isArray(batteryStatusList) ? batteryStatusList : []
            };
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockPcsChargeDischargeStatus as unknown as PcsChargeDischargeStatusResponse;
                  }
                  throw error;
          }
    }
};
