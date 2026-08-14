import { PageHeading } from '../../../../shared/ui/PageHeading';
import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import { usePowerConsumptionStatus } from '../hooks/usePowerConsumptionStatus';
import { PowerConsumptionSummarySection } from '../sections/PowerConsumptionSummarySection';
import { PowerConsumptionTableSection } from '../sections/PowerConsumptionTableSection';

/*
 * 필요: 전력 소비 현황의 API 조회와 섹션 조립을 담당한다.
 * 연결: usePowerConsumptionStatus, PowerConsumptionSummarySection, PowerConsumptionTableSection.
 * 설명: API 기반 view model만 화면 섹션에 전달한다.
 * 수정: 전용 전력 소비 API가 생기면 hook/adapter부터 교체한다.
 */
export function PowerConsumptionStatusPage() {
  const { data, isLoading, errorMessage } = usePowerConsumptionStatus();

  return (
    <div className="page-stack">
      <PageHeading title="전력 소비 현황" />

      {isLoading && <PageDataLoadingFallback title="전력 소비 현황" />}

      {!isLoading && errorMessage && (
        <div className="base-generation-page__message" role="alert">
          {errorMessage}
        </div>
      )}

      {!isLoading && data && (
        <>
          <PowerConsumptionSummarySection summary={data.summary} trendChart={data.trendChart} />
          <PowerConsumptionTableSection table={data.table} bankTable={data.bankTable} />
        </>
      )}
    </div>
  );
}
