import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../shared/api/apiClient';
import type { ApiRecord } from '../../shared/api/apiDataUtils';
import { getRawValue } from '../../shared/api/apiDataUtils';
import { useDisclosure } from '../../shared/hooks/useDisclosure';
import { ActionButton } from '../../shared/ui/ActionButton';
import { ConfirmActionModal } from '../../shared/ui/ConfirmActionModal';
import { TextField } from '../../shared/ui/Field';
import { Modal } from '../../shared/ui/Modal';
import { PageCard } from '../../shared/ui/PageCard';
import { PageDataLoadingFallback } from '../../shared/ui/PageDataLoadingFallback';
import { PageHeading } from '../../shared/ui/PageHeading';
import { adminApi, type RoleMenuNode, type RoleMenuSaveItem } from './adminApi';

type RoleRow = {
  id: string;
  name: string;
  description: string;
};

type RoleFormValues = {
  roleId: string;
  roleNm: string;
  roleDesc: string;
  useYn: string;
};

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'confirm' | 'warning';
  run: () => Promise<void>;
};

const emptyRoleFormValues: RoleFormValues = {
  roleId: '',
  roleNm: '',
  roleDesc: '',
  useYn: 'Y'
};

const PROTECTED_ADMIN_ROLE_IDS = new Set(['ROLE_ADMIN']);
const PROTECTED_ADMIN_ROLE_NAME = '\uAD00\uB9AC\uC790';

function toRoleRow(row: ApiRecord): RoleRow {
  return {
    id: getRawValue(row.roleId),
    name: getRawValue(row.roleNm),
    description: getRawValue(row.roleDesc)
  };
}

function getMenuId(node: RoleMenuNode) {
  return getRawValue(node.sysMenuId);
}

function getMenuName(node: RoleMenuNode) {
  return getRawValue(node.menuNm) || getMenuId(node);
}

function getCheckedKey(menuId: string, type: 'read' | 'write') {
  return `${menuId}:${type}`;
}

type PrivilegeTreeNodeProps = {
  node: RoleMenuNode;
  checkedItems: string[];
  onToggle: (key: string) => void;
};

function PrivilegeTreeNode({ node, checkedItems, onToggle }: PrivilegeTreeNodeProps) {
  const menuId = getMenuId(node);
  const children = node.children ?? [];
  const readKey = getCheckedKey(menuId, 'read');
  const writeKey = getCheckedKey(menuId, 'write');

  return (
    <div className="privilege-tree__branch">
      <div className="privilege-tree__menu">{getMenuName(node)}</div>
      <div className="privilege-tree__children">
        <label className="checkbox">
          <input type="checkbox" checked={checkedItems.includes(readKey)} onChange={() => onToggle(readKey)} />
          <span>읽기</span>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={checkedItems.includes(writeKey)} onChange={() => onToggle(writeKey)} />
          <span>쓰기</span>
        </label>
        {children.map((childNode) => (
          <PrivilegeTreeNode key={getMenuId(childNode)} node={childNode} checkedItems={checkedItems} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

function getInitialCheckedItems(nodes: RoleMenuNode[]) {
  const checkedItems: string[] = [];

  const visit = (node: RoleMenuNode) => {
    const menuId = getMenuId(node);

    if (getRawValue(node.readYn) === 'Y') {
      checkedItems.push(getCheckedKey(menuId, 'read'));
    }

    if (getRawValue(node.writeYn) === 'Y') {
      checkedItems.push(getCheckedKey(menuId, 'write'));
    }

    node.children?.forEach(visit);
  };

  nodes.forEach(visit);

  return checkedItems;
}

function createRoleMenuSaveItems(nodes: RoleMenuNode[], checkedItems: string[]): RoleMenuSaveItem[] {
  const checkedSet = new Set(checkedItems);
  const items: RoleMenuSaveItem[] = [];

  const visit = (node: RoleMenuNode) => {
    const sysMenuId = getMenuId(node);

    if (sysMenuId) {
      const readYn = checkedSet.has(getCheckedKey(sysMenuId, 'read')) ? 'Y' : 'N';
      const writeYn = checkedSet.has(getCheckedKey(sysMenuId, 'write')) ? 'Y' : 'N';

      items.push({
        sysMenuId,
        readYn,
        writeYn,
        useYn: readYn === 'Y' || writeYn === 'Y' ? 'Y' : 'N'
      });
    }

    node.children?.forEach(visit);
  };

  nodes.forEach(visit);

  return items;
}

function validateRoleForm(values: RoleFormValues) {
  if (!values.roleId.trim()) return '권한 ID은(는) 필수 입력값입니다.';
  if (!values.roleNm.trim()) return '권한명은(는) 필수 입력값입니다.';
  return '';
}

function isProtectedAdminRole(role?: RoleRow) {
  if (!role) return false;

  return PROTECTED_ADMIN_ROLE_IDS.has(role.id) || role.name.trim() === PROTECTED_ADMIN_ROLE_NAME;
}

/*
 * 필요: 권한 목록과 권한별 메뉴 트리를 시스템 API 값으로 표시한다.
 * 연결: /system/roles, /system/roles/{roleId}/menus/tree, 권한 선택 UI.
 * 설명: 권한 등록과 권한별 메뉴 저장은 API 실행 전 공통 확인 팝업을 거친다.
 * 수정: 메뉴 권한 응답 구조가 바뀌면 createRoleMenuSaveItems와 PrivilegeTreeNode만 조정한다.
 */
export function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [menuTree, setMenuTree] = useState<RoleMenuNode[]>([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [roleFormValues, setRoleFormValues] = useState<RoleFormValues>(emptyRoleFormValues);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const modal = useDisclosure(false);

  const loadRoles = async (nextSelectedRoleId = '') => {
    setIsLoadingRoles(true);
    setErrorMessage('');

    try {
      const rows = await adminApi.getRoles();
      const nextRoles = rows.map(toRoleRow).filter((role) => role.id);

      setRoles(nextRoles);
      setSelectedRoleId((current) => nextSelectedRoleId || current || nextRoles[0]?.id || '');
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '권한 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadInitialRoles() {
      setIsLoadingRoles(true);
      setErrorMessage('');

      try {
        const rows = await adminApi.getRoles();
        const nextRoles = rows.map(toRoleRow).filter((role) => role.id);

        if (!mounted) {
          return;
        }

        setRoles(nextRoles);
        setSelectedRoleId((current) => current || nextRoles[0]?.id || '');
      } catch (error) {
        if (!mounted) {
          return;
        }

        setErrorMessage(error instanceof ApiError ? error.message : '권한 목록을 불러오지 못했습니다.');
      } finally {
        if (mounted) {
          setIsLoadingRoles(false);
        }
      }
    }

    loadInitialRoles();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    let mounted = true;

    async function loadMenuTree() {
      setIsLoadingTree(true);
      setErrorMessage('');

      try {
        const nextTree = await adminApi.getRoleMenuTree(selectedRoleId);

        if (!mounted) {
          return;
        }

        setMenuTree(nextTree);
        setCheckedItems(getInitialCheckedItems(nextTree));
      } catch (error) {
        if (!mounted) {
          return;
        }

        setMenuTree([]);
        setCheckedItems([]);
        setErrorMessage(error instanceof ApiError ? error.message : '권한 메뉴 트리를 불러오지 못했습니다.');
      } finally {
        if (mounted) {
          setIsLoadingTree(false);
        }
      }
    }

    loadMenuTree();

    return () => {
      mounted = false;
    };
  }, [selectedRoleId]);

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId), [roles, selectedRoleId]);
  const isSelectedRoleDeleteProtected = isProtectedAdminRole(selectedRole);

  const togglePrivilege = (key: string) => {
    setCheckedItems((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const openRoleRegisterModal = () => {
    setRoleFormValues(emptyRoleFormValues);
    setFormErrorMessage('');
    modal.open();
  };

  const updateRoleFormValue = (key: keyof RoleFormValues, value: string) => {
    setRoleFormValues((current) => ({ ...current, [key]: value }));
  };

  const requestRoleRegistration = () => {
    const validationMessage = validateRoleForm(roleFormValues);

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    setFormErrorMessage('');
    setConfirmAction({
      title: '권한 등록 확인',
      description: `${roleFormValues.roleNm.trim()} 권한을 등록하시겠습니까?`,
      confirmLabel: '등록',
      run: async () => {
        const payload: ApiRecord = {
          roleId: roleFormValues.roleId.trim(),
          roleNm: roleFormValues.roleNm.trim(),
          roleDesc: roleFormValues.roleDesc.trim(),
          useYn: roleFormValues.useYn.trim() || 'Y'
        };

        await adminApi.saveRole(payload);
        modal.close();
        setStatusMessage('권한 등록이 완료되었습니다.');
        await loadRoles(payload.roleId as string);
      }
    });
  };

  const requestRoleMenuSave = () => {
    if (!selectedRoleId) {
      setErrorMessage('저장할 권한을 먼저 선택해 주세요.');
      return;
    }

    const items = createRoleMenuSaveItems(menuTree, checkedItems);

    setConfirmAction({
      title: '권한별 메뉴 저장 확인',
      description: `${selectedRole?.name || selectedRoleId} 권한의 메뉴 설정을 저장하시겠습니까?`,
      confirmLabel: '저장',
      run: async () => {
        await adminApi.saveRoleMenus(selectedRoleId, items);
        setStatusMessage('권한별 메뉴 설정이 저장되었습니다.');
        const nextTree = await adminApi.getRoleMenuTree(selectedRoleId);
        setMenuTree(nextTree);
        setCheckedItems(getInitialCheckedItems(nextTree));
      }
    });
  };

  const requestRoleDelete = () => {
    if (!selectedRoleId) {
      setErrorMessage('삭제할 권한을 선택해 주세요.');
      return;
    }

    if (isProtectedAdminRole(selectedRole)) {
      setErrorMessage('관리자 권한은 삭제할 수 없습니다.');
      return;
    }

    setConfirmAction({
      title: '권한 삭제 확인',
      description: `${selectedRole?.name || selectedRoleId} 권한을 삭제하시겠습니까?\n매핑된 권한은 API 정책에 따라 제한될 수 있습니다.`,
      confirmLabel: '삭제',
      tone: 'warning',
      run: async () => {
        await adminApi.deleteRole(selectedRoleId);
        setStatusMessage('권한 삭제가 완료되었습니다.');
        setMenuTree([]);
        setCheckedItems([]);
        await loadRoles('');
      }
    });
  };

  const confirmPendingAction = async () => {
    if (!confirmAction) return;

    setIsSubmittingAction(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      await confirmAction.run();
      setConfirmAction(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '요청 처리에 실패했습니다.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeading
        title="권한 관리"
        actions={
          <div className="inline-actions">
            <ActionButton variant="outline" onClick={requestRoleDelete} disabled={!selectedRoleId || isSelectedRoleDeleteProtected}>{'\uC0AD\uC81C'}</ActionButton>
            <ActionButton variant="primary" onClick={openRoleRegisterModal}>{'\uCD94\uAC00'}</ActionButton>
          </div>
        }
      />

      {isLoadingRoles && <PageDataLoadingFallback title="권한 관리" />}
      {!isLoadingRoles && errorMessage && <div role="alert">{errorMessage}</div>}
      {!isLoadingRoles && statusMessage && <div role="status">{statusMessage}</div>}
      {!isLoadingRoles && (
        <div className="split-grid">
          <PageCard title="ROLE List">
            <div className="list-panel">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`list-panel__item ${selectedRoleId === role.id ? 'is-active' : ''}`.trim()}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <strong>{role.name || role.id}</strong>
                  <span>{role.description || '-'}</span>
                </button>
              ))}
            </div>
          </PageCard>

          <PageCard
            title={`Privilege List${selectedRole ? ` - ${selectedRole.name}` : ''}`}
            actions={
              <ActionButton variant="primary" size="sm" onClick={requestRoleMenuSave} disabled={!selectedRoleId || isLoadingTree}>
                저장
              </ActionButton>
            }
          >
            {isLoadingTree && <PageDataLoadingFallback title="권한 관리" />}
            {!isLoadingTree && (
              <div className="privilege-tree">
                {menuTree.map((node) => (
                  <PrivilegeTreeNode key={getMenuId(node)} node={node} checkedItems={checkedItems} onToggle={togglePrivilege} />
                ))}
              </div>
            )}
          </PageCard>
        </div>
      )}

      <Modal
        open={modal.isOpen}
        title="시스템 권한 정보 입력"
        confirmLabel="등록"
        onConfirm={requestRoleRegistration}
        onCancel={modal.close}
      >
        {formErrorMessage && <p role="alert">{formErrorMessage}</p>}
        <div className="form-grid">
          <TextField
            label="ROLE ID"
            placeholder="권한 ID"
            value={roleFormValues.roleId}
            required
            onChange={(event) => updateRoleFormValue('roleId', event.target.value)}
          />
          <TextField
            label="ROLE Name"
            placeholder="권한명"
            value={roleFormValues.roleNm}
            required
            onChange={(event) => updateRoleFormValue('roleNm', event.target.value)}
          />
          <TextField
            label="Description"
            placeholder="권한 설명"
            value={roleFormValues.roleDesc}
            onChange={(event) => updateRoleFormValue('roleDesc', event.target.value)}
          />
          <TextField
            label="Use"
            placeholder="Y"
            value={roleFormValues.useYn}
            onChange={(event) => updateRoleFormValue('useYn', event.target.value.toUpperCase())}
          />
        </div>
      </Modal>

      <ConfirmActionModal
        open={Boolean(confirmAction)}
        title={confirmAction?.title ?? ''}
        description={confirmAction?.description ?? ''}
        tone={confirmAction?.tone ?? 'confirm'}
        confirmLabel={confirmAction?.confirmLabel ?? '확인'}
        isProcessing={isSubmittingAction}
        onConfirm={confirmPendingAction}
        onCancel={() => {
          if (!isSubmittingAction) {
            setConfirmAction(null);
          }
        }}
      />
    </div>
  );
}
