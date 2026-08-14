import { useState } from 'react';
import { CollapsibleContent } from '../../../../shared/ui/CollapsibleContent';
import { DataTableCard } from '../../../../shared/ui/DataTableCard';
import { DetailToggleBar } from '../../../../shared/ui/DetailToggleBar';
import type { PcsChargeDischargeTableData } from '../types/pcsChargeDischargeStatus';
import '../styles/PcsChargeDischargeTableSection.css';

type PcsChargeDischargeTableSectionProps = {
  pcsTable: PcsChargeDischargeTableData;
  batteryTable: PcsChargeDischargeTableData;
};

/*
 * 필요: PCS 상세 표와 BATTERY 접힘 표를 API 표 데이터로 표시한다.
 * 연결: DataTableCard, DetailToggleBar, usePcsChargeDischargeStatus.
 * 설명: 표 헤더와 행은 adapter가 만들고 section은 접힘 상태만 관리한다.
 * 수정: 패널 폭과 여백은 styles/PcsChargeDischargeTableSection.css에서 조정한다.
 */
export function PcsChargeDischargeTableSection({ pcsTable, batteryTable }: PcsChargeDischargeTableSectionProps) {
  const [batteryExpanded, setBatteryExpanded] = useState(true);

  return (
    <div className="pcs-charge-table-section">
      <DataTableCard
        title=""
        ariaLabel={pcsTable.ariaLabel}
        headerRows={pcsTable.headerRows}
        rows={pcsTable.rows}
        minWidth={pcsTable.minWidth}
        excel={{ fileName: 'PCS_충방전_PCS상세내역', sheetName: 'PCS 상세 내역' }}
      />

      <DetailToggleBar
        label="BATTERY 상세 내역 보기"
        expanded={batteryExpanded}
        onClick={() => setBatteryExpanded((value) => !value)}
      />

      <CollapsibleContent open={batteryExpanded}>
        <DataTableCard
          ariaLabel={batteryTable.ariaLabel}
          headerRows={batteryTable.headerRows}
          rows={batteryTable.rows}
          minWidth={batteryTable.minWidth}
          excel={{ fileName: 'PCS_충방전_BATTERY상세내역', sheetName: 'BATTERY 상세 내역' }}
        />
      </CollapsibleContent>
    </div>
  );
}
