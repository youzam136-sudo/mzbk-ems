import { usePlantOperationV2TotalStatus } from '../hooks/usePlantOperationV2TotalStatus';
import { PlantOperationDiagramSection } from '../sections/PlantOperationDiagramSection';

/*
 * 필요: 기존 individual 대시보드는 유지하고 total 타입 대시보드를 별도 진입점으로 렌더링한다.
 * 연결: usePlantOperationV2TotalStatus, PlantOperationDiagramSection, AppRouter.
 * 설명: total 타입은 `/dashboard/integrated?groupBySerial=true`를 기준으로 인버터 상세표를 추가 표시한다.
 * 수정: individual 화면과 다른 좌표/데이터 정책은 total hook/variant에서만 조정한다.
 */
export function PlantOperationTotalStatusPage() {
  const { data, isLoading, errorMessage } = usePlantOperationV2TotalStatus();

  return (
    <div className="page-stack plant-operation-page">
      <PlantOperationDiagramSection
        data={data}
        targetOptions={[]}
        selectedTargetId=""
        onTargetChange={() => undefined}
        isLoading={isLoading}
        errorMessage={errorMessage}
        variant="total"
      />
    </div>
  );
}
