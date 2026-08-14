import { useEffect, useState, type ReactNode } from 'react';
import { API_ERROR_EVENT, type ApiErrorEventDetail } from '../api/apiClient';
import { Modal } from './Modal';

type ApiErrorModalProviderProps = {
  children: ReactNode;
};

function getErrorTypeLabel(type: ApiErrorEventDetail['type']) {
  if (type === 'network') return '네트워크 오류';
  if (type === 'session') return '세션 만료 또는 인증 오류';
  return 'API 오류';
}

function getStatusLabel(error: ApiErrorEventDetail) {
  if (error.type === 'network') return 'NETWORK';
  return error.status ? String(error.status) : '-';
}

/*
 * 필요: 화면 어디에서 API 요청이 실패해도 같은 오류 팝업으로 사용자에게 알린다.
 * 연결: apiClient의 API_ERROR_EVENT, 공통 Modal.
 * 설명: 실제 화면의 inline 오류 문구는 유지하고, 팝업은 작업명/오류타입/상태코드/API코드를 명시한다.
 * 수정: 오류 문구 정책이 바뀌면 getErrorTypeLabel과 detail rows를 먼저 조정한다.
 */
export function ApiErrorModalProvider({ children }: ApiErrorModalProviderProps) {
  const [apiError, setApiError] = useState<ApiErrorEventDetail | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const detail = (event as CustomEvent<ApiErrorEventDetail>).detail;

      if (!detail) return;
      if (detail.type === 'session') return;
      setApiError(detail);
    };

    window.addEventListener(API_ERROR_EVENT, handleApiError);
    return () => {
      window.removeEventListener(API_ERROR_EVENT, handleApiError);
    };
  }, []);

  return (
    <>
      {children}

      <Modal
        open={Boolean(apiError)}
        tone="error"
        title={apiError ? `${apiError.operationName} 실패` : '요청 실패'}
        description={apiError?.message}
        confirmLabel="확인"
        cancelLabel="닫기"
        onConfirm={() => setApiError(null)}
        onCancel={() => setApiError(null)}
      >
        {apiError && (
          <dl className="api-error-detail">
            <div>
              <dt>오류 타입</dt>
              <dd>{getErrorTypeLabel(apiError.type)}</dd>
            </div>
            <div>
              <dt>HTTP 상태</dt>
              <dd>{getStatusLabel(apiError)}</dd>
            </div>
            <div>
              <dt>API 코드</dt>
              <dd>{apiError.code || '-'}</dd>
            </div>
            <div>
              <dt>요청</dt>
              <dd>
                {apiError.method} {apiError.path}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </>
  );
}
