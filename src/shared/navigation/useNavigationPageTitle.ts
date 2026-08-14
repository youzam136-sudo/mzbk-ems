import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthSession } from '../../features/auth/session/AuthSessionProvider';
import { getNavigationGroups } from './navigationMenuAdapter';

type TitleCandidate = {
  label: string;
  score: number;
  pathLength: number;
  matchedByAlias: boolean;
};

const routeTitleFallbacks: Record<string, string> = {
  '/login': '로그인',
  '/dashboard/individual': '대시보드',
  '/dashboard/integrated': '대시보드',
  '/dashboard/plant-operation-status': '발전소 운영현황',
  '/dashboard/base-generation': '기저발전',
  '/dashboard/support-generation': '보조 발전현황',
  '/dashboard/charge-discharge': '충방전 현황',
  '/dashboard/power-consumption-status': '전력 소비 현황',
  '/dashboard/ac-status': '공조기현황',
  '/monitoring/dashboard': '대시보드',
  '/monitoring/dashboard/plant': '발전소 개별',
  '/monitoring/dashboard/total': '발전소 통합',
  '/monitoring/grid': 'GRID현황',
  '/monitoring/base/plant': '기저전력 개별 운전현황',
  '/monitoring/base/total': '기저전력 통합 운전현황',
  '/monitoring/ess': 'ESS현황',
  '/monitoring/assist': '보조전력 운전현황',
  '/monitoring/diesel1': '디젤1현황',
  '/monitoring/diesel2': '디젤2현황',
  '/monitoring/pcs': 'PCS현황',
  '/monitoring/battery': '배터리현황',
  '/monitoring/standby': '예비전력 운전현황',
  '/monitoring/ac': '공조기현황',
  '/monitoring/dispatch': '전력급전 운영현황',
  '/analysis/base/plant/history': '기저전력 개별 운영이력',
  '/analysis/base/total/history': '기저전력 통합 운영이력',
  '/analysis/assist/history': '보조전력 운영이력',
  '/analysis/standby/history': '예비전력 운영이력',
  '/analysis/dispatch/history': '전력급전 운영이력',
  '/history/grid': 'GRID이력',
  '/history/ess': 'ESS이력',
  '/history/pcs': 'PCS이력',
  '/history/battery': '배터리이력',
  '/history/diesel1': '디젤1이력',
  '/history/diesel2': '디젤2이력',
  '/history/ac': '공조기이력',
  '/history/power-consumption': '전력소비 이력',
  '/history/grid-base-generation-history': 'GRID 기저발전 이력',
  '/history/support-generation-history': '보조발전 이력',
  '/history/pcs-charge-discharge-history': 'PCS 충방전 이력',
  '/history/power-consumption-history': '전력소비 이력',
  '/reports/operation': '운영 리포트',
  '/report/daily': '일간 운전 보고서',
  '/report/weekly': '주간 운전 보고서',
  '/report/monthly': '월간 운전 보고서',
  '/report/yearly': '년간 운전 보고서',
  '/report/pcs': 'PCS 리포트',
  '/report/battery': '배터리 리포트',
  '/report/diesel1': '디젤1 리포트',
  '/report/diesel2': '디젤2 리포트',
  '/report/grid': 'GRID 리포트',
  '/report/ess': 'ESS 리포트',
  '/report/ac': '공조기 리포트',
  '/excel': '엑셀다운로드',
  '/master/plants': '발전소 관리',
  '/master/pcs': 'PCS 관리',
  '/master/inverters': '인버터 관리',
  '/master/batteries': '배터리 관리',
  '/master/diesels': '디젤 관리',
  '/admin/master': '마스터 관리',
  '/admin/code': '코드 관리',
  '/admin/user': '사용자 관리',
  '/admin/role': '권한 관리',
  '/system/roles': '권한 관리',
  '/system/menus': '메뉴 관리',
  '/system/users': '사용자 관리',
  '/system/codes': '코드 관리',
  '/system/popups': '팝업 샘플',
  '/search': '검색 결과'
};

function isSameRoute(pathname: string, targetPath: string) {
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

function resolveRouteFallbackTitle(pathname: string) {
  const matchedPath = Object.keys(routeTitleFallbacks)
    .filter((path) => isSameRoute(pathname, path))
    .sort((a, b) => b.length - a.length)[0];

  return matchedPath ? routeTitleFallbacks[matchedPath] : undefined;
}

function resolveNavigationTitle(pathname: string, fallbackTitle: string, groups: ReturnType<typeof getNavigationGroups>) {
  const candidates: TitleCandidate[] = [];
  const routeFallbackTitle = resolveRouteFallbackTitle(pathname);

  groups.forEach((group) => {
    group.items.forEach((item) => {
      if (isSameRoute(pathname, item.path)) {
        candidates.push({
          label: item.label,
          score: 3,
          pathLength: item.path.length,
          matchedByAlias: false
        });
      }

      (item.matchPaths ?? []).forEach((aliasPath) => {
        if (isSameRoute(pathname, aliasPath)) {
          candidates.push({
            label: item.label,
            score: 2,
            pathLength: aliasPath.length,
            matchedByAlias: true
          });
        }
      });
    });
  });

  if (candidates.length === 0) {
    return routeFallbackTitle ?? fallbackTitle;
  }

  candidates.sort((a, b) => b.score - a.score || b.pathLength - a.pathLength);

  const bestScore = candidates[0].score;
  const bestCandidates = candidates.filter((candidate) => candidate.score === bestScore);

  // 여러 API 메뉴가 같은 퍼블리싱 화면을 공유하면 화면 전용 fallback 제목을 우선한다.
  if (bestCandidates.length > 1 && bestCandidates.every((candidate) => candidate.matchedByAlias)) {
    return routeFallbackTitle ?? fallbackTitle;
  }

  return candidates[0].label;
}

/*
 * 필요: API 메뉴명과 퍼블리싱 화면명을 함께 사용할 수 있는 제목 해석 규칙을 모은다.
 * 연결: PageHeading, PageDocumentTitle, 로딩 메시지.
 * 설명: API 메뉴 경로에서는 메뉴명을 우선하고, 하나의 화면에 여러 메뉴가 붙은 경우 fallback 제목을 사용한다.
 * 수정: 특정 화면명을 강제로 유지해야 하면 PageHeading의 preferMenuTitle 값을 false로 넘긴다.
 */
export function useNavigationPageTitle(fallbackTitle: string, preferMenuTitle = true) {
  const location = useLocation();
  const { session } = useAuthSession();

  return useMemo(() => {
    if (!preferMenuTitle) {
      return fallbackTitle;
    }

    return resolveNavigationTitle(location.pathname, fallbackTitle, getNavigationGroups(session?.menus ?? []));
  }, [fallbackTitle, location.pathname, preferMenuTitle, session?.menus]);
}
