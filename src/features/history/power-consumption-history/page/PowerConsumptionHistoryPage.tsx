import { useState } from 'react';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageHeading } from '../../../../shared/ui/PageHeading';
import { powerConsumptionHistoryDefaultCriteria } from '../constants/powerConsumptionHistoryConfig';
import { PowerConsumptionHistoryResultSection } from '../sections/PowerConsumptionHistoryResultSection';
import { PowerConsumptionHistorySearchSection } from '../sections/PowerConsumptionHistorySearchSection';
import type { PowerConsumptionHistoryMode } from '../types/powerConsumptionHistory';
import '../../shared/HistoryPageLayout.css';

/*
 * 필요: PPT의 전력소비 이력 화면을 독립 route로 조립한다.
 * 연결: PowerConsumptionHistorySearchSection, PowerConsumptionHistoryResultSection.
 * 설명: 검색 조건과 조회 시각은 page 상태로 관리하고 결과 영역에서 API를 조회한다.
 * 수정: 최종 메뉴명 확정 시 제목과 navigationGroups를 같이 조정한다.
 */
export function PowerConsumptionHistoryPage() {
  const [searchCriteria, setSearchCriteria] =
    useState<SearchConditionCriteria<PowerConsumptionHistoryMode>>(powerConsumptionHistoryDefaultCriteria);
  const [searchedAt, setSearchedAt] = useState('조회 전');

  const handleSearch = (nextCriteria: SearchConditionCriteria<PowerConsumptionHistoryMode>) => {
    setSearchCriteria(nextCriteria);
    setSearchedAt(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
  };

  return (
    <div className="page-stack history-page">
      <PageHeading title="전력소비 이력" />
      <PowerConsumptionHistorySearchSection onSearch={handleSearch} />
      <PowerConsumptionHistoryResultSection searchCriteria={searchCriteria} searchedAt={searchedAt} />
    </div>
  );
}
