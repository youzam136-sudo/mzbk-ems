import { useState } from 'react';
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import { EquipmentSelect } from '../../../../shared/ui/EquipmentSelect';
import { ExcelSaveButton } from '../../../../shared/ui/ExcelSaveButton';
import type { SupportGenerationDetailTableData, SupportGenerationOperationTableData } from '../types/supportGenerationStatus';
import '../styles/SupportGenerationDetailTableSection.css';

type SupportGenerationDetailTableSectionProps = {
  operationTable: SupportGenerationOperationTableData;
  detailTable: SupportGenerationDetailTableData;
};

/*
 * 필요: 보조 발전현황 운전 상세 표(디젤1/디젤2 나란히)와 장비별 접힘 상세 표를 표시한다.
 * 연결: DataTableCard, DetailToggleBar, EquipmentSelect, ExcelSaveButton, useSupportGenerationStatus.
 * 설명: 하단 상세 표는 드롭다운으로 고른 장비의 rowsByEquipment만 보여주며, 운전 상세 표와는 헤더/구성이 다르다.
 * 수정: 상세 패널 간격은 styles/SupportGenerationDetailTableSection.css에서 조정한다.
 */
export function SupportGenerationDetailTableSection({ operationTable, detailTable }: SupportGenerationDetailTableSectionProps) {
  const [expanded, setExpanded] = useState(detailTable.defaultExpanded);
  const [equipment, setEquipment] = useState(detailTable.defaultEquipmentValue);
  const detailRows = detailTable.rowsByEquipment[equipment] ?? [];

  return (
    <div className="support-generation-detail">
      <DataTableCard
        ariaLabel={operationTable.ariaLabel}
        headerRows={operationTable.headerRows}
        rows={operationTable.rows}
        minWidth={operationTable.minWidth}
        excel={{ fileName: '보조발전_운전상세현황', sheetName: '운전 상세 현황', rows: operationTable.allRows }}
        className="support-generation-detail__panel"
      />

      <DetailToggleBar label="Diesel 상세 내역 보기" expanded={expanded} onClick={() => setExpanded((value) => !value)} />

      <CollapsibleContent open={expanded}>
        <DataTableCard
          ariaLabel={detailTable.ariaLabel}
          headerRows={detailTable.headerRows}
          rows={detailRows}
          minWidth={detailTable.minWidth}
          actions={
            <div className="inline-actions">
              <EquipmentSelect
                aria-label="보조발전 장비 선택"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                options={detailTable.equipmentOptions}
              />
              <ExcelSaveButton
                fileName={`보조발전_${equipment}_상세내역`}
                sheets={[
                  {
                    name: 'Diesel 상세 내역',
                    headerRows: detailTable.headerRows,
                    rows: detailRows
                  }
                ]}
              />
            </div>
          }
          className="support-generation-detail__panel"
        />
      </CollapsibleContent>
    </div>
  );
}
