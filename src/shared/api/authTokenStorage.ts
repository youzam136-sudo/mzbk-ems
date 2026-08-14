const PERSIST_AUTH_TOKEN_KEY = 'ems-auth-token';
const BROWSER_AUTH_TOKEN_KEY = 'ems-browser-auth-token';

export type StoredAuthToken = {
  accessToken: string;
  tokenType: string;
};

/*
 * 필요: 화면 세션과 별도로 API Authorization에 쓸 토큰을 보관한다.
 * 연결: apiClient, AuthSessionProvider, authSessionStorage.
 * 설명: 자동로그인은 localStorage, 일반 로그인은 sessionStorage에 저장한다.
 * 수정: 쿠키 인증으로 바뀌면 이 저장소와 apiClient 헤더 처리를 함께 정리한다.
 */
function readJsonToken(value: string | null): StoredAuthToken | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as StoredAuthToken;
  } catch {
    return null;
  }
}

export const authTokenStorage = {
  read() {
    return readJsonToken(localStorage.getItem(PERSIST_AUTH_TOKEN_KEY)) ?? readJsonToken(sessionStorage.getItem(BROWSER_AUTH_TOKEN_KEY));
  },
  write(token: StoredAuthToken, remember: boolean) {
    this.clear();
    const serializedToken = JSON.stringify(token);

    if (remember) {
      localStorage.setItem(PERSIST_AUTH_TOKEN_KEY, serializedToken);
      return;
    }

    sessionStorage.setItem(BROWSER_AUTH_TOKEN_KEY, serializedToken);
  },
  clear() {
    localStorage.removeItem(PERSIST_AUTH_TOKEN_KEY);
    sessionStorage.removeItem(BROWSER_AUTH_TOKEN_KEY);
  }
};
