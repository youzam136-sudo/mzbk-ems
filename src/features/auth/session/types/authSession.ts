export type AuthSessionUser = {
  id: string;
  name: string;
  roleLabel: string;
  roleIds: string[];
};

export type AuthSessionMenu = {
  sysMenuId: string;
  sysUprmenuId?: string;
  menuNm: string;
  menuUrl?: string;
  menuLvl: number;
  sortOrd: number;
  children?: AuthSessionMenu[];
};

export type AuthSession = {
  user: AuthSessionUser;
  menus: AuthSessionMenu[];
  accessToken: string;
  tokenType: string;
  remember: boolean;
  loggedInAt: string;
};

export type LoginSessionRequest = {
  id: string;
  password: string;
  remember: boolean;
};
