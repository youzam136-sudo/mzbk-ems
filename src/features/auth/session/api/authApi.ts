import { apiClient } from '../../../../shared/api/apiClient';
import type { AuthSessionMenu, AuthSessionUser } from '../types/authSession';

export type LoginRequestDto = {
  userId: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken: string;
  tokenType: string;
  userId: string;
  userName: string;
  roleIds: string[];
};

export type MeResponseDto = {
  userId: string;
  userName: string;
  roleIds: string[];
};

export type MyMenuResponseDto = {
  sysMenuId: string;
  sysUprmenuId?: string;
  menuNm: string;
  menuUrl?: string;
  menuLvl: number;
  sortOrd: number;
  children?: MyMenuResponseDto[];
};

/*
 * 필요: 인증 API 응답 DTO를 화면 세션 타입으로 바꾼다.
 * 연결: AuthSessionProvider, Topbar, 보호 route.
 * 설명: 화면은 AuthSession 타입만 보고, Swagger 필드명 변경은 이 파일에서 흡수한다.
 * 수정: /me, /me/menus 응답 필드가 바뀌면 변환 함수와 DTO 타입을 같이 수정한다.
 */
export function toAuthSessionUser(response: LoginResponseDto | MeResponseDto): AuthSessionUser {
  return {
    id: response.userId,
    name: response.userName,
    roleLabel: response.roleIds.join(', ') || '사용자',
    roleIds: response.roleIds
  };
}

export function toAuthSessionMenus(response: MyMenuResponseDto[]): AuthSessionMenu[] {
  return response.map((menu) => ({
    sysMenuId: menu.sysMenuId,
    sysUprmenuId: menu.sysUprmenuId,
    menuNm: menu.menuNm,
    menuUrl: menu.menuUrl,
    menuLvl: menu.menuLvl,
    sortOrd: menu.sortOrd,
    children: menu.children ? toAuthSessionMenus(menu.children) : undefined
  }));
}

export const authApi = {
  login(request: LoginRequestDto) {
    return apiClient<LoginResponseDto>('/auth/login', {
      method: 'POST',
      auth: false,
      body: request,
      operationName: '로그인'
    });
  },
  me() {
    return apiClient<MeResponseDto>('/me', { operationName: '내 계정 정보 조회' });
  },
  menus() {
    return apiClient<MyMenuResponseDto[]>('/me/menus', { operationName: '내 메뉴 조회' });
  },
  logout() {
    return apiClient<void>('/auth/logout', { method: 'POST', operationName: '로그아웃' });
  }
};
