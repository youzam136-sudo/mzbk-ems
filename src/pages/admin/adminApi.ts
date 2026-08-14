import { apiClient } from '../../shared/api/apiClient';
import type { ApiRecord } from '../../shared/api/apiDataUtils';
import { getRawValue } from '../../shared/api/apiDataUtils';
import { getPageContents, type ApiPageResponse } from '../../shared/api/monitoringApi';

export type MasterResource = 'plants' | 'pcs' | 'inverters' | 'batteries' | 'diesels';

export type RoleMenuNode = ApiRecord & {
  children?: RoleMenuNode[];
};

export type RoleMenuSaveItem = {
  sysMenuId: string;
  readYn: 'Y' | 'N';
  writeYn: 'Y' | 'N';
  useYn: 'Y' | 'N';
};

type MasterResourceEndpoint = {
  idKey: string;
  sequenceKey: string;
};

const masterResourceEndpoints: Record<MasterResource, MasterResourceEndpoint> = {
  plants: { idKey: 'plntId', sequenceKey: 'plntSeq' },
  pcs: { idKey: 'pcsId', sequenceKey: 'pcsSeq' },
  inverters: { idKey: 'ivtId', sequenceKey: 'ivtSeq' },
  batteries: { idKey: 'batId', sequenceKey: 'batSeq' },
  diesels: { idKey: 'dslId', sequenceKey: 'dslSeq' }
};

function toPagedRows(response: ApiPageResponse<ApiRecord> | ApiRecord[] | undefined) {
  return getPageContents(response);
}

function createMasterDetailPath(resource: MasterResource, row: ApiRecord) {
  const endpoint = masterResourceEndpoints[resource];
  const id = getRawValue(row[endpoint.idKey]);
  const sequence = getRawValue(row[endpoint.sequenceKey]);

  if (!id || !sequence) {
    return '';
  }

  return `/master/${resource}/${encodeURIComponent(id)}/${encodeURIComponent(sequence)}`;
}

export const adminApi = {
  async getUsers() {
    return toPagedRows(await apiClient<ApiPageResponse<ApiRecord> | ApiRecord[]>('/system/users', { operationName: '사용자 목록 조회' }));
  },
  async getUser(userId: string) {
    return apiClient<ApiRecord>(`/system/users/${encodeURIComponent(userId)}`, { operationName: '사용자 상세 조회' });
  },
  async saveUser(payload: Record<string, unknown>) {
    return apiClient<ApiRecord | void>('/system/users', {
      method: 'POST',
      body: payload,
      operationName: '사용자 등록'
    });
  },
  async updateUser(userId: string, payload: Record<string, unknown>) {
    return apiClient<ApiRecord | void>(`/system/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      body: payload,
      operationName: '사용자 수정'
    });
  },
  async deleteUser(userId: string, reason: string) {
    return apiClient<ApiRecord | void>(`/system/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      body: { reason },
      operationName: '사용자 삭제'
    });
  },
  async getRoles() {
    return toPagedRows(await apiClient<ApiPageResponse<ApiRecord> | ApiRecord[]>('/system/roles', { operationName: '권한 목록 조회' }));
  },
  async saveRole(payload: ApiRecord) {
    return apiClient<ApiRecord | void>('/system/roles', {
      method: 'POST',
      body: payload,
      operationName: '권한 등록'
    });
  },
  async deleteRole(roleId: string) {
    return apiClient<ApiRecord | void>(`/system/roles/${encodeURIComponent(roleId)}`, {
      method: 'DELETE',
      operationName: '권한 삭제'
    });
  },
  async getUserRoles(userId: string) {
    return apiClient<ApiRecord[]>(`/system/users/${encodeURIComponent(userId)}/roles`, { operationName: '사용자 권한 조회' });
  },
  async getCodes(params: { keyword?: string; includeUnused?: boolean } = {}) {
    const query = new URLSearchParams({ page: '1', size: '200' });

    if (params.keyword?.trim()) {
      query.set('keyword', params.keyword.trim());
    }

    if (!params.includeUnused) {
      query.set('useYn', 'Y');
    }

    return toPagedRows(
      await apiClient<ApiPageResponse<ApiRecord> | ApiRecord[]>(`/system/codes?${query.toString()}`, { operationName: '시스템 코드 목록 조회' })
    );
  },
  async getCodeChildren(codeId: string) {
    return apiClient<ApiRecord[]>(`/system/codes/${encodeURIComponent(codeId)}/children`, { operationName: '시스템 상세 코드 조회' });
  },
  async saveCode(payload: ApiRecord) {
    return apiClient<ApiRecord | void>('/system/codes', {
      method: 'POST',
      body: payload,
      operationName: '시스템 코드 등록'
    });
  },
  async updateCode(codeId: string, payload: ApiRecord) {
    return apiClient<ApiRecord | void>(`/system/codes/${encodeURIComponent(codeId)}`, {
      method: 'PUT',
      body: payload,
      operationName: '시스템 코드 수정'
    });
  },
  async deleteCode(codeId: string, reason: string) {
    return apiClient<ApiRecord | void>(`/system/codes/${encodeURIComponent(codeId)}`, {
      method: 'DELETE',
      body: { reason },
      operationName: '시스템 코드 삭제'
    });
  },
  async getRoleMenuTree(roleId: string) {
    return apiClient<RoleMenuNode[]>(`/system/roles/${encodeURIComponent(roleId)}/menus/tree`, { operationName: '권한 메뉴 트리 조회' });
  },
  async saveRoleMenus(roleId: string, items: RoleMenuSaveItem[]) {
    return apiClient<ApiRecord | void>(`/system/roles/${encodeURIComponent(roleId)}/menus`, {
      method: 'POST',
      body: { items },
      operationName: '권한 메뉴 저장'
    });
  },
  async getMasterRows(resource: MasterResource) {
    return toPagedRows(await apiClient<ApiPageResponse<ApiRecord> | ApiRecord[]>(`/master/${resource}`, { operationName: '마스터 목록 조회' }));
  },
  async getMasterDetail(resource: MasterResource, row: ApiRecord) {
    const detailPath = createMasterDetailPath(resource, row);

    if (!detailPath) {
      return row;
    }

    return apiClient<ApiRecord>(detailPath, { operationName: '마스터 상세 조회' });
  },
  async saveMaster(resource: MasterResource, payload: ApiRecord) {
    return apiClient<ApiRecord | void>(`/master/${resource}`, {
      method: 'POST',
      body: payload,
      operationName: '마스터 등록'
    });
  },
  async updateMaster(resource: MasterResource, row: ApiRecord, payload: ApiRecord) {
    const detailPath = createMasterDetailPath(resource, row);

    if (!detailPath) {
      return Promise.resolve();
    }

    return apiClient<ApiRecord | void>(detailPath, {
      method: 'PUT',
      body: payload,
      operationName: '마스터 변경'
    });
  },
  async deleteMaster(resource: MasterResource, row: ApiRecord) {
    const detailPath = createMasterDetailPath(resource, row);

    if (!detailPath) {
      return Promise.resolve();
    }

    return apiClient<ApiRecord | void>(detailPath, {
      method: 'DELETE',
      operationName: '마스터 삭제'
    });
  }
};
