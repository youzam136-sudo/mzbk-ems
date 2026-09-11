import {
    monitoringApi,
    toLegacyMonitoringLatest,
    toLegacyMonitoringRows,
    type MonitoringDomain,
    type MonitoringResponseDto,
    type MonitoringTargetDto
} from '../../../../shared/api/monitoringApi';
import { PREVIEW_MOCK_ENABLED, mockBaseGenerationStatus } from '../../../../shared/api/previewMockData';

type ApiScalar = string | number | null | undefined;

export type GridStatusResponseDto = {
    esmtOperYmd?: ApiScalar;
    esmtOperTime?: ApiScalar;
    status?: ApiScalar;
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

// PPT 신규 스펙: 인버터 상세 내역의 STRING(P/V/A Max/Min/AVG) 통계 — 실제 API 필드명은 연동 시 조정
export type InverterStringDetailDto = {
    operTime?: ApiScalar;
    status?: ApiScalar;
    activePower?: ApiScalar;
    reactivePower?: ApiScalar;
    dayAccm?: ApiScalar;
    totalAccm?: ApiScalar;
    stringPMax?: ApiScalar;
    stringPMin?: ApiScalar;
    stringPAvg?: ApiScalar;
    stringVMax?: ApiScalar;
    stringVMin?: ApiScalar;
    stringVAvg?: ApiScalar;
    stringAMax?: ApiScalar;
    stringAMin?: ApiScalar;
    stringAAvg?: ApiScalar;
};

export type BaseGenerationStatusResponse = {
    latest: GridStatusResponseDto | null;
    statusList: GridStatusResponseDto[];
    detailList: InverterStringDetailDto[];
    targetList: MonitoringTargetDto[];
    selectedTargetId: string;
    // TEMP: 실제 API가 인버터별 시계열을 지원하면 이 필드로 교체 — 현재는 미리보기 데이터에서만 채워짐
    targetSeriesMap?: Record<string, GridStatusResponseDto[]>;
};

export const baseGenerationApi = {
    async getStatus(domain: MonitoringDomain = 'base-total', targetId = ''): Promise<BaseGenerationStatusResponse> {
          try {
                  const response = await monitoringApi.getData<MonitoringResponseDto>(domain);
                  const selectedTargetId = targetId || String(response.targetList?.[0]?.targetId ?? '');
                  const detailList =
                            domain === 'base-plant' && selectedTargetId
                                      ? await monitoringApi.getDetail<InverterStringDetailDto[]>(domain, selectedTargetId)
                                      : [];
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
                            const mock = mockBaseGenerationStatus as unknown as BaseGenerationStatusResponse;
                            const selectedTargetId = targetId || mock.selectedTargetId;
                            const detailList = mock.targetSeriesMap?.[selectedTargetId]
                                      ? (mockBaseGenerationStatus as unknown as { detailListByTarget: Record<string, InverterStringDetailDto[]> }).detailListByTarget?.[selectedTargetId] ?? mock.detailList
                                      : mock.detailList;
                            return { ...mock, selectedTargetId, detailList };
                  }
                  throw error;
          }
    }
    };
