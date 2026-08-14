import { useEffect, useMemo, useRef, useState } from 'react';
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
import { ToggleSwitch } from '../../shared/ui/ToggleSwitch';
import { adminApi } from './adminApi';

type CodeRow = {
  id: string;
  name: string;
  parentId: string;
  parentName: string;
  description: string;
  sortOrder: string;
  useYn: string;
  createdAt: string;
  deletedYn: string;
  deletedAt: string;
  raw: ApiRecord;
};

type CodeFormMode = 'master-create' | 'master-update' | 'detail-create' | 'detail-update';

type CodeFormValues = {
  cdId: string;
  cdNm: string;
  uprCdId: string;
  cdDesc: string;
  sortOrd: string;
  useYn: string;
};

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'confirm' | 'warning';
  run: () => Promise<void>;
};

type CodeDisplayRow = {
  key: string;
  label: string;
  fieldKey?: string;
  value: string;
  sectionEnd?: boolean;
  noBottomLine?: boolean;
  wide?: boolean;
};

const CODE_LIST_PAGE_SIZE = 10;
const CODE_LIST_PAGE_WINDOW = 5;

const emptyCodeFormValues: CodeFormValues = {
  cdId: '',
  cdNm: '',
  uprCdId: '',
  cdDesc: '',
  sortOrd: '',
  useYn: 'Y'
};

function getFirstRawValue(row: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const value = getRawValue(row[key]);
    if (value) {
      return value;
    }
  }

  return '';
}

function toCodeRow(row: ApiRecord): CodeRow {
  const useYn = getRawValue(row.useYn);

  return {
    id: getRawValue(row.cdId),
    name: getRawValue(row.cdNm),
    parentId: getRawValue(row.uprCdId),
    parentName: getFirstRawValue(row, ['uprCdNm', 'uprCdName', 'upperCdNm', 'upperCdName', 'parentCdNm', 'parentCdName']),
    description: getRawValue(row.cdDesc),
    sortOrder: getRawValue(row.sortOrd),
    useYn,
    createdAt: getFirstRawValue(row, ['regDttm', 'regDt', 'regDate', 'createdAt', 'createdDttm', 'frstRegDttm']),
    deletedYn: getFirstRawValue(row, ['delYn', 'delyn', 'deleteYn', 'deletedYn']),
    deletedAt: getFirstRawValue(row, ['delDttm', 'delDt', 'deleteDttm', 'deleteDt', 'deletedAt', 'deletedDttm']),
    raw: row
  };
}

function toCodeFormValues(code?: CodeRow | null, parentId = ''): CodeFormValues {
  if (!code) {
    return { ...emptyCodeFormValues, uprCdId: parentId };
  }

  return {
    cdId: code.id,
    cdNm: code.name,
    uprCdId: code.parentId || parentId,
    cdDesc: code.description,
    sortOrd: code.sortOrder,
    useYn: code.useYn || 'Y'
  };
}

function toCodePayload(values: CodeFormValues): ApiRecord {
  return {
    cdId: values.cdId.trim(),
    cdNm: values.cdNm.trim(),
    uprCdId: values.uprCdId.trim(),
    cdDesc: values.cdDesc.trim(),
    sortOrd: values.sortOrd ? Number(values.sortOrd) : undefined,
    useYn: values.useYn.trim() || 'Y'
  };
}

function validateCodeForm(values: CodeFormValues) {
  if (!values.cdId.trim()) return '코드 ID은(는) 필수 입력값입니다.';
  if (!values.cdNm.trim()) return '코드명은(는) 필수 입력값입니다.';
  return '';
}

function getSortOrderValue(code: CodeRow) {
  const sortOrder = Number(code.sortOrder);
  return Number.isFinite(sortOrder) ? sortOrder : Number.MAX_SAFE_INTEGER;
}

function sortCodeRows(rows: CodeRow[]) {
  return [...rows].sort((a, b) => getSortOrderValue(a) - getSortOrderValue(b) || a.id.localeCompare(b.id));
}

function getCodeListPageWindow(currentPage: number, totalPages: number) {
  const windowSize = Math.min(CODE_LIST_PAGE_WINDOW, totalPages);
  const halfWindow = Math.floor(windowSize / 2);
  const startPage = Math.min(Math.max(1, currentPage - halfWindow), totalPages - windowSize + 1);

  return Array.from({ length: windowSize }, (_, index) => startPage + index);
}

function CodeFieldGrid({ rows, showKeys = false, className = '' }: { rows: CodeDisplayRow[]; showKeys?: boolean; className?: string }) {
  return (
    <dl className={`code-field-list ${className}`.trim()}>
      {rows.map((row) => (
        <div
          key={row.key}
          className={`code-field-list__row ${row.sectionEnd ? 'has-section-line' : ''} ${row.noBottomLine ? 'has-no-bottom-line' : ''} ${row.wide ? 'is-wide' : ''}`.trim()}
        >
          <dt>
            {row.label}
            {showKeys && row.fieldKey && <span> ({row.fieldKey})</span>}
          </dt>
          <dd>{row.value || '-'}</dd>
        </div>
      ))}
    </dl>
  );
}

const parentNameFieldKeys = ['upCdNm', 'uprCdNm', 'uprCdName', 'upperCdNm', 'upperCdName', 'parentCdNm', 'parentCdName'];
const hiddenApiDisplayKeys = new Set(['sortOrd', 'sortOrder', 'useYn']);

function getApiExtraRows(code: CodeRow, usedKeys: string[]) {
  const usedKeySet = new Set(usedKeys);
  return Object.entries(code.raw)
    .filter(([key]) => !usedKeySet.has(key) && !hiddenApiDisplayKeys.has(key))
    .map(([key, value]) => ({
      key,
      label: codeApiFieldLabels[key] ?? key,
      fieldKey: key,
      value: getRawValue(value)
    }));
}

function CodeFieldRows({ code }: { code: CodeRow }) {
  // 캡처에 있는 항목을 먼저 고정하고, API에만 있는 값은 그 아래에 붙인다.
  const rows: CodeDisplayRow[] = [
    { key: 'cdDesc', label: '설명', value: code.description, wide: true },
    { key: 'uprCdId', label: '상위 코드 ID', value: code.parentId },
    { key: 'upCdNm', label: '상위 코드명', value: code.parentName },
    { key: 'regDttm', label: '등록일시', value: code.createdAt },
    { key: 'delYn', label: '삭제여부', value: code.deletedYn },
    { key: 'delDttm', label: '삭제일시', value: code.deletedAt, noBottomLine: true }
  ];
  const apiRows = getApiExtraRows(code, ['cdId', 'cdNm', 'cdDesc', 'uprCdId', 'regDttm', 'delYn', 'delDttm', ...parentNameFieldKeys]);

  return (
    <>
      <CodeFieldGrid rows={rows} />
      {apiRows.length > 0 && (
        <div className="code-api-extra">
          <CodeFieldGrid rows={apiRows} className="code-field-list--api-extra" />
        </div>
      )}
    </>
  );
}

const codeApiFieldLabels: Record<string, string> = {
  cdId: '코드 ID',
  cdNm: '코드명',
  cdDesc: '설명',
  uprCdId: '상위 코드 ID',
  upCdNm: '상위 코드명',
  uprCdNm: '상위 코드명',
  uprCdName: '상위 코드명',
  upperCdNm: '상위 코드명',
  upperCdName: '상위 코드명',
  parentCdNm: '상위 코드명',
  parentCdName: '상위 코드명',
  sortOrd: '정렬',
  useYn: '사용 여부',
  regDttm: '등록일시',
  regDt: '등록일시',
  regDate: '등록일시',
  createdAt: '등록일시',
  createdDttm: '등록일시',
  frstRegDttm: '등록일시',
  delYn: '삭제여부',
  delyn: '삭제여부',
  deleteYn: '삭제여부',
  deletedYn: '삭제여부',
  delDttm: '삭제일시',
  delDt: '삭제일시',
  deleteDttm: '삭제일시',
  deleteDt: '삭제일시',
  deletedAt: '삭제일시',
  deletedDttm: '삭제일시'
};

function CodeApiFieldRows({ code }: { code: CodeRow }) {
  // 오른쪽 Code Detail도 캡처 기준 필드를 먼저 두고, API 추가 필드는 아래에 둔다.
  const baseRows: CodeDisplayRow[] = [
    { key: 'cdId', label: '코드 ID', fieldKey: 'cdId', value: code.id, wide: true },
    { key: 'cdNm', label: '코드명', fieldKey: 'cdNm', value: code.name, sectionEnd: true },
    { key: 'cdDesc', label: '설명', fieldKey: 'cdDesc', value: code.description, sectionEnd: true },
    { key: 'uprCdId', label: '상위 코드 ID', fieldKey: 'uprCdId', value: code.parentId, sectionEnd: true },
    { key: 'upCdNm', label: '상위 코드명', fieldKey: 'upCdNm', value: code.parentName, sectionEnd: true },
    { key: 'regDttm', label: '등록일시', fieldKey: 'regDttm', value: code.createdAt },
    { key: 'delYn', label: '삭제여부', fieldKey: 'delYn', value: code.deletedYn },
    { key: 'delDttm', label: '삭제일시', fieldKey: 'delDttm', value: code.deletedAt }
  ];
  const extraRows = getApiExtraRows(code, [...baseRows.map((row) => row.key), ...parentNameFieldKeys]);

  return (
    <>
      <CodeFieldGrid rows={baseRows} showKeys className="code-field-list--detail" />
      {extraRows.length > 0 && (
        <div className="code-api-extra">
          <CodeFieldGrid rows={extraRows} showKeys className="code-field-list--api-extra" />
        </div>
      )}
    </>
  );
}

/*
 * 필요: 코드 그룹과 상세 코드를 시스템 API 값으로 표시한다.
 * 연결: /system/codes, /system/codes/{cdId}/children, 코드 등록/수정 팝업.
 * 설명: 왼쪽은 마스터 코드, 오른쪽은 선택한 마스터 코드의 하위 상세 코드를 API 값으로 표시한다.
 * 수정: 코드 계층 필드명이 바뀌면 toCodeRow의 parentId 매핑만 조정한다.
 */
export function CodeManagementPage() {
  const [codes, setCodes] = useState<CodeRow[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedDetailCode, setSelectedDetailCode] = useState('');
  const [codeDetails, setCodeDetails] = useState<CodeRow[]>([]);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [codeListPage, setCodeListPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [formMode, setFormMode] = useState<CodeFormMode>('master-create');
  const [formValues, setFormValues] = useState<CodeFormValues>(emptyCodeFormValues);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const codeListPanelRef = useRef<HTMLDivElement>(null);
  const codeListSectionRef = useRef<HTMLDivElement>(null);
  const codeDetailSectionRef = useRef<HTMLDivElement>(null);
  const modal = useDisclosure(false);

  const loadMasterCodes = async (nextSelectedCode = '', keyword = appliedKeyword) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const rows = await adminApi.getCodes({ keyword, includeUnused: true });
      const nextCodes = sortCodeRows(rows.map(toCodeRow).filter((code) => code.id));
      const nextMasterCodeId = nextSelectedCode || nextCodes.find((code) => !code.parentId)?.id || '';

      setCodes(nextCodes);
      setSelectedCode((current) => nextMasterCodeId || (nextCodes.some((code) => code.id === current) ? current : ''));
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : '코드 데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCodeChildren = async (codeId: string, nextSelectedDetailCode = '') => {
    if (!codeId) {
      setCodeDetails([]);
      setSelectedDetailCode('');
      return;
    }

    setIsDetailLoading(true);
    setErrorMessage('');

    try {
      const rows = await adminApi.getCodeChildren(codeId);
      const nextDetails = sortCodeRows(rows.map(toCodeRow).filter((code) => code.id));

      setCodeDetails(nextDetails);
      setSelectedDetailCode(nextSelectedDetailCode || nextDetails[0]?.id || '');
    } catch (error) {
      setCodeDetails([]);
      setSelectedDetailCode('');
      setErrorMessage(error instanceof ApiError ? error.message : '상세 코드를 불러오지 못했습니다.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadMasterCodes('', appliedKeyword);
  }, [appliedKeyword]);

  const codeGroups = useMemo(
    () => sortCodeRows(codes.filter((code) => !code.parentId)),
    [codes]
  );
  const codeListTotalPages = Math.max(1, Math.ceil(codeGroups.length / CODE_LIST_PAGE_SIZE));
  const normalizedCodeListPage = Math.min(codeListPage, codeListTotalPages);
  const pagedCodeGroups = useMemo(() => {
    const startIndex = (normalizedCodeListPage - 1) * CODE_LIST_PAGE_SIZE;

    return codeGroups.slice(startIndex, startIndex + CODE_LIST_PAGE_SIZE);
  }, [codeGroups, normalizedCodeListPage]);
  const codeListPageWindow = useMemo(
    () => getCodeListPageWindow(normalizedCodeListPage, codeListTotalPages),
    [normalizedCodeListPage, codeListTotalPages]
  );
  const visibleCodeDetails = useMemo(
    () => sortCodeRows(codeDetails.filter((code) => includeDeleted || code.useYn !== 'N')),
    [codeDetails, includeDeleted]
  );
  const selectedMasterCode = useMemo(() => codeGroups.find((code) => code.id === selectedCode), [codeGroups, selectedCode]);
  const selectedDetail = useMemo(
    () => visibleCodeDetails.find((code) => code.id === selectedDetailCode) ?? visibleCodeDetails[0],
    [selectedDetailCode, visibleCodeDetails]
  );

  useEffect(() => {
    loadCodeChildren(selectedCode);
  }, [selectedCode]);

  useEffect(() => {
    setCodeListPage((current) => Math.min(Math.max(current, 1), codeListTotalPages));
  }, [codeListTotalPages]);

  useEffect(() => {
    if (codeListPanelRef.current) {
      codeListPanelRef.current.scrollTop = 0;
    }
  }, [normalizedCodeListPage]);

  const openCodeModal = (mode: CodeFormMode) => {
    setFormMode(mode);
    setFormErrorMessage('');

    if (mode === 'master-update') {
      setFormValues(toCodeFormValues(selectedMasterCode));
    } else if (mode === 'detail-create') {
      setFormValues(toCodeFormValues(null, selectedCode));
    } else if (mode === 'detail-update') {
      setFormValues(toCodeFormValues(selectedDetail, selectedCode));
    } else {
      setFormValues(emptyCodeFormValues);
    }

    modal.open();
  };

  const updateFormValue = (key: keyof CodeFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const submitSearch = () => {
    setCodeListPage(1);
    setAppliedKeyword(searchKeyword.trim());
  };

  const requestCodeSave = () => {
    const validationMessage = validateCodeForm(formValues);

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    const isUpdate = formMode === 'master-update' || formMode === 'detail-update';
    const isDetail = formMode === 'detail-create' || formMode === 'detail-update';

    setConfirmAction({
      title: isUpdate ? '코드 수정 확인' : '코드 등록 확인',
      description: `${formValues.cdNm.trim()} 코드를 ${isUpdate ? '수정' : '등록'}하시겠습니까?`,
      confirmLabel: isUpdate ? '수정' : '등록',
      run: async () => {
        const payload = toCodePayload(formValues);

        if (isUpdate) {
          await adminApi.updateCode(formValues.cdId, payload);
        } else {
          await adminApi.saveCode(payload);
        }

        modal.close();
        setStatusMessage(`코드 ${isUpdate ? '수정' : '등록'}이 완료되었습니다.`);

        if (isDetail) {
          await loadCodeChildren(formValues.uprCdId, formValues.cdId);
        } else {
          await loadMasterCodes(formValues.cdId);
        }
      }
    });
  };

  const requestCodeDelete = (target: 'master' | 'detail') => {
    const targetCode = target === 'master' ? selectedMasterCode : selectedDetail;

    if (!targetCode) {
      setErrorMessage('삭제할 코드를 선택해 주세요.');
      return;
    }

    setConfirmAction({
      title: '코드 삭제 확인',
      description: `${targetCode.name || targetCode.id} 코드를 삭제하시겠습니까?\n하위 코드가 있으면 API 정책에 따라 제한될 수 있습니다.`,
      confirmLabel: '삭제',
      tone: 'warning',
      run: async () => {
        await adminApi.deleteCode(targetCode.id, '시스템 코드 관리 화면 삭제 요청');
        setStatusMessage('코드 삭제가 완료되었습니다.');

        if (target === 'detail') {
          await loadCodeChildren(selectedCode);
        } else {
          setCodeDetails([]);
          setSelectedDetailCode('');
          await loadMasterCodes('');
        }
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
      if (modal.isOpen) {
        setFormErrorMessage(nextMessage);
      } else {
        setErrorMessage(nextMessage);
      }
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const modalTitle = formMode.startsWith('master') ? '마스터 코드 정보 입력' : '상세 코드 정보 입력';
  const modalConfirmLabel = formMode.endsWith('update') ? '수정' : '등록';
  const scrollToCodeSection = (section: 'list' | 'detail') => {
    const target = section === 'list' ? codeListSectionRef.current : codeDetailSectionRef.current;

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-stack code-management-page">
      <PageHeading title="시스템 코드 관리" />
      {isLoading && <PageDataLoadingFallback title="코드 관리" />}
      {!isLoading && errorMessage && <div role="alert">{errorMessage}</div>}
      {!isLoading && statusMessage && <div role="status">{statusMessage}</div>}
      {!isLoading && !errorMessage && (
        <div className="code-management-grid">
          <div className="code-management-panel-shell" ref={codeListSectionRef}>
          <PageCard
            title="Code List"
            className="code-list-card"
            actions={
              <>
              <button type="button" className="code-mobile-panel-tab code-mobile-panel-tab--list" onClick={() => scrollToCodeSection('detail')}>
                Detail
              </button>
              <form
                className="code-list-actions"
                onSubmit={(event) => {
                  event.preventDefault();
                  submitSearch();
                }}
              >
                <TextField
                  aria-label="코드 검색"
                  placeholder=""
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                />
                <ActionButton variant="outline" type="submit" aria-label="코드 검색" className="code-list-search__button">
                  검색
                </ActionButton>
                <span className="code-list-actions__separator" aria-hidden="true" />
                <ActionButton variant="outline" onClick={() => requestCodeDelete('master')} disabled={!selectedMasterCode}>{'\uC0AD\uC81C'}</ActionButton>
                <ActionButton variant="primary" onClick={() => openCodeModal('master-create')}>추가</ActionButton>
              </form>
              </>
            }
          >
            <div className="code-list-layout">
              <div className="list-panel" ref={codeListPanelRef}>
                {pagedCodeGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`list-panel__item code-list-item ${selectedCode === group.id ? 'is-active' : ''}`.trim()}
                    onClick={() => setSelectedCode(group.id)}
                  >
                    <strong>{group.id}</strong>
                    <CodeFieldRows code={group} />
                  </button>
                ))}
                {codeGroups.length === 0 && <p className="list-panel__empty">표시할 마스터 코드가 없습니다.</p>}
              </div>
              {codeGroups.length > 0 && (
                <nav className="code-list-pagination" aria-label="Code List pagination">
                  <span className="code-list-pagination__edge">
                    {codeListPageWindow[0] > 1 && (
                      <button
                        type="button"
                        className="code-list-pagination__button code-list-pagination__button--control css-chevron css-chevron--double css-chevron--left"
                        aria-label="First code list page"
                        onClick={() => setCodeListPage(1)}
                      />
                    )}
                    <button
                      type="button"
                      className="code-list-pagination__button code-list-pagination__button--control css-chevron css-chevron--left"
                      aria-label="Previous code list page"
                      disabled={normalizedCodeListPage <= 1}
                      onClick={() => setCodeListPage((current) => Math.max(1, current - 1))}
                    />
                  </span>
                  <span className="code-list-pagination__pages">
                    {codeListPageWindow.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`code-list-pagination__button ${item === normalizedCodeListPage ? 'is-active' : ''}`.trim()}
                        aria-current={item === normalizedCodeListPage ? 'page' : undefined}
                        onClick={() => setCodeListPage(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </span>
                  <span className="code-list-pagination__edge">
                    <button
                      type="button"
                      className="code-list-pagination__button code-list-pagination__button--control css-chevron css-chevron--right"
                      aria-label="Next code list page"
                      disabled={normalizedCodeListPage >= codeListTotalPages}
                      onClick={() => setCodeListPage((current) => Math.min(codeListTotalPages, current + 1))}
                    />
                    {codeListPageWindow[codeListPageWindow.length - 1] < codeListTotalPages && (
                      <button
                        type="button"
                        className="code-list-pagination__button code-list-pagination__button--control css-chevron css-chevron--double css-chevron--right"
                        aria-label="Last code list page"
                        onClick={() => setCodeListPage(codeListTotalPages)}
                      />
                    )}
                  </span>
                </nav>
              )}
            </div>
          </PageCard>
          </div>

          <div className="code-management-panel-shell" ref={codeDetailSectionRef}>
          <PageCard
            title="Code Detail"
            className="code-detail-card"
            actions={
              <>
              <button type="button" className="code-mobile-panel-tab code-mobile-panel-tab--detail" onClick={() => scrollToCodeSection('list')}>
                List
              </button>
              <div className="code-detail-actions">
                <div className="code-detail-actions__group code-detail-actions__filter">
                  <label className="code-include-toggle">
                    <span>미사용 코드 포함</span>
                    <ToggleSwitch checked={includeDeleted} onChange={setIncludeDeleted} onLabel="ON" offLabel="OFF" />
                  </label>
                </div>
                <div className="code-detail-actions__group code-detail-actions__buttons">
                  <ActionButton variant="outline" onClick={() => requestCodeDelete('detail')} disabled={!selectedDetail}>{'\uC0AD\uC81C'}</ActionButton>
                  <ActionButton variant="outline" onClick={() => openCodeModal('detail-update')} disabled={!selectedDetail}>
                    수정
                  </ActionButton>
                  <ActionButton variant="primary" onClick={() => openCodeModal('detail-create')} disabled={!selectedCode}>
                    추가
                  </ActionButton>
                </div>
              </div>
              </>
            }
          >
            {isDetailLoading && <PageDataLoadingFallback title="상세 코드" preferMenuTitle={false} />}
            {!isDetailLoading && (
              <div className="list-panel code-detail-list">
                {visibleCodeDetails.map((detail) => (
                  <button
                    key={detail.id}
                    type="button"
                    className={`list-panel__item code-detail-item ${selectedDetailCode === detail.id ? 'is-active' : ''}`.trim()}
                    onClick={() => setSelectedDetailCode(detail.id)}
                  >
                    <CodeApiFieldRows code={detail} />
                  </button>
                ))}
                {visibleCodeDetails.length === 0 && <p className="list-panel__empty">선택한 마스터 코드의 상세 코드가 없습니다.</p>}
              </div>
            )}
          </PageCard>
          </div>
        </div>
      )}

      <Modal
        open={modal.isOpen}
        title={modalTitle}
        confirmLabel={modalConfirmLabel}
        onConfirm={requestCodeSave}
        onCancel={modal.close}
      >
        {formErrorMessage && <p role="alert">{formErrorMessage}</p>}
        <div className="form-grid">
          <TextField
            label={formMode.startsWith('master') ? '마스터 코드 ID(*)' : '세부 코드 ID(*)'}
            placeholder="코드 ID"
            value={formValues.cdId}
            readOnly={formMode.endsWith('update')}
            onChange={(event) => updateFormValue('cdId', event.target.value)}
          />
          <TextField
            label={formMode.startsWith('master') ? '마스터 코드명(*)' : '세부 코드명(*)'}
            placeholder="코드명"
            value={formValues.cdNm}
            onChange={(event) => updateFormValue('cdNm', event.target.value)}
          />
          <TextField
            label="상위 코드 ID"
            placeholder="상위 코드 ID"
            value={formValues.uprCdId}
            readOnly={formMode.startsWith('detail')}
            onChange={(event) => updateFormValue('uprCdId', event.target.value)}
          />
          <TextField
            label="Sort Order"
            placeholder="정렬 순서"
            value={formValues.sortOrd}
            onChange={(event) => updateFormValue('sortOrd', event.target.value)}
          />
          <TextField
            label="Description"
            placeholder="코드 설명"
            value={formValues.cdDesc}
            onChange={(event) => updateFormValue('cdDesc', event.target.value)}
          />
          <TextField
            label="Use"
            placeholder="Y"
            value={formValues.useYn}
            onChange={(event) => updateFormValue('useYn', event.target.value.toUpperCase())}
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
