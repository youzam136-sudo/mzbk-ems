import { useState } from 'react';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageHeading } from '../../../../shared/ui/PageHeading';
import { pcsChargeDischargeHistoryDefaultCriteria } from '../constants/pcsChargeDischargeHistoryConfig';
import { PcsChargeDischargeHistoryResultSection } from '../sections/PcsChargeDischargeHistoryResultSection';
import { PcsChargeDischargeHistorySearchSection } from '../sections/PcsChargeDischargeHistorySearchSection';
import type { PcsChargeDischargeHistoryMode } from '../types/pcsChargeDischargeHistory';
import '../../shared/HistoryPageLayout.css';

/*
 * 필요: PCS 충방전 이력의 제목, 검색 조건, 결과 영역을 page에서 연결한다.
 * 연결: PageHeading actions, PcsChargeDischargeHistorySearchSection, PcsChargeDischargeHistoryResultSection.
 * 설명: 검색 조건은 constants에서 받고 결과 영역은 API 이력 데이터를 조회한다.
 * 수정: route 이름 확정 시 app/router.tsx와 navigation을 같이 확인한다.
 */
export function PcsChargeDischargeHistoryPage() {
  const [searchCriteria, setSearchCriteria] =
    useState<SearchConditionCriteria<PcsChargeDischargeHistoryMode>>(pcsChargeDischargeHistoryDefaultCriteria);
  const [searchedAt, setSearchedAt] = useState('조회 전');

  const handleSearch = (nextCriteria: SearchConditionCriteria<PcsChargeDischargeHistoryMode>) => {
    setSearchCriteria(nextCriteria);
    setSearchedAt(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
  };

  return (
    <div className="page-stack history-page">
      <PageHeading title="PCS 충방전 이력" />
      <PcsChargeDischargeHistorySearchSection onSearch={handleSearch} />
      <PcsChargeDischargeHistoryResultSection searchCriteria={searchCriteria} searchedAt={searchedAt} />
    </div>
  );
}
