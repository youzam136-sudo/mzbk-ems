import {
  monitoringApi,
  toLegacyMonitoringLatest,
  type MonitoringDomain,
  type MonitoringDetailDto,
  type MonitoringResponseDto,
  type MonitoringTargetDto
} from '../../../../shared/api/monitoringApi';

type ApiScalar = string | number | null | undefined;

export type DashboardSummaryResponseDto = {
  esmtOperYmd?: ApiScalar;
  esmtOperTime?: ApiScalar;
  totalBasePower?: ApiScalar;
  totalAssistPower?: ApiScalar;
  totalStandbyPower?: ApiScalar;
  totalDispatchPower?: ApiScalar;
  avgSoc?: ApiScalar;
  baseAtpTot?: ApiScalar;
  assistAtpTot?: ApiScalar;
  standbyAtpTot?: ApiScalar;
  dispatchAtpTot?: ApiScalar;
  batterySoc?: ApiScalar;
  essPlantSoc?: ApiScalar;
  pcsOperStatus?: ApiScalar;
  pcsAtpTot?: ApiScalar;
  pcsFr?: ApiScalar;
  pcsDcP?: ApiScalar;
  batAvgSoc?: ApiScalar;
  batAvgSoh?: ApiScalar;
  dsl1AtpTot?: ApiScalar;
  dsl2AtpTot?: ApiScalar;
  baAtpTot?: ApiScalar;
  essAtpTot?: ApiScalar;
  essPlntSoc?: ApiScalar;
  acOperStuscd?: ApiScalar;
};

export type GridStatusResponseDto = {
  esmtOperYmd?: ApiScalar;
  esmtOperTime?: ApiScalar;
  baPtpvL12?: ApiScalar;
  baPtpvL23?: ApiScalar;
  baPtpvL31?: ApiScalar;
  baPfrL1?: ApiScalar;
  baPfrL2?: ApiScalar;
  baPfrL3?: ApiScalar;
  baPaL1?: ApiScalar;
  baPaL2?: ApiScalar;
  baPaL3?: ApiScalar;
  baAtpTot?: ApiScalar;
  baRtpTot?: ApiScalar;
  baArpTot?: ApiScalar;
  baPfTot?: ApiScalar;
  baAtpDayAccm?: ApiScalar;
  baAtpTotAccm?: ApiScalar;
};

export type EssStatusResponseDto = {
  essPlntSoc?: ApiScalar;
  essPtpvL12?: ApiScalar;
  essPtpvL23?: ApiScalar;
  essPtpvL31?: ApiScalar;
  essPfrL1?: ApiScalar;
  essPfrL2?: ApiScalar;
  essPfrL3?: ApiScalar;
  essPaL1?: ApiScalar;
  essPaL2?: ApiScalar;
  essPaL3?: ApiScalar;
  essAtpTot?: ApiScalar;
  essRtpTot?: ApiScalar;
  essArpTot?: ApiScalar;
  essPfTot?: ApiScalar;
  essAtpDayAccm?: ApiScalar;
  essAtpTotAccm?: ApiScalar;
};

export type PcsStatusResponseDto = {
  pcsOperStatus?: ApiScalar;
  pcsMdlTemp?: ApiScalar;
  pcsAbntTemp?: ApiScalar;
  pcsCbntTemp?: ApiScalar;
  pcsPfTot?: ApiScalar;
  pcsAtpTot?: ApiScalar;
  pcsRtpTot?: ApiScalar;
  pcsArpTot?: ApiScalar;
  pcsPaL1?: ApiScalar;
  pcsPaL2?: ApiScalar;
  pcsPaL3?: ApiScalar;
  pcsFr?: ApiScalar;
  pcsPtpvL12?: ApiScalar;
  pcsPtpvL23?: ApiScalar;
  pcsPtpvL31?: ApiScalar;
  pcsAtpDayAccm?: ApiScalar;
  pcsAtpMonAccm?: ApiScalar;
  pcsDcP?: ApiScalar;
  pcsDcA?: ApiScalar;
  pcsDcV?: ApiScalar;
};

export type BatteryStatusResponseDto = {
  batAvgSoc?: ApiScalar;
  batAvgSoh?: ApiScalar;
  batMaxRakv?: ApiScalar;
  batAvgRakv?: ApiScalar;
  batMinRakv?: ApiScalar;
  batMaxRaka?: ApiScalar;
  batAvgRaka?: ApiScalar;
  batMinRaka?: ApiScalar;
  batMaxPaktmp?: ApiScalar;
  batAvgPaktmp?: ApiScalar;
  batMinPaktmp?: ApiScalar;
};

export type DieselStatusResponseDto = {
  dslPtpvL12?: ApiScalar;
  dslPtpvL23?: ApiScalar;
  dslPtpvL31?: ApiScalar;
  dslPfrL1?: ApiScalar;
  dslPfrL2?: ApiScalar;
  dslPfrL3?: ApiScalar;
  dslPaL1?: ApiScalar;
  dslPaL2?: ApiScalar;
  dslPaL3?: ApiScalar;
  dslAtpTot?: ApiScalar;
  dslRtpTot?: ApiScalar;
  dslArpTot?: ApiScalar;
  dslAtpDayAccm?: ApiScalar;
  dslAtpTotAccm?: ApiScalar;
  dslPfTot?: ApiScalar;
  dslEgnRpm?: ApiScalar;
  dslClntTmp?: ApiScalar;
  dslOilPrsr?: ApiScalar;
  dslOilTmp?: ApiScalar;
  dslFuelLvl?: ApiScalar;
};

export type AcStatusResponseDto = {
  acOperStuscd?: ApiScalar;
  acSuplyAirtmp?: ApiScalar;
  acRtnAirhum?: ApiScalar;
  acRtnAirtmp?: ApiScalar;
};

export type PlantOperationStatusLatestResponse = {
  dashboard: DashboardSummaryResponseDto;
  targets: MonitoringTargetDto[];
  grid: GridStatusResponseDto;
  ess: EssStatusResponseDto;
  pcs: PcsStatusResponseDto;
  battery: BatteryStatusResponseDto;
  diesel1: DieselStatusResponseDto;
  diesel2: DieselStatusResponseDto;
  ac: AcStatusResponseDto;
};

export type PlantOperationViewMode = 'total' | 'plant';

const baseDomainByViewMode: Record<PlantOperationViewMode, MonitoringDomain> = {
  total: 'base-total',
  plant: 'base-plant'
};

function applyBaseDetail(grid: GridStatusResponseDto, details: MonitoringDetailDto[]): GridStatusResponseDto {
  const detail = details[0];

  if (!detail) {
    return grid;
  }

  return {
    ...grid,
    esmtOperYmd: detail.operYmd ?? grid.esmtOperYmd,
    esmtOperTime: detail.operTime ?? grid.esmtOperTime,
    baAtpTot: detail.detailValue1 ?? grid.baAtpTot,
    baRtpTot: detail.detailValue2 ?? grid.baRtpTot,
    baArpTot: detail.detailValue3 ?? grid.baArpTot,
    baPfTot: detail.detailValue4 ?? grid.baPfTot,
    baAtpDayAccm: detail.detailValue5 ?? grid.baAtpDayAccm,
    baAtpTotAccm: detail.detailValue5 ?? grid.baAtpTotAccm
  };
}

/*
 * 필요: 발전소 운영현황에서 사용하는 monitoring 최신값 API를 한 번에 조회한다.
 * 연결: usePlantOperationStatus, plantOperationStatusAdapter.
 * 설명: v3 dashboard endpoint를 우선 사용하고, 상세 카드 값은 현재값 endpoint를 함께 조회해 채운다.
 * 수정: PM API 문서에서 endpoint, targetList, detail 값 의미가 바뀌면 이 Promise 목록과 매핑을 먼저 확인한다.
 */
export const plantOperationStatusApi = {
  async getLatestStatus(viewMode: PlantOperationViewMode = 'total', targetId = ''): Promise<PlantOperationStatusLatestResponse> {
    const [dashboardResponse, baseResponse, assistResponse, standbyResponse, dispatchResponse] = await Promise.all([
      monitoringApi.getDashboardStatus<DashboardSummaryResponseDto>(viewMode),
      monitoringApi.getData<MonitoringResponseDto>(baseDomainByViewMode[viewMode]),
      monitoringApi.getData<MonitoringResponseDto>('assist'),
      monitoringApi.getData<MonitoringResponseDto>('standby'),
      monitoringApi.getData<MonitoringResponseDto>('dispatch')
    ]);
    const selectedTargetId = targetId || String(baseResponse.targetList?.[0]?.targetId ?? '');
    const baseDetails =
      viewMode === 'plant' && selectedTargetId ? await monitoringApi.getDetail<MonitoringDetailDto[]>(baseDomainByViewMode[viewMode], selectedTargetId) : [];
    const grid = applyBaseDetail(toLegacyMonitoringLatest(baseResponse, 'grid') as GridStatusResponseDto, baseDetails);
    const ess = toLegacyMonitoringLatest(assistResponse, 'ess') as EssStatusResponseDto;
    const pcs = toLegacyMonitoringLatest(standbyResponse, 'pcs') as PcsStatusResponseDto;
    const battery = toLegacyMonitoringLatest(standbyResponse, 'battery') as BatteryStatusResponseDto;
    const diesel1 = toLegacyMonitoringLatest(assistResponse, 'diesel1') as DieselStatusResponseDto;
    const diesel2 = toLegacyMonitoringLatest(assistResponse, 'diesel2') as DieselStatusResponseDto;
    const ac = toLegacyMonitoringLatest(dispatchResponse, 'ac') as AcStatusResponseDto;
    const dashboard: DashboardSummaryResponseDto = {
      ...dashboardResponse,
      esmtOperYmd: dashboardResponse.esmtOperYmd ?? grid.esmtOperYmd,
      esmtOperTime: dashboardResponse.esmtOperTime ?? grid.esmtOperTime,
      pcsOperStatus: dashboardResponse.pcsOperStatus ?? pcs.pcsOperStatus,
      pcsAtpTot: dashboardResponse.dispatchAtpTot ?? dashboardResponse.totalDispatchPower ?? pcs.pcsAtpTot,
      pcsFr: pcs.pcsFr,
      pcsDcP: pcs.pcsDcP,
      batAvgSoc: dashboardResponse.batterySoc ?? dashboardResponse.avgSoc ?? battery.batAvgSoc,
      batAvgSoh: battery.batAvgSoh,
      dsl1AtpTot: dashboardResponse.standbyAtpTot ?? dashboardResponse.totalStandbyPower ?? diesel1.dslAtpTot,
      dsl2AtpTot: diesel2.dslAtpTot,
      baAtpTot: dashboardResponse.baseAtpTot ?? dashboardResponse.totalBasePower ?? grid.baAtpTot,
      essAtpTot: dashboardResponse.assistAtpTot ?? dashboardResponse.totalAssistPower ?? ess.essAtpTot,
      essPlntSoc: dashboardResponse.essPlantSoc ?? ess.essPlntSoc,
      acOperStuscd: ac.acOperStuscd
    };

    return { dashboard, targets: baseResponse.targetList ?? [], grid, ess, pcs, battery, diesel1, diesel2, ac };
  }
};
