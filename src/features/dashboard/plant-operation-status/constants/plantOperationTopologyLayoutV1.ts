import type {
  PlantOperationCanvasLayout,
  PlantOperationConnectionRule,
  PlantOperationGridPlacement,
  PlantOperationTopologyLabelBlock
} from '../types/plantOperationStatus';

type NodePairPlacement = {
  labelLayout: PlantOperationGridPlacement;
  tableLayout: PlantOperationGridPlacement;
};

type BankPlacement = {
  tableLayout: PlantOperationGridPlacement;
  labelLayout: PlantOperationGridPlacement;
};

type GeneratorPlacement = {
  agcLayout: PlantOperationGridPlacement;
  tableLayout: PlantOperationGridPlacement;
  equipmentLayout: PlantOperationGridPlacement;
};

export type PlantOperationTopologyPlacements = {
  banks: Record<string, BankPlacement>;
  topAuxiliaryTables: Record<string, PlantOperationGridPlacement>;
  mainBtbLabel: PlantOperationTopologyLabelBlock;
  btb: NodePairPlacement;
  solar: NodePairPlacement;
  storageBtb: NodePairPlacement;
  pcs: NodePairPlacement;
  battery: NodePairPlacement;
  generators: Record<string, GeneratorPlacement>;
  inverters: Record<string, PlantOperationGridPlacement>;
};

/*
 * 필요: 발전소 운영현황 판의 기준점과 선 연결 규칙.
 * 연결: PlantOperationDiagramSection, plantOperationStatus API view model.
 * 설명: 조회값과 분리해 값 교체 시 배치 기준이 흔들리지 않게 한다.
 * 수정: 칸 단위, 위치, 선 분배 기준은 이 파일에서만 조정한다.
 */
export const plantOperationCanvasLayout: PlantOperationCanvasLayout = {
  columnWidth: 27,
  columnGap: 0,
  rowHeight: 30,
  rowGap: 0
};

export const plantOperationTopologyPlacements: PlantOperationTopologyPlacements = {
  banks: {
    'bank-1': {
      tableLayout: { colStart: 16, colSpan: 10, rowStart: 2, rowSpan: 5, anchorColumn: 21 },
      labelLayout: { colStart: 16, colSpan: 10, rowStart: 8, rowSpan: 2, anchorColumn: 21 }
    },
    'bank-2': {
      tableLayout: { colStart: 29, colSpan: 10, rowStart: 2, rowSpan: 5, anchorColumn: 34 },
      labelLayout: { colStart: 29, colSpan: 10, rowStart: 8, rowSpan: 2, anchorColumn: 34 }
    },
    'bank-3': {
      tableLayout: { colStart: 42, colSpan: 10, rowStart: 2, rowSpan: 5, anchorColumn: 47 },
      labelLayout: { colStart: 42, colSpan: 10, rowStart: 8, rowSpan: 2, anchorColumn: 47 }
    },
    'bank-4': {
      tableLayout: { colStart: 55, colSpan: 10, rowStart: 2, rowSpan: 5, anchorColumn: 60 },
      labelLayout: { colStart: 55, colSpan: 10, rowStart: 8, rowSpan: 2, anchorColumn: 60 }
    },
    'bank-5': {
      tableLayout: { colStart: 68, colSpan: 10, rowStart: 2, rowSpan: 5, anchorColumn: 73 },
      labelLayout: { colStart: 68, colSpan: 10, rowStart: 8, rowSpan: 2, anchorColumn: 73 }
    }
  },
  topAuxiliaryTables: {
    'air-conditioner': { colStart: 3, colSpan: 16, rowStart: 16, rowSpan: 7, anchorColumn: 11 }
  },
  mainBtbLabel: {
    id: 'main-btb-label',
    label: 'AGC-BTB',
    layout: { colStart: 33, colSpan: 8, rowStart: 16, rowSpan: 2, anchorColumn: 37 }
  },
  btb: {
    labelLayout: { colStart: 33, colSpan: 8, rowStart: 16, rowSpan: 2, anchorColumn: 37 },
    tableLayout: { colStart: 43, colSpan: 18, rowStart: 15, rowSpan: 6, anchorColumn: 52 }
  },
  solar: {
    labelLayout: { colStart: 3, colSpan: 8, rowStart: 28, rowSpan: 2, anchorColumn: 7 },
    tableLayout: { colStart: 14, colSpan: 20, rowStart: 27, rowSpan: 7, anchorColumn: 24 }
  },
  storageBtb: {
    labelLayout: { colStart: 38, colSpan: 8, rowStart: 28, rowSpan: 2, anchorColumn: 42 },
    tableLayout: { colStart: 49, colSpan: 24, rowStart: 27, rowSpan: 7, anchorColumn: 61 }
  },
  pcs: {
    labelLayout: { colStart: 38, colSpan: 8, rowStart: 39, rowSpan: 2, anchorColumn: 42 },
    tableLayout: { colStart: 49, colSpan: 10, rowStart: 37, rowSpan: 11, anchorColumn: 54 }
  },
  battery: {
    labelLayout: { colStart: 38, colSpan: 8, rowStart: 56, rowSpan: 2, anchorColumn: 42 },
    tableLayout: { colStart: 49, colSpan: 26, rowStart: 55, rowSpan: 5, anchorColumn: 62 }
  },
  generators: {
    'diesel-1': {
      agcLayout: { colStart: 77, colSpan: 6, rowStart: 30, rowSpan: 2, anchorColumn: 80 },
      tableLayout: { colStart: 87, colSpan: 9, rowStart: 25, rowSpan: 14, anchorColumn: 91.5 },
      equipmentLayout: { colStart: 77, colSpan: 6, rowStart: 41, rowSpan: 2, anchorColumn: 80 }
    },
    'diesel-2': {
      agcLayout: { colStart: 98, colSpan: 6, rowStart: 30, rowSpan: 2, anchorColumn: 101 },
      tableLayout: { colStart: 108, colSpan: 9, rowStart: 25, rowSpan: 14, anchorColumn: 112.5 },
      equipmentLayout: { colStart: 98, colSpan: 6, rowStart: 41, rowSpan: 2, anchorColumn: 101 }
    }
  },
  inverters: {
    'ivt-1': { colStart: 3, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 5 },
    'ivt-2': { colStart: 8, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 10 },
    'ivt-3': { colStart: 13, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 15 },
    'ivt-4': { colStart: 18, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 20 },
    'ivt-5': { colStart: 23, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 25 },
    'ivt-6': { colStart: 28, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 30 },
    'ivt-7': { colStart: 33, colSpan: 4, rowStart: 43, rowSpan: 2, anchorColumn: 35 }
  }
};

export const plantOperationConnectionRules: PlantOperationConnectionRule[] = [
  {
    id: 'banks-to-main-btb',
    kind: 'collector',
    fromIds: ['bank-1', 'bank-2', 'bank-3', 'bank-4', 'bank-5'],
    toId: 'main-btb-label',
    busRow: 12.5,
    busPaddingColumns: 1.5
  },
  {
    id: 'main-btb-to-branches',
    kind: 'split',
    fromId: 'main-btb-label',
    toIds: ['solar-agc-label', 'storage-btb-label', 'diesel-1-agc-label', 'diesel-2-agc-label'],
    busRow: 24,
    busPaddingColumns: 1.5
  },
  {
    id: 'solar-to-inverters',
    kind: 'split',
    fromId: 'solar-agc-label',
    toIds: ['ivt-1', 'ivt-2', 'ivt-3', 'ivt-4', 'ivt-5', 'ivt-6', 'ivt-7'],
    busRow: 40,
    busPaddingColumns: 1.5,
    toAnchor: 'center'
  },
  {
    id: 'storage-btb-to-battery',
    kind: 'chain',
    nodeIds: ['storage-btb-label', 'pcs-label', 'battery-label'],
    toAnchor: 'center'
  },
  {
    id: 'diesel-1-chain',
    kind: 'chain',
    nodeIds: ['diesel-1-agc-label', 'diesel-1-equipment-label'],
    toAnchor: 'center'
  },
  {
    id: 'diesel-2-chain',
    kind: 'chain',
    nodeIds: ['diesel-2-agc-label', 'diesel-2-equipment-label'],
    toAnchor: 'center'
  }
];
