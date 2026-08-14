import { useEffect, useState } from 'react';
import { ApiError } from '../../../../shared/api/apiClient';
import { useAutoRefresh } from '../../../../shared/hooks/useAutoRefresh';
import { toPlantOperationStatusData } from '../adapters/plantOperationStatusAdapter';
import { plantOperationStatusApi, type PlantOperationViewMode } from '../api/plantOperationStatusApi';
import type { PlantOperationStatusData } from '../types/plantOperationStatus';

type PlantOperationStatusState = {
  data: PlantOperationStatusData | null;
  isLoading: boolean;
  errorMessage: string;
};

/*
 * 필요: 발전소 운영현황의 실제 API 조회 상태를 화면에 전달한다.
 * 연결: PlantOperationStatusPage, plantOperationStatusApi, plantOperationStatusAdapter.
 * 설명: 개별 대상 targetId 변경은 이 hook에서 재조회하고, endpoint와 DTO 변환은 hook 밖 계층에 둔다.
 * 수정: 자동 갱신이나 조회 주기가 필요하면 이 hook에만 주기를 추가한다.
 */
export function usePlantOperationStatus(viewMode: PlantOperationViewMode, targetId = '') {
  const refreshedAt = useAutoRefresh();
  const [state, setState] = useState<PlantOperationStatusState>({
    data: null,
    isLoading: true,
    errorMessage: ''
  });

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setState((currentState) => ({ ...currentState, isLoading: currentState.data === null, errorMessage: '' }));

      try {
        const response = await plantOperationStatusApi.getLatestStatus(viewMode, targetId);
        const data = toPlantOperationStatusData(response);

        if (!mounted) {
          return;
        }

        setState({ data, isLoading: false, errorMessage: '' });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message = error instanceof ApiError ? error.message : '발전소 운영현황 데이터를 불러오지 못했습니다.';
        setState({ data: null, isLoading: false, errorMessage: message });
      }
    }

    loadStatus();

    return () => {
      mounted = false;
    };
  }, [refreshedAt, targetId, viewMode]);

  return state;
}
