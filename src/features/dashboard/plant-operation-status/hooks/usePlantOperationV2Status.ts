import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { toPlantOperationV2StatusData } from '../adapters/plantOperationV2Adapter';
import { plantOperationV2Api } from '../api/plantOperationV2Api';
import type { PlantOperationStatusData } from '../types/plantOperationStatus';

type PlantOperationV2StatusState = {
  data: PlantOperationStatusData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: dashboard v2 전용 개별 그룹 API와 고정 디젤 2개 serial API를 조회한다.
 * 연결: PlantOperationStatusPage, plantOperationV2Api, plantOperationV2Adapter.
 * 설명: 나머지 장비는 그룹 응답을 쓰고, 디젤 슬롯은 `DSL0001`/`DSL0002` 지정 조회값만 주입한다.
 * 수정: 조회 조건이나 refresh 정책이 바뀌면 이 hook과 API 파일만 먼저 조정한다.
 */
export function usePlantOperationV2Status() {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<PlantOperationV2StatusState>({
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
          plantOperationV2Api.getIndividualGroupStatus(),
          plantOperationV2Api.getDieselStatus('DSL0001'),
          plantOperationV2Api.getDieselStatus('DSL0002')
        ]);
        const data = toPlantOperationV2StatusData({
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

        const message = error instanceof ApiError ? error.message : '대시보드2 데이터를 불러오지 못했습니다.';
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
