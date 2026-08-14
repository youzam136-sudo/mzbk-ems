import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { SearchConditionBar } from '../../../../shared/ui/SearchConditionBar';
import {
  pcsChargeDischargeHistoryDefaultCriteria,
  pcsChargeDischargeHistoryModes
} from '../constants/pcsChargeDischargeHistoryConfig';
import type { PcsChargeDischargeHistoryMode } from '../types/pcsChargeDischargeHistory';

type PcsChargeDischargeHistorySearchSectionProps = {
  onSearch: (criteria: SearchConditionCriteria<PcsChargeDischargeHistoryMode>) => void;
};

/*
 * 필요: PCS 이력의 기간 선택 검색 UI를 공통 검색 바로 표시한다.
 * 연결: SearchConditionBar, pcsChargeDischargeHistoryConfig.
 * 설명: 조회 버튼으로 선택 조건을 상위 page에 전달하고 결과 영역에서 API를 다시 조회한다.
 * 수정: 기본 선택값은 constants/pcsChargeDischargeHistoryConfig.ts에서 조정한다.
 */
export function PcsChargeDischargeHistorySearchSection({ onSearch }: PcsChargeDischargeHistorySearchSectionProps) {
  return (
    <SearchConditionBar
      modes={pcsChargeDischargeHistoryModes}
      defaultMode={pcsChargeDischargeHistoryDefaultCriteria.mode}
      align="left"
      className="history-search-bar"
      defaultStartDate={pcsChargeDischargeHistoryDefaultCriteria.startDate}
      defaultEndDate={pcsChargeDischargeHistoryDefaultCriteria.endDate}
      defaultYear={pcsChargeDischargeHistoryDefaultCriteria.year}
      defaultMonth={pcsChargeDischargeHistoryDefaultCriteria.month}
      onSearch={onSearch}
    />
  );
}
