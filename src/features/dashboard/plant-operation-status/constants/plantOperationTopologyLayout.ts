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
  inverterDetails?: Record<string, PlantOperationGridPlacement>;
  inverterMatrix?: PlantOperationGridPlacement;
};

function pixelPlacement(x: number, y: number, width: number, height: number, anchorX = width / 2): PlantOperationGridPlacement {
  return {
    colStart: x + 1,
    colSpan: width,
    rowStart: y + 1,
    rowSpan: height,
    anchorColumn: x + 1 + anchorX
  };
}

function pixelBusRow(y: number) {
  return y + 1;
}

/*
 * 필요: 발전소 운영현황 판의 기준점과 선 연결 규칙.
 * 연결: PlantOperationDiagramSection, plantOperationStatus API view model.
 * 설명: 조회값과 분리해 값 교체 시 배치 기준이 흔들리지 않게 한다.
 * 수정: 칸 단위, 위치, 선 분배 기준은 이 파일에서만 조정한다.
 */
export const plantOperationCanvasLayout: PlantOperationCanvasLayout = {
  columnWidth: 1,
  columnGap: 0,
  rowHeight: 1,
  rowGap: 0
};

export const plantOperationTopologyPlacements: PlantOperationTopologyPlacements = {
  banks: {
    'bank-1': {
      labelLayout: pixelPlacement(307, 8, 204, 28),
      tableLayout: pixelPlacement(307, 36, 204, 92)
    },
    'bank-2': {
      labelLayout: pixelPlacement(527, 8, 204, 28),
      tableLayout: pixelPlacement(527, 36, 204, 92)
    },
    'bank-3': {
      labelLayout: pixelPlacement(747, 8, 204, 28),
      tableLayout: pixelPlacement(747, 36, 204, 92)
    },
    'bank-4': {
      labelLayout: pixelPlacement(967, 8, 204, 28),
      tableLayout: pixelPlacement(967, 36, 204, 92)
    },
    'bank-5': {
      labelLayout: pixelPlacement(1187, 8, 204, 28),
      tableLayout: pixelPlacement(1187, 36, 204, 92)
    }
  },
  topAuxiliaryTables: {
    'air-conditioner': pixelPlacement(2, 148, 260, 112),
    'ac-status': pixelPlacement(906, 402, 196, 140)
  },
  mainBtbLabel: {
    id: 'main-btb-label',
    label: 'MAIN',
    layout: pixelPlacement(575, 148, 110, 112)
  },
  btb: {
    labelLayout: pixelPlacement(575, 148, 110, 112),
    tableLayout: pixelPlacement(702, 148, 400, 112)
  },
  solar: {
    labelLayout: pixelPlacement(2, 276, 110, 112),
    tableLayout: pixelPlacement(126, 276, 400, 112)
  },
  storageBtb: {
    labelLayout: pixelPlacement(575, 276, 110, 112),
    tableLayout: pixelPlacement(702, 276, 400, 112)
  },
  pcs: {
    labelLayout: pixelPlacement(575, 402, 110, 112),
    tableLayout: pixelPlacement(704, 402, 182, 140)
  },
  battery: {
    labelLayout: pixelPlacement(575, 562, 110, 84),
    tableLayout: pixelPlacement(704, 562, 398, 84)
  },
  generators: {
    'diesel-1': {
      agcLayout: pixelPlacement(1228, 276, 110, 112),
      tableLayout: pixelPlacement(1192, 402, 182, 280),
      equipmentLayout: pixelPlacement(1228, 402, 182, 28)
    },
    'diesel-2': {
      agcLayout: pixelPlacement(1478, 276, 110, 112),
      tableLayout: pixelPlacement(1442, 402, 182, 280),
      equipmentLayout: pixelPlacement(1442, 402, 182, 28)
    }
  },
  inverters: {
    'ivt-1': pixelPlacement(22, 402, 70, 46),
    'ivt-2': pixelPlacement(22, 454, 70, 46),
    'ivt-3': pixelPlacement(22, 506, 70, 46),
    'ivt-4': pixelPlacement(22, 558, 70, 46),
    'ivt-5': pixelPlacement(22, 610, 70, 46),
    'ivt-6': pixelPlacement(22, 662, 70, 46),
    'ivt-7': pixelPlacement(22, 714, 70, 46)
  },
  inverterDetails: {
    'ivt-1': pixelPlacement(126, 402, 400, 46),
    'ivt-2': pixelPlacement(126, 454, 400, 46),
    'ivt-3': pixelPlacement(126, 506, 400, 46),
    'ivt-4': pixelPlacement(126, 558, 400, 46),
    'ivt-5': pixelPlacement(126, 610, 400, 46),
    'ivt-6': pixelPlacement(126, 662, 400, 46),
    'ivt-7': pixelPlacement(126, 714, 400, 46)
  }
};

export const plantOperationConnectionRules: PlantOperationConnectionRule[] = [
  {
    id: 'banks-to-main-btb',
    kind: 'collector',
    fromIds: ['bank-1', 'bank-2', 'bank-3', 'bank-4', 'bank-5'],
    toId: 'main-btb-label',
    busRow: pixelBusRow(138),
    busPaddingColumns: 0
  },
  {
    id: 'main-btb-to-branches',
    kind: 'split',
    fromId: 'main-btb-label',
    toIds: ['solar-agc-label', 'storage-btb-label', 'diesel-1-agc-label', 'diesel-2-agc-label'],
    busRow: pixelBusRow(268),
    busPaddingColumns: 0
  },
  {
    id: 'solar-to-inverters',
    kind: 'split',
    fromId: 'solar-agc-label',
    toIds: ['ivt-1'],
    busRow: pixelBusRow(395),
    busPaddingColumns: 0,
    toAnchor: 'center'
  },
  {
    id: 'storage-btb-to-battery',
    kind: 'chain',
    nodeIds: ['storage-btb-label', 'pcs-label', 'battery-label'],
    toAnchor: 'center'
  }
];
