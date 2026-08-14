import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ActionButton } from './ActionButton';
import './Modal.css';

type ModalTone = 'info' | 'confirm' | 'warning' | 'error';

type ModalProps = {
  open: boolean;
  title: string;
  className?: string;
  tone?: ModalTone;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

function getToneLabel(tone: ModalTone) {
  if (tone === 'error') return 'ERROR';
  if (tone === 'warning') return 'WARNING';
  if (tone === 'confirm') return 'CONFIRM';
  return 'INFO';
}

export function Modal({
  open,
  title,
  className = '',
  tone = 'info',
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmDisabled = false,
  onConfirm,
  onCancel,
  children
}: ModalProps) {
  if (!open) return null;

  const modalElement = (
    <div className="modal-backdrop" role="presentation">
      <section className={`modal modal--${tone} ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal__badge">{getToneLabel(tone)}</div>
        <h2 id="modal-title" className="modal__title">
          {title}
        </h2>
        {description && <p className="modal__description">{description}</p>}

        {children && <div className="modal__content">{children}</div>}

        <div className="modal__actions">
          {onConfirm && (
            <ActionButton variant={tone === 'error' ? 'danger' : 'primary'} onClick={onConfirm} disabled={confirmDisabled}>
              {confirmLabel}
            </ActionButton>
          )}
          <ActionButton variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </ActionButton>
        </div>
      </section>
    </div>
  );

  /*
   * 버튼/카드 내부에서 호출해도 fixed backdrop 기준이 흔들리지 않도록
   * 공통 모달은 항상 document.body 기준으로 렌더링한다.
   */
  return createPortal(modalElement, document.body);
}
