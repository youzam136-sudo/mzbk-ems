import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { powerConsumptionStatusApi } from '../api/powerConsumptionStatusApi';
import { toPowerConsumptionPageData } from '../adapters/powerConsumptionStatusAdapter';
import type { PowerConsumptionPageData } from '../types/powerConsumptionStatus';

type PowerConsumptionStatusState = {
  data: PowerConsumptionPageData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: 전력 소비 현황 API 조회 상태를 page에 전달한다.
 * 연결: PowerConsumptionStatusPage, powerConsumptionStatusApi, powerConsumptionStatusAdapter.
 * 설명: 전력 소비 전용 API가 확정되기 전까지도 실 API 기반 값만 화면에 공급한다.
 * 수정: 전용 검색 조건이 생기면 API 함수와 이 hook의 loadStatus 인자를 확장한다.
 */
export function usePowerConsumptionStatus() {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<PowerConsumptionStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const response = await powerConsumptionStatusApi.getStatus();
        const data = toPowerConsumptionPageData(response);

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : '전력 소비 현황 데이터를 불러오지 못했습니다.';
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
