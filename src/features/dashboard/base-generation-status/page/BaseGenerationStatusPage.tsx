import { PageHeading } from '../../../../shared/ui/PageHeading';
import { BaseGenerationStatusScaffoldSection } from '../sections/BaseGenerationStatusScaffoldSection';

/*
 * 필요: 기저 발전현황 이미지가 별도 화면인지 확인할 수 있는 비교용 page를 둔다.
 * 연결: BaseGenerationStatusScaffoldSection.
 * 설명: 동일/별도 화면 확정 전이라 라우터에는 연결하지 않는 스캐폴딩이다.
 * 수정: route 연결 여부는 app/router.tsx에서 별도 확인 후 처리한다.
 */
export function BaseGenerationStatusPage() {
  return (
    <div className="page-stack">
      <PageHeading title="기저 발전현황" />
      <BaseGenerationStatusScaffoldSection />
    </div>
  );
}
