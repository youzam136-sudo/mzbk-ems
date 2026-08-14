import { useState } from 'react';
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import type { PowerConsumptionTableData } from '../types/powerConsumptionStatus';
import '../styles/PowerConsumptionTableSection.css';

type PowerConsumptionTableSectionProps = {
  table: PowerConsumptionTableData;
  bankTable: PowerConsumptionTableData;
};

/*
 * 필요: 전력 소비 상세 표와 BANK 상세 표를 API 표 데이터로 표시한다.
 * 연결: DataTableCard, DetailToggleBar, usePowerConsumptionStatus.
 * 설명: 표 데이터는 adapter가 만들고 section은 접힘 상태만 관리한다.
 * 수정: 상세 영역 간격은 styles/PowerConsumptionTableSection.css에서 조정한다.
 */
export function PowerConsumptionTableSection({ table, bankTable }: PowerConsumptionTableSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="power-consumption-table-section">
      <DataTableCard
        title=""
        ariaLabel={table.ariaLabel}
        headerRows={table.headerRows}
        rows={table.rows}
        minWidth={table.minWidth}
        excel={{ fileName: '전력소비현황_상세내역', sheetName: '전력 소비 상세' }}
      />

      <DetailToggleBar label="BANK 상세 내역 보기" expanded={expanded} onClick={() => setExpanded((value) => !value)} />

      <CollapsibleContent open={expanded}>
        <DataTableCard
          ariaLabel={bankTable.ariaLabel}
          headerRows={bankTable.headerRows}
          rows={bankTable.rows}
          minWidth={bankTable.minWidth}
          excel={{ fileName: '전력소비현황_BANK상세내역', sheetName: 'BANK 상세 내역' }}
        />
      </CollapsibleContent>
    </div>
  );
}
