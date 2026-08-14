import { usePlantOperationV2Status } from '../hooks/usePlantOperationV2Status';
import { PlantOperationDiagramSection } from '../sections/PlantOperationDiagramSection';

/*
 * 필요: dashboard v2 shell board의 좌표/선은 유지하고 API 값만 주입한다.
 * 연결: usePlantOperationV2Status, PlantOperationDiagramSection, AppRouter, Sidebar.
 * 설명: 기존 monitoring 조합 hook 대신 v2 전용 `/dashboard/individual?groupBySerial=true` 조회 결과를 사용한다.
 * 수정: API 실패 시 오류 상태는 diagram section에 위임하고, shell data는 adapter 슬롯 fixture로 남긴다.
 */
export function PlantOperationStatusPage() {
  const { data, isLoading, errorMessage } = usePlantOperationV2Status();

  return (
    <div className="page-stack plant-operation-page">
      <PlantOperationDiagramSection
        data={data}
        targetOptions={[]}
        selectedTargetId=""
        onTargetChange={() => undefined}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </div>
  );
}
