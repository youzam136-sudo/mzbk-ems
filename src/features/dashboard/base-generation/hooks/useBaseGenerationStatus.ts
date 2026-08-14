import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import type { MonitoringDomain } from '../../../../shared/api/monitoringApi';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { toBaseGenerationPageData } from '../adapters/baseGenerationAdapter';
import { baseGenerationApi } from '../api/baseGenerationApi';
import type { BaseGenerationPageData } from '../types/baseGeneration';

type BaseGenerationStatusState = {
  data: BaseGenerationPageData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: 기저전력 API 조회 상태를 페이지에 전달한다.
 * 연결: BaseGenerationPage, baseGenerationApi, baseGenerationAdapter.
 * 설명: 개별 화면의 targetId 변경은 이 hook에서 다시 조회하고, 화면 컴포넌트는 data/loading/error만 받는다.
 * 수정: 자동 갱신이나 검색 조건이 들어오면 이 hook의 domain, targetId, 조회 인자만 확장한다.
 */
export function useBaseGenerationStatus(domain: MonitoringDomain = 'base-total', targetId = '') {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<BaseGenerationStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const response = await baseGenerationApi.getStatus(domain, targetId);
        const data = toBaseGenerationPageData(response);

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : '기저전력 데이터를 불러오지 못했습니다.';
        setState({ data: null, isLoading: false, errorMessage: message });
      }
    }

    loadStatus();

    return () => {
      mounted = false;
    };
  }, [domain, refreshedAt, targetId]);

  return state;
}
