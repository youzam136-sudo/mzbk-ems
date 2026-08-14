import { apiClient } from '../../../../shared/api/apiClient';
import type { ApiScalar } from '../../../../shared/api/apiDataUtils';
import { PREVIEW_MOCK_ENABLED, mockPlantOperationV2Response } from '../../../../shared/api/previewMockData';

export type PlantOperationV2AcDto = {
  serialNo?: ApiScalar;
  status?: ApiScalar;
  dischargeAirTemperature?: ApiScalar;
  temperature?: ApiScalar;
  humidity?: ApiScalar;
};

export type PlantOperationV2BatteryDto = {
  serialNo?: ApiScalar;
  status?: ApiScalar;
  soc?: ApiScalar;
  soh?: ApiScalar;
  rackVoltageMax?: ApiScalar;
  rackVoltageMin?: ApiScalar;
  rackVoltageAvg?: ApiScalar;
  rackCurrentMax?: ApiScalar;
  rackCurrentMin?: ApiScalar;
  rackCurrentAvg?: ApiScalar;
  packTempMax?: ApiScalar;
  packTempMin?: ApiScalar;
  packTempAvg?: ApiScalar;
  dcVoltage?: ApiScalar;
  dcCurrent?: ApiScalar;
  chargeKwh?: ApiScalar;
  dischargeKwh?: ApiScalar;
};

export type PlantOperationV2PcsDto = {
  serialNo?: ApiScalar;
  status?: ApiScalar;
  dcVoltage?: ApiScalar;
  dcCurrent?: ApiScalar;
  dcPower?: ApiScalar;
  activePower?: ApiScalar;
  reactivePower?: ApiScalar;
  apparentPower?: ApiScalar;
  pf?: ApiScalar;
  voltageL12?: ApiScalar;
  voltageL23?: ApiScalar;
  voltageL31?: ApiScalar;
  currentL1?: ApiScalar;
  currentL2?: ApiScalar;
  currentL3?: ApiScalar;
  moduleTemp?: ApiScalar;
  ambientTemp?: ApiScalar;
  cabinetTemp?: ApiScalar;
};

export type PlantOperationV2DieselDto = {
  serialNo?: ApiScalar;
  status?: ApiScalar;
  totalPower?: ApiScalar;
  powerL1?: ApiScalar;
  powerL2?: ApiScalar;
  powerL3?: ApiScalar;
  pf?: ApiScalar;
  voltageL12?: ApiScalar;
  voltageL23?: ApiScalar;
  voltageL31?: ApiScalar;
  currentL1?: ApiScalar;
  currentL2?: ApiScalar;
  currentL3?: ApiScalar;
  frequency?: ApiScalar;
  rpm?: ApiScalar;
  fuel?: ApiScalar;
  coolantTemp?: ApiScalar;
  oilTemp?: ApiScalar;
  oilPress?: ApiScalar;
  runningHour?: ApiScalar;
};

export type PlantOperationV2PowerDto = {
  serialNo?: ApiScalar;
  activePower?: ApiScalar;
  reactivePower?: ApiScalar;
  apparentPower?: ApiScalar;
  pf?: ApiScalar;
  voltageL12?: ApiScalar;
  voltageL23?: ApiScalar;
  voltageL31?: ApiScalar;
  currentL1?: ApiScalar;
  currentL2?: ApiScalar;
  currentL3?: ApiScalar;
  frequencyL1?: ApiScalar;
  frequencyL2?: ApiScalar;
  frequencyL3?: ApiScalar;
};

export type PlantOperationV2StorageDto = {
  serialNo?: ApiScalar;
  status?: ApiScalar;
  nowKw?: ApiScalar;
  dayKw?: ApiScalar;
  nowKvar?: ApiScalar;
  dayKvar?: ApiScalar;
  nowPf?: ApiScalar;
  dayPf?: ApiScalar;
};

export type PlantOperationV2InverterDto = {
  serialNo?: ApiScalar;
  inverterId?: ApiScalar;
  inverterName?: ApiScalar;
  status?: ApiScalar;
  dcPower?: ApiScalar;
  acPower?: ApiScalar;
  efficiency?: ApiScalar;
  activePower?: ApiScalar;
  reactivePower?: ApiScalar;
  apparentPower?: ApiScalar;
  pf?: ApiScalar;
  dailyActiveAccmPower?: ApiScalar;
  dailyReactiveAccmPower?: ApiScalar;
};

export type PlantOperationV2BankDto = {
  serialNo?: ApiScalar;
  bankId?: ApiScalar;
  bankName?: ApiScalar;
  totalPower?: ApiScalar;
  threePhasePower?: ApiScalar;
  singlePhasePower?: ApiScalar;
  activePower?: ApiScalar;
  reactivePower?: ApiScalar;
  pf?: ApiScalar;
};

export type PlantOperationV2DashboardResponse = {
  menuId?: ApiScalar;
  pageTitle?: ApiScalar;
  operYmd?: ApiScalar;
  operTime?: ApiScalar;
  serialType?: ApiScalar;
  serialNo?: ApiScalar;
  groupBySerial?: boolean;
  refreshSeconds?: ApiScalar;
  ac?: PlantOperationV2AcDto | null;
  battery?: PlantOperationV2BatteryDto | null;
  pcs?: PlantOperationV2PcsDto | null;
  diesel?: PlantOperationV2DieselDto | PlantOperationV2DieselDto[] | null;
  dieselList?: PlantOperationV2DieselDto[] | null;
  diesel1?: PlantOperationV2DieselDto | null;
  diesel2?: PlantOperationV2DieselDto | null;
  solar?: PlantOperationV2PowerDto | null;
  btb?: PlantOperationV2PowerDto | null;
  storage?: PlantOperationV2StorageDto | null;
  inverterList?: PlantOperationV2InverterDto[];
  bankList?: PlantOperationV2BankDto[];
};

export const plantOperationV2Api = {
    async getIndividualGroupStatus() {
          try {
                  return await apiClient<PlantOperationV2DashboardResponse>('/dashboard/individual?groupBySerial=true', {
                            operationName: 'individual group status'
                  });
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockPlantOperationV2Response as PlantOperationV2DashboardResponse;
                  }
                  throw error;
          }
    },
    async getIntegratedGroupStatus() {
          try {
                  return await apiClient<PlantOperationV2DashboardResponse>('/dashboard/integrated?groupBySerial=true', {
                            operationName: 'integrated group status'
                  });
          } catch (error) {
                  if (PREVIEW_MOCK_ENABLED) {
                            return mockPlantOperationV2Response as PlantOperationV2DashboardResponse;
                  }
                  throw error;
          }
    },
    async getDieselStatus(serialNo: 'DSL0001' | 'DSL0002') {
          const query = new URLSearchParams({
                  serialType: 'DSL',
                  serialNo,
                  groupBySerial: 'true'
          });

      try {
              return await apiClient<PlantOperationV2DashboardResponse>(`/dashboard/individual?${query.toString()}`, {
                        operationName: `diesel ${serialNo} status`
              });
      } catch (error) {
              if (PREVIEW_MOCK_ENABLED) {
                        return {
                                    ...mockPlantOperationV2Response,
                                    diesel: serialNo === 'DSL0001' ? mockPlantOperationV2Response.diesel1 : mockPlantOperationV2Response.diesel2
                        } as PlantOperationV2DashboardResponse;
              }
              throw error;
      }
    }
    };
