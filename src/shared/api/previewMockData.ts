// Preview mock data: used when the real backend is unreachable so screens still render sample numbers.
// TEMP: 로그인/실제 API 미작동 시 임시 미리보기용 — 클라이언트 전달 시에는 반드시 false로 되돌릴 것
export const PREVIEW_MOCK_ENABLED = true;

export const mockPlantOperationV2Response = {
    menuId: 'MZBK_EMS',
    pageTitle: 'individual',
    operYmd: '20260810',
    operTime: '143000',
    groupBySerial: true,
    refreshSeconds: 30,
    ac: { serialNo: 'AC0001', status: '02', dischargeAirTemperature: 18.4, temperature: 24.1, humidity: 46 },
    battery: {
          serialNo: 'BAT0001', status: '02', soc: 78, soh: 96,
          rackVoltageMax: 812.4, rackVoltageMin: 806.1, rackVoltageAvg: 809.2,
          rackCurrentMax: 42.5, rackCurrentMin: 38.1, rackCurrentAvg: 40.3,
          packTempMax: 31.2, packTempMin: 27.8, packTempAvg: 29.4,
          dcVoltage: 809.2, dcCurrent: 40.3, chargeKwh: 128.6, dischargeKwh: 96.4
    },
    pcs: {
          serialNo: 'PCS0001', status: '02', dcVoltage: 808.5, dcCurrent: 39.8, dcPower: 32.1,
          activePower: 320.5, reactivePower: 42.3, apparentPower: 323.2, pf: 0.97,
          voltageL12: 380.2, voltageL23: 379.8, voltageL31: 380.5,
          currentL1: 152.4, currentL2: 150.1, currentL3: 151.7,
          moduleTemp: 38.2, ambientTemp: 27.5, cabinetTemp: 32.6
    },
    diesel1: {
          serialNo: 'DSL0001', status: '02', totalPower: 210.4, powerL1: 70.2, powerL2: 69.8, powerL3: 70.4, pf: 0.95,
          voltageL12: 380.1, voltageL23: 379.6, voltageL31: 380.3, currentL1: 92.4, currentL2: 91.8, currentL3: 92.1,
          frequency: 60.02, rpm: 1800, fuel: 82, coolantTemp: 78.4, oilTemp: 84.1, oilPress: 4.2, runningHour: 1284
    },
    diesel2: {
          serialNo: 'DSL0002', status: '01', totalPower: 0, powerL1: 0, powerL2: 0, powerL3: 0, pf: 0,
          voltageL12: 0, voltageL23: 0, voltageL31: 0, currentL1: 0, currentL2: 0, currentL3: 0,
          frequency: 0, rpm: 0, fuel: 76, coolantTemp: 24.1, oilTemp: 25.3, oilPress: 0, runningHour: 642
    },
    solar: {
          serialNo: 'SOLAR0001', activePower: 186.4, reactivePower: 12.1, apparentPower: 186.8, pf: 0.99,
          voltageL12: 380.4, voltageL23: 380.1, voltageL31: 380.6, currentL1: 88.2, currentL2: 87.6, currentL3: 88.0,
          frequencyL1: 60.01, frequencyL2: 60.01, frequencyL3: 60.0
    },
    btb: {
          serialNo: 'BTB0001', activePower: 412.6, reactivePower: 38.4, apparentPower: 414.4, pf: 0.98,
          voltageL12: 380.3, voltageL23: 380.0, voltageL31: 380.5, currentL1: 196.4, currentL2: 195.8, currentL3: 196.1,
          frequencyL1: 60.0, frequencyL2: 60.0, frequencyL3: 60.0
    },
    storage: { serialNo: 'ESS0001', status: '02', nowKw: 312.4, dayKw: 2846.2, nowKvar: 24.1, dayKvar: 186.4, nowPf: 0.97, dayPf: 0.96 },
    inverterList: Array.from({ length: 7 }, (_, i) => ({
          serialNo: 'IVT000' + (i + 1), inverterId: 'IVT-0' + (i + 1), inverterName: 'IVT #0' + (i + 1),
          status: i === 5 ? '01' : '02', dcPower: 24.1 + i, acPower: 23.4 + i, efficiency: 96.8,
          activePower: 23.4 + i, reactivePower: 1.8, apparentPower: 23.5 + i, pf: 0.98,
          dailyActiveAccmPower: 182.4 + i * 4, dailyReactiveAccmPower: 12.6
    })),
    bankList: Array.from({ length: 5 }, (_, i) => ({
          serialNo: 'BANK000' + (i + 1), bankId: 'BANK-0' + (i + 1), bankName: 'Bank #' + (i + 1),
          totalPower: 62.4 + i * 3, threePhasePower: 58.1 + i * 3, singlePhasePower: 4.3,
          activePower: 62.4 + i * 3, reactivePower: 4.1, pf: 0.96
    }))
};

function buildMonitoringLatest() {
    return { operTime: '143000', operYmd: '20260810', ratio1: 78, ratio2: 22, remark: 'ok', value1: 320.5, value2: 96.4, value3: 0.97 };
}

function buildMonitoringStatusList(count: number) {
    return Array.from({ length: count }, (_, i) => ({
          baseLabel: '0' + (i + 1), chargeKwh: 128.6 + i * 4, current: 92.1 + i * 2, detailYn: 'N',
          dischargeKwh: 96.4 + i * 3, frequency: 60.0, oilPress: 4.2, operTime: '1' + i + '0000', operYmd: '20260810',
          pf: 0.96, powerKwh: 210.4 + i * 5, rpm: 1800, rowNo: i + 1, soc: 74 + i, soh: 95, tankLevel: 82,
          targetId: 'T' + (i + 1), targetName: 'unit ' + (i + 1), temperature: 28.4 + i,
          value1: 320.5, value2: 42.3, value3: 0.97, value4: 0, voltage: 380.2
    }));
}

function buildBaseGenerationInverterSeries(index: number) {
    const base = 24 + index * 3;
    return Array.from({ length: 6 }, (_, i) => ({
          esmtOperYmd: '20260810',
          esmtOperTime: '1' + i + '0000',
          status: index === 5 ? '정지' : '정상',
          baAtpTot: index === 5 ? 0 : Number((base + i * 1.2).toFixed(1))
    }));
}

function buildBaseGenerationInverterDetail(index: number) {
    const base = 24 + index * 3;
    return Array.from({ length: 6 }, (_, i) => ({
          operTime: '1' + i + '0000',
          status: index === 5 ? '정지' : '정상',
          activePower: index === 5 ? 0 : Number((base + i * 1.2).toFixed(1)),
          reactivePower: index === 5 ? 0 : Number((1.8 + i * 0.1).toFixed(1)),
          dayAccm: Number((182.4 + index * 4 + i * 6).toFixed(1)),
          totalAccm: Number((96820.4 + index * 120).toFixed(1)),
          stringPMax: Number((base + 2.4).toFixed(1)),
          stringPMin: Number((base - 1.8).toFixed(1)),
          stringPAvg: Number(base.toFixed(1)),
          stringVMax: 382.4,
          stringVMin: 378.1,
          stringVAvg: 380.2,
          stringAMax: Number((88.2 + index).toFixed(1)),
          stringAMin: Number((85.6 + index).toFixed(1)),
          stringAAvg: Number((87.0 + index).toFixed(1))
    }));
}

const BASE_GENERATION_INVERTER_COUNT = 7;
const baseGenerationTargetSeriesMap = Object.fromEntries(
      Array.from({ length: BASE_GENERATION_INVERTER_COUNT }, (_, i) => [`ivt-${i + 1}`, buildBaseGenerationInverterSeries(i)])
);
const baseGenerationDetailListByTarget = Object.fromEntries(
      Array.from({ length: BASE_GENERATION_INVERTER_COUNT }, (_, i) => [`ivt-${i + 1}`, buildBaseGenerationInverterDetail(i)])
);
const baseGenerationTotalStatusList = Array.from({ length: 6 }, (_, i) => ({
      esmtOperYmd: '20260810',
      esmtOperTime: '1' + i + '0000',
      baAtpTot: Object.values(baseGenerationTargetSeriesMap).reduce((sum, series) => sum + (series[i]?.baAtpTot ?? 0), 0)
}));

export const mockBaseGenerationStatus = {
    latest: {
          esmtOperYmd: '20260810', esmtOperTime: '143000',
          baAtpTot: baseGenerationTotalStatusList.at(-1)?.baAtpTot ?? 0,
          baRtpTot: 24.1, baArpTot: 289.3, baPfTot: 0.97, lgldGbcd: 100
    },
    statusList: baseGenerationTotalStatusList,
    detailList: baseGenerationDetailListByTarget['ivt-1'],
    targetList: Array.from({ length: BASE_GENERATION_INVERTER_COUNT }, (_, i) => ({ targetId: `ivt-${i + 1}`, targetName: `IVT${i + 1}` })),
    selectedTargetId: 'ivt-1',
    targetSeriesMap: baseGenerationTargetSeriesMap,
    detailListByTarget: baseGenerationDetailListByTarget
};

function buildDieselStatusList(count: number, unitIndex: number, stopped: boolean) {
    return Array.from({ length: count }, (_, i) => ({
          esmtOperYmd: '20260810',
          esmtOperTime: '1' + i + '0000',
          dslStat: stopped ? '정지' : '정상',
          dslAtpTot: stopped ? 0 : Number((68 + unitIndex * 2 + i * 1.4).toFixed(1)),
          dslVtg: stopped ? 0 : 380.1 + i * 0.1,
          dslCur: stopped ? 0 : Number((90.4 + unitIndex * 1.5 + i).toFixed(1)),
          dslFreq: stopped ? 0 : 60.0,
          dslPfTot: stopped ? 0 : 0.95
    }));
}

function buildDieselDetailList(count: number, unitIndex: number, stopped: boolean) {
    return Array.from({ length: count }, (_, i) => ({
          esmtOperTime: '1' + i + '0000',
          dslStat: stopped ? '정지' : '정상',
          dslAtpTot: stopped ? 0 : Number((68 + unitIndex * 2 + i * 1.4).toFixed(1)),
          dslRtpTot: stopped ? 0 : Number((4.2 + i * 0.2).toFixed(1)),
          dslArpTot: stopped ? 0 : Number((69.5 + unitIndex * 2 + i * 1.4).toFixed(1)),
          dslPfTot: stopped ? 0 : 0.95,
          dslLeadLag: stopped ? '-' : '지상',
          dslAtpDayAccm: Number((642.4 + unitIndex * 20 + i * 8).toFixed(1)),
          dslVtg: stopped ? 0 : 380.1 + i * 0.1,
          dslCur: stopped ? 0 : Number((90.4 + unitIndex * 1.5 + i).toFixed(1)),
          dslFreq: stopped ? 0 : 60.0,
          dslCoolTemp: Number((78.4 + unitIndex).toFixed(1)),
          dslOilTemp: Number((84.1 + unitIndex).toFixed(1)),
          dslOilPress: 4.2,
          dslRpm: stopped ? 0 : 1800,
          dslFuel: 82 - unitIndex * 6
    }));
}

export const mockSupportGenerationStatus = {
    essLatest: buildMonitoringLatest(),
    diesel1Latest: buildMonitoringLatest(),
    diesel2Latest: Object.assign(buildMonitoringLatest(), { value1: 0, remark: 'stop' }),
    essStatusList: buildMonitoringStatusList(6),
    diesel1StatusList: buildDieselStatusList(6, 0, false),
    diesel2StatusList: buildDieselStatusList(6, 1, true),
    diesel1Detail: buildDieselDetailList(6, 0, false),
    diesel2Detail: buildDieselDetailList(6, 1, true)
};

function buildPcsStatusList(count: number) {
    return Array.from({ length: count }, (_, i) => {
          const charging = i % 3 !== 2;
          return {
                esmtOperYmd: '20260810',
                esmtOperTime: '1' + i + '0000',
                pcsOperStatus: charging ? '충전' : '방전',
                pcsPaL1: Number((152.4 + i * 2).toFixed(1)),
                pcsPtpvL12: 380.2,
                pcsAtpTot: charging ? Number((42 + i * 8).toFixed(1)) : 0,
                pcsDcP: charging ? 0 : Number((28 + i * 6).toFixed(1))
          };
    });
}

function buildBatteryStatusList(count: number) {
    return Array.from({ length: count }, (_, i) => ({
          esmtOperYmd: '20260810',
          esmtOperTime: '1' + i + '0000',
          batAvgSoc: Number((52 + i * 3).toFixed(1)),
          batAvgSoh: 96.0,
          batAvgDcv: 809.2,
          batAvgDca: Number((40.3 + i).toFixed(1)),
          batAvgRakv: 483.6,
          batAvgRaka: Number((118.9 + i).toFixed(1)),
          batAvgCelv: 3.65,
          batAvgCela: Number((118.9 + i).toFixed(1)),
          batAvgPaktmp: Number((24.3 + i * 0.2).toFixed(1)),
          batMaxRakv: 486.2, batMinRakv: 480.9, maxRakvRakno: 3, minRakvRakno: 1,
          batMaxRaka: Number((124.6 + i).toFixed(1)), batMinRaka: Number((112.1 + i).toFixed(1)), maxRakaRakno: 2, minRakaRakno: 4,
          batMaxCelv: 3.68, batMinCelv: 3.61, maxCelvRakno: 5, minCelvRakno: 2,
          batMaxCela: Number((124.6 + i).toFixed(1)), batMinCela: Number((112.1 + i).toFixed(1)), maxCelaRakno: 6, minCelaRakno: 3,
          batMaxPaktmp: Number((25.8 + i * 0.2).toFixed(1)), maxPaktmpRakno: 4
    }));
}

export const mockPcsChargeDischargeStatus = {
    pcsLatest: buildMonitoringLatest(),
    batteryLatest: buildMonitoringLatest(),
    pcsStatusList: buildPcsStatusList(6),
    batteryStatusList: buildBatteryStatusList(6)
};

const POWER_CONSUMPTION_BANK_COUNT = 5;

function buildPowerConsumptionBankSeries(index: number) {
    const base = 62.4 + index * 3;
    return Array.from({ length: 6 }, (_, i) => ({
          esmtOperYmd: '20260810',
          esmtOperTime: '1' + i + '0000',
          pcActive: Number((base + i * 1.1).toFixed(1)),
          pcFreq: 60.0,
          pcPf: 0.96
    }));
}

function buildPowerConsumptionBankDetail(index: number) {
    const base = 62.4 + index * 3;
    return Array.from({ length: 6 }, (_, i) => ({
          esmtOperTime: '1' + i + '0000',
          pcStat: '정상',
          pcVtg: 380.2,
          pcCur: Number((92.4 + index * 4 + i).toFixed(1)),
          pcActive: Number((base + i * 1.1).toFixed(1)),
          pcReactive: Number((4.1 + i * 0.1).toFixed(1)),
          pcPf: 0.96,
          pcFreq: 60.0,
          pcDayActive: Number((642.4 + index * 20 + i * 8).toFixed(1)),
          pcDayReactive: Number((42.1 + index * 2 + i).toFixed(1)),
          pcTotalActive: Number((96820.4 + index * 120).toFixed(1)),
          pcTotalReactive: Number((6820.4 + index * 40).toFixed(1))
    }));
}

const powerConsumptionBankSeriesMap = Object.fromEntries(
      Array.from({ length: POWER_CONSUMPTION_BANK_COUNT }, (_, i) => [`bank-${i + 1}`, buildPowerConsumptionBankSeries(i)])
);
const powerConsumptionBankDetailByEquipment = Object.fromEntries(
      Array.from({ length: POWER_CONSUMPTION_BANK_COUNT }, (_, i) => [`bank-${i + 1}`, buildPowerConsumptionBankDetail(i)])
);

export const mockPowerConsumptionStatus = {
    bankList: Array.from({ length: POWER_CONSUMPTION_BANK_COUNT }, (_, i) => ({ targetId: `bank-${i + 1}`, targetName: `BANK ${i + 1}` })),
    bankSeriesMap: powerConsumptionBankSeriesMap,
    bankDetailByEquipment: powerConsumptionBankDetailByEquipment
};

export const mockAcStatus = {
    latest: { esmtOperYmd: '20260810', esmtOperTime: '143000', acOperStuscd: '02', acSuplyAirtmp: 18.4, acRtnAirtmp: 24.1, acRtnAirhum: 46 },
    statusList: Array.from({ length: 4 }, (_, i) => ({
          esmtOperYmd: '20260810', esmtOperTime: '1' + i + '0000', acOperStuscd: '02',
          acSuplyAirtmp: 18 + i * 0.4, acRtnAirtmp: 24 + i * 0.3, acRtnAirhum: 44 + i
    }))
};
