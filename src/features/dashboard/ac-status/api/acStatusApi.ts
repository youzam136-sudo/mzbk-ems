import { monitoringApi } from '../../../../shared/api/monitoringApi';
import type { ApiScalar } from '../../../../shared/api/apiDataUtils';
import { PREVIEW_MOCK_ENABLED, mockAcStatus } from '../../../../shared/api/previewMockData';

export type AcStatusResponseDto = {
    esmtOperYmd?: ApiScalar;
    esmtOperTime?: ApiScalar;
    acOperStuscd?: ApiScalar;
    acSuplyAirtmp?: ApiScalar;
    acRtnAirtmp?: ApiScalar;
    acRtnAirhum?: ApiScalar;
};

export type AcStatusResponse = {
    latest: AcStatusResponseDto | null;
    statusList: AcStatusResponseDto[];
};

export const acStatusApi = {
    async getStatus(): Promise<AcStatusResponse> {
          try {
                  const [latest, statusList] = await Promise.all([
                            monitoringApi.getLatest<AcStatusResponseDto>('ac'),
                            monitoringApi.getStatus<AcStatusResponseDto>('ac')
                          ]);

            return { latest, statusList };
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockAcStatus as unknown as AcStatusResponse;
                  }
                  throw error;
          }
    }
};
