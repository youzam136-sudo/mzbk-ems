export type PlantOperationValueRow = {
  label: string;
  value: string;
};

export type PlantOperationTripletRow = {
  label: string;
  values: [string, string, string];
};

export type PlantOperationEquipmentStatus = 'on' | 'off';

export type PlantOperationCanvasLayout = {
  columnWidth: number;
  columnGap: number;
  rowHeight: number;
  rowGap: number;
};

export type PlantOperationResolvedCanvasLayout = PlantOperationCanvasLayout & {
  columnCount: number;
  rowCount: number;
};

export type PlantOperationGridPlacement = {
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  anchorColumn?: number;
};

export type PlantOperationConnectionAnchor = 'top' | 'center' | 'bottom';

/*
 * 필요: 토폴로지 화면의 선을 위치값이 아니라 연결 규칙으로 계산한다.
 * 연결: plantOperationTopologyLayout의 connections 배열과 PlantOperationDiagramSection의 SVG 선 렌더러.
 * 설명: collector는 여러 노드를 한 선으로 모으고, split은 한 노드를 여러 노드로 나누며, chain은 세로 흐름을 잇는다.
 * 수정: 선이 닿을 위치는 fromAnchor/toAnchor, 좌우 여백은 busPaddingColumns로 조정한다.
 */
export type PlantOperationConnectionRule =
  | {
      id: string;
      kind: 'collector';
      fromIds: string[];
      toId: string;
      busRow: number;
      busPaddingColumns?: number;
      fromAnchor?: PlantOperationConnectionAnchor;
      toAnchor?: PlantOperationConnectionAnchor;
    }
  | {
      id: string;
      kind: 'split';
      fromId: string;
      toIds: string[];
      busRow: number;
      busPaddingColumns?: number;
      fromAnchor?: PlantOperationConnectionAnchor;
      toAnchor?: PlantOperationConnectionAnchor;
    }
  | {
      id: string;
      kind: 'chain';
      nodeIds: string[];
      fromAnchor?: PlantOperationConnectionAnchor;
      toAnchor?: PlantOperationConnectionAnchor;
    };

export type PlantOperationTopologyTableBlock = {
  id: string;
  title: string;
  rows: PlantOperationValueRow[];
  layout: PlantOperationGridPlacement;
};

export type PlantOperationTopologyTableData = {
  id: string;
  title: string;
  rows: PlantOperationValueRow[];
  placement?: 'bank-collector-left';
};

export type PlantOperationTopologyLabelBlock = {
  id: string;
  label: string;
  layout: PlantOperationGridPlacement;
};

export type PlantOperationAuxiliaryTable = PlantOperationTopologyTableBlock & {
  placement: 'bank-collector-left';
};

export type PlantOperationBankRow = {
  label: string;
  status: string;
  dAccm: string;
};

export type PlantOperationBankStatus = {
  id: string;
  name: string;
  rows: PlantOperationValueRow[];
  status?: PlantOperationEquipmentStatus;
  tableLayout: PlantOperationGridPlacement;
  labelLayout: PlantOperationGridPlacement;
};

export type PlantOperationBankData = {
  id: string;
  name: string;
  rows: PlantOperationValueRow[];
  status?: PlantOperationEquipmentStatus;
};

export type PlantOperationPowerPanel = {
  id: string;
  nodeLabel: string;
  rows: PlantOperationTripletRow[];
  pf: string;
  status?: PlantOperationEquipmentStatus;
  labelLayout: PlantOperationGridPlacement;
  tableLayout: PlantOperationGridPlacement;
};

export type PlantOperationPowerPanelData = {
  id: string;
  nodeLabel: string;
  rows: PlantOperationTripletRow[];
  pf: string;
  status?: PlantOperationEquipmentStatus;
};

export type PlantOperationPcsPanel = {
  id: string;
  nodeLabel: string;
  rows: PlantOperationValueRow[];
  status?: PlantOperationEquipmentStatus;
  labelLayout: PlantOperationGridPlacement;
  tableLayout: PlantOperationGridPlacement;
};

export type PlantOperationPcsPanelData = {
  id: string;
  nodeLabel: string;
  rows: PlantOperationValueRow[];
  status?: PlantOperationEquipmentStatus;
};

export type PlantOperationMetricGroup = {
  title: string;
  metrics: PlantOperationValueRow[];
};

export type PlantOperationBatteryPanel = {
  id: string;
  nodeLabel: string;
  summary: PlantOperationValueRow[];
  groups: PlantOperationMetricGroup[];
  status?: PlantOperationEquipmentStatus;
  labelLayout: PlantOperationGridPlacement;
  tableLayout: PlantOperationGridPlacement;
};

export type PlantOperationBatteryPanelData = {
  id: string;
  nodeLabel: string;
  summary: PlantOperationValueRow[];
  groups: PlantOperationMetricGroup[];
  status?: PlantOperationEquipmentStatus;
};

export type PlantOperationGeneratorPanel = {
  id: string;
  agcLabel: string;
  equipmentLabel: string;
  rows: PlantOperationValueRow[];
  status?: PlantOperationEquipmentStatus;
  agcLayout: PlantOperationGridPlacement;
  tableLayout: PlantOperationGridPlacement;
  equipmentLayout: PlantOperationGridPlacement;
};

export type PlantOperationGeneratorData = {
  id: string;
  agcLabel: string;
  equipmentLabel: string;
  rows: PlantOperationValueRow[];
  status?: PlantOperationEquipmentStatus;
};

export type PlantOperationInverterNode = {
  id: string;
  label: string;
  status?: PlantOperationEquipmentStatus;
  layout: PlantOperationGridPlacement;
  detailLayout?: PlantOperationGridPlacement;
  detailRows?: PlantOperationValueRow[];
  disabled?: boolean;
};

export type PlantOperationInverterData = {
  id: string;
  label: string;
  detailRows?: PlantOperationValueRow[];
  disabled?: boolean;
};

/*
 * 필요: API targetList를 카드 내부 조회 대상 셀렉트로 전달한다.
 * 연결: plantOperationStatusAdapter, PlantOperationDiagramSection.
 * 설명: 선택값은 targetId로 유지하고, 화면에는 targetName만 노출한다.
 * 수정: detail API를 연결할 때 이 targetId를 조회 인자로 사용한다.
 */
export type PlantOperationTargetOption = {
  targetId: string;
  targetName: string;
};

export type PlantOperationStatusData = {
  banks: PlantOperationBankData[];
  targetOptions: PlantOperationTargetOption[];
  topAuxiliaryTables: PlantOperationTopologyTableData[];
  btb: PlantOperationPowerPanelData;
  solar: PlantOperationPowerPanelData;
  storageBtb: PlantOperationPowerPanelData;
  pcs: PlantOperationPcsPanelData;
  battery: PlantOperationBatteryPanelData;
  generators: PlantOperationGeneratorData[];
  inverters: PlantOperationInverterData[];
};

export type PlantOperationTopologyData = {
  layout: PlantOperationResolvedCanvasLayout;
  banks: PlantOperationBankStatus[];
  topAuxiliaryTables: PlantOperationAuxiliaryTable[];
  mainBtbLabel: PlantOperationTopologyLabelBlock;
  connections: PlantOperationConnectionRule[];
  btb: PlantOperationPowerPanel;
  solar: PlantOperationPowerPanel;
  storageBtb: PlantOperationPowerPanel;
  pcs: PlantOperationPcsPanel;
  battery: PlantOperationBatteryPanel;
  generators: PlantOperationGeneratorPanel[];
  inverters: PlantOperationInverterNode[];
  inverterMatrixLayout?: PlantOperationGridPlacement;
};
