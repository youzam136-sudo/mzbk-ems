import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { pcsChargeDischargeStatusApi } from '../api/pcsChargeDischargeStatusApi';
import { toPcsChargeDischargePageData } from '../adapters/pcsChargeDischargeStatusAdapter';
import type { PcsChargeDischargePageData } from '../types/pcsChargeDischargeStatus';

type PcsChargeDischargeStatusState = {
  data: PcsChargeDischargePageData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: PCS 충방전 API 조회 상태를 page에 전달한다.
 * 연결: PcsChargeDischargeStatusPage, pcsChargeDischargeStatusApi, pcsChargeDischargeStatusAdapter.
 * 설명: 화면 컴포넌트는 data/loading/error만 받고 API 조합과 변환은 hook에서 처리한다.
 * 수정: 장비 선택 조건이 추가되면 이 hook의 조회 인자만 확장한다.
 */
export function usePcsChargeDischargeStatus() {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<PcsChargeDischargeStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const response = await pcsChargeDischargeStatusApi.getStatus();
        const data = toPcsChargeDischargePageData(response);

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : 'PCS 충방전 데이터를 불러오지 못했습니다.';
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
