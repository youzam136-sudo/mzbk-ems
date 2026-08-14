import type { ButtonHTMLAttributes, MouseEventHandler } from 'react';
import { useState } from 'react';
import type { AuthSession } from '../../features/auth/session/types/authSession';
import { useAuthSession } from '../../features/auth/session/AuthSessionProvider';
import { commonIconSources } from '../assets/icons/commonIconSources';
import type { ExcelExportSheet } from '../utils/excelExport';
import { downloadExcelWorkbook } from '../utils/excelExport';
import { ActionButton } from './ActionButton';
import { ConfirmActionModal } from './ConfirmActionModal';
import './ExcelSaveButton.css';

type ExcelSaveButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label?: string;
  iconSrc?: string;
  iconAlt?: string;
  fileName?: string;
  sheets?: ExcelExportSheet[];
};

function formatExcelDownloadTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(
    date.getSeconds()
  )}`;
}

function getExcelDownloadAccountName(session: AuthSession | null) {
  return session?.user.name.trim() || session?.user.id.trim() || 'unknown';
}

/*
 * 필요: 여러 상세 표에 반복되는 전체엑셀 저장 버튼 모양을 통일한다.
 * 연결: ActionButton, commonIconSources, 각 feature table section.
 * 설명: 전달받은 표 view model을 브라우저 다운로드로 저장하고, 별도 클릭 동작도 함께 받을 수 있다.
 * 수정: 아이콘 src/alt는 props나 shared/assets/icons/commonIconSources에서 조정한다.
 */
export function ExcelSaveButton({
  label = '전체엑셀 저장',
  iconSrc = commonIconSources.excelSave.src,
  iconAlt = commonIconSources.excelSave.alt,
  fileName = 'excel-export',
  sheets,
  className = '',
  onClick,
  ...props
}: ExcelSaveButtonProps) {
  const { session } = useAuthSession();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || !sheets?.length) return;

    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!sheets?.length) return;
    const timestamp = formatExcelDownloadTimestamp(new Date());
    const accountName = getExcelDownloadAccountName(session);
    downloadExcelWorkbook({ fileName: `${fileName}_다운로드_${timestamp}_${accountName}`, sheets });
    setIsConfirmOpen(false);
  };

  return (
    <>
      <ActionButton
        variant="success"
        size="sm"
        className={`excel-save-button ${className}`.trim()}
        aria-label={props['aria-label'] ?? label}
        onClick={handleClick}
        {...props}
      >
        <img src={iconSrc} alt={iconAlt} className="excel-save-button__icon" />
        <span>{label}</span>
      </ActionButton>
      <ConfirmActionModal
        open={isConfirmOpen}
        title="엑셀 저장 확인"
        description="엑셀 파일을 저장하시겠습니까?"
        confirmLabel="저장"
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
