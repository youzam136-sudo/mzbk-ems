import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { SearchConditionBar } from '../../../../shared/ui/SearchConditionBar';
import {
  monitoringResourceHistoryModes,
  type MonitoringHistoryMode,
  type MonitoringResourceHistoryPageConfig
} from '../constants/monitoringResourceHistoryConfig';

type MonitoringResourceHistorySearchSectionProps = {
  config: MonitoringResourceHistoryPageConfig;
  onSearch: (criteria: SearchConditionCriteria<MonitoringHistoryMode>) => void;
};

/*
 * 필요: 모든 monitoring 이력 화면의 조회 조건을 제목 아래 좌측 정렬 UI와 같은 기간 계산 규칙으로 맞춘다.
 * 연결: MonitoringResourceHistoryPage, SearchConditionBar.
 * 설명: 화면별 기본값만 config에서 받고 검색 입력/submit 흐름은 공통으로 유지한다.
 */
export function MonitoringResourceHistorySearchSection({ config, onSearch }: MonitoringResourceHistorySearchSectionProps) {
  return (
    <SearchConditionBar
      modes={monitoringResourceHistoryModes}
      defaultMode={config.defaultCriteria.mode}
      align="left"
      className="history-search-bar"
      defaultStartDate={config.defaultCriteria.startDate}
      defaultEndDate={config.defaultCriteria.endDate}
      defaultYear={config.defaultCriteria.year}
      defaultMonth={config.defaultCriteria.month}
      onSearch={onSearch}
    />
  );
}
