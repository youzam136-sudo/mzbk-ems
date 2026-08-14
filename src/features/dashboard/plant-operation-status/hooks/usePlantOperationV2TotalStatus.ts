import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { toPlantOperationV2TotalStatusData } from '../adapters/plantOperationV2Adapter';
import { plantOperationV2Api } from '../api/plantOperationV2Api';
import type { PlantOperationStatusData } from '../types/plantOperationStatus';

type PlantOperationV2TotalStatusState = {
  data: PlantOperationStatusData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: dashboard v2 total 타입 API와 고정 디젤 2개 serial API를 조회한다.
 * 연결: PlantOperationTotalStatusPage, plantOperationV2Api, plantOperationV2Adapter.
 * 설명: 인버터 상세표는 `/dashboard/integrated?groupBySerial=true`의 unique inverter만 사용한다.
 * 수정: total 타입 조회 조건이 바뀌면 이 hook과 API 파일만 먼저 확인한다.
 */
export function usePlantOperationV2TotalStatus() {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<PlantOperationV2TotalStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const [response, diesel1Response, diesel2Response] = await Promise.all([
          plantOperationV2Api.getIntegratedGroupStatus(),
          plantOperationV2Api.getDieselStatus('DSL0001'),
          plantOperationV2Api.getDieselStatus('DSL0002')
        ]);
        const data = toPlantOperationV2TotalStatusData({
          ...response,
          diesel: null,
          dieselList: null,
          diesel1: Array.isArray(diesel1Response.diesel) ? diesel1Response.diesel[0] : diesel1Response.diesel ?? null,
          diesel2: Array.isArray(diesel2Response.diesel) ? diesel2Response.diesel[0] : diesel2Response.diesel ?? null
        });

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : '대시보드2 total 데이터를 불러오지 못했습니다.';
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
