import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { Fragment, useMemo, useRef } from 'react';
import { PageCard } from '../../../../shared/ui/PageCard';
import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import equipBatteryImage from '../../../../assets/img/dashboard/equip-battery-new.png';
import equipSolarImage from '../../../../assets/img/dashboard/equip-solar-v2.png';
import equipSolarFlatImage from '../../../../assets/img/dashboard/equip-solar-new.png';
import equipTypeHorizontalImage from '../../../../assets/img/dashboard/equip-generator.png';
import equipTypeMultiImage from '../../../../assets/img/dashboard/equip-main-v2.png';
import equipTypeSquareImage from '../../../../assets/img/dashboard/equip-ess.png';
import equipPcsImage from '../../../../assets/img/dashboard/equip-pcs.png';
import icoBankImage from '../../../../assets/img/dashboard/equip-bank-tower.png';
import equipAcTempImage from '../../../../assets/img/dashboard/equip-ac-temp.png';
import equipAcHumidityImage from '../../../../assets/img/dashboard/equip-ac-humidity.png';
import equipAcStatImage from '../../../../assets/img/dashboard/equip-ac-unit.png';
import { plantOperationCanvasLayout, plantOperationConnectionRules, plantOperationTopologyPlacements } from '../constants/plantOperationTopologyLayout';
import { plantOperationTotalCanvasLayout, plantOperationTotalConnectionRules, plantOperationTotalTopologyPlacements } from '../constants/plantOperationTopologyLayoutTotal';
import type {
  PlantOperationAuxiliaryTable,
  PlantOperationBankStatus,
  PlantOperationEquipmentStatus,
  PlantOperationBatteryPanel,
  PlantOperationCanvasLayout,
  PlantOperationConnectionAnchor,
  PlantOperationConnectionRule,
  PlantOperationGeneratorPanel,
  PlantOperationGridPlacement,
  PlantOperationInverterNode,
  PlantOperationPcsPanel,
  PlantOperationPowerPanel,
  PlantOperationResolvedCanvasLayout,
  PlantOperationStatusData,
  PlantOperationTargetOption,
  PlantOperationTopologyData,
  PlantOperationTopologyTableBlock
} from '../types/plantOperationStatus';
import '../styles/PlantOperationDiagramSection.css';

type PlantOperationStyle = CSSProperties & { [key: `--${string}`]: string | number };
type PlantOperationTopologyContent = Omit<PlantOperationTopologyData, 'layout'>;
type PlantOperationDiagramVariant = 'individual' | 'total';

type PlantOperationDiagramSectionProps = {
  data: PlantOperationStatusData | null;
  targetOptions: PlantOperationTargetOption[];
  selectedTargetId: string;
  onTargetChange: (targetId: string) => void;
  isLoading: boolean;
  errorMessage: string;
  variant?: PlantOperationDiagramVariant;
};

type Point = {
  x: number;
  y: number;
};

const equipmentIconImages: Record<string, string | undefined> = {
  battery: equipBatteryImage,
  bank: icoBankImage,
  btb: equipTypeSquareImage,
  btbMulti: equipTypeMultiImage,
  generator: equipTypeHorizontalImage,
  inverter: equipSolarFlatImage,
  pcs: equipPcsImage,
  solar: equipSolarImage
};

function getLayoutSize(layout: PlantOperationResolvedCanvasLayout) {
  return {
    width: layout.columnCount * layout.columnWidth + (layout.columnCount - 1) * layout.columnGap,
    height: layout.rowCount * layout.rowHeight + (layout.rowCount - 1) * layout.rowGap
  };
}

function getGridAxisStart(index: number, size: number, gap: number) {
  return (index - 1) * (size + gap);
}

function getPlacementSize(placement: PlantOperationGridPlacement, layout: PlantOperationCanvasLayout) {
  return {
    width: placement.colSpan * layout.columnWidth + (placement.colSpan - 1) * layout.columnGap,
    height: placement.rowSpan * layout.rowHeight + (placement.rowSpan - 1) * layout.rowGap
  };
}

function getPlacementX(placement: PlantOperationGridPlacement, layout: PlantOperationCanvasLayout) {
  return getGridAxisStart(placement.colStart, layout.columnWidth, layout.columnGap);
}

function getPlacementY(placement: PlantOperationGridPlacement, layout: PlantOperationCanvasLayout) {
  return getGridAxisStart(placement.rowStart, layout.rowHeight, layout.rowGap);
}

function getRuleRowY(layout: PlantOperationCanvasLayout, row: number) {
  return getGridAxisStart(row, layout.rowHeight, layout.rowGap);
}

function getColumnPaddingPx(layout: PlantOperationCanvasLayout, columns = 0) {
  return columns * (layout.columnWidth + layout.columnGap);
}

const LINE_EDGE_INSET_PX = 1;
const PLANT_OPERATION_MIN_GRID_ROWS = 200;
const PLANT_OPERATION_BOTTOM_GRID_PADDING_ROWS = 8;
const PLANT_OPERATION_TOTAL_MIN_GRID_ROWS = 804;
const PLANT_OPERATION_TOTAL_BOTTOM_GRID_PADDING_ROWS = 8;

function getTopologyConfig(variant: PlantOperationDiagramVariant) {
  if (variant === 'total') {
    return {
      canvasLayout: plantOperationTotalCanvasLayout,
      placements: plantOperationTotalTopologyPlacements,
      connections: plantOperationTotalConnectionRules,
      minGridRows: PLANT_OPERATION_TOTAL_MIN_GRID_ROWS,
      bottomGridPaddingRows: PLANT_OPERATION_TOTAL_BOTTOM_GRID_PADDING_ROWS
    };
  }

  return {
    canvasLayout: plantOperationCanvasLayout,
    placements: plantOperationTopologyPlacements,
    connections: plantOperationConnectionRules,
    minGridRows: PLANT_OPERATION_MIN_GRID_ROWS,
    bottomGridPaddingRows: PLANT_OPERATION_BOTTOM_GRID_PADDING_ROWS
  };
}

function clampLineX(x: number, layout: PlantOperationResolvedCanvasLayout) {
  const { width } = getLayoutSize(layout);

  return Math.max(LINE_EDGE_INSET_PX, Math.min(width - LINE_EDGE_INSET_PX, x));
}

function getBusRangeX(xs: number[], padding: number, layout: PlantOperationResolvedCanvasLayout) {
  return {
    minX: clampLineX(Math.min(...xs) - padding, layout),
    maxX: clampLineX(Math.max(...xs) + padding, layout)
  };
}

function getPlacementAnchorX(placement: PlantOperationGridPlacement, layout: PlantOperationCanvasLayout) {
  const { width } = getPlacementSize(placement, layout);
  const anchorColumn = placement.anchorColumn ?? placement.colStart + placement.colSpan / 2;
  const anchorRatio = Math.max(0, Math.min(1, (anchorColumn - placement.colStart) / placement.colSpan));

  return getPlacementX(placement, layout) + width * anchorRatio;
}

function getAnchorPoint(placement: PlantOperationGridPlacement, layout: PlantOperationCanvasLayout, anchor: PlantOperationConnectionAnchor): Point {
  const { height } = getPlacementSize(placement, layout);
  const top = getPlacementY(placement, layout);
  const yMap = {
    top,
    center: top + height / 2,
    bottom: top + height
  };

  return {
    x: getPlacementAnchorX(placement, layout),
    y: yMap[anchor]
  };
}

function getGridItemStyle(placement: PlantOperationGridPlacement): CSSProperties {
  return {
    gridColumn: `${placement.colStart} / span ${placement.colSpan}`,
    gridRow: `${placement.rowStart} / span ${placement.rowSpan}`
  };
}

function getBoardStyle(layout: PlantOperationResolvedCanvasLayout): PlantOperationStyle {
  const size = getLayoutSize(layout);

  return {
    '--plant-op-grid-columns': layout.columnCount,
    '--plant-op-grid-rows': layout.rowCount,
    '--plant-op-col-width': `${layout.columnWidth}px`,
    '--plant-op-col-gap': `${layout.columnGap}px`,
    '--plant-op-row-height': `${layout.rowHeight}px`,
    '--plant-op-row-gap': `${layout.rowGap}px`,
    width: size.width,
    height: size.height
  };
}

function getTopologyPlacements(topology: PlantOperationTopologyContent) {
  return [
    ...topology.banks.flatMap((bank) => [bank.tableLayout, bank.labelLayout]),
    ...topology.topAuxiliaryTables.map((table) => table.layout),
    topology.mainBtbLabel.layout,
    topology.btb.labelLayout,
    topology.btb.tableLayout,
    topology.solar.labelLayout,
    topology.solar.tableLayout,
    topology.storageBtb.labelLayout,
    topology.storageBtb.tableLayout,
    topology.pcs.labelLayout,
    topology.pcs.tableLayout,
    topology.battery.labelLayout,
    topology.battery.tableLayout,
    ...topology.generators.flatMap((generator) => [generator.agcLayout, generator.tableLayout, generator.equipmentLayout]),
    ...topology.inverters.flatMap((inverter) => [inverter.layout, inverter.detailLayout].filter((layout): layout is PlantOperationGridPlacement => Boolean(layout))),
    ...(topology.inverterMatrixLayout ? [topology.inverterMatrixLayout] : [])
  ];
}

function resolveCanvasLayout(
  topology: PlantOperationTopologyContent,
  canvasLayout: PlantOperationCanvasLayout,
  minGridRows: number,
  bottomGridPaddingRows: number
): PlantOperationResolvedCanvasLayout {
  const placements = getTopologyPlacements(topology);
  const maxPlacementColumn = Math.max(
    1,
    ...placements.map((placement) => Math.max(placement.colStart + placement.colSpan - 1, placement.anchorColumn ?? 0))
  );
  const maxPlacementRow = Math.max(1, ...placements.map((placement) => placement.rowStart + placement.rowSpan - 1));
  const maxBusRow = Math.max(1, ...topology.connections.map((rule) => ('busRow' in rule ? rule.busRow : 0)));

  return {
    ...canvasLayout,
    columnCount: Math.ceil(maxPlacementColumn + 3),
    rowCount: Math.max(minGridRows, Math.ceil(Math.max(maxPlacementRow, maxBusRow) + bottomGridPaddingRows))
  };
}

function createPlantOperationTopology(data: PlantOperationStatusData, variant: PlantOperationDiagramVariant): PlantOperationTopologyData {
  const { canvasLayout, placements, connections, minGridRows, bottomGridPaddingRows } = getTopologyConfig(variant);
  const content: PlantOperationTopologyContent = {
    banks: data.banks.flatMap((bank): PlantOperationBankStatus[] => {
      const placement = placements.banks[bank.id];

      return placement ? [{ ...bank, ...placement }] : [];
    }),
    topAuxiliaryTables: data.topAuxiliaryTables.flatMap((table): PlantOperationAuxiliaryTable[] => {
      const layout = placements.topAuxiliaryTables[table.id];

      return layout ? [{ ...table, placement: table.placement ?? 'bank-collector-left', layout }] : [];
    }),
    mainBtbLabel: placements.mainBtbLabel,
    connections,
    btb: { ...data.btb, ...placements.btb },
    solar: { ...data.solar, ...placements.solar },
    storageBtb: { ...data.storageBtb, ...placements.storageBtb },
    pcs: { ...data.pcs, ...placements.pcs },
    battery: { ...data.battery, ...placements.battery },
    generators: data.generators.flatMap((generator): PlantOperationGeneratorPanel[] => {
      const placement = placements.generators[generator.id];

      return placement ? [{ ...generator, ...placement }] : [];
    }),
    inverters: data.inverters.flatMap((inverter): PlantOperationInverterNode[] => {
      const layout = placements.inverters[inverter.id];
      const detailLayout = placements.inverterDetails?.[inverter.id];

      return layout ? [{ ...inverter, layout, detailLayout }] : [];
    }),
    inverterMatrixLayout: placements.inverterMatrix
  };

  return {
    ...content,
    layout: resolveCanvasLayout(content, canvasLayout, minGridRows, bottomGridPaddingRows)
  };
}

function getPath(points: Point[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ');
}

function getStepPath(from: Point, to: Point) {
  if (Math.abs(from.x - to.x) < 0.1) {
    return getPath([from, to]);
  }

  const middleY = from.y + (to.y - from.y) / 2;

  return getPath([
    from,
    { x: from.x, y: middleY },
    { x: to.x, y: middleY },
    to
  ]);
}

function getTopologyNodeMap(topology: PlantOperationTopologyContent) {
  const nodeMap = new Map<string, PlantOperationGridPlacement>();

  topology.banks.forEach((bank) => nodeMap.set(bank.id, bank.tableLayout));
  topology.topAuxiliaryTables.forEach((table) => nodeMap.set(table.id, table.layout));
  nodeMap.set(topology.mainBtbLabel.id, topology.mainBtbLabel.layout);
  nodeMap.set(`${topology.solar.id}-label`, topology.solar.labelLayout);
  nodeMap.set(`${topology.storageBtb.id}-label`, topology.storageBtb.labelLayout);
  nodeMap.set(`${topology.pcs.id}-label`, topology.pcs.labelLayout);
  nodeMap.set(`${topology.battery.id}-label`, topology.battery.labelLayout);
  topology.generators.forEach((generator) => {
    nodeMap.set(`${generator.id}-agc-label`, generator.agcLayout);
    nodeMap.set(`${generator.id}-equipment-label`, generator.equipmentLayout);
  });
  topology.inverters.forEach((inverter) => nodeMap.set(inverter.id, inverter.layout));

  return nodeMap;
}

function NodePill({
  label,
  nodeId,
  className = '',
  icon = 'device',
  disabled = false,
  status,
  style
}: {
  label: string;
  nodeId?: string;
  className?: string;
  icon?: string;
  disabled?: boolean;
  status?: PlantOperationEquipmentStatus;
  style?: CSSProperties;
}) {
  const iconImage = equipmentIconImages[icon];
  const nodeClassName = [
    'plant-operation-node-pill',
    className,
    disabled ? 'plant-operation-node-pill--disabled' : '',
    status ? `plant-operation-node-pill--${status}` : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={nodeClassName} data-topology-node-id={nodeId} data-topology-disabled={disabled ? 'true' : undefined} style={style} title={label}>
      <span className={`plant-operation-node-pill__icon plant-operation-node-pill__icon--${icon}`} aria-hidden="true">
        {iconImage && <img className="plant-operation-node-pill__image" src={iconImage} alt="" draggable={false} />}
      </span>
      <span className="plant-operation-node-pill__label">{label}</span>
    </span>
  );
}

/*
 * 필요: 발전소 운영현황 카드 안에서 API targetList 기반 조회 대상을 선택한다.
 * 연결: PlantOperationStatusPage, plantOperationStatusAdapter.
 * 설명: 현재는 선택 상태만 화면에 유지하고, detail API 연결 시 selectedTargetId를 조회 인자로 넘긴다.
 * 수정: 셀렉트 위치와 디자인은 PlantOperationDiagramSection.css의 card action 영역에서 조정한다.
 */
function PlantOperationTargetSelect({
  options,
  selectedTargetId,
  onChange
}: {
  options: PlantOperationTargetOption[];
  selectedTargetId: string;
  onChange: (targetId: string) => void;
}) {
  if (!options.length) {
    return null;
  }

  const value = selectedTargetId || options[0].targetId;

  return (
    <label className="plant-operation-card__target-field">
      <span>조회 대상</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="발전소 운영현황 조회 대상">
        {options.map((option) => (
          <option key={option.targetId} value={option.targetId}>
            {option.targetName}
          </option>
        ))}
      </select>
    </label>
  );
}

function BankStatusCard({ bank }: { bank: PlantOperationBankStatus }) {
  const tableStyle = { ...getGridItemStyle(bank.tableLayout), '--topology-row-count': bank.rows.length } as PlantOperationStyle;

  return (
    <>
      <table
        className="plant-operation-bank-table"
        data-topology-node-id={bank.id}
        data-topology-table-kind="bank"
        data-topology-table-id={bank.id}
        style={tableStyle}
        aria-label={`${bank.name} 상태`}
      >
        <tbody>
          {bank.rows.map((row) => (
            <tr key={`${bank.id}-${row.label}`}>
              <th scope="row" title={row.label}>
                {row.label}
              </th>
              <td title={row.value}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <NodePill
        label={bank.name}
        nodeId={`${bank.id}-label`}
        className="plant-operation-node-pill--bank"
        icon="bank"
        status={bank.status}
        style={getGridItemStyle(bank.labelLayout)}
      />
    </>
  );
}

function SimpleStatusPanel({ panel, className = '', style }: { panel: PlantOperationTopologyTableBlock; className?: string; style?: CSSProperties }) {
  const tableStyle = { ...style, '--topology-row-count': panel.rows.length } as PlantOperationStyle;
  const shouldShowTitle = className.includes('bank-collector-left');
  const tableKind = className.includes('plant-operation-generator-table') ? 'generator' : shouldShowTitle ? 'environment' : 'simple';

  return (
    <table
      className={`plant-operation-simple-table ${className}`.trim()}
      data-topology-table-kind={tableKind}
      data-topology-table-id={panel.id}
      style={tableStyle}
      aria-label={`${panel.title} 상태`}
    >
      {shouldShowTitle && (
        <colgroup>
          <col className="plant-operation-simple-table__col-label" />
          <col className="plant-operation-simple-table__col-value" />
        </colgroup>
      )}
      {shouldShowTitle && panel.title && (
        <thead>
          <tr>
            <th colSpan={2} scope="colgroup">
              {panel.title}
            </th>
          </tr>
        </thead>
      )}
      <tbody>
        {panel.rows.map((row) => {
          const showAcStatIcon = panel.id === 'ac-status' && (row.label === 'A/C STAT' || row.label === 'A/C[℃]');
          const showAcTempIcon = panel.id === 'ac-status' && row.label === '온도[℃]';
          const showAcHumidityIcon = panel.id === 'ac-status' && row.label === '습도[%]';

          return (
            <tr key={`${panel.id}-${row.label}`}>
              <th scope="row" title={row.label}>
                <span className="plant-operation-simple-table__row-label">
                  {showAcStatIcon && (
                    <img src={equipAcStatImage} alt="" className="plant-operation-simple-table__row-icon" />
                  )}
                  {showAcTempIcon && (
                    <img src={equipAcTempImage} alt="" className="plant-operation-simple-table__row-icon" />
                  )}
                  {showAcHumidityIcon && (
                    <img src={equipAcHumidityImage} alt="" className="plant-operation-simple-table__row-icon" />
                  )}
                  {row.label}
                </span>
              </th>
              <td className={!row.value || row.value === '-' ? 'plant-operation-empty-value' : undefined} title={row.value}>
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PowerMetricTable({ panel, className = '', style }: { panel: PlantOperationPowerPanel; className?: string; style?: CSSProperties }) {
  const tableStyle = { ...style, '--topology-row-count': panel.rows.length } as PlantOperationStyle;

  return (
    <table
      className={`plant-operation-power-table ${className}`.trim()}
      data-topology-table-kind="power"
      data-topology-table-id={panel.id}
      style={tableStyle}
      aria-label={`${panel.nodeLabel} 계측값`}
    >
      <colgroup>
        <col className="plant-operation-power-table__col-label" />
        <col className="plant-operation-power-table__col-value" />
        <col className="plant-operation-power-table__col-value" />
        <col className="plant-operation-power-table__col-value" />
        <col className="plant-operation-power-table__col-pf-label" />
        <col className="plant-operation-power-table__col-pf-value" />
      </colgroup>
      <tbody>
        {panel.rows.map((row, index) => (
          <tr key={`${panel.id}-${row.label}`}>
            <th scope="row" title={row.label}>
              {row.label}
            </th>
            <td title={row.values[0]}>{row.values[0]}</td>
            <td title={row.values[1]}>{row.values[1]}</td>
            <td title={row.values[2]}>{row.values[2]}</td>
            {index === 0 && (
              <>
                <th className="plant-operation-power-table__pf-label" rowSpan={panel.rows.length} scope="row">
                  PF[%]
                </th>
                <td className="plant-operation-power-table__pf-value" rowSpan={panel.rows.length} title={panel.pf}>
                  {panel.pf}
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PcsStatusTable({ panel, style }: { panel: PlantOperationPcsPanel; style?: CSSProperties }) {
  const tableStyle = { ...style, '--topology-row-count': panel.rows.length } as PlantOperationStyle;

  return (
    <table
      className="plant-operation-pcs-table"
      data-topology-table-kind="pcs"
      data-topology-table-id={panel.id}
      style={tableStyle}
      aria-label={`${panel.nodeLabel} 상태`}
    >
      <tbody>
        {panel.rows.map((row) => (
          <tr key={`${panel.id}-${row.label}`}>
            <th scope="row" title={row.label}>
              {row.label}
            </th>
            <td title={row.value}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BatteryRackTable({ panel, style }: { panel: PlantOperationBatteryPanel; style?: CSSProperties }) {
  const tableStyle = { ...style, '--topology-row-count': 3 } as PlantOperationStyle;
  const summaryColumnWidth = 52;
  const metricColumnCount = panel.groups.reduce((count, group) => count + group.metrics.length, 0);
  const metricColumnWidth = `calc((100% - ${panel.summary.length * summaryColumnWidth}px) / ${Math.max(1, metricColumnCount)})`;

  return (
    <table
      className="plant-operation-battery-table"
      data-topology-table-kind="battery"
      data-topology-table-id={panel.id}
      style={tableStyle}
      aria-label={`${panel.nodeLabel} 상태`}
    >
      <colgroup>
        {panel.summary.map((item) => (
          <col key={`${panel.id}-summary-col-${item.label}`} style={{ width: `${summaryColumnWidth}px` }} />
        ))}
        {panel.groups.flatMap((group) =>
          group.metrics.map((metric) => (
            <col key={`${panel.id}-metric-col-${group.title}-${metric.label}`} style={{ width: metricColumnWidth }} />
          ))
        )}
      </colgroup>
      <thead>
        <tr>
          {panel.summary.map((item) => (
            <th key={`${panel.id}-${item.label}`} rowSpan={2} scope="col" title={item.label}>
              {item.label}
            </th>
          ))}
          {panel.groups.map((group) => (
            <th key={`${panel.id}-${group.title}`} colSpan={group.metrics.length} scope="colgroup" title={group.title}>
              {group.title}
            </th>
          ))}
        </tr>
        <tr>
          {panel.groups.flatMap((group) =>
            group.metrics.map((metric) => (
              <th key={`${panel.id}-${group.title}-${metric.label}`} scope="col" title={metric.label}>
                {metric.label}
              </th>
            ))
          )}
        </tr>
      </thead>
      <tbody>
        <tr>
          {panel.summary.map((item) => (
            <td key={`${panel.id}-value-${item.label}`} title={item.value}>
              {item.value}
            </td>
          ))}
          {panel.groups.flatMap((group) =>
            group.metrics.map((metric) => (
              <td key={`${panel.id}-value-${group.title}-${metric.label}`} title={metric.value}>
                {metric.value}
              </td>
            ))
          )}
        </tr>
      </tbody>
    </table>
  );
}

function GeneratorBranch({ generator }: { generator: PlantOperationGeneratorPanel }) {
  const tableStyle = { ...getGridItemStyle(generator.tableLayout), '--topology-row-count': generator.rows.length } as PlantOperationStyle;

  return (
    <>
      <NodePill
        label={generator.agcLabel}
        nodeId={`${generator.id}-agc-label`}
        className="plant-operation-node-pill--generator-agc"
        icon="generator"
        status={generator.status}
        style={getGridItemStyle(generator.agcLayout)}
      />
      <SimpleStatusPanel
        panel={{ id: generator.id, title: generator.equipmentLabel, rows: generator.rows, layout: generator.tableLayout }}
        className="plant-operation-generator-table"
        style={tableStyle}
      />
    </>
  );
}

function InverterDetailTable({ inverter }: { inverter: PlantOperationInverterNode }) {
  if (!inverter.detailRows?.length || !inverter.detailLayout) {
    return null;
  }

  const tableClassName = [
    'plant-operation-inverter-detail-table',
    inverter.disabled ? 'plant-operation-inverter-detail-table--disabled' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <table
      className={tableClassName}
      data-topology-table-kind="inverter-detail"
      data-topology-table-id={inverter.id}
      style={getGridItemStyle(inverter.detailLayout)}
      aria-label={`${inverter.label} 상세 상태`}
    >
      <thead>
        <tr>
          {inverter.detailRows.map((row) => (
            <th key={`${inverter.id}-header-${row.label}`} scope="col" title={row.label}>
              {row.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {inverter.detailRows.map((row) => (
            <td key={`${inverter.id}-value-${row.label}`} className={!row.value || row.value === '-' ? 'plant-operation-empty-value' : undefined} title={row.value}>
              {row.value}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function InverterMatrixTable({ inverters, layout }: { inverters: PlantOperationInverterNode[]; layout?: PlantOperationGridPlacement }) {
  if (!layout || !inverters.length) {
    return null;
  }

  const metricLabels = inverters[0]?.detailRows?.map((row) => row.label) ?? [];
  const tableStyle = { ...getGridItemStyle(layout), '--topology-row-count': metricLabels.length + 1 } as PlantOperationStyle;

  return (
    <table className="plant-operation-inverter-matrix-table" data-topology-table-kind="inverter-matrix" style={tableStyle} aria-label="인버터 현황 매트릭스">
      <thead>
        <tr>
          <th scope="col" aria-label="구분" />
          {inverters.map((inverter) => (
            <th key={`matrix-header-${inverter.id}`} scope="col" title={inverter.label}>
              {inverter.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {metricLabels.map((metricLabel, rowIndex) => (
          <tr key={`matrix-row-${metricLabel}`}>
            <th scope="row" title={metricLabel}>
              {metricLabel}
            </th>
            {inverters.map((inverter) => {
              const value = inverter.detailRows?.[rowIndex]?.value ?? '';

              return (
                <td key={`matrix-${inverter.id}-${metricLabel}`} className={!value || value === '-' ? 'plant-operation-empty-value' : undefined} title={value}>
                  {value}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function renderCollectorLine(rule: Extract<PlantOperationConnectionRule, { kind: 'collector' }>, topology: PlantOperationTopologyData, nodeMap: Map<string, PlantOperationGridPlacement>) {
  const layout = topology.layout;
  const fromPlacements = rule.fromIds.map((id) => nodeMap.get(id)).filter((placement): placement is PlantOperationGridPlacement => Boolean(placement));
  const toPlacement = nodeMap.get(rule.toId);

  if (!fromPlacements.length || !toPlacement) {
    return [];
  }

  const fromPoints = fromPlacements.map((placement) => getAnchorPoint(placement, layout, rule.fromAnchor ?? 'bottom'));
  const toPoint = getAnchorPoint(toPlacement, layout, rule.toAnchor ?? 'top');
  const busY = getRuleRowY(layout, rule.busRow);
  const busXs = [...fromPoints.map((point) => point.x), toPoint.x];
  const busPadding = getColumnPaddingPx(layout, rule.busPaddingColumns);
  const { minX, maxX } = getBusRangeX(busXs, busPadding, layout);
  const lines: ReactNode[] = [];

  fromPoints.forEach((point, index) => {
    lines.push(
      <path
        key={`${rule.id}-drop-${index}`}
        className="plant-operation-line"
        data-line-id={rule.id}
        data-line-role="drop"
        data-line-from={rule.fromIds[index]}
        d={getPath([point, { x: point.x, y: busY }])}
      />
    );
  });
  lines.push(
    <path
      key={`${rule.id}-bus`}
      className="plant-operation-line"
      data-line-id={rule.id}
      data-line-role="bus"
      d={getPath([{ x: minX, y: busY }, { x: maxX, y: busY }])}
    />
  );
  lines.push(
    <path
      key={`${rule.id}-target`}
      className="plant-operation-line"
      data-line-id={rule.id}
      data-line-role="target"
      data-line-to={rule.toId}
      d={getPath([{ x: toPoint.x, y: busY }, toPoint])}
    />
  );

  return lines;
}

function renderSplitLine(rule: Extract<PlantOperationConnectionRule, { kind: 'split' }>, topology: PlantOperationTopologyData, nodeMap: Map<string, PlantOperationGridPlacement>) {
  const layout = topology.layout;
  const fromPlacement = nodeMap.get(rule.fromId);
  const toPlacements = rule.toIds.map((id) => nodeMap.get(id)).filter((placement): placement is PlantOperationGridPlacement => Boolean(placement));

  if (!fromPlacement || !toPlacements.length) {
    return [];
  }

  const fromPoint = getAnchorPoint(fromPlacement, layout, rule.fromAnchor ?? 'bottom');
  const toPoints = toPlacements.map((placement) => getAnchorPoint(placement, layout, rule.toAnchor ?? 'top'));
  const busY = getRuleRowY(layout, rule.busRow);
  const busXs = [fromPoint.x, ...toPoints.map((point) => point.x)];
  const busPadding = getColumnPaddingPx(layout, rule.busPaddingColumns);
  const { minX, maxX } = getBusRangeX(busXs, busPadding, layout);
  const lines: ReactNode[] = [
    <path
      key={`${rule.id}-source`}
      className="plant-operation-line"
      data-line-id={rule.id}
      data-line-role="source"
      data-line-from={rule.fromId}
      d={getPath([fromPoint, { x: fromPoint.x, y: busY }])}
    />,
    <path
      key={`${rule.id}-bus`}
      className="plant-operation-line"
      data-line-id={rule.id}
      data-line-role="bus"
      d={getPath([{ x: minX, y: busY }, { x: maxX, y: busY }])}
    />
  ];

  toPoints.forEach((point, index) => {
    lines.push(
      <path
        key={`${rule.id}-drop-${index}`}
        className="plant-operation-line"
        data-line-id={rule.id}
        data-line-role="drop"
        data-line-to={rule.toIds[index]}
        d={getPath([{ x: point.x, y: busY }, point])}
      />
    );
  });

  return lines;
}

function renderChainLine(rule: Extract<PlantOperationConnectionRule, { kind: 'chain' }>, topology: PlantOperationTopologyData, nodeMap: Map<string, PlantOperationGridPlacement>) {
  const lines: ReactNode[] = [];

  for (let index = 0; index < rule.nodeIds.length - 1; index += 1) {
    const fromPlacement = nodeMap.get(rule.nodeIds[index]);
    const toPlacement = nodeMap.get(rule.nodeIds[index + 1]);

    if (!fromPlacement || !toPlacement) {
      continue;
    }

    const fromPoint = getAnchorPoint(fromPlacement, topology.layout, rule.fromAnchor ?? 'bottom');
    const toPoint = getAnchorPoint(toPlacement, topology.layout, rule.toAnchor ?? 'top');
    lines.push(
      <path
        key={`${rule.id}-${index}`}
        className="plant-operation-line"
        data-line-id={rule.id}
        data-line-role="chain"
        data-line-from={rule.nodeIds[index]}
        data-line-to={rule.nodeIds[index + 1]}
        d={getStepPath(fromPoint, toPoint)}
      />
    );
  }

  return lines;
}

function TopologyLines({ topology }: { topology: PlantOperationTopologyData }) {
  const { lines, size } = useMemo(() => {
    const nodeMap = getTopologyNodeMap(topology);
    const layoutSize = getLayoutSize(topology.layout);
    const topologyLines = topology.connections.flatMap((rule) => {
      if (rule.kind === 'collector') {
        return renderCollectorLine(rule, topology, nodeMap);
      }

      if (rule.kind === 'split') {
        return renderSplitLine(rule, topology, nodeMap);
      }

      return renderChainLine(rule, topology, nodeMap);
    });

    return { lines: topologyLines, size: layoutSize };
  }, [topology]);

  return (
    <svg className="plant-operation-lines" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true">
      {lines}
    </svg>
  );
}

/*
 * 필요: 발전소 운영현황의 설비 배치와 선 연결을 한 판에서 렌더링한다.
 * 연결: usePlantOperationStatus, plantOperationTopologyLayout, PageCard, /dashboard/plant-operation-status.
 * 설명: API adapter가 만든 ViewModel과 배치 기준을 조합하고, 실제 판 크기는 배치된 요소와 선 규칙에서 계산한다.
 * 수정: 데이터 매핑은 adapter, 기준점과 선은 constants, 표현 스타일은 CSS에서 조정한다.
 */
export function PlantOperationDiagramSection({
  data,
  targetOptions,
  selectedTargetId,
  onTargetChange,
  isLoading,
  errorMessage,
  variant = 'individual'
}: PlantOperationDiagramSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({ isDragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });
  const topology = useMemo(() => (data ? createPlantOperationTopology(data, variant) : undefined), [data, variant]);
  const boardStyle = useMemo(() => (topology ? getBoardStyle(topology.layout) : undefined), [topology]);
  const targetSelect = targetOptions.length ? (
    <PlantOperationTargetSelect options={targetOptions} selectedTargetId={selectedTargetId} onChange={onTargetChange} />
  ) : undefined;

  if (isLoading) {
    return (
      <PageCard actions={targetSelect} className="plant-operation-card" ariaLabel="발전설비 운영 현황">
        <PageDataLoadingFallback title="발전소 운영현황" />
      </PageCard>
    );
  }

  if (errorMessage || !data || !topology || !boardStyle) {
    return (
      <PageCard actions={targetSelect} className="plant-operation-card" ariaLabel="발전설비 운영 현황">
        <div className="plant-operation-status-message plant-operation-status-message--error" role="alert">
          {errorMessage || '발전소 운영현황 데이터가 없습니다.'}
        </div>
      </PageCard>
    );
  }

  function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest('table, .plant-operation-node-pill, button, a, input, select, textarea'));
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || isInteractiveTarget(event.target)) {
      return;
    }

    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scrollElement.scrollLeft,
      scrollTop: scrollElement.scrollTop
    };
    scrollElement.setPointerCapture(event.pointerId);
    scrollElement.classList.add('plant-operation-scroll--dragging');
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const scrollElement = scrollRef.current;
    const dragState = dragStateRef.current;

    if (!scrollElement || !dragState.isDragging) {
      return;
    }

    scrollElement.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.startX);
    scrollElement.scrollTop = dragState.scrollTop - (event.clientY - dragState.startY);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const scrollElement = scrollRef.current;

    if (!scrollElement || !dragStateRef.current.isDragging) {
      return;
    }

    dragStateRef.current.isDragging = false;
    scrollElement.releasePointerCapture(event.pointerId);
    scrollElement.classList.remove('plant-operation-scroll--dragging');
  }

  return (
    <PageCard className="plant-operation-card" ariaLabel="발전설비 운영 현황">
      <div
        ref={scrollRef}
        className="plant-operation-scroll"
        role="region"
        aria-label="발전소 운영현황 설비 토폴로지"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="plant-operation-canvas">
          <section className={`plant-operation-topology-board plant-operation-topology-board--${variant}`} style={boardStyle} aria-label="발전소 운영현황 설비 연결도">
            <TopologyLines topology={topology} />

            {topology.banks.map((bank) => (
              <BankStatusCard key={bank.id} bank={bank} />
            ))}

            {topology.topAuxiliaryTables.map((panel) => (
              <SimpleStatusPanel
                key={panel.id}
                panel={panel}
                className={`plant-operation-simple-table--${panel.placement} plant-operation-simple-table--${panel.id}`}
                style={getGridItemStyle(panel.layout)}
              />
            ))}

            <NodePill
              label={topology.mainBtbLabel.label}
              nodeId={topology.mainBtbLabel.id}
              className="plant-operation-node-pill--btb"
              icon="btbMulti"
              status={topology.btb.status}
              style={getGridItemStyle(topology.mainBtbLabel.layout)}
            />
            <PowerMetricTable panel={topology.btb} className="plant-operation-power-table--btb" style={getGridItemStyle(topology.btb.tableLayout)} />

            <NodePill
              label={topology.solar.nodeLabel}
              nodeId={`${topology.solar.id}-label`}
              className="plant-operation-node-pill--solar"
              icon="solar"
              status={topology.solar.status}
              style={getGridItemStyle(topology.solar.labelLayout)}
            />
            <PowerMetricTable panel={topology.solar} className="plant-operation-power-table--solar" style={getGridItemStyle(topology.solar.tableLayout)} />

            <NodePill
              label={topology.storageBtb.nodeLabel}
              nodeId={`${topology.storageBtb.id}-label`}
              className="plant-operation-node-pill--storage-btb"
              icon="btb"
              status={topology.storageBtb.status}
              style={getGridItemStyle(topology.storageBtb.labelLayout)}
            />
            <PowerMetricTable panel={topology.storageBtb} className="plant-operation-power-table--storage" style={getGridItemStyle(topology.storageBtb.tableLayout)} />

            <NodePill
              label={topology.pcs.nodeLabel}
              nodeId={`${topology.pcs.id}-label`}
              className="plant-operation-node-pill--pcs"
              icon="pcs"
              status={topology.pcs.status}
              style={getGridItemStyle(topology.pcs.labelLayout)}
            />
            <PcsStatusTable panel={topology.pcs} style={getGridItemStyle(topology.pcs.tableLayout)} />

            <NodePill
              label={topology.battery.nodeLabel}
              nodeId={`${topology.battery.id}-label`}
              className="plant-operation-node-pill--battery"
              icon="battery"
              status={topology.battery.status}
              style={getGridItemStyle(topology.battery.labelLayout)}
            />
            <BatteryRackTable panel={topology.battery} style={getGridItemStyle(topology.battery.tableLayout)} />

            {topology.generators.map((generator) => (
              <GeneratorBranch key={generator.id} generator={generator} />
            ))}

            {topology.inverters.map((inverter: PlantOperationInverterNode) => (
              <Fragment key={inverter.id}>
                <NodePill
                  label={inverter.label}
                  nodeId={inverter.id}
                  className="plant-operation-node-pill--inverter"
                  icon="inverter"
                  disabled={inverter.disabled}
                  status={inverter.status}
                  style={getGridItemStyle(inverter.layout)}
                />
                <InverterDetailTable inverter={inverter} />
              </Fragment>
            ))}

            {topology.inverterMatrixLayout && <InverterMatrixTable inverters={topology.inverters} layout={topology.inverterMatrixLayout} />}
          </section>
        </div>
      </div>
    </PageCard>
  );
}
