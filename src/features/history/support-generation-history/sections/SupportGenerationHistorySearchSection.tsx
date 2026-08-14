import { SearchConditionBar, type SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import {
  supportGenerationHistoryDefaultCriteria,
  supportGenerationHistoryModes
} from '../constants/supportGenerationHistoryConfig';
import type { SupportGenerationHistoryMode } from '../types/supportGenerationHistory';

type SupportGenerationHistorySearchSectionProps = {
  onSearch: (criteria: SearchConditionCriteria<SupportGenerationHistoryMode>) => void;
};

/*
 * 필요: 보조발전 이력 조회 조건 UI를 page title 아래 좌측 정렬로 연결한다.
 * 연결: SearchConditionBar, supportGenerationHistoryConfig.
 * 설명: 선택 조건은 상위 page로 전달하고 결과 영역의 API 조회 조건으로 사용한다.
 * 수정: 조회 모드와 기본 날짜는 constants/supportGenerationHistoryConfig.ts에서 조정한다.
 */
export function SupportGenerationHistorySearchSection({ onSearch }: SupportGenerationHistorySearchSectionProps) {
  return (
    <SearchConditionBar
      modes={supportGenerationHistoryModes}
      defaultMode={supportGenerationHistoryDefaultCriteria.mode}
      align="left"
      className="history-search-bar"
      defaultStartDate={supportGenerationHistoryDefaultCriteria.startDate}
      defaultEndDate={supportGenerationHistoryDefaultCriteria.endDate}
      defaultYear={supportGenerationHistoryDefaultCriteria.year}
      defaultMonth={supportGenerationHistoryDefaultCriteria.month}
      onSearch={onSearch}
    />
  );
}
