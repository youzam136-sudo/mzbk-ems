import { useState } from 'react';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageHeading } from '../../../../shared/ui/PageHeading';
import { supportGenerationHistoryDefaultCriteria } from '../constants/supportGenerationHistoryConfig';
import { SupportGenerationHistoryResultSection } from '../sections/SupportGenerationHistoryResultSection';
import { SupportGenerationHistorySearchSection } from '../sections/SupportGenerationHistorySearchSection';
import type { SupportGenerationHistoryMode } from '../types/supportGenerationHistory';
import '../../shared/HistoryPageLayout.css';

/*
 * 필요: PPT의 보조발전 이력 화면을 독립 route에서 확인할 수 있게 조립한다.
 * 연결: SupportGenerationHistorySearchSection, SupportGenerationHistoryResultSection.
 * 설명: 검색 조건과 조회 시각은 page 상태로 두고 결과 영역에서 API를 조회한다.
 * 수정: 최종 메뉴명이 바뀌면 PageHeading 제목과 navigationGroups를 같이 조정한다.
 */
export function SupportGenerationHistoryPage() {
  const [searchCriteria, setSearchCriteria] =
    useState<SearchConditionCriteria<SupportGenerationHistoryMode>>(supportGenerationHistoryDefaultCriteria);
  const [searchedAt, setSearchedAt] = useState('조회 전');

  const handleSearch = (nextCriteria: SearchConditionCriteria<SupportGenerationHistoryMode>) => {
    setSearchCriteria(nextCriteria);
    setSearchedAt(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
  };

  return (
    <div className="page-stack history-page">
      <PageHeading title="보조발전 이력" />
      <SupportGenerationHistorySearchSection onSearch={handleSearch} />
      <SupportGenerationHistoryResultSection searchCriteria={searchCriteria} searchedAt={searchedAt} />
    </div>
  );
}
