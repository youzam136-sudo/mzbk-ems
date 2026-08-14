import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="empty-state">
      <h1>페이지를 찾을 수 없음</h1>
      <p>라우트 구성이 없는 화면이다. 로그인으로 돌아가거나 대시보드로 이동하면 된다.</p>
      <div className="empty-state__actions">
        <Link className="link-button" to="/login">
          로그인
        </Link>
        <Link className="link-button is-primary" to="/dashboard/base-generation">
          대시보드
        </Link>
      </div>
    </div>
  );
}
