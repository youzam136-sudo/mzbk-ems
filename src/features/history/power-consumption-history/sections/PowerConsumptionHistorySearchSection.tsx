import { SearchConditionBar, type SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import {
  powerConsumptionHistoryDefaultCriteria,
  powerConsumptionHistoryModes
} from '../constants/powerConsumptionHistoryConfig';
import type { PowerConsumptionHistoryMode } from '../types/powerConsumptionHistory';

type PowerConsumptionHistorySearchSectionProps = {
  onSearch: (criteria: SearchConditionCriteria<PowerConsumptionHistoryMode>) => void;
};

/*
 * 필요: 전력소비 이력 조회 조건 UI를 공통 검색 바로 연결한다.
 * 연결: SearchConditionBar, powerConsumptionHistoryConfig.
 * 설명: 조회 조건은 상위 page에 전달하고 결과 영역에서 API 조회 조건으로 사용한다.
 * 수정: 검색 기본값은 constants/powerConsumptionHistoryConfig.ts에서 조정한다.
 */
export function PowerConsumptionHistorySearchSection({ onSearch }: PowerConsumptionHistorySearchSectionProps) {
  return (
    <SearchConditionBar
      modes={powerConsumptionHistoryModes}
      defaultMode={powerConsumptionHistoryDefaultCriteria.mode}
      align="left"
      className="history-search-bar"
      defaultStartDate={powerConsumptionHistoryDefaultCriteria.startDate}
      defaultEndDate={powerConsumptionHistoryDefaultCriteria.endDate}
      defaultYear={powerConsumptionHistoryDefaultCriteria.year}
      defaultMonth={powerConsumptionHistoryDefaultCriteria.month}
      onSearch={onSearch}
    />
  );
}
