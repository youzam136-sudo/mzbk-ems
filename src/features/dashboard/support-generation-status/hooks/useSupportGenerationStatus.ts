import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { supportGenerationStatusApi } from '../api/supportGenerationStatusApi';
import { toSupportGenerationPageData } from '../adapters/supportGenerationStatusAdapter';
import type { SupportGenerationPageData } from '../types/supportGenerationStatus';

type SupportGenerationStatusState = {
  data: SupportGenerationPageData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: 보조 발전현황 실 API 조회 상태를 page에 전달한다.
 * 연결: SupportGenerationStatusPage, supportGenerationStatusApi, supportGenerationStatusAdapter.
 * 설명: loading/error/data만 화면에 노출하고 endpoint와 DTO 변환은 hook 뒤에 둔다.
 * 수정: 조회 조건이 생기면 API 함수 인자와 이 hook의 loadStatus만 확장한다.
 */
export function useSupportGenerationStatus() {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<SupportGenerationStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const response = await supportGenerationStatusApi.getStatus();
        const data = toSupportGenerationPageData(response);

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : '보조 발전현황 데이터를 불러오지 못했습니다.';
        setState({ data: null, isLoading: false, errorMessage: message });
      }
    }

    loadStatus();

    return () => {
      mounted = false;
    };
  }, [refreshedAt]);

  return state;
}
