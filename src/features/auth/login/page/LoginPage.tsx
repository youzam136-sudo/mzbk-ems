import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logoMark from '../../../../assets/logo-comm.svg';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAuthSession } from '../../session/AuthSessionProvider';
import { loginScreenText } from '../constants/loginScreenText';
import { LoginForm } from '../sections/LoginForm';
import '../styles/LoginPage.css';

const DEFAULT_DASHBOARD_PATH = '/dashboard/individual';

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.code === 'C002' || error.code === 'C999') {
      return '아이디 또는 비밀번호가 일치하지 않습니다.';
    }

    return error.message;
  }

  return '로그인 처리 중 오류가 발생했습니다.';
}

/*
 * 필요: 로그인 화면의 입력 결과를 실제 인증 세션으로 연결한다.
 * 연결: LoginForm, AuthSessionProvider.login, 보호 route 복귀 경로.
 * 설명: 로그인 성공 시 이전 접근 경로가 있으면 그 화면으로, 없으면 대시보드 화면으로 이동한다.
 * 수정: 기본 진입 화면을 바꿀 때는 fromPath fallback과 router 기본 redirect를 같이 확인한다.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthSession();
  const [autoLogin, setAutoLogin] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? DEFAULT_DASHBOARD_PATH;

  return (
    <section className="login-shell">
      <div className="login-card">
        <h1 className="sr-only">{loginScreenText.pageTitle}</h1>

        <img src={logoMark} alt={loginScreenText.logoAlt} className="login-card__logo" />

        <LoginForm
          autoLogin={autoLogin}
          onAutoLoginChange={setAutoLogin}
          errorMessage={loginErrorMessage}
          submitting={submitting}
          onInputChange={() => setLoginErrorMessage('')}
          onSubmit={async (credentials) => {
            setLoginErrorMessage('');
            setSubmitting(true);

            try {
              await login({ id: credentials.id, password: credentials.password, remember: autoLogin });
              navigate(fromPath, { replace: true });
            } catch (error) {
              setLoginErrorMessage(getLoginErrorMessage(error));
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </div>
    </section>
  );
}
