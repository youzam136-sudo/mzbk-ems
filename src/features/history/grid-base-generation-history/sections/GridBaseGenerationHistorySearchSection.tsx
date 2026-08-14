import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { SearchConditionBar } from '../../../../shared/ui/SearchConditionBar';
import {
  gridBaseGenerationHistoryDefaultCriteria,
  gridBaseGenerationHistoryModes
} from '../constants/gridBaseGenerationHistoryConfig';
import type { GridBaseGenerationHistoryMode } from '../types/gridBaseGenerationHistory';

type GridBaseGenerationHistorySearchSectionProps = {
  onSearch: (criteria: SearchConditionCriteria<GridBaseGenerationHistoryMode>) => void;
};

/*
 * 필요: Year, Month, Duration 조회 조건 UI를 이력 제목 아래 좌측 정렬로 붙인다.
 * 연결: SearchConditionBar, gridBaseGenerationHistoryConfig.
 * 설명: 검색 바는 조건 상태만 만들고 결과 영역에서 해당 조건으로 API를 조회한다.
 * 수정: 모드 목록과 기본 날짜는 constants 파일에서 조정한다.
 */
export function GridBaseGenerationHistorySearchSection({ onSearch }: GridBaseGenerationHistorySearchSectionProps) {
  return (
    <SearchConditionBar
      modes={gridBaseGenerationHistoryModes}
      defaultMode={gridBaseGenerationHistoryDefaultCriteria.mode}
      align="left"
      className="history-search-bar"
      defaultStartDate={gridBaseGenerationHistoryDefaultCriteria.startDate}
      defaultEndDate={gridBaseGenerationHistoryDefaultCriteria.endDate}
      defaultYear={gridBaseGenerationHistoryDefaultCriteria.year}
      defaultMonth={gridBaseGenerationHistoryDefaultCriteria.month}
      onSearch={onSearch}
    />
  );
}
