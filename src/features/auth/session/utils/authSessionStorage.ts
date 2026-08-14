import type { AuthSession } from '../types/authSession';
import { authTokenStorage } from '../../../../shared/api/authTokenStorage';

const PERSIST_SESSION_KEY = 'ems-auth-session';
const BROWSER_SESSION_KEY = 'ems-browser-session';

function readJsonSession(value: string | null): AuthSession | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    return null;
  }
}

function getNormalizedTokenType(tokenType: string | undefined) {
  return tokenType?.trim() || 'Bearer';
}

function restoreTokenFromSession(session: AuthSession | null): AuthSession | null {
  if (!session?.accessToken) return null;

  const restoredSession: AuthSession = {
    ...session,
    tokenType: getNormalizedTokenType(session.tokenType)
  };

  // 세션은 남아 있는데 API 토큰 저장소만 비어 있는 이전 브라우저 상태를 복구한다.
  authTokenStorage.write(
    {
      accessToken: restoredSession.accessToken,
      tokenType: restoredSession.tokenType
    },
    restoredSession.remember
  );

  return restoredSession;
}

/*
 * 필요: 자동로그인 여부에 따라 로그인 유지 저장소를 나눈다.
 * 연결: AuthSessionProvider.
 * 설명: 자동로그인은 localStorage, 일반 로그인은 sessionStorage만 사용한다.
 * 수정: 저장 키나 만료 정책이 필요하면 이 파일에서만 조정한다.
 */
export const authSessionStorage = {
  read() {
    return (
      restoreTokenFromSession(readJsonSession(localStorage.getItem(PERSIST_SESSION_KEY))) ??
      restoreTokenFromSession(readJsonSession(sessionStorage.getItem(BROWSER_SESSION_KEY)))
    );
  },
  write(session: AuthSession) {
    this.clear();
    const storedSession: AuthSession = {
      ...session,
      tokenType: getNormalizedTokenType(session.tokenType)
    };
    const serializedSession = JSON.stringify(storedSession);
    authTokenStorage.write({ accessToken: storedSession.accessToken, tokenType: storedSession.tokenType }, storedSession.remember);

    if (storedSession.remember) {
      localStorage.setItem(PERSIST_SESSION_KEY, serializedSession);
      return;
    }

    sessionStorage.setItem(BROWSER_SESSION_KEY, serializedSession);
  },
  clear() {
    localStorage.removeItem(PERSIST_SESSION_KEY);
    sessionStorage.removeItem(BROWSER_SESSION_KEY);
    authTokenStorage.clear();
  }
};
