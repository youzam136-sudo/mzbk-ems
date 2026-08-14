import { useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../shared/api/apiClient';
import type { ApiRecord } from '../../shared/api/apiDataUtils';
import { getRawValue } from '../../shared/api/apiDataUtils';
import { useDisclosure } from '../../shared/hooks/useDisclosure';
import { ActionButton } from '../../shared/ui/ActionButton';
import { ConfirmActionModal } from '../../shared/ui/ConfirmActionModal';
import { SelectField, TextField } from '../../shared/ui/Field';
import { Modal } from '../../shared/ui/Modal';
import { PageCard } from '../../shared/ui/PageCard';
import { PageDataLoadingFallback } from '../../shared/ui/PageDataLoadingFallback';
import { PageHeading } from '../../shared/ui/PageHeading';
import { adminApi } from './adminApi';

type RoleOption = {
  id: string;
  name: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
  useYn: string;
  lockYn: string;
  lastLoginDttm: string;
  roleIds: string[];
  roleNames: string[];
  primaryRoleId: string;
  corporation: string;
  dept: string;
  corpTelephone: string;
  corpFax: string;
};

type UserRoleRow = {
  roleId: string;
  roleName: string;
};

type UserFormValues = {
  usrId: string;
  usrNm: string;
  mobileNo: string;
  roleId: string;
  email: string;
  useYn: string;
  lockYn: string;
  corporation: string;
  dept: string;
  corpTelephone: string;
  corpFax: string;
};

type UserSavePayload = {
  usrId: string;
  usrNm: string;
  email: string;
  mobileNo: string;
  useYn: string;
  lockYn: string;
  roleIds: string[];
  usrPwd?: string;
};

type RegisterFormValues = UserFormValues & {
  usrPwd: string;
};

type ConfirmAction = {
  title: string;
  description: string;
  tone?: 'confirm' | 'warning';
  confirmLabel: string;
  run: () => Promise<void>;
};

const ALL_ROLE_FILTER_ID = 'ALL';
const PROTECTED_ADMIN_USER_IDS = new Set(['admin']);
const PROTECTED_ADMIN_ROLE_IDS = new Set(['ROLE_ADMIN']);
const PROTECTED_ADMIN_ROLE_NAME = '\uAD00\uB9AC\uC790';

const emptyUserFormValues: UserFormValues = {
  usrId: '',
  usrNm: '',
  mobileNo: '',
  roleId: '',
  email: '',
  useYn: 'Y',
  lockYn: 'N',
  corporation: '',
  dept: '',
  corpTelephone: '',
  corpFax: ''
};

const emptyRegisterFormValues: RegisterFormValues = {
  ...emptyUserFormValues,
  usrPwd: ''
};

function toUserRow(row: ApiRecord): UserRow {
  return {
    id: getRawValue(row.usrId),
    name: getRawValue(row.usrNm),
    email: getRawValue(row.email),
    mobileNo: getRawValue(row.mobileNo),
    useYn: getRawValue(row.useYn),
    lockYn: getRawValue(row.lockYn),
    lastLoginDttm: getRawValue(row.lastLoginDttm),
    roleIds: [],
    roleNames: [],
    primaryRoleId: '',
    corporation: getRawValue(row.corporation ?? row.corpNm ?? row.companyNm ?? row.compNm),
    dept: getRawValue(row.dept ?? row.deptNm),
    corpTelephone: getRawValue(row.corpTelephone ?? row.corpTel ?? row.compTel),
    corpFax: getRawValue(row.corpFax ?? row.compFax)
  };
}

function toRoleOption(row: ApiRecord): RoleOption {
  return {
    id: getRawValue(row.roleId),
    name: getRawValue(row.roleNm)
  };
}

function toUserRoleRow(row: ApiRecord): UserRoleRow {
  return {
    roleId: getRawValue(row.roleId),
    roleName: getRawValue(row.roleNm)
  };
}

function createUserFormValues(user: UserRow | undefined, fallbackRoleId: string): UserFormValues {
  if (!user) {
    return { ...emptyUserFormValues, roleId: fallbackRoleId };
  }

  return {
    usrId: user.id,
    usrNm: user.name,
    mobileNo: user.mobileNo,
    roleId: user.primaryRoleId || fallbackRoleId,
    email: user.email,
    useYn: user.useYn || 'Y',
    lockYn: user.lockYn || 'N',
    corporation: user.corporation,
    dept: user.dept,
    corpTelephone: user.corpTelephone,
    corpFax: user.corpFax
  };
}

function createUserPayload(values: UserFormValues, password = ''): UserSavePayload {
  /*
   * Swagger v3 UserSaveRequest에 정의된 필드만 저장 API로 보낸다.
   * 회사/부서 계열은 현재 UserSaveRequest에 없어 화면 표시만 유지한다.
   */
  const payload: UserSavePayload = {
    usrId: values.usrId.trim(),
    usrNm: values.usrNm.trim(),
    email: values.email.trim(),
    mobileNo: values.mobileNo.trim(),
    useYn: values.useYn.trim() || 'Y',
    lockYn: values.lockYn.trim() || 'N',
    roleIds: values.roleId ? [values.roleId] : []
  };

  if (password.trim()) {
    payload.usrPwd = password.trim();
  }

  return payload;
}

function validateUserForm(values: UserFormValues, requirePassword = false, password = '') {
  if (!values.usrId.trim()) return '사용자 ID은(는) 필수 입력값입니다.';
  if (!values.usrNm.trim()) return '사용자명은(는) 필수 입력값입니다.';
  if (!values.roleId.trim()) return '권한은(는) 필수 입력값입니다.';
  if (requirePassword && !password.trim()) return '비밀번호은(는) 필수 입력값입니다.';
  return '';
}

function isProtectedAdminUser(user?: UserRow) {
  if (!user) return false;

  const userId = user.id.trim().toLowerCase();

  return (
    PROTECTED_ADMIN_USER_IDS.has(userId) ||
    PROTECTED_ADMIN_ROLE_IDS.has(user.primaryRoleId) ||
    user.roleIds.some((roleId) => PROTECTED_ADMIN_ROLE_IDS.has(roleId)) ||
    user.roleNames.some((roleName) => roleName.trim() === PROTECTED_ADMIN_ROLE_NAME)
  );
}

/*
 * 필요: 사용자/권한 목록을 시스템 API 값으로 표시한다.
 * 연결: /system/users, /system/roles, 사용자 상세 폼, 암호 변경 팝업.
 * 설명: 추가/수정/암호 변경 실행 전 확인 팝업을 거친 뒤 사용자 저장 API를 호출한다.
 * 수정: 사용자 API 필드명이 바뀌면 toUserRow 매핑만 조정한다.
 */
export function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedRoleFilterId, setSelectedRoleFilterId] = useState(ALL_ROLE_FILTER_ID);
  const [selectedDetailRoleId, setSelectedDetailRoleId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [detailValues, setDetailValues] = useState<UserFormValues>(emptyUserFormValues);
  const [registerValues, setRegisterValues] = useState<RegisterFormValues>(emptyRegisterFormValues);
  const [passwordValues, setPasswordValues] = useState({ password: '', passwordConfirm: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const passwordModal = useDisclosure(false);
  const registerModal = useDisclosure(false);

  const loadUsers = async (nextSelectedUserId = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [userRows, roleRows] = await Promise.all([adminApi.getUsers(), adminApi.getRoles()]);
      const baseUsers = userRows.map(toUserRow).filter((user) => user.id);
      const nextUsers = await Promise.all(
        baseUsers.map(async (user) => {
          const userRoleRows = (await adminApi.getUserRoles(user.id)).map(toUserRoleRow).filter((role) => role.roleId);

          return {
            ...user,
            roleIds: userRoleRows.map((role) => role.roleId),
            roleNames: userRoleRows.map((role) => role.roleName || role.roleId),
            primaryRoleId: userRoleRows[0]?.roleId ?? ''
          };
        })
      );
      const nextRoles = roleRows.map(toRoleOption).filter((role) => role.id);

      setUsers(nextUsers);
      setRoles(nextRoles);
      setSelectedUserId((current) => nextSelectedUserId || current || nextUsers[0]?.id || '');
      setSelectedDetailRoleId((current) => current || nextUsers[0]?.primaryRoleId || nextRoles[0]?.id || '');
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '사용자 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [userRows, roleRows] = await Promise.all([adminApi.getUsers(), adminApi.getRoles()]);
        const baseUsers = userRows.map(toUserRow).filter((user) => user.id);
        const nextUsers = await Promise.all(
          baseUsers.map(async (user) => {
            const userRoleRows = (await adminApi.getUserRoles(user.id)).map(toUserRoleRow).filter((role) => role.roleId);

            return {
              ...user,
              roleIds: userRoleRows.map((role) => role.roleId),
              roleNames: userRoleRows.map((role) => role.roleName || role.roleId),
              primaryRoleId: userRoleRows[0]?.roleId ?? ''
            };
          })
        );
        const nextRoles = roleRows.map(toRoleOption).filter((role) => role.id);

        if (!mounted) {
          return;
        }

        setUsers(nextUsers);
        setRoles(nextRoles);
        setSelectedUserId((current) => current || nextUsers[0]?.id || '');
        setSelectedDetailRoleId((current) => current || nextUsers[0]?.primaryRoleId || nextRoles[0]?.id || '');
      } catch (error) {
        if (!mounted) {
          return;
        }

        setErrorMessage(error instanceof ApiError ? error.message : '사용자 데이터를 불러오지 못했습니다.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      mounted = false;
    };
  }, []);

  const roleFilterOptions = useMemo(() => [{ id: ALL_ROLE_FILTER_ID, name: '전체' }, ...roles], [roles]);
  const filteredUsers = useMemo(() => {
    if (selectedRoleFilterId === ALL_ROLE_FILTER_ID) {
      return users;
    }

    return users.filter((user) => user.roleIds.includes(selectedRoleFilterId));
  }, [selectedRoleFilterId, users]);
  const selectedUser = useMemo(
    () => filteredUsers.find((user) => user.id === selectedUserId) ?? filteredUsers[0],
    [filteredUsers, selectedUserId]
  );
  const isSelectedUserDeleteProtected = isProtectedAdminUser(selectedUser);
  const roleOptions = roles.map((role) => role.id);

  useEffect(() => {
    if (filteredUsers.some((user) => user.id === selectedUserId)) {
      return;
    }

    setSelectedUserId(filteredUsers[0]?.id ?? '');
  }, [filteredUsers, selectedUserId]);

  useEffect(() => {
    setSelectedDetailRoleId(selectedUser?.primaryRoleId || roles[0]?.id || '');
  }, [roles, selectedUser?.id, selectedUser?.primaryRoleId]);

  useEffect(() => {
    const fallbackRoleId = roles[0]?.id || '';
    setDetailValues(createUserFormValues(selectedUser, fallbackRoleId));
  }, [roles, selectedUser]);

  const updateDetailValue = (key: keyof UserFormValues, value: string) => {
    setDetailValues((current) => ({ ...current, [key]: value }));
    if (key === 'roleId') {
      setSelectedDetailRoleId(value);
    }
  };

  const updateRegisterValue = (key: keyof RegisterFormValues, value: string) => {
    setRegisterValues((current) => ({ ...current, [key]: value }));
  };

  const refreshUserDetail = async (userId: string) => {
    const latestUser = toUserRow(await adminApi.getUser(userId));
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, ...latestUser } : user)));
    setDetailValues((current) => ({
      ...current,
      usrNm: latestUser.name,
      mobileNo: latestUser.mobileNo,
      email: latestUser.email,
      useYn: latestUser.useYn || 'Y',
      lockYn: latestUser.lockYn || 'N',
      corporation: latestUser.corporation,
      dept: latestUser.dept,
      corpTelephone: latestUser.corpTelephone,
      corpFax: latestUser.corpFax
    }));
  };

  const openRegisterModal = () => {
    setRegisterValues({ ...emptyRegisterFormValues, roleId: roles[0]?.id || '' });
    setFormErrorMessage('');
    registerModal.open();
  };

  const openPasswordModal = () => {
    setPasswordValues({ password: '', passwordConfirm: '' });
    setFormErrorMessage('');
    passwordModal.open();
  };

  const requestRegisterUser = () => {
    const validationMessage = validateUserForm(registerValues, true, registerValues.usrPwd);

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    setConfirmAction({
      title: '사용자 등록 확인',
      description: `${registerValues.usrId.trim()} 사용자를 등록하시겠습니까?`,
      confirmLabel: '등록',
      run: async () => {
        await adminApi.saveUser(createUserPayload(registerValues, registerValues.usrPwd));
        registerModal.close();
        setStatusMessage('사용자 등록이 완료되었습니다.');
        await loadUsers(registerValues.usrId.trim());
      }
    });
  };

  const requestDeleteUser = () => {
    if (!selectedUser) {
      setErrorMessage('삭제할 사용자를 선택해 주세요.');
      return;
    }

    if (isProtectedAdminUser(selectedUser)) {
      setErrorMessage('관리자 계정은 삭제할 수 없습니다.');
      return;
    }

    setConfirmAction({
      title: '사용자 삭제 확인',
      description: `${selectedUser.id} 사용자를 삭제하시겠습니까?\n삭제 후 사용자 목록에서 제거됩니다.`,
      tone: 'warning',
      confirmLabel: '삭제',
      run: async () => {
        await adminApi.deleteUser(selectedUser.id, '사용자 관리 화면 삭제 요청');
        setStatusMessage('사용자 삭제가 완료되었습니다.');
        await loadUsers();
      }
    });
  };

  const requestUpdateUser = () => {
    const validationMessage = validateUserForm(detailValues);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setConfirmAction({
      title: '사용자 수정 확인',
      description: `${detailValues.usrId.trim()} 사용자 정보를 수정하시겠습니까?`,
      confirmLabel: '수정',
      run: async () => {
        await adminApi.updateUser(detailValues.usrId, createUserPayload(detailValues));
        setStatusMessage('사용자 수정이 완료되었습니다.');
        await loadUsers(detailValues.usrId);
        await refreshUserDetail(detailValues.usrId);
      }
    });
  };

  const requestPasswordChange = () => {
    if (!selectedUser) {
      setFormErrorMessage('암호를 변경할 사용자를 선택해 주세요.');
      return;
    }

    if (!passwordValues.password.trim()) {
      setFormErrorMessage('새 암호은(는) 필수 입력값입니다.');
      return;
    }

    if (passwordValues.password !== passwordValues.passwordConfirm) {
      setFormErrorMessage('새 암호와 확인 값이 일치하지 않습니다.');
      return;
    }

    setConfirmAction({
      title: '암호 변경 확인',
      description: `${selectedUser.id} 사용자의 암호를 변경하시겠습니까?`,
      confirmLabel: '변경',
      run: async () => {
        await adminApi.updateUser(selectedUser.id, createUserPayload(detailValues, passwordValues.password));
        passwordModal.close();
        setStatusMessage('사용자 암호가 변경되었습니다.');
      }
    });
  };

  const confirmPendingAction = async () => {
    if (!confirmAction) return;

    setIsSubmittingAction(true);
    setErrorMessage('');
    setStatusMessage('');
    setFormErrorMessage('');

    try {
      await confirmAction.run();
      setConfirmAction(null);
    } catch (error) {
      const nextMessage = error instanceof ApiError ? error.message : '요청 처리에 실패했습니다.';
      if (registerModal.isOpen || passwordModal.isOpen) {
        setFormErrorMessage(nextMessage);
      } else {
        setErrorMessage(nextMessage);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeading
        title="사용자 관리"
        actions={<ActionButton variant="outline" onClick={openPasswordModal} disabled={!selectedUser}>암호 변경</ActionButton>}
      />

      {isLoading && <PageDataLoadingFallback title="사용자 관리" />}
      {!isLoading && errorMessage && <div role="alert">{errorMessage}</div>}
      {!isLoading && statusMessage && <div role="status">{statusMessage}</div>}
      {!isLoading && !errorMessage && (
        <div className="split-grid">
          <PageCard
            title="User List"
            actions={
              <div className="inline-actions">
                <ActionButton variant="primary" onClick={openRegisterModal}>추가</ActionButton>
                <ActionButton variant="outline" onClick={requestDeleteUser} disabled={!selectedUser || isSelectedUserDeleteProtected}>삭제</ActionButton>
              </div>
            }
          >
            <div className="role-filter">
              {/* 역할 탭은 사용자별 권한 API 응답을 기준으로 목록을 분류한다. */}
              {roleFilterOptions.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={`role-filter__button ${selectedRoleFilterId === role.id ? 'is-active' : ''}`.trim()}
                  onClick={() => setSelectedRoleFilterId(role.id)}
                >
                  {role.name || role.id}
                </button>
              ))}
            </div>

            <div className="list-panel">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`list-panel__item ${selectedUser?.id === user.id ? 'is-active' : ''}`.trim()}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <strong className="list-panel__line">
                    <span className="list-panel__icon list-panel__icon--id" aria-hidden="true" />
                    {user.id}
                  </strong>
                  <span className="list-panel__line">
                    <span className="list-panel__icon list-panel__icon--user" aria-hidden="true" />
                    {user.name || '-'}{user.email ? ` (${user.email})` : ''}
                  </span>
                  <small className="list-panel__line">
                    <span className="list-panel__icon list-panel__icon--company" aria-hidden="true" />
                    {user.corporation || '-'}
                  </small>
                </button>
              ))}
              {filteredUsers.length === 0 && <p className="list-panel__empty">선택한 권한의 사용자가 없습니다.</p>}
            </div>
          </PageCard>

          <PageCard
            title="User Detail Information"
            actions={
              <ActionButton variant="primary" size="sm" onClick={requestUpdateUser} disabled={!selectedUser}>
                수정
              </ActionButton>
            }
          >
            <div className="admin-user-detail-alert" role="note">
              <strong>EMS 접속 및 사용권한</strong>
              <span>관리자가 입력하는 계정 접근 정보입니다.</span>
            </div>
            <div className="form-grid">
              <TextField label="User ID(*)" value={detailValues.usrId} readOnly />
              <TextField
                label="User Name(*)"
                value={detailValues.usrNm}
                onChange={(event) => updateDetailValue('usrNm', event.target.value)}
              />
              <TextField
                label="Phone"
                value={detailValues.mobileNo}
                onChange={(event) => updateDetailValue('mobileNo', event.target.value)}
              />
              <SelectField
                label="ROLE(*)"
                options={roleOptions}
                value={detailValues.roleId || selectedDetailRoleId}
                onChange={(event) => updateDetailValue('roleId', event.target.value)}
              />
              <TextField
                label="Email"
                value={detailValues.email}
                onChange={(event) => updateDetailValue('email', event.target.value)}
              />
              <TextField
                label="Use"
                value={detailValues.useYn}
                onChange={(event) => updateDetailValue('useYn', event.target.value.toUpperCase())}
              />
              <TextField
                label="Lock"
                value={detailValues.lockYn}
                onChange={(event) => updateDetailValue('lockYn', event.target.value.toUpperCase())}
              />
              <TextField label="Last Login" value={selectedUser?.lastLoginDttm ?? ''} readOnly />
              <TextField
                label="Corporation"
                value={detailValues.corporation}
                onChange={(event) => updateDetailValue('corporation', event.target.value)}
              />
              <TextField
                label="Dept"
                value={detailValues.dept}
                onChange={(event) => updateDetailValue('dept', event.target.value)}
              />
              <TextField
                label="Corp Telephone"
                value={detailValues.corpTelephone}
                onChange={(event) => updateDetailValue('corpTelephone', event.target.value)}
              />
              <TextField
                label="Corp Fax"
                value={detailValues.corpFax}
                onChange={(event) => updateDetailValue('corpFax', event.target.value)}
              />
            </div>
          </PageCard>
        </div>
      )}

      <Modal
        open={passwordModal.isOpen}
        tone="confirm"
        title="사용자 암호 변경"
        confirmLabel="변경"
        onConfirm={requestPasswordChange}
        onCancel={passwordModal.close}
      >
        {formErrorMessage && <p role="alert">{formErrorMessage}</p>}
        <div className="form-grid">
          <TextField label="User ID" value={selectedUser?.id ?? ''} readOnly />
          <TextField label="User Name" value={selectedUser?.name ?? ''} readOnly />
          <TextField
            label="새 암호"
            type="password"
            value={passwordValues.password}
            onChange={(event) => setPasswordValues((current) => ({ ...current, password: event.target.value }))}
          />
          <TextField
            label="새 암호 확인"
            type="password"
            value={passwordValues.passwordConfirm}
            onChange={(event) => setPasswordValues((current) => ({ ...current, passwordConfirm: event.target.value }))}
          />
        </div>
      </Modal>

      <Modal
        open={registerModal.isOpen}
        title="사용자 정보 입력"
        confirmLabel="등록"
        onConfirm={requestRegisterUser}
        onCancel={registerModal.close}
      >
        {formErrorMessage && <p role="alert">{formErrorMessage}</p>}
        <div className="form-grid">
          <TextField
            label="User ID(*)"
            placeholder="사용자 ID"
            value={registerValues.usrId}
            onChange={(event) => updateRegisterValue('usrId', event.target.value)}
          />
          <TextField
            label="User Name(*)"
            placeholder="사용자명"
            value={registerValues.usrNm}
            onChange={(event) => updateRegisterValue('usrNm', event.target.value)}
          />
          <TextField
            label="Phone"
            placeholder="연락처"
            value={registerValues.mobileNo}
            onChange={(event) => updateRegisterValue('mobileNo', event.target.value)}
          />
          <SelectField
            label="ROLE(*)"
            options={roleOptions.length > 0 ? roleOptions : ['ROLE_USER']}
            value={registerValues.roleId}
            onChange={(event) => updateRegisterValue('roleId', event.target.value)}
          />
          <TextField
            label="Email"
            placeholder="이메일"
            value={registerValues.email}
            onChange={(event) => updateRegisterValue('email', event.target.value)}
          />
          <TextField
            label="Password(*)"
            type="password"
            placeholder="초기 암호"
            value={registerValues.usrPwd}
            onChange={(event) => updateRegisterValue('usrPwd', event.target.value)}
          />
          <TextField
            label="Use"
            placeholder="Y"
            value={registerValues.useYn}
            onChange={(event) => updateRegisterValue('useYn', event.target.value.toUpperCase())}
          />
          <TextField
            label="Lock"
            placeholder="N"
            value={registerValues.lockYn}
            onChange={(event) => updateRegisterValue('lockYn', event.target.value.toUpperCase())}
          />
          <TextField
            label="Corporation"
            placeholder="소속회사"
            value={registerValues.corporation}
            onChange={(event) => updateRegisterValue('corporation', event.target.value)}
          />
          <TextField
            label="Dept"
            placeholder="부서"
            value={registerValues.dept}
            onChange={(event) => updateRegisterValue('dept', event.target.value)}
          />
          <TextField
            label="Corp Telephone"
            placeholder="회사 전화번호"
            value={registerValues.corpTelephone}
            onChange={(event) => updateRegisterValue('corpTelephone', event.target.value)}
          />
          <TextField
            label="Corp Fax"
            placeholder="회사 팩스"
            value={registerValues.corpFax}
            onChange={(event) => updateRegisterValue('corpFax', event.target.value)}
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
