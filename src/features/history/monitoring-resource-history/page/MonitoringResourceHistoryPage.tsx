import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { SearchConditionCriteria } from '../../../../shared/ui/SearchConditionBar';
import { PageHeading } from '../../../../shared/ui/PageHeading';
import '../../shared/HistoryPageLayout.css';
import {
  monitoringResourceHistoryPageConfigs,
  type MonitoringHistoryMode
} from '../constants/monitoringResourceHistoryConfig';
import { MonitoringResourceHistoryResultSection } from '../sections/MonitoringResourceHistoryResultSection';
import { MonitoringResourceHistorySearchSection } from '../sections/MonitoringResourceHistorySearchSection';

const SEARCH_READY_LABEL = '\uC870\uD68C \uC804';

function getConfig(pathname: string) {
  return monitoringResourceHistoryPageConfigs[pathname] ?? monitoringResourceHistoryPageConfigs['/history/grid'];
}

// 필요: API 메뉴 URL과 기존 monitoring 이력 화면을 같은 구조로 연결한다.
// 연결: 라우터 analysis history 메뉴, monitoring history 화면 config.
// 설명: 메뉴명과 경로는 API를 우선하고, 화면 구조는 config만 바꿔 재사용한다.
export function MonitoringResourceHistoryPage() {
  const location = useLocation();
  const config = useMemo(() => getConfig(location.pathname), [location.pathname]);
  const [searchCriteria, setSearchCriteria] = useState<SearchConditionCriteria<MonitoringHistoryMode>>(config.defaultCriteria);
  const [searchedAt, setSearchedAt] = useState(SEARCH_READY_LABEL);

  useEffect(() => {
    setSearchCriteria(config.defaultCriteria);
    setSearchedAt(SEARCH_READY_LABEL);
  }, [config]);

  const handleSearch = (nextCriteria: SearchConditionCriteria<MonitoringHistoryMode>) => {
    setSearchCriteria(nextCriteria);
    setSearchedAt(new Date().toLocaleTimeString('ko-KR', { hour12: false }));
  };

  return (
    <div className="page-stack history-page">
      <PageHeading title={config.title} />
      <MonitoringResourceHistorySearchSection config={config} onSearch={handleSearch} />
      <MonitoringResourceHistoryResultSection config={config} searchCriteria={searchCriteria} searchedAt={searchedAt} />
    </div>
  );
}
