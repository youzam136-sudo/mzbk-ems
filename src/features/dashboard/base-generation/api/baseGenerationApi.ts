import {
    monitoringApi,
    toLegacyMonitoringLatest,
    toLegacyMonitoringRows,
    type MonitoringDomain,
    type MonitoringDetailDto,
    type MonitoringResponseDto,
    type MonitoringTargetDto
} from '../../../../shared/api/monitoringApi';
import { PREVIEW_MOCK_ENABLED, mockBaseGenerationStatus } from '../../../../shared/api/previewMockData';

type ApiScalar = string | number | null | undefined;

export type GridStatusResponseDto = {
    esmtOperYmd?: ApiScalar;
    esmtOperTime?: ApiScalar;
    baPtpvL12?: ApiScalar;
    baPtpvL23?: ApiScalar;
    baPtpvL31?: ApiScalar;
    baPtpvL1n?: ApiScalar;
    baPtpvL2n?: ApiScalar;
    baPtptL3n?: ApiScalar;
    baPfrL1?: ApiScalar;
    baPfrL2?: ApiScalar;
    baPfrL3?: ApiScalar;
    baPaL1?: ApiScalar;
    baPaL2?: ApiScalar;
    baPaL3?: ApiScalar;
    baAtpL1?: ApiScalar;
    baAtpL2?: ApiScalar;
    baAtpL3?: ApiScalar;
    baAtpTot?: ApiScalar;
    baRtpTot?: ApiScalar;
    baArpTot?: ApiScalar;
    baPfTot?: ApiScalar;
    baAtpDayAccm?: ApiScalar;
    baAtpWeekAccm?: ApiScalar;
    baAtpMonAccm?: ApiScalar;
    baAtpTotAccm?: ApiScalar;
    baRtpDayAccm?: ApiScalar;
    baRtpWeekAccm?: ApiScalar;
    baRtpMonAccm?: ApiScalar;
    baRtpTotAccm?: ApiScalar;
    lgldGbcd?: ApiScalar;
};

export type BaseGenerationStatusResponse = {
    latest: GridStatusResponseDto | null;
    statusList: GridStatusResponseDto[];
    detailList: MonitoringDetailDto[];
    targetList: MonitoringTargetDto[];
    selectedTargetId: string;
};

export const baseGenerationApi = {
    async getStatus(domain: MonitoringDomain = 'base-total', targetId = ''): Promise<BaseGenerationStatusResponse> {
          try {
                  const response = await monitoringApi.getData<MonitoringResponseDto>(domain);
                  const selectedTargetId = targetId || String(response.targetList?.[0]?.targetId ?? '');
                  const detailList =
                            domain === 'base-plant' && selectedTargetId ? await monitoringApi.getDetail<MonitoringDetailDto[]>(domain, selectedTargetId) : [];
                  const latest = toLegacyMonitoringLatest(response, 'grid') as GridStatusResponseDto;
                  const statusList = toLegacyMonitoringRows(response, 'grid') as GridStatusResponseDto[];

            return {
                      latest,
                      statusList: Array.isArray(statusList) ? statusList : [],
                      detailList,
                      targetList: response.targetList ?? [],
                      selectedTargetId
            };
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockBaseGenerationStatus as unknown as BaseGenerationStatusResponse;
                  }
                  throw error;
          }
    }
    };
