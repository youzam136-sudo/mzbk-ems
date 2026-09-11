import { useState } from 'react';
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import { EquipmentSelect } from '../../../../shared/ui/EquipmentSelect';
import { ExcelSaveButton } from '../../../../shared/ui/ExcelSaveButton';
import type { PowerConsumptionDetailTableData, PowerConsumptionOperationTableData } from '../types/powerConsumptionStatus';
import '../styles/PowerConsumptionTableSection.css';

type PowerConsumptionTableSectionProps = {
  operationTable: PowerConsumptionOperationTableData;
  detailTable: PowerConsumptionDetailTableData;
};

/*
 * 필요: 전력 소비 운전 상세 표와 BANK별 접힘 상세 표(드롭다운 선택)를 표시한다.
 * 연결: DataTableCard, DetailToggleBar, EquipmentSelect, ExcelSaveButton, usePowerConsumptionStatus.
 * 설명: 표 데이터는 adapter가 만들고 section은 접힘/선택 상태만 관리한다.
 * 수정: 상세 영역 간격은 styles/PowerConsumptionTableSection.css에서 조정한다.
 */
export function PowerConsumptionTableSection({ operationTable, detailTable }: PowerConsumptionTableSectionProps) {
  const [expanded, setExpanded] = useState(detailTable.defaultExpanded);
  const [equipment, setEquipment] = useState(detailTable.defaultEquipmentValue);
  const detailRows = detailTable.rowsByEquipment[equipment] ?? [];

  return (
    <div className="power-consumption-table-section">
      <DataTableCard
        title=""
        ariaLabel={operationTable.ariaLabel}
        headerRows={operationTable.headerRows}
        rows={operationTable.rows}
        minWidth={operationTable.minWidth}
        excel={{ fileName: '전력소비현황_운전상세', sheetName: '운전 상세 현황', rows: operationTable.allRows }}
      />

      <DetailToggleBar label="전력수요 상세 내역 보기" expanded={expanded} onClick={() => setExpanded((value) => !value)} />

      <CollapsibleContent open={expanded}>
        <DataTableCard
          ariaLabel={detailTable.ariaLabel}
          headerRows={detailTable.headerRows}
          rows={detailRows}
          minWidth={detailTable.minWidth}
          actions={
            <div className="inline-actions">
              <EquipmentSelect
                aria-label="전력소비 BANK 선택"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                options={detailTable.equipmentOptions}
              />
              <ExcelSaveButton
                fileName={`전력소비현황_${equipment}_상세내역`}
                sheets={[{ name: 'BANK 상세 내역', headerRows: detailTable.headerRows, rows: detailRows }]}
              />
            </div>
          }
        />
      </CollapsibleContent>
    </div>
  );
}
