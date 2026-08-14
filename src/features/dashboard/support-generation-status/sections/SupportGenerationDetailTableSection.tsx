import { useState } from 'react';
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import { EquipmentSelect } from '../../../../shared/ui/EquipmentSelect';
import { ExcelSaveButton } from '../../../../shared/ui/ExcelSaveButton';
import type { SupportGenerationDetailTableData } from '../types/supportGenerationStatus';
import '../styles/SupportGenerationDetailTableSection.css';

type SupportGenerationDetailTableSectionProps = {
  table: SupportGenerationDetailTableData;
};

/*
 * 필요: 보조 발전현황 상세 표와 장비별 접힘 표를 API 표 데이터로 표시한다.
 * 연결: DataTableCard, DetailToggleBar, EquipmentSelect, ExcelSaveButton, useSupportGenerationStatus.
 * 설명: 표 헤더/행/장비 옵션은 adapter에서 만든 view model을 사용하고 section은 UI 상태만 가진다.
 * 수정: 상세 패널 간격은 styles/SupportGenerationDetailTableSection.css에서 조정한다.
 */
export function SupportGenerationDetailTableSection({ table }: SupportGenerationDetailTableSectionProps) {
  const [expanded, setExpanded] = useState(table.defaultExpanded);
  const [equipment, setEquipment] = useState(table.defaultEquipmentValue);

  return (
    <div className="support-generation-detail">
      <DataTableCard
        ariaLabel={table.ariaLabel}
        headerRows={table.headerRows}
        rows={table.rows}
        minWidth={table.minWidth}
        excel={{ fileName: '보조발전_운전상세현황', sheetName: '운전 상세 현황' }}
        className="support-generation-detail__panel"
      />

      <DetailToggleBar label="Diesel 상세 내역 보기" expanded={expanded} onClick={() => setExpanded((value) => !value)} />

      <CollapsibleContent open={expanded}>
        <DataTableCard
          ariaLabel="보조 발전현황 장비 상세 내역"
          headerRows={table.headerRows}
          rows={table.rows}
          minWidth={table.minWidth}
          actions={
            <div className="inline-actions">
              <EquipmentSelect
                aria-label="보조발전 장비 선택"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                options={table.equipmentOptions}
              />
              <ExcelSaveButton
                fileName={`보조발전_${equipment}_상세내역`}
                sheets={[
                  {
                    name: 'Diesel 상세 내역',
                    headerRows: table.headerRows,
                    rows: table.rows
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
