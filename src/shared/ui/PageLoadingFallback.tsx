import './PageLoadingFallback.css';

type PageLoadingFallbackProps = {
  label?: string;
};

/*
 * 필요: lazy route가 불러와지는 동안 빈 화면 대신 공통 로딩 상태를 보여 준다.
 * 연결: app/router.tsx의 Suspense fallback.
 * 설명: 화면 코드 청크 로딩 전용 UI이며, 데이터 조회 로딩은 PageDataLoadingFallback에서 처리한다.
 */
export function PageLoadingFallback({ label = '화면을 불러오는 중입니다.' }: PageLoadingFallbackProps) {
  return (
    <div className="page-loading" role="status" aria-live="polite">
      <div className="page-loading__content">
        <span className="page-loading__spinner" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <span className="page-loading__bar" aria-hidden="true" />
    </div>
  );
}
