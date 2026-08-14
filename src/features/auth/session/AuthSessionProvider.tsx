import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { API_AUTH_REQUIRED_EVENT, ApiError } from '../../../shared/api/apiClient';
import { authTokenStorage } from '../../../shared/api/authTokenStorage';
import { authApi, toAuthSessionMenus, toAuthSessionUser } from './api/authApi';
import type { AuthSession, LoginSessionRequest } from './types/authSession';
import { authSessionStorage } from './utils/authSessionStorage';

type AuthSessionContextValue = {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (request: LoginSessionRequest) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

type AuthSessionProviderProps = {
  children: ReactNode;
};

/*
 * 필요: 로그인 여부와 실제 API 세션을 앱 전체 route와 topbar에서 공유한다.
 * 연결: router guard, LoginPage, Topbar, authApi, authTokenStorage.
 * 설명: 저장된 토큰은 먼저 화면에 반영하고, /me와 /me/menus 재확인은 백그라운드에서 처리한다.
 * 수정: 인증 흐름이 바뀌면 login/logout/refreshSession만 우선 확인한다.
 */
export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const [initialSession] = useState<AuthSession | null>(() => authSessionStorage.read());
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [isInitializing, setIsInitializing] = useState(Boolean(initialSession));

  useEffect(() => {
    let mounted = true;

    async function refreshSession() {
      if (!initialSession) {
        setIsInitializing(false);
        return;
      }

      try {
        const me = await authApi.me();
        if (!mounted) return;

        const refreshedSession: AuthSession = {
          ...initialSession,
          user: toAuthSessionUser(me)
        };
        authSessionStorage.write(refreshedSession);
        setSession(refreshedSession);

        try {
          const menus = await authApi.menus();
          if (!mounted) return;

          const sessionWithMenus: AuthSession = {
            ...refreshedSession,
            menus: toAuthSessionMenus(menus)
          };
          authSessionStorage.write(sessionWithMenus);
          setSession(sessionWithMenus);
        } catch (error) {
          if (error instanceof ApiError && error.type === 'session') {
            throw error;
          }
        }
      } catch (error) {
        authSessionStorage.clear();
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    refreshSession();

    return () => {
      mounted = false;
    };
  }, [initialSession]);

  useEffect(() => {
    const handleAuthRequired = () => {
      authSessionStorage.clear();
      setSession(null);
      setIsInitializing(false);
    };

    window.addEventListener(API_AUTH_REQUIRED_EVENT, handleAuthRequired);
    return () => {
      window.removeEventListener(API_AUTH_REQUIRED_EVENT, handleAuthRequired);
    };
  }, []);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      isInitializing,
      async login(request) {
        const loginResponse = await authApi.login({
          userId: request.id,
          password: request.password
        });
        authTokenStorage.write({ accessToken: loginResponse.accessToken, tokenType: loginResponse.tokenType }, request.remember);
        const nextSession: AuthSession = {
          user: toAuthSessionUser(loginResponse),
          menus: [],
          accessToken: loginResponse.accessToken,
          tokenType: loginResponse.tokenType,
          remember: request.remember,
          loggedInAt: new Date().toISOString()
        };

        authSessionStorage.write(nextSession);
        setSession(nextSession);

        /*
         * 메뉴는 로그인 화면 이동을 막지 않도록 후속 갱신한다.
         * 로그인 토큰이 바뀌었거나 로그아웃된 뒤에는 이전 메뉴 응답으로 세션을 덮어쓰지 않는다.
         */
        void authApi
          .menus()
          .then((menus) => {
            const sessionWithMenus: AuthSession = {
              ...nextSession,
              menus: toAuthSessionMenus(menus)
            };

            setSession((currentSession) => {
              if (currentSession?.accessToken !== nextSession.accessToken) {
                return currentSession;
              }

              authSessionStorage.write(sessionWithMenus);
              return sessionWithMenus;
            });
          })
          .catch(() => undefined);

        return nextSession;
      },
      async logout() {
        const logoutRequest = authApi.logout();

        authSessionStorage.clear();
        setSession(null);

        try {
          await logoutRequest;
        } catch {
          // 화면 세션은 이미 종료했으므로 서버 로그아웃 실패는 다음 인증 확인에서 정리한다.
        }
      }
    }),
    [isInitializing, session]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error('AuthSessionProvider 안에서만 useAuthSession을 사용할 수 있습니다.');
  }

  return context;
}
