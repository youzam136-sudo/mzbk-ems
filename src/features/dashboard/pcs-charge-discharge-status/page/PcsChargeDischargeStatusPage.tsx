import { PageHeading } from '../../../../shared/ui/PageHeading';
import { PageDataLoadingFallback } from '../../../../shared/ui/PageDataLoadingFallback';
import { usePcsChargeDischargeStatus } from '../hooks/usePcsChargeDischargeStatus';
import { PcsChargeDischargeSummarySection } from '../sections/PcsChargeDischargeSummarySection';
import { PcsChargeDischargeTableSection } from '../sections/PcsChargeDischargeTableSection';

/*
 * 필요: PCS 충방전 화면의 API 조회와 섹션 조립을 담당한다.
 * 연결: usePcsChargeDischargeStatus, PcsChargeDischargeSummarySection, PcsChargeDischargeTableSection.
 * 설명: PCS/Battery API 응답을 변환한 view model만 전달한다.
 * 수정: 화면 전체 배치는 공통 page-stack과 각 section styles에서 조정한다.
 */
export function PcsChargeDischargeStatusPage() {
  const { data, isLoading, errorMessage } = usePcsChargeDischargeStatus();

  return (
    <div className="page-stack">
      <PageHeading title="PCS 충방전" />

      {isLoading && <PageDataLoadingFallback title="PCS 충방전" />}

      {!isLoading && errorMessage && (
        <div className="base-generation-page__message" role="alert">
          {errorMessage}
        </div>
      )}

      {!isLoading && data && (
        <>
          <PcsChargeDischargeSummarySection summary={data.summary} chart={data.chart} />
          <PcsChargeDischargeTableSection pcsTable={data.pcsTable} batteryTable={data.batteryTable} />
        </>
      )}
    </div>
  );
}
