import type { PlantOperationCanvasLayout, PlantOperationConnectionRule, PlantOperationGridPlacement } from '../types/plantOperationStatus';
import type { PlantOperationTopologyPlacements } from './plantOperationTopologyLayout';

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

export const plantOperationTotalCanvasLayout: PlantOperationCanvasLayout = {
  columnWidth: 1,
  columnGap: 0,
  rowHeight: 1,
  rowGap: 0
};

export const plantOperationTotalTopologyPlacements: PlantOperationTopologyPlacements = {
  banks: {
    'bank-1': {
      labelLayout: pixelPlacement(307, 8, 204, 28),
      tableLayout: pixelPlacement(307, 36, 204, 112)
    },
    'bank-2': {
      labelLayout: pixelPlacement(527, 8, 204, 28),
      tableLayout: pixelPlacement(527, 36, 204, 112)
    },
    'bank-3': {
      labelLayout: pixelPlacement(747, 8, 204, 28),
      tableLayout: pixelPlacement(747, 36, 204, 112)
    },
    'bank-4': {
      labelLayout: pixelPlacement(967, 8, 204, 28),
      tableLayout: pixelPlacement(967, 36, 204, 112)
    },
    'bank-5': {
      labelLayout: pixelPlacement(1187, 8, 204, 28),
      tableLayout: pixelPlacement(1187, 36, 204, 112)
    }
  },
  topAuxiliaryTables: {
    'air-conditioner': pixelPlacement(2, 162, 260, 112),
    'ac-status': pixelPlacement(906, 487, 200, 140)
  },
  mainBtbLabel: {
    id: 'main-btb-label',
    label: 'MAIN',
    layout: pixelPlacement(464, 162, 110, 112)
  },
  btb: {
    labelLayout: pixelPlacement(464, 162, 110, 112),
    tableLayout: pixelPlacement(608, 162, 400, 112)
  },
  solar: {
    labelLayout: pixelPlacement(2, 312, 110, 112),
    tableLayout: pixelPlacement(126, 312, 400, 112)
  },
  storageBtb: {
    labelLayout: pixelPlacement(575, 312, 110, 112),
    tableLayout: pixelPlacement(702, 312, 400, 112)
  },
  pcs: {
    labelLayout: pixelPlacement(575, 487, 110, 112),
    tableLayout: pixelPlacement(704, 487, 182, 140)
  },
  battery: {
    labelLayout: pixelPlacement(575, 667, 110, 84),
    tableLayout: pixelPlacement(704, 667, 478, 84)
  },
  generators: {
    'diesel-1': {
      agcLayout: pixelPlacement(1228, 312, 110, 112),
      tableLayout: pixelPlacement(1192, 462, 182, 280),
      equipmentLayout: pixelPlacement(1228, 462, 182, 28)
    },
    'diesel-2': {
      agcLayout: pixelPlacement(1478, 312, 110, 112),
      tableLayout: pixelPlacement(1442, 462, 182, 280),
      equipmentLayout: pixelPlacement(1442, 462, 182, 28)
    }
  },
  inverters: {
    'ivt-1': pixelPlacement(22, 438, 70, 46),
    'ivt-2': pixelPlacement(22, 490, 70, 46),
    'ivt-3': pixelPlacement(22, 542, 70, 46),
    'ivt-4': pixelPlacement(22, 594, 70, 46),
    'ivt-5': pixelPlacement(22, 646, 70, 46),
    'ivt-6': pixelPlacement(22, 698, 70, 46),
    'ivt-7': pixelPlacement(22, 750, 70, 46)
  },
  inverterDetails: {
    'ivt-1': pixelPlacement(126, 438, 318, 46),
    'ivt-2': pixelPlacement(126, 490, 318, 46),
    'ivt-3': pixelPlacement(126, 542, 318, 46),
    'ivt-4': pixelPlacement(126, 594, 318, 46),
    'ivt-5': pixelPlacement(126, 646, 318, 46),
    'ivt-6': pixelPlacement(126, 698, 318, 46),
    'ivt-7': pixelPlacement(126, 750, 318, 46)
  }
};

export const plantOperationTotalConnectionRules: PlantOperationConnectionRule[] = [
  {
    id: 'banks-to-main-btb',
    kind: 'collector',
    fromIds: ['bank-1', 'bank-2', 'bank-3', 'bank-4', 'bank-5'],
    toId: 'main-btb-label',
    busRow: pixelBusRow(156),
    busPaddingColumns: 0
  },
  {
    id: 'main-btb-to-branches',
    kind: 'split',
    fromId: 'main-btb-label',
    toIds: ['solar-agc-label', 'storage-btb-label', 'diesel-1-agc-label', 'diesel-2-agc-label'],
    busRow: pixelBusRow(288),
    busPaddingColumns: 0
  },
  {
    id: 'solar-to-inverters',
    kind: 'split',
    fromId: 'solar-agc-label',
    toIds: ['ivt-1', 'ivt-2', 'ivt-3', 'ivt-4', 'ivt-5', 'ivt-6', 'ivt-7'],
    busRow: pixelBusRow(428),
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
