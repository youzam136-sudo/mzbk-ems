import { useMemo, useState } from 'react';
import { ActionButton } from '../../shared/ui/ActionButton';
import { EntityFormModal, type EntityFormField } from '../../shared/ui/EntityFormModal';
import { Modal } from '../../shared/ui/Modal';
import { PageCard } from '../../shared/ui/PageCard';
import { PageHeading } from '../../shared/ui/PageHeading';
import './PopupSamplesPage.css';

type PopupSampleKind = 'info' | 'warning' | 'error' | 'confirm' | 'registration';

type PopupSample = {
  kind: PopupSampleKind;
  title: string;
  description: string;
  buttonLabel: string;
};

const popupSamples: PopupSample[] = [
  {
    kind: 'info',
    title: '안내 팝업',
    description: '조회 결과나 저장 완료처럼 사용자에게 상태만 알려야 할 때 사용하는 팝업입니다.',
    buttonLabel: '안내 확인'
  },
  {
    kind: 'warning',
    title: '경고 팝업',
    description: '삭제나 변경 전 사용자 확인이 필요한 상황에서 사용하는 팝업입니다.',
    buttonLabel: '경고 확인'
  },
  {
    kind: 'error',
    title: '오류 팝업',
    description: 'API 오류, 저장 실패, 필수값 누락처럼 작업을 진행할 수 없는 상태를 안내합니다.',
    buttonLabel: '오류 확인'
  },
  {
    kind: 'confirm',
    title: '확인 팝업',
    description: '실행 여부를 다시 묻는 공통 확인 팝업입니다.',
    buttonLabel: '확인 팝업'
  },
  {
    kind: 'registration',
    title: '등록 팝업',
    description: '마스터/사용자/코드 등록 화면에서 재사용할 수 있는 입력형 팝업입니다.',
    buttonLabel: '등록 팝업'
  }
];

const plantRegistrationFields: EntityFormField[] = [
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
  { key: 'plntMntcEmail', label: '담당자 이메일', section: '운영자' }
];

function createEmptyRegistrationValues() {
  return plantRegistrationFields.reduce<Record<string, string>>((values, field) => {
    values[field.key] = '';
    return values;
  }, {});
}

export function PopupSamplesPage() {
  const [activePopup, setActivePopup] = useState<PopupSampleKind | null>(null);
  const [registrationValues, setRegistrationValues] = useState<Record<string, string>>(createEmptyRegistrationValues);
  const activeSample = useMemo(() => popupSamples.find((sample) => sample.kind === activePopup), [activePopup]);

  const handleRegistrationChange = (key: string, value: string) => {
    setRegistrationValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="page-stack popup-samples">
      <PageHeading title="팝업 샘플" />

      <PageCard title="팝업 유형" ariaLabel="팝업 샘플 목록">
        <div className="popup-samples__grid">
          {popupSamples.map((sample) => (
            <article key={sample.kind} className="popup-samples__item">
              <div>
                <strong>{sample.title}</strong>
                <p>{sample.description}</p>
              </div>
              <ActionButton variant={sample.kind === 'error' ? 'danger' : 'primary'} onClick={() => setActivePopup(sample.kind)}>
                {sample.buttonLabel}
              </ActionButton>
            </article>
          ))}
        </div>
      </PageCard>

      {activeSample && activeSample.kind !== 'registration' && (
        <Modal
          open
          tone={activeSample.kind === 'confirm' ? 'info' : activeSample.kind}
          title={activeSample.title}
          description={activeSample.description}
          confirmLabel="확인"
          onConfirm={() => setActivePopup(null)}
          onCancel={() => setActivePopup(null)}
        >
          <p className="popup-samples__modal-text">공통 팝업의 배지, 버튼, 문구 배치를 확인하는 샘플입니다.</p>
        </Modal>
      )}

      {activeSample?.kind === 'registration' && (
        <EntityFormModal
          open
          title="발전소 마스터 정보 입력"
          fields={plantRegistrationFields}
          values={registrationValues}
          onChange={handleRegistrationChange}
          onSubmit={() => setActivePopup(null)}
          onCancel={() => setActivePopup(null)}
        />
      )}
    </div>
  );
}
