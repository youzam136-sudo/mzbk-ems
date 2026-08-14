import { Modal } from './Modal';

type ConfirmActionTone = 'confirm' | 'warning';

type ConfirmActionModalProps = {
  open: boolean;
  title: string;
  description: string;
  tone?: ConfirmActionTone;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/*
 * 필요: API 실행 전 확인/취소 흐름을 브라우저 alert가 아닌 공통 팝업으로 통일한다.
 * 연결: 등록, 수정, 저장, 삭제 같은 실행 버튼.
 * 설명: 실제 API 호출은 호출부가 담당하고, 이 컴포넌트는 의도 확인 UI만 제공한다.
 * 수정: 확인 문구 기본값이나 팝업 톤이 바뀌면 여기에서 먼저 조정한다.
 */
export function ConfirmActionModal({
  open,
  title,
  description,
  tone = 'confirm',
  confirmLabel = '확인',
  cancelLabel = '취소',
  isProcessing = false,
  onConfirm,
  onCancel
}: ConfirmActionModalProps) {
  return (
    <Modal
      open={open}
      tone={tone}
      title={title}
      description={description}
      confirmLabel={isProcessing ? '처리 중' : confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={isProcessing}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
