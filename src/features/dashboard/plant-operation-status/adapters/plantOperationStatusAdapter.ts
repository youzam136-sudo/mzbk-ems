import type { PlantOperationStatusData, PlantOperationTargetOption, PlantOperationValueRow } from '../types/plantOperationStatus';
import type {
  DieselStatusResponseDto,
  EssStatusResponseDto,
  GridStatusResponseDto,
  PlantOperationStatusLatestResponse,
  PcsStatusResponseDto
} from '../api/plantOperationStatusApi';

type NumberLike = string | number | null | undefined;

const EMPTY_VALUE = '-';

const operationStatusLabelMap: Record<string, string> = {
  '01': '정지',
  '02': '정상',
  '03': '이상'
};

const inverterNodes = Array.from({ length: 7 }, (_, index) => {
  const order = String(index + 1).padStart(2, '0');

  return {
    id: `ivt-${index + 1}`,
    label: `IVT #${order}`
  };
});

function getRawValue(value: NumberLike) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toNumber(value: NumberLike) {
  const rawValue = getRawValue(value).replace(/,/g, '');

  if (!rawValue) {
    return null;
  }

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function getFractionDigits(value: NumberLike, fallbackDigits = 1) {
  const rawValue = getRawValue(value);
  const fractionPart = rawValue.includes('.') ? rawValue.split('.')[1] : '';

  return fractionPart ? Math.min(fractionPart.length, 2) : fallbackDigits;
}

function formatNumber(value: NumberLike, fallbackDigits = 1) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return EMPTY_VALUE;
  }

  const fractionDigits = getFractionDigits(value, fallbackDigits);

  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(numericValue);
}

function formatUnit(value: NumberLike, unit: string, fallbackDigits = 1) {
  const formattedValue = formatNumber(value, fallbackDigits);

  return formattedValue === EMPTY_VALUE ? formattedValue : `${formattedValue}${unit}`;
}

function formatPercent(value: NumberLike) {
  return formatUnit(value, '%');
}

function formatPowerFactor(value: NumberLike) {
  const numericValue = toNumber(value);

  if (numericValue === null) {
    return EMPTY_VALUE;
  }

  const normalizedValue = numericValue > 1 ? numericValue / 100 : numericValue;

  return normalizedValue.toFixed(2);
}

function formatStatusCode(value: NumberLike) {
  const rawValue = getRawValue(value);

  if (!rawValue) {
    return EMPTY_VALUE;
  }

  return operationStatusLabelMap[rawValue] ?? rawValue;
}

function createValueRow(label: string, value: string): PlantOperationValueRow {
  return { label, value };
}

function readField(source: object, key: string) {
  return (source as Record<string, NumberLike>)[key];
}

function createPowerRows(source: GridStatusResponseDto | EssStatusResponseDto | PcsStatusResponseDto | DieselStatusResponseDto, prefix: 'ba' | 'ess' | 'pcs' | 'dsl') {
  const triple = (values: NumberLike[]) => {
    const formattedValues = values.map((value) => formatNumber(value));
    return [formattedValues[0], formattedValues[1], formattedValues[2]] as [string, string, string];
  };

  return [
    { label: 'P [kW]', values: triple([readField(source, `${prefix}AtpTot`), readField(source, `${prefix}RtpTot`), readField(source, `${prefix}ArpTot`)]) },
    { label: 'V [V]', values: triple([readField(source, `${prefix}PtpvL12`), readField(source, `${prefix}PtpvL23`), readField(source, `${prefix}PtpvL31`)]) },
    { label: 'A [A]', values: triple([readField(source, `${prefix}PaL1`), readField(source, `${prefix}PaL2`), readField(source, `${prefix}PaL3`)]) },
    { label: 'FR [Hz]', values: triple([readField(source, `${prefix}PfrL1`), readField(source, `${prefix}PfrL2`), readField(source, `${prefix}PfrL3`)]) }
  ];
}

function createBank(id: string, name: string, currentKw: NumberLike, accumulatedKw: NumberLike, powerFactor: NumberLike) {
  return {
    id,
    name,
    rows: [
      { label: 'P [kW]', value: formatNumber(currentKw) },
      { label: 'P [kVar]', value: '-' },
      { label: 'DAY [kWh]', value: formatNumber(accumulatedKw) },
      { label: 'PF [%]', value: formatPowerFactor(powerFactor) }
    ]
  };
}

function createDieselRows(source: DieselStatusResponseDto) {
  return [
    createValueRow('P', formatUnit(source.dslAtpTot, ' kW')),
    createValueRow('V', formatUnit(source.dslPtpvL12, ' V')),
    createValueRow('A', formatUnit(source.dslPaL1, ' A')),
    createValueRow('PF', formatPowerFactor(source.dslPfTot)),
    createValueRow('Freq', formatUnit(source.dslPfrL1, ' Hz')),
    createValueRow('RPM', formatNumber(source.dslEgnRpm)),
    createValueRow('FUEL', formatPercent(source.dslFuelLvl)),
    createValueRow('CoolTmp', formatUnit(source.dslClntTmp, '℃')),
    createValueRow('OilTmp', formatUnit(source.dslOilTmp, '℃')),
    createValueRow('OilPres', formatUnit(source.dslOilPrsr, ' bar'))
  ];
}

function createTargetOptions(targets: PlantOperationStatusLatestResponse['targets']): PlantOperationTargetOption[] {
  return targets
    .map((target, index) => {
      const targetId = getRawValue(target.targetId) || `target-${index + 1}`;
      const targetName = getRawValue(target.targetName) || `대상 #${index + 1}`;

      return { targetId, targetName };
    })
    .filter((target) => target.targetId);
}

/*
 * 필요: monitoring API 응답을 기존 발전소 운영현황 ViewModel로 변환한다.
 * 연결: usePlantOperationStatus, PlantOperationDiagramSection.
 * 설명: 화면 값 하드코딩은 제거하고, API null/빈값은 여기서 '-'로 정리하며 targetList는 조회 대상 옵션으로 분리한다.
 * 수정: API 필드 의미나 조회 대상 표시명이 바뀌면 화면 TSX가 아니라 이 adapter의 매핑만 수정한다.
 */
export function toPlantOperationStatusData(response: PlantOperationStatusLatestResponse): PlantOperationStatusData {
  const { grid, ess, pcs, battery, diesel1, diesel2, ac } = response;

  return {
    banks: [
      createBank('bank-1', 'Bank #1', grid.baAtpTot, grid.baAtpTotAccm ?? grid.baAtpDayAccm, grid.baPfTot),
      createBank('bank-2', 'Bank #2', ess.essAtpTot, ess.essAtpTotAccm ?? ess.essAtpDayAccm, ess.essPfTot),
      createBank('bank-3', 'Bank #3', pcs.pcsAtpTot, pcs.pcsAtpMonAccm ?? pcs.pcsAtpDayAccm, pcs.pcsPfTot),
      createBank('bank-4', 'Bank #4', diesel1.dslAtpTot, diesel1.dslAtpTotAccm ?? diesel1.dslAtpDayAccm, diesel1.dslPfTot),
      createBank('bank-5', 'Bank #5', diesel2.dslAtpTot, diesel2.dslAtpTotAccm ?? diesel2.dslAtpDayAccm, diesel2.dslPfTot)
    ],
    targetOptions: createTargetOptions(response.targets),
    topAuxiliaryTables: [
      {
        id: 'air-conditioner',
        title: 'A/C 상태',
        placement: 'bank-collector-left',
        rows: [
          createValueRow('A/C 상태', formatStatusCode(ac.acOperStuscd)),
          createValueRow('A/C 배출공기 온도', formatUnit(ac.acSuplyAirtmp, '℃')),
          createValueRow('온도(℃)', formatUnit(ac.acRtnAirtmp, '℃')),
          createValueRow('습도(%)', formatPercent(ac.acRtnAirhum))
        ]
      }
    ],
    btb: {
      id: 'main-btb',
      nodeLabel: 'AGC-BTB',
      pf: formatPercent(grid.baPfTot),
      rows: createPowerRows(grid, 'ba')
    },
    solar: {
      id: 'solar-agc',
      nodeLabel: 'AGC-Solar',
      pf: formatPercent(grid.baPfTot),
      rows: createPowerRows(grid, 'ba')
    },
    storageBtb: {
      id: 'storage-btb',
      nodeLabel: 'AGC-BTB',
      pf: formatPercent(ess.essPfTot),
      rows: createPowerRows(ess, 'ess')
    },
    pcs: {
      id: 'pcs',
      nodeLabel: 'PCS',
      rows: [
        createValueRow('STATUS', formatStatusCode(pcs.pcsOperStatus)),
        createValueRow('DC V', formatNumber(pcs.pcsDcV)),
        createValueRow('DC A', formatNumber(pcs.pcsDcA)),
        createValueRow('MDL.T(℃)', formatUnit(pcs.pcsMdlTemp, '℃')),
        createValueRow('ABNT.T (℃)', formatUnit(pcs.pcsAbntTemp, '℃')),
        createValueRow('CABN.T (℃)', formatUnit(pcs.pcsCbntTemp, '℃'))
      ]
    },
    battery: {
      id: 'battery',
      nodeLabel: '배터리',
      summary: [createValueRow('SoC(%)', formatNumber(battery.batAvgSoc)), createValueRow('SoH(%)', formatNumber(battery.batAvgSoh))],
      groups: [
        {
          title: 'RACK V',
          metrics: [
            createValueRow('MAX', formatNumber(battery.batMaxRakv)),
            createValueRow('MIN', formatNumber(battery.batMinRakv)),
            createValueRow('AVG', formatNumber(battery.batAvgRakv))
          ]
        },
        {
          title: 'RACK A',
          metrics: [
            createValueRow('MAX', formatNumber(battery.batMaxRaka)),
            createValueRow('MIN', formatNumber(battery.batMinRaka)),
            createValueRow('AVG', formatNumber(battery.batAvgRaka))
          ]
        },
        {
          title: 'PACK Temp',
          metrics: [
            createValueRow('MAX', formatUnit(battery.batMaxPaktmp, '℃')),
            createValueRow('MIN', formatUnit(battery.batMinPaktmp, '℃')),
            createValueRow('AVG', formatUnit(battery.batAvgPaktmp, '℃'))
          ]
        }
      ]
    },
    generators: [
      {
        id: 'diesel-1',
        agcLabel: 'AGC-GEN',
        equipmentLabel: '디젤 #01',
        rows: createDieselRows(diesel1)
      },
      {
        id: 'diesel-2',
        agcLabel: 'AGC-GEN',
        equipmentLabel: '디젤 #02',
        rows: createDieselRows(diesel2)
      }
    ],
    inverters: inverterNodes
  };
}
