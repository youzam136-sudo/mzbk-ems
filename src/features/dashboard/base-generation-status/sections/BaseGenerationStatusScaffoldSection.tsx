import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import { useBaseGenerationStatus } from '../../base-generation/hooks/useBaseGenerationStatus';
import { BaseGenerationSummarySection } from '../../base-generation/sections/BaseGenerationSummarySection';
import { BaseGenerationTableSection } from '../../base-generation/sections/BaseGenerationTableSection';
import '../styles/BaseGenerationStatusScaffoldSection.css';

/*
 * 필요: 기저 발전현황 비교용 화면도 기저발전 API 데이터 흐름을 그대로 사용한다.
 * 연결: useBaseGenerationStatus, BaseGenerationSummarySection, BaseGenerationTableSection.
 * 설명: 별도 확정 전 스캐폴딩이더라도 GRID API view model만 렌더링한다.
 * 수정: 별도 화면으로 확정되면 adapter를 분리하되 API 호출 계층은 유지한다.
 */
export function BaseGenerationStatusScaffoldSection() {
  const { data, isLoading, errorMessage } = useBaseGenerationStatus();

  if (isLoading) {
    return <PageDataLoadingFallback title="기저 발전현황" />;
  }

  if (errorMessage) {
    return (
      <div className="base-generation-page__message" role="alert">
        {errorMessage}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="base-generation-status-scaffold">
      <BaseGenerationSummarySection summary={data.summary} trendChart={data.trendChart} />
      <BaseGenerationTableSection tables={data.tables} />
    </div>
  );
}
