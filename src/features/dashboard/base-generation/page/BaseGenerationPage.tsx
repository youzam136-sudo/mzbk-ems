import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { MonitoringDomain } from '../../../../shared/api/monitoringApi';
import { useBaseGenerationStatus } from '../hooks/useBaseGenerationStatus';
import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import { PageHeading } from '../../../../shared/ui/PageHeading';
import { BaseGenerationSummarySection } from '../sections/BaseGenerationSummarySection';
import { BaseGenerationTableSection } from '../sections/BaseGenerationTableSection';
import '../styles/BaseGenerationPage.css';

function getBaseGenerationDomain(pathname: string): MonitoringDomain {
  return pathname.includes('/monitoring/base/plant') ? 'base-plant' : 'base-total';
}

function getBaseGenerationTitle(pathname: string) {
  if (pathname.includes('/monitoring/base/plant')) return '기저전력 개별 운영현황';
  if (pathname.includes('/monitoring/base/total')) return '기저전력 통합 운영현황';
  if (pathname.includes('/monitoring/grid')) return '기저전력 통합 운영현황';

  return '기저발전';
}

/*
 * 필요: 기저발전/기저전력 현황 화면의 제목, API 조회, 상단 요약, 하단 상세 표 순서를 유지한다.
 * 연결: useBaseGenerationStatus, BaseGenerationSummarySection, BaseGenerationTableSection.
 * 설명: route가 개별/통합 도메인을 결정하고, 화면 데이터 모양은 adapter와 section이 처리한다.
 * 수정: 화면 전체 여백은 styles/BaseGenerationPage.css, API 도메인 매핑은 이 파일의 helper에서 조정한다.
 */
export function BaseGenerationPage() {
  const location = useLocation();
  const domain = useMemo(() => getBaseGenerationDomain(location.pathname), [location.pathname]);
  const isTargetSelectable = domain === 'base-plant';
  const pageTitle = useMemo(() => getBaseGenerationTitle(location.pathname), [location.pathname]);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const { data, isLoading, errorMessage } = useBaseGenerationStatus(domain, isTargetSelectable ? selectedTargetId : '');

  useEffect(() => {
    if (!isTargetSelectable) {
      setSelectedTargetId('');
      return;
    }

    if (data?.selectedTargetId && data.selectedTargetId !== selectedTargetId) {
      setSelectedTargetId(data.selectedTargetId);
    }
  }, [data?.selectedTargetId, isTargetSelectable, selectedTargetId]);

  return (
    <div className="page-stack base-generation-page">
      <PageHeading title={pageTitle} />

      {isLoading && <PageDataLoadingFallback title={pageTitle} />}

      {!isLoading && errorMessage && (
        <div className="base-generation-page__message" role="alert">
          {errorMessage}
        </div>
      )}

      {!isLoading && data && (
        <>
          <BaseGenerationSummarySection summary={data.summary} trendChart={data.trendChart} />
          <BaseGenerationTableSection
            tables={data.tables}
            targetOptions={isTargetSelectable ? data.targetOptions : []}
            selectedTargetId={selectedTargetId || data.selectedTargetId}
            onTargetChange={setSelectedTargetId}
          />
        </>
      )}
    </div>
  );
}
