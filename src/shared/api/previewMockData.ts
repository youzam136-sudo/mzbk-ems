// Preview mock data: used when the real backend is unreachable so screens still render sample numbers.
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

export const mockBaseGenerationStatus = {
    latest: {
          esmtOperYmd: '20260810', esmtOperTime: '143000',
          baPtpvL12: 380.2, baPtpvL23: 379.8, baPtpvL31: 380.5, baPtpvL1n: 219.4, baPtpvL2n: 219.1, baPtptL3n: 219.6,
          baPfrL1: 60.0, baPfrL2: 60.0, baPfrL3: 60.0, baPaL1: 152.4, baPaL2: 151.1, baPaL3: 151.7,
          baAtpL1: 96.4, baAtpL2: 95.8, baAtpL3: 96.1, baAtpTot: 288.3, baRtpTot: 24.1, baArpTot: 289.3, baPfTot: 0.97,
          baAtpDayAccm: 2846.2, baAtpWeekAccm: 18642.4, baAtpMonAccm: 78642.1, baAtpTotAccm: 942681.4,
          baRtpDayAccm: 186.4, baRtpWeekAccm: 1284.2, baRtpMonAccm: 4862.1, baRtpTotAccm: 68421.4, lgldGbcd: 100
    },
    statusList: buildMonitoringStatusList(6),
    detailList: [],
    targetList: [{ targetId: 'T1', targetName: 'base plant' }],
    selectedTargetId: 'T1'
};

export const mockSupportGenerationStatus = {
    essLatest: buildMonitoringLatest(),
    diesel1Latest: buildMonitoringLatest(),
    diesel2Latest: Object.assign(buildMonitoringLatest(), { value1: 0, remark: 'stop' }),
    essStatusList: buildMonitoringStatusList(4),
    diesel1StatusList: buildMonitoringStatusList(4),
    diesel2StatusList: buildMonitoringStatusList(4)
};

export const mockPcsChargeDischargeStatus = {
    pcsLatest: buildMonitoringLatest(),
    batteryLatest: buildMonitoringLatest(),
    pcsStatusList: buildMonitoringStatusList(5),
    batteryStatusList: buildMonitoringStatusList(5)
};

export const mockPowerConsumptionStatus = {
    gridLatest: buildMonitoringLatest(),
    essLatest: buildMonitoringLatest(),
    pcsLatest: buildMonitoringLatest(),
    diesel1Latest: buildMonitoringLatest(),
    diesel2Latest: Object.assign(buildMonitoringLatest(), { value1: 0, remark: 'stop' }),
    gridStatusList: buildMonitoringStatusList(6)
};

export const mockAcStatus = {
    latest: { esmtOperYmd: '20260810', esmtOperTime: '143000', acOperStuscd: '02', acSuplyAirtmp: 18.4, acRtnAirtmp: 24.1, acRtnAirhum: 46 },
    statusList: Array.from({ length: 4 }, (_, i) => ({
          esmtOperYmd: '20260810', esmtOperTime: '1' + i + '0000', acOperStuscd: '02',
          acSuplyAirtmp: 18 + i * 0.4, acRtnAirtmp: 24 + i * 0.3, acRtnAirhum: 44 + i
    }))
};
