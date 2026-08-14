import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { acStatusApi } from '../api/acStatusApi';
import { toAcStatusPageData } from '../adapters/acStatusAdapter';
import type { AcStatusPageData } from '../types/acStatus';

type AcStatusState = {
  data: AcStatusPageData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: 공조기 현황 API 조회 상태를 페이지에 전달한다.
 * 연결: AcStatusPage, acStatusApi, acStatusAdapter.
 * 설명: 페이지는 로딩/오류/데이터만 받고 API 필드 매핑은 adapter에서 처리한다.
 * 수정: 자동 갱신이 필요하면 이 hook에서 polling 기준만 추가한다.
 */
export function useAcStatus() {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<AcStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const response = await acStatusApi.getStatus();
        const data = toAcStatusPageData(response);

        if (!mounted) return;

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) return;

        const message = error instanceof ApiError ? error.message : '공조기 데이터를 불러오지 못했습니다.';
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
