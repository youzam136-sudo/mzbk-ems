import {
  EMPTY_API_VALUE,
  formatApiNumber,
  formatApiPercent,
  formatApiPowerFactor,
  getRawValue
} from '../../../../shared/api/apiDataUtils';
import { plantOperationV2ShellData } from '../constants/plantOperationV2ShellData';
import type { PlantOperationStatusData, PlantOperationTripletRow, PlantOperationValueRow } from '../types/plantOperationStatus';
import type {
  PlantOperationV2AcDto,
  PlantOperationV2BankDto,
  PlantOperationV2BatteryDto,
  PlantOperationV2DashboardResponse,
  PlantOperationV2DieselDto,
  PlantOperationV2InverterDto,
  PlantOperationV2PcsDto,
  PlantOperationV2PowerDto,
  PlantOperationV2StorageDto
} from '../api/plantOperationV2Api';
import type { ApiScalar } from '../../../../shared/api/apiDataUtils';

const STATUS_LABELS: Record<string, string> = {
  '01': '정지',
  '02': '정상',
  '03': '이상'
};

function valueRow(label: string, value: string): PlantOperationValueRow {
  return { label, value };
}

function firstValue(...values: ApiScalar[]) {
  return values.find((value) => getRawValue(value) !== '');
}

function formatStatus(value: ApiScalar) {
  const rawValue = getRawValue(value);

  if (!rawValue) {
    return EMPTY_API_VALUE;
  }

  return STATUS_LABELS[rawValue] ?? rawValue;
}

/*
 * 필요: 설비 ON/OFF 상태(설비명 색상: ON=적색, OFF=회색)를 판정한다.
 * 수정: 설비별 가동 판정 기준이 API 상태코드로 확정되면 이 함수 대신 해당 필드로 직접 매핑한다.
 */
function deriveStatusFromCode(value: ApiScalar): 'on' | 'off' | undefined {
  const rawValue = getRawValue(value);

  if (!rawValue) {
    return undefined;
  }

  return rawValue === '02' ? 'on' : 'off';
}

function deriveStatusFromPower(...values: ApiScalar[]): 'on' | 'off' | undefined {
  const numericValue = values.map((value) => getRawValue(value)).find((raw) => raw !== '');

  if (numericValue === undefined) {
    return undefined;
  }

  return Number(numericValue) !== 0 ? 'on' : 'off';
}

function tripletRow(label: string, values: ApiScalar[]): PlantOperationTripletRow {
  const formattedValues = values.map((value) => formatApiNumber(value));

  return { label, values: [formattedValues[0], formattedValues[1], formattedValues[2]] };
}

function createPowerRows(source: PlantOperationV2PowerDto | null | undefined) {
  return [
    tripletRow('P [kW]', [source?.activePower, source?.reactivePower, source?.apparentPower]),
    tripletRow('V [V]', [source?.voltageL12, source?.voltageL23, source?.voltageL31]),
    tripletRow('A [A]', [source?.currentL1, source?.currentL2, source?.currentL3]),
    tripletRow('FR [Hz]', [source?.frequencyL1, source?.frequencyL2, source?.frequencyL3])
  ];
}

function createStorageRows(source: PlantOperationV2StorageDto | null | undefined) {
  return [
    tripletRow('P [kW]', [source?.nowKw, source?.nowKvar, undefined]),
    tripletRow('V [V]', [undefined, undefined, undefined]),
    tripletRow('A [A]', [undefined, undefined, undefined]),
    tripletRow('FR [Hz]', [undefined, undefined, undefined])
  ];
}

function createBank(slotIndex: number, source: PlantOperationV2BankDto | undefined) {
  const slot = plantOperationV2ShellData.banks[slotIndex];

  return {
    id: slot.id,
    name: slot.name,
    status: deriveStatusFromPower(source?.activePower, source?.totalPower, source?.threePhasePower),
    rows: [
      valueRow('P [kW]', formatApiNumber(firstValue(source?.activePower, source?.totalPower, source?.threePhasePower))),
      valueRow('P [kVar]', formatApiNumber(source?.reactivePower)),
      valueRow('DAY [kWh]', EMPTY_API_VALUE),
      valueRow('PF [%]', formatApiPowerFactor(source?.pf))
    ]
  };
}

function createAcTable(source: PlantOperationV2AcDto | null | undefined) {
  const shell = plantOperationV2ShellData.topAuxiliaryTables[0];

  return {
    ...shell,
    rows: [
      valueRow('대기온도[℃]', formatApiNumber(source?.temperature)),
      valueRow('대기습도[%]', formatApiNumber(source?.humidity)),
      valueRow('수직 [W/m²]', EMPTY_API_VALUE),
      valueRow('수평 [W/m²]', EMPTY_API_VALUE)
    ]
  };
}

function createAcStatusTable(source: PlantOperationV2AcDto | null | undefined) {
  const shell = plantOperationV2ShellData.topAuxiliaryTables[1];

  return {
    ...shell,
    rows: [
      valueRow('A/C STAT', formatStatus(source?.status)),
      valueRow('A/C[℃]', formatApiNumber(source?.dischargeAirTemperature)),
      valueRow('온도[℃]', formatApiNumber(source?.temperature)),
      valueRow('습도[%]', formatApiPercent(source?.humidity))
    ]
  };
}

function createPowerPanel(shellKey: 'btb' | 'solar', source: PlantOperationV2PowerDto | null | undefined) {
  const shell = plantOperationV2ShellData[shellKey];

  return {
    ...shell,
    pf: formatApiPercent(source?.pf),
    rows: createPowerRows(source),
    status: deriveStatusFromPower(source?.activePower)
  };
}

function createStoragePanel(source: PlantOperationV2StorageDto | null | undefined) {
  const shell = plantOperationV2ShellData.storageBtb;

  return {
    ...shell,
    pf: formatApiPercent(firstValue(source?.nowPf, source?.dayPf)),
    rows: createStorageRows(source),
    status: deriveStatusFromCode(source?.status) ?? deriveStatusFromPower(source?.nowKw)
  };
}

function createPcs(source: PlantOperationV2PcsDto | null | undefined) {
  return {
    ...plantOperationV2ShellData.pcs,
    status: deriveStatusFromCode(source?.status),
    rows: [
      valueRow('STAT', formatStatus(source?.status)),
      valueRow('DC V[V]', formatApiNumber(source?.dcVoltage)),
      valueRow('DC A[A]', formatApiNumber(source?.dcCurrent)),
      valueRow('AC V[V]', formatApiNumber(firstValue(source?.voltageL12, source?.voltageL23, source?.voltageL31))),
      valueRow('AC A[A]', formatApiNumber(firstValue(source?.currentL1, source?.currentL2, source?.currentL3))),
      valueRow('TMP[°C]', formatApiNumber(source?.moduleTemp))
    ]
  };
}

function createBattery(source: PlantOperationV2BatteryDto | null | undefined) {
  return {
    ...plantOperationV2ShellData.battery,
    status: deriveStatusFromCode(source?.status),
    summary: [valueRow('SoC[%]', formatApiNumber(source?.soc)), valueRow('SoH[%]', formatApiNumber(source?.soh))],
    groups: [
      {
        title: 'TOTAL',
        metrics: [
          valueRow('V[V]', formatApiNumber(firstValue(source?.dcVoltage, source?.rackVoltageAvg))),
          valueRow('A[A]', formatApiNumber(firstValue(source?.dcCurrent, source?.rackCurrentAvg))),
          valueRow('TMP[°C]', formatApiNumber(source?.packTempAvg))
        ]
      }
    ]
  };
}

function createDieselRows(source: PlantOperationV2DieselDto | null | undefined) {
  if (!source) {
    return plantOperationV2ShellData.generators[1].rows.map((row) => valueRow(row.label, '-'));
  }

  return [
    valueRow('P [kW]', formatApiNumber(source.totalPower)),
    valueRow('V [V]', formatApiNumber(source.voltageL12)),
    valueRow('A [A]', formatApiNumber(source.currentL1)),
    valueRow('FR [Hz]', formatApiNumber(source.frequency)),
    valueRow('PF [%]', formatApiPowerFactor(source.pf)),
    valueRow('RPM', formatApiNumber(source.rpm)),
    valueRow('FUEL [%]', formatApiNumber(source.fuel)),
    valueRow('Cool [°C]', formatApiNumber(source.coolantTemp)),
    valueRow('Oil [°C]', formatApiNumber(source.oilTemp)),
    valueRow('Oil [Bar]', formatApiNumber(source.oilPress))
  ];
}

function getDieselSources(response: PlantOperationV2DashboardResponse) {
  const dieselSlots = Array<PlantOperationV2DieselDto | undefined>(plantOperationV2ShellData.generators.length).fill(undefined);

  function getSlotIndexBySerialNo(source: PlantOperationV2DieselDto) {
    const serialNo = getRawValue(source.serialNo).toUpperCase();
    const suffixMatch = serialNo.match(/(\d+)$/);

    if (!suffixMatch) {
      return -1;
    }

    const serialNumber = Number(suffixMatch[1]);

    if (serialNumber === 1) {
      return 0;
    }

    if (serialNumber === 2) {
      return 1;
    }

    return -1;
  }

  function assignSource(source: PlantOperationV2DieselDto | null | undefined, preferredIndex?: number) {
    if (!source) {
      return;
    }

    const serialSlotIndex = getSlotIndexBySerialNo(source);
    const slotIndex = serialSlotIndex >= 0 ? serialSlotIndex : preferredIndex;

    if (typeof slotIndex === 'number' && slotIndex >= 0 && slotIndex < dieselSlots.length) {
      dieselSlots[slotIndex] = source;
      return;
    }

    const fallbackIndex = dieselSlots.findIndex((slot) => !slot);

    if (fallbackIndex >= 0) {
      dieselSlots[fallbackIndex] = source;
    }
  }

  assignSource(response.diesel1, 0);
  assignSource(response.diesel2, 1);

  if (Array.isArray(response.diesel)) {
    response.diesel.forEach((source) => assignSource(source));
  } else {
    assignSource(response.diesel);
  }

  response.dieselList?.forEach((source) => assignSource(source));

  return dieselSlots;
}

function createGenerators(response: PlantOperationV2DashboardResponse) {
  const dieselSources = getDieselSources(response);

  return plantOperationV2ShellData.generators.map((slot, index) => ({
    ...slot,
    status: deriveStatusFromCode(dieselSources[index]?.status),
    rows: createDieselRows(dieselSources[index])
  }));
}

function isInactiveStatus(value: ApiScalar) {
  const rawValue = getRawValue(value).toUpperCase();

  return ['0', 'N', 'NO', 'OFF', 'STOP', 'STOPPED', 'IDLE', 'INACTIVE', '정지', '미가동'].includes(rawValue);
}

function hasInverterValue(source: PlantOperationV2InverterDto) {
  return [
    source.serialNo,
    source.inverterId,
    source.inverterName,
    source.status,
    source.dcPower,
    source.acPower,
    source.efficiency,
    source.activePower,
    source.reactivePower,
    source.apparentPower,
    source.pf,
    source.dailyActiveAccmPower,
    source.dailyReactiveAccmPower
  ].some((value) => getRawValue(value) !== '');
}

function isDisabledInverter(source: PlantOperationV2InverterDto | undefined) {
  if (!source) {
    return true;
  }

  if (isInactiveStatus(source.status)) {
    return true;
  }

  return !hasInverterValue(source);
}

function createInverterDetailRows(source: PlantOperationV2InverterDto | undefined) {
  return [
    valueRow('STAT', formatStatus(source?.status)),
    valueRow('AC [kW]', formatApiNumber(firstValue(source?.acPower, source?.activePower))),
    valueRow('DAY [kWh]', EMPTY_API_VALUE)
  ];
}

function getUniqueInverterSources(sources: PlantOperationV2InverterDto[] | undefined) {
  const uniqueSources: PlantOperationV2InverterDto[] = [];
  const seenKeys = new Set<string>();

  sources?.forEach((source, index) => {
    const key = getRawValue(source.serialNo) || getRawValue(source.inverterId) || getRawValue(source.inverterName) || `index-${index}`;

    if (seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    uniqueSources.push(source);
  });

  return uniqueSources;
}

function createInverter(slotIndex: number, source: PlantOperationV2InverterDto | undefined, includeDetailRows = false) {
  const slot = plantOperationV2ShellData.inverters[slotIndex];

  return {
    ...slot,
    label: slot.label,
    detailRows: includeDetailRows ? createInverterDetailRows(source) : undefined,
    disabled: isDisabledInverter(source),
    status: deriveStatusFromCode(source?.status)
  };
}

/*
 * 필요: 대시보드2 전용 `/dashboard/individual?groupBySerial=true` 응답을 기존 topology ViewModel에 값만 주입한다.
 * 연결: usePlantOperationV2Status, PlantOperationStatusPage, PlantOperationDiagramSection.
 * 설명: 좌표/선/슬롯 수는 `plantOperationV2ShellData`를 기준으로 유지하고, API가 제공한 앞쪽 값만 슬롯에 매핑한다.
 * 수정: Bank/IVT/디젤 다건 계약이 확정되면 슬롯 초과/부족 정책을 여기서만 조정한다.
 */
export function toPlantOperationV2StatusData(response: PlantOperationV2DashboardResponse): PlantOperationStatusData {
  return {
    banks: plantOperationV2ShellData.banks.map((_, index) => createBank(index, response.bankList?.[index])),
    targetOptions: [],
    topAuxiliaryTables: [createAcTable(response.ac), createAcStatusTable(response.ac)],
    btb: createPowerPanel('btb', response.btb),
    solar: createPowerPanel('solar', response.solar),
    storageBtb: createStoragePanel(response.storage),
    pcs: createPcs(response.pcs),
    battery: createBattery(response.battery),
    generators: createGenerators(response),
    inverters: plantOperationV2ShellData.inverters.map((_, index) => createInverter(index, response.inverterList?.[index], true))
  };
}

/*
 * 필요: 대시보드2 total 타입에서 인버터 상세표를 추가 표시한다.
 * 연결: usePlantOperationV2TotalStatus, PlantOperationTotalStatusPage.
 * 설명: `/dashboard/integrated?groupBySerial=true`의 unique inverter 6건만 사용하고, 7번째 슬롯은 빈값/disabled로 둔다.
 * 수정: Effi %는 efficiency만 사용하며 pf로 대체하지 않는다.
 */
export function toPlantOperationV2TotalStatusData(response: PlantOperationV2DashboardResponse): PlantOperationStatusData {
  const inverterSources = getUniqueInverterSources(response.inverterList);

  return {
    banks: plantOperationV2ShellData.banks.map((_, index) => createBank(index, response.bankList?.[index])),
    targetOptions: [],
    topAuxiliaryTables: [createAcTable(response.ac), createAcStatusTable(response.ac)],
    btb: createPowerPanel('btb', response.btb),
    solar: createPowerPanel('solar', response.solar),
    storageBtb: createStoragePanel(response.storage),
    pcs: createPcs(response.pcs),
    battery: createBattery(response.battery),
    generators: createGenerators(response),
    inverters: plantOperationV2ShellData.inverters.map((_, index) => createInverter(index, inverterSources[index], true))
  };
}
