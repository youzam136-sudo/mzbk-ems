import { PageHeading } from '../../../../shared/ui/PageHeading';
import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import { useSupportGenerationStatus } from '../hooks/useSupportGenerationStatus';
import { SupportGenerationDetailTableSection } from '../sections/SupportGenerationDetailTableSection';
import { SupportGenerationSummarySection } from '../sections/SupportGenerationSummarySection';

/*
 * 필요: 보조 발전현황의 API 조회와 화면 섹션 조립을 page에서 담당한다.
 * 연결: useSupportGenerationStatus, SupportGenerationSummarySection, SupportGenerationDetailTableSection.
 * 설명: API 응답을 변환한 view model만 섹션에 전달한다.
 * 수정: 화면 전체 배치는 공통 page-stack과 각 section styles에서 조정한다.
 */
export function SupportGenerationStatusPage() {
  const { data, isLoading, errorMessage } = useSupportGenerationStatus();

  return (
    <div className="page-stack">
      <PageHeading title="보조 발전현황" />

      {isLoading && <PageDataLoadingFallback title="보조 발전현황" />}

      {!isLoading && errorMessage && (
        <div className="base-generation-page__message" role="alert">
          {errorMessage}
        </div>
      )}

      {!isLoading && data && (
        <>
          <SupportGenerationSummarySection summary={data.summary} trendChart={data.trendChart} />
          <SupportGenerationDetailTableSection table={data.table} />
        </>
      )}
    </div>
  );
}
