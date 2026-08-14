import { useMemo } from 'react';
import { TextField } from './Field';
import { Modal } from './Modal';
import './EntityFormModal.css';

export type EntityFormField = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  section?: string;
  wide?: boolean;
};

type EntityFormModalProps = {
  open: boolean;
  title: string;
  fields: EntityFormField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
};

type SectionGroup = {
  title: string;
  fields: EntityFormField[];
};

function groupFields(fields: EntityFormField[]) {
  const sectionMap = new Map<string, SectionGroup>();

  fields.forEach((field) => {
    const title = field.section ?? '기본 정보';
    const group = sectionMap.get(title) ?? { title, fields: [] };

    group.fields.push(field);
    sectionMap.set(title, group);
  });

  return Array.from(sectionMap.values());
}

/*
 * 필요: 마스터 등록과 샘플 팝업의 필수 표시, 2열 입력, 버튼 위치를 같은 규칙으로 맞춘다.
 * 연결: Modal, TextField, master 등록 API.
 * 설명: 화면은 필드 목록과 값만 넘기고, 필수 빨강 표시와 입력 배치는 공통에서 처리한다.
 * 수정: 팝업 크기와 필드 간격은 EntityFormModal.css에서 조정한다.
 */
export function EntityFormModal({
  open,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  confirmLabel = '저장',
  cancelLabel = '취소',
  isSubmitting = false,
  errorMessage
}: EntityFormModalProps) {
  const sections = useMemo(() => groupFields(fields), [fields]);

  return (
    <Modal
      open={open}
      className="modal--entity-form"
      title={title}
      confirmLabel={isSubmitting ? '처리 중' : confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={isSubmitting}
      onConfirm={onSubmit}
      onCancel={onCancel}
    >
      <form
        className="entity-form-modal"
        aria-label={title}
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSubmitting) {
            onSubmit();
          }
        }}
      >
        {errorMessage && (
          <p className="entity-form-modal__error" role="alert">
            {errorMessage}
          </p>
        )}

        {sections.map((section) => (
          <section key={section.title} className="entity-form-modal__section" aria-label={section.title}>
            {section.title !== '기본 정보' && <h3 className="entity-form-modal__section-title">{section.title}</h3>}
            <div className="entity-form-modal__grid">
              {section.fields.map((field) => (
                <div key={field.key} className={field.wide ? 'entity-form-modal__wide-field' : undefined}>
                  <TextField
                    label={field.label}
                    required={field.required}
                    requiredMark={field.required}
                    placeholder={field.placeholder ?? field.label}
                    value={values[field.key] ?? ''}
                    onChange={(event) => onChange(field.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </form>
    </Modal>
  );
}
