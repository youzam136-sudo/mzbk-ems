import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiError } from '../../shared/api/apiClient';
import type { ApiRecord } from '../../shared/api/apiDataUtils';
import { EMPTY_API_VALUE, getRawValue } from '../../shared/api/apiDataUtils';
import { useDisclosure } from '../../shared/hooks/useDisclosure';
import { ActionButton } from '../../shared/ui/ActionButton';
import { ConfirmActionModal } from '../../shared/ui/ConfirmActionModal';
import { EntityFormModal, type EntityFormField } from '../../shared/ui/EntityFormModal';
import { PageCard } from '../../shared/ui/PageCard';
import { PageDataLoadingFallback } from '../../shared/ui/PageDataLoadingFallback';
import { PageHeading } from '../../shared/ui/PageHeading';
import { adminApi, type MasterResource } from './adminApi';
import './MasterManagementPage.css';

type MasterField = {
  key: string;
  label: string;
  required?: boolean;
  section?: string;
  wide?: boolean;
};

type MasterResourceViewConfig = {
  resource: MasterResource;
  title: string;
  listFields: MasterField[];
  detailFields: MasterField[];
};

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'confirm' | 'warning';
  run: () => Promise<void>;
};

type MasterDetailEntry = {
  key: string;
  label: string;
  value: string;
  required?: boolean;
  section?: string;
  wide?: boolean;
};

type MasterDetailSection = {
  title: string;
  entries: MasterDetailEntry[];
};

const masterResourceConfigs: Record<MasterResource, MasterResourceViewConfig> = {
  plants: {
    resource: 'plants',
    title: '발전소관리',
    listFields: [
      { key: 'plntId', label: '발전소 ID' },
      { key: 'plntSeq', label: '순번' },
      { key: 'plntNm', label: '발전소명' },
      { key: 'pplntDelyn', label: '삭제' }
    ],
    detailFields: [
      { key: 'plntId', label: '발전소 ID', required: true, section: '발전소 정보' },
      { key: 'plntSeq', label: '발전소 순번', required: true, section: '발전소 정보' },
      { key: 'plntNm', label: '발전소명', required: true, section: '발전소 정보' },
      { key: 'plntComtYmd', label: '준공일자', section: '발전소 정보' },
      { key: 'plntOperYmd', label: '운전개시일', section: '발전소 정보' },
      { key: 'plntAddr', label: '주소', section: '발전소 정보', wide: true },
      { key: 'pplntGpsLatd', label: '위도', section: '발전소 정보' },
      { key: 'pplntGpsLntd', label: '경도', section: '발전소 정보' },
      { key: 'plntVndrNm', label: '회사명', required: true, section: '운영자' },
      { key: 'plntVndrPhon', label: '전화번호', required: true, section: '운영자' },
      { key: 'plntVndrEmail', label: '이메일', required: true, section: '운영자' },
      { key: 'plntMntcNm', label: '담당자명', section: '운영자' },
      { key: 'plntMntcPhon', label: '담당자 전화번호', section: '운영자' },
      { key: 'plntMntcEmail', label: '담당자 이메일', section: '운영자' },
      { key: 'pplntDelyn', label: '삭제 여부', section: '운영자' }
    ]
  },
  pcs: {
    resource: 'pcs',
    title: 'PCS관리',
    listFields: [
      { key: 'pcsId', label: 'PCS ID' },
      { key: 'pcsSeq', label: '순번' },
      { key: 'pcsNm', label: 'PCS명' },
      { key: 'pcsDelyn', label: '삭제' }
    ],
    detailFields: [
      { key: 'pcsId', label: 'PCS ID', required: true },
      { key: 'pcsSeq', label: 'PCS 순번', required: true },
      { key: 'pcsNm', label: 'PCS명', required: true },
      { key: 'plntId', label: '발전소 ID' },
      { key: 'plntSeq', label: '발전소 순번' },
      { key: 'pcsSeril', label: 'PCS 시리얼' },
      { key: 'modlNm', label: '모델명' },
      { key: 'pcsDelyn', label: '삭제 여부' }
    ]
  },
  inverters: {
    resource: 'inverters',
    title: '인버터관리',
    listFields: [
      { key: 'ivtId', label: '인버터 ID' },
      { key: 'ivtSeq', label: '순번' },
      { key: 'ivtNm', label: '인버터명' },
      { key: 'ivtDelyn', label: '삭제' }
    ],
    detailFields: [
      { key: 'ivtId', label: '인버터 ID', required: true },
      { key: 'ivtSeq', label: '인버터 순번', required: true },
      { key: 'ivtNm', label: '인버터명', required: true },
      { key: 'pcsId', label: 'PCS ID' },
      { key: 'plntId', label: '발전소 ID' },
      { key: 'ivtSeril', label: '인버터 시리얼' },
      { key: 'modlNm', label: '모델명' },
      { key: 'ivtDelyn', label: '삭제 여부' }
    ]
  },
  batteries: {
    resource: 'batteries',
    title: '배터리관리',
    listFields: [
      { key: 'batId', label: '배터리 ID' },
      { key: 'batSeq', label: '순번' },
      { key: 'batNm', label: '배터리명' },
      { key: 'batDelyn', label: '삭제' }
    ],
    detailFields: [
      { key: 'batId', label: '배터리 ID', required: true },
      { key: 'batSeq', label: '배터리 순번', required: true },
      { key: 'batNm', label: '배터리명', required: true },
      { key: 'pcsId', label: 'PCS ID' },
      { key: 'plntId', label: '발전소 ID' },
      { key: 'batSeril', label: '배터리 시리얼' },
      { key: 'modlNm', label: '모델명' },
      { key: 'batDelyn', label: '삭제 여부' }
    ]
  },
  diesels: {
    resource: 'diesels',
    title: '디젤관리',
    listFields: [
      { key: 'dslId', label: '디젤 ID' },
      { key: 'dslSeq', label: '순번' },
      { key: 'dslNm', label: '디젤명' },
      { key: 'dslDelyn', label: '삭제' }
    ],
    detailFields: [
      { key: 'dslId', label: '디젤 ID', required: true },
      { key: 'dslSeq', label: '디젤 순번', required: true },
      { key: 'dslNm', label: '디젤명', required: true },
      { key: 'plntId', label: '발전소 ID' },
      { key: 'plntSeq', label: '발전소 순번' },
      { key: 'dslSeril', label: '디젤 시리얼' },
      { key: 'modlNm', label: '모델명' },
      { key: 'dslDelyn', label: '삭제 여부' }
    ]
  }
};

const masterRouteResources: Array<{ path: string; resource: MasterResource }> = [
  { path: '/master/plants', resource: 'plants' },
  { path: '/master/pcs', resource: 'pcs' },
  { path: '/master/inverters', resource: 'inverters' },
  { path: '/master/batteries', resource: 'batteries' },
  { path: '/master/diesels', resource: 'diesels' }
];

function resolveMasterResource(pathname: string) {
  return masterRouteResources.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))?.resource ?? 'plants';
}

function getDisplayValue(row: ApiRecord | null | undefined, key: string) {
  const value = getRawValue(row?.[key]);
  return value || EMPTY_API_VALUE;
}

function getRowKey(row: ApiRecord, resource: MasterResource, index: number) {
  const config = masterResourceConfigs[resource];
  const primaryValues = config.listFields.map((field) => getRawValue(row[field.key])).filter(Boolean);

  return primaryValues.length > 0 ? `${resource}-${primaryValues.join('-')}` : `${resource}-${index}`;
}

function getDetailEntries(detail: ApiRecord | null, config: MasterResourceViewConfig) {
  if (!detail) {
    return [];
  }

  const usedKeys = new Set(config.detailFields.map((field) => field.key));
  const configuredEntries = config.detailFields.map((field) => ({
    key: field.key,
    label: field.label,
    value: getDisplayValue(detail, field.key),
    required: field.required,
    section: field.section,
    wide: field.wide
  }));
  const extraEntries = Object.entries(detail)
    .filter(([key, value]) => !usedKeys.has(key) && getRawValue(value))
    .map(([key, value]) => ({ key, label: key, value: getRawValue(value), section: '추가 정보' }));

  return [...configuredEntries, ...extraEntries];
}

function groupDetailEntries(entries: MasterDetailEntry[], fallbackTitle: string): MasterDetailSection[] {
  return entries.reduce<MasterDetailSection[]>((sections, entry) => {
    const title = entry.section ?? fallbackTitle;
    const lastSection = sections[sections.length - 1];

    if (lastSection?.title === title) {
      lastSection.entries.push(entry);
      return sections;
    }

    return [...sections, { title, entries: [entry] }];
  }, []);
}

function createEmptyFormValues(fields: MasterField[]) {
  return fields.reduce<Record<string, string>>((values, field) => {
    values[field.key] = '';
    return values;
  }, {});
}

function toEntityFormFields(fields: MasterField[]): EntityFormField[] {
  return fields.map((field) => ({
    key: field.key,
    label: field.label,
    required: field.required,
    section: field.section,
    wide: field.wide
  }));
}

function validateRequiredFields(fields: MasterField[], values: Record<string, string>) {
  const missingField = fields.find((field) => field.required && !values[field.key]?.trim());

  return missingField ? `${missingField.label}은(는) 필수 입력값입니다.` : '';
}

/*
 * 필요: 마스터 06~10번 API를 같은 화면 규칙으로 읽어 목록과 상세를 분리한다.
 * 연결: /master/plants, /master/pcs, /master/inverters, /master/batteries, /master/diesels.
 * 설명: 디자인 확정 전이라도 실제 API 값이 들어오는 위치를 명확히 두고, 상세 실패 시 목록 행을 상세 대체값으로 보여준다.
 */
export function MasterManagementPage() {
  const location = useLocation();
  const resource = resolveMasterResource(location.pathname);
  const config = masterResourceConfigs[resource];
  const [rows, setRows] = useState<ApiRecord[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detail, setDetail] = useState<ApiRecord | null>(null);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailMessage, setDetailMessage] = useState('');
  const registerModal = useDisclosure(false);
  const updateModal = useDisclosure(false);
  const [registerValues, setRegisterValues] = useState<Record<string, string>>(() => createEmptyFormValues(config.detailFields));
  const [updateValues, setUpdateValues] = useState<Record<string, string>>(() => createEmptyFormValues(config.detailFields));
  const [registerErrorMessage, setRegisterErrorMessage] = useState('');
  const [updateErrorMessage, setUpdateErrorMessage] = useState('');
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [isUpdateSubmitting, setIsUpdateSubmitting] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  useEffect(() => {
    setRegisterValues(createEmptyFormValues(config.detailFields));
    setUpdateValues(createEmptyFormValues(config.detailFields));
    setRegisterErrorMessage('');
    setUpdateErrorMessage('');
    registerModal.close();
    updateModal.close();
  }, [config.detailFields, registerModal.close, updateModal.close]);

  useEffect(() => {
    let mounted = true;

    async function loadRows() {
      setIsListLoading(true);
      setErrorMessage('');
      setDetailMessage('');
      setRows([]);
      setDetail(null);
      setSelectedIndex(0);

      try {
        const nextRows = await adminApi.getMasterRows(resource);

        if (!mounted) {
          return;
        }

        setRows(nextRows);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setErrorMessage(error instanceof ApiError ? error.message : `${config.title} 데이터를 불러오지 못했습니다.`);
      } finally {
        if (mounted) {
          setIsListLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      mounted = false;
    };
  }, [config.title, resource]);

  const selectedRow = rows[selectedIndex] ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!selectedRow) {
        setDetail(null);
        return;
      }

      setIsDetailLoading(true);
      setDetailMessage('');

      try {
        const nextDetail = await adminApi.getMasterDetail(resource, selectedRow);

        if (!mounted) {
          return;
        }

        setDetail(nextDetail);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setDetail(selectedRow);
        setDetailMessage(error instanceof ApiError ? error.message : '상세 API 응답이 없어 목록 값을 표시합니다.');
      } finally {
        if (mounted) {
          setIsDetailLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [resource, selectedRow]);

  const detailEntries = useMemo(() => getDetailEntries(detail, config), [config, detail]);
  const detailSections = useMemo(
    () => groupDetailEntries(detailEntries, `${config.title} 정보`),
    [config.title, detailEntries]
  );
  const registerFields = useMemo(() => toEntityFormFields(config.detailFields), [config.detailFields]);

  const handleRegisterChange = (key: string, value: string) => {
    setRegisterValues((current) => ({ ...current, [key]: value }));
  };

  const handleUpdateChange = (key: string, value: string) => {
    setUpdateValues((current) => ({ ...current, [key]: value }));
  };

  const handleRegisterOpen = () => {
    setRegisterValues(createEmptyFormValues(config.detailFields));
    setRegisterErrorMessage('');
    registerModal.open();
  };

  const handleUpdateOpen = () => {
    if (!detail) {
      setDetailMessage('변경할 데이터를 선택해 주세요.');
      return;
    }

    const nextValues = createEmptyFormValues(config.detailFields);
    config.detailFields.forEach((field) => {
      nextValues[field.key] = getRawValue(detail[field.key]);
    });
    setUpdateValues(nextValues);
    setUpdateErrorMessage('');
    updateModal.open();
  };

  const handleRegisterSubmit = async () => {
    const validationMessage = validateRequiredFields(config.detailFields, registerValues);

    if (validationMessage) {
      setRegisterErrorMessage(validationMessage);
      return;
    }

    setIsRegisterSubmitting(true);
    setRegisterErrorMessage('');

    try {
      /*
       * 필요: 등록 팝업 입력값을 실제 master API에 전달하고, 저장 후 목록을 다시 동기화한다.
       * 연결: EntityFormModal, adminApi.saveMaster, adminApi.getMasterRows.
       * 설명: 실제 필드명은 Swagger schema key를 그대로 사용해 이후 백엔드 변경 시 매핑 위치를 줄인다.
       */
      await adminApi.saveMaster(resource, registerValues);
      const nextRows = await adminApi.getMasterRows(resource);

      setRows(nextRows);
      setSelectedIndex(0);
      setDetail(null);
      registerModal.close();
    } catch (error) {
      setRegisterErrorMessage(error instanceof ApiError ? error.message : `${config.title} 등록에 실패했습니다.`);
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedRow) {
      setUpdateErrorMessage('변경할 데이터를 선택해 주세요.');
      return;
    }

    const validationMessage = validateRequiredFields(config.detailFields, updateValues);

    if (validationMessage) {
      setUpdateErrorMessage(validationMessage);
      return;
    }

    setIsUpdateSubmitting(true);
    setUpdateErrorMessage('');

    try {
      await adminApi.updateMaster(resource, selectedRow, updateValues);
      const nextRows = await adminApi.getMasterRows(resource);

      setRows(nextRows);
      setSelectedIndex((current) => Math.min(current, Math.max(nextRows.length - 1, 0)));
      setDetail(null);
      updateModal.close();
    } catch (error) {
      setUpdateErrorMessage(error instanceof ApiError ? error.message : `${config.title} 변경에 실패했습니다.`);
    } finally {
      setIsUpdateSubmitting(false);
    }
  };

  const requestDeleteMaster = () => {
    if (!selectedRow) {
      setDetailMessage('삭제할 데이터를 선택해 주세요.');
      return;
    }

    const displayKey = config.detailFields[2]?.key ?? config.listFields[0].key;
    const displayName = getDisplayValue(detail ?? selectedRow, displayKey);

    setConfirmAction({
      title: `${config.title} 삭제 확인`,
      description: `${displayName} 데이터를 삭제하시겠습니까?\n삭제 후 목록에서 제거됩니다.`,
      confirmLabel: '삭제',
      tone: 'warning',
      run: async () => {
        await adminApi.deleteMaster(resource, selectedRow);
        const nextRows = await adminApi.getMasterRows(resource);

        setRows(nextRows);
        setSelectedIndex((current) => Math.min(current, Math.max(nextRows.length - 1, 0)));
        setDetail(null);
        setDetailMessage(`${config.title} 삭제가 완료되었습니다.`);
      }
    });
  };

  const confirmPendingAction = async () => {
    if (!confirmAction) return;

    setIsSubmittingAction(true);
    setErrorMessage('');
    setDetailMessage('');

    try {
      await confirmAction.run();
      setConfirmAction(null);
    } catch (error) {
      setDetailMessage(error instanceof ApiError ? error.message : `${config.title} 삭제에 실패했습니다.`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="page-stack master-management-page">
      <PageHeading
        title={config.title}
        actions={
          <div className="inline-actions">
            <ActionButton variant="outline" onClick={requestDeleteMaster} disabled={!selectedRow}>{'\uC0AD\uC81C'}</ActionButton>
            <ActionButton variant="primary" onClick={handleRegisterOpen}>등록</ActionButton>
          </div>
        }
      />

      <div className="master-management-page__grid">
        <PageCard title={`${config.title} 목록`} className="master-management-page__list-card">
          {isListLoading && <PageDataLoadingFallback title={config.title} preferMenuTitle={false} />}
          {!isListLoading && errorMessage && <div role="alert" className="master-management-page__message">{errorMessage}</div>}
          {!isListLoading && !errorMessage && rows.length === 0 && (
            <div className="master-management-page__message">표시할 데이터가 없습니다.</div>
          )}
          {!isListLoading && !errorMessage && rows.length > 0 && (
            <div className="master-management-table-wrap">
              <table className="master-management-table" aria-label={`${config.title} 목록`}>
                <thead>
                  <tr>
                    {config.listFields.map((field) => (
                      <th key={field.key}>{field.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={getRowKey(row, resource, rowIndex)}
                      className={selectedIndex === rowIndex ? 'is-active' : ''}
                      onClick={() => setSelectedIndex(rowIndex)}
                    >
                      {config.listFields.map((field) => (
                        <td key={field.key}>{getDisplayValue(row, field.key)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageCard>

        <PageCard
          title={`${config.title} 상세`}
          actions={
            <ActionButton variant="primary" size="sm" onClick={handleUpdateOpen} disabled={!selectedRow}>
              변경
            </ActionButton>
          }
          className="master-management-page__detail-card"
        >
          {isDetailLoading && <PageDataLoadingFallback title={`${config.title} 상세`} preferMenuTitle={false} />}
          {!isDetailLoading && detailMessage && <div role="status" className="master-management-page__message">{detailMessage}</div>}
          {!isDetailLoading && detailEntries.length === 0 && (
            <div className="master-management-page__message">선택된 데이터가 없습니다.</div>
          )}
          {!isDetailLoading && detailSections.length > 0 && (
            <div className="master-detail-form">
              {detailSections.map((section) => (
                <section key={section.title} className="master-detail-form__section" aria-label={section.title}>
                  <h4 className="master-detail-form__section-title">{section.title}</h4>
                  <div className="master-detail-form__grid">
                    {section.entries.map((entry) => (
                      <label
                        key={`${entry.key}-${entry.value}`}
                        className={`master-detail-field ${entry.wide ? 'master-detail-field--wide' : ''}`.trim()}
                      >
                        <span className="master-detail-field__label">
                          {entry.label}
                          {entry.required && <span aria-hidden="true"> (*)</span>}
                        </span>
                        <input
                          className="master-detail-field__input"
                          value={entry.value}
                          title={`${entry.label}: ${entry.value}`}
                          readOnly
                          disabled
                        />
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      <EntityFormModal
        open={registerModal.isOpen}
        title={`${config.title} 정보 입력`}
        fields={registerFields}
        values={registerValues}
        onChange={handleRegisterChange}
        onSubmit={handleRegisterSubmit}
        onCancel={registerModal.close}
        confirmLabel="등록"
        isSubmitting={isRegisterSubmitting}
        errorMessage={registerErrorMessage}
      />

      <EntityFormModal
        open={updateModal.isOpen}
        title={`${config.title} 정보 변경`}
        fields={registerFields}
        values={updateValues}
        onChange={handleUpdateChange}
        onSubmit={handleUpdateSubmit}
        onCancel={updateModal.close}
        confirmLabel="변경"
        isSubmitting={isUpdateSubmitting}
        errorMessage={updateErrorMessage}
      />

      <ConfirmActionModal
        open={Boolean(confirmAction)}
        title={confirmAction?.title ?? ''}
        description={confirmAction?.description ?? ''}
        tone={confirmAction?.tone ?? 'confirm'}
        confirmLabel={confirmAction?.confirmLabel ?? 'OK'}
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
