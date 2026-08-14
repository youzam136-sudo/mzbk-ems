import { useState } from 'react';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageHeading } from '../../../../shared/ui/PageHeading';
import { gridBaseGenerationHistoryDefaultCriteria } from '../constants/gridBaseGenerationHistoryConfig';
import { GridBaseGenerationHistoryResultSection } from '../sections/GridBaseGenerationHistoryResultSection';
import { GridBaseGenerationHistorySearchSection } from '../sections/GridBaseGenerationHistorySearchSection';
import type { GridBaseGenerationHistoryMode } from '../types/gridBaseGenerationHistory';
import '../../shared/HistoryPageLayout.css';

/*
 * 필요: GRID 기저발전 이력의 검색 조건과 API 결과 영역을 page에서 연결한다.
 * 연결: PageHeading actions, GridBaseGenerationHistorySearchSection, GridBaseGenerationHistoryResultSection.
 * 설명: 기본 조건은 constants에 두고, 결과 데이터는 ResultSection의 API hook에서 조회한다.
 * 수정: 검색 조건 기본값은 constants/gridBaseGenerationHistoryConfig.ts에서 조정한다.
 */
export function GridBaseGenerationHistoryPage() {
  const [searchCriteria, setSearchCriteria] =
    useState<SearchConditionCriteria<GridBaseGenerationHistoryMode>>(gridBaseGenerationHistoryDefaultCriteria);
  const [searchedAt, setSearchedAt] = useState('조회 전');

  const handleSearch = (nextCriteria: SearchConditionCriteria<GridBaseGenerationHistoryMode>) => {
    setSearchCriteria(nextCriteria);
    setSearchedAt(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
  };

  return (
    <div className="page-stack history-page">
      <PageHeading title="GRID 기저발전 이력" />
      <GridBaseGenerationHistorySearchSection onSearch={handleSearch} />
      <GridBaseGenerationHistoryResultSection searchCriteria={searchCriteria} searchedAt={searchedAt} />
    </div>
  );
}
