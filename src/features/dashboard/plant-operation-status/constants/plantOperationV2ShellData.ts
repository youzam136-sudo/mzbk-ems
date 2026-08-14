import type { PlantOperationStatusData, PlantOperationValueRow } from '../types/plantOperationStatus';

const EMPTY_PLACEHOLDER = '00/00/00';
const EMPTY_PERCENT = '00.0';

function row(label: string, value = EMPTY_PLACEHOLDER): PlantOperationValueRow {
  return { label, value };
}

const powerRows = [
  { label: 'P [kW]', values: [EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER] as [string, string, string] },
  { label: 'V [V]', values: [EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER] as [string, string, string] },
  { label: 'A [A]', values: [EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER] as [string, string, string] },
  { label: 'FR [Hz]', values: [EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER, EMPTY_PLACEHOLDER] as [string, string, string] }
];

const dieselRows = ['P [kW]', 'V [V]', 'A [A]', 'FR [Hz]', 'PF [%]', 'RPM', 'FUEL [%]', 'Cool [°C]', 'Oil [°C]', 'Oil [Bar]'].map((label) => row(label, ''));

export const plantOperationV2ShellData: PlantOperationStatusData = {
  banks: Array.from({ length: 5 }, (_, index) => ({
    id: `bank-${index + 1}`,
    name: `Bank #${index + 1}`,
    rows: [
      { label: 'P [kW]', value: '' },
      { label: 'P [kVar]', value: '' },
      { label: 'DAY [kWh]', value: '' },
      { label: 'PF [%]', value: '' }
    ]
  })),
  targetOptions: [],
  topAuxiliaryTables: [
    {
      id: 'air-conditioner',
      title: '',
      placement: 'bank-collector-left',
      rows: [
        row('대기온도[℃]', '24.1'),
        row('대기습도[%]', '46.0'),
        row('수직 [W/m²]', '-'),
        row('수평 [W/m²]', '-')
      ]
    },
    {
      id: 'ac-status',
      title: '',
      placement: 'bank-collector-left',
      rows: [
        row('A/C STAT', ''),
        row('A/C[℃]', ''),
        row('온도[℃]', ''),
        row('습도[%]', '')
      ]
    }
  ],
  btb: {
    id: 'main-btb',
    nodeLabel: 'MAIN',
    pf: EMPTY_PERCENT,
    rows: powerRows
  },
  solar: {
    id: 'solar-agc',
    nodeLabel: 'SOLAR',
    pf: EMPTY_PERCENT,
    rows: powerRows
  },
  storageBtb: {
    id: 'storage-btb',
    nodeLabel: 'ESS',
    pf: EMPTY_PERCENT,
    rows: powerRows
  },
  pcs: {
    id: 'pcs',
    nodeLabel: 'PCS',
    rows: [row('STAT', ''), row('DC V[V]', ''), row('DC A[A]', ''), row('AC V[V]', ''), row('AC A[A]', ''), row('TMP[°C]', '')]
  },
  battery: {
    id: 'battery',
    nodeLabel: 'BATT',
    summary: [row('SoC[%]', ''), row('SoH[%]', '')],
    groups: [
      {
        title: 'TOTAL',
        metrics: [row('V[V]', ''), row('A[A]', ''), row('TMP[°C]', '')]
      }
    ]
  },
  generators: [
    {
      id: 'diesel-1',
      agcLabel: 'DG #1',
      equipmentLabel: 'DG #1',
      rows: dieselRows
    },
    {
      id: 'diesel-2',
      agcLabel: 'DG #2',
      equipmentLabel: 'DG #2',
      rows: dieselRows
    }
  ],
  inverters: Array.from({ length: 7 }, (_, index) => {
    const order = String(index + 1).padStart(2, '0');

    return {
      id: `ivt-${index + 1}`,
      label: `IVT #${order}`
    };
  })
};
