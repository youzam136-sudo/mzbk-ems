import type { ApiRecord } from '../../../../shared/api/apiDataUtils';
import { PREVIEW_MOCK_ENABLED, mockPowerConsumptionStatus } from '../../../../shared/api/previewMockData';

export type PowerConsumptionStatusResponse = {
    bankList: { targetId: string; targetName: string }[];
    // TEMP: 실제 API가 BANK별 시계열/상세를 지원하면 이 필드들로 교체 — 현재는 미리보기 데이터에서만 채워짐
    bankSeriesMap: Record<string, ApiRecord[]>;
    bankDetailByEquipment: Record<string, ApiRecord[]>;
};

export const powerConsumptionStatusApi = {
    async getStatus(): Promise<PowerConsumptionStatusResponse> {
          try {
                  throw new Error('전력소비현황 BANK API가 아직 연동되지 않았습니다.');
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockPowerConsumptionStatus as unknown as PowerConsumptionStatusResponse;
                  }
                  throw error;
          }
    }
};
