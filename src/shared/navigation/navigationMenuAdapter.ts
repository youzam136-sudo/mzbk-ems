import type { AuthSessionMenu } from '../../features/auth/session/types/authSession';
import { commonIconSources } from '../assets/icons/commonIconSources';
import {
  navigationGroups,
  productionNavigationGroups,
  sampleNavigationGroups,
  type NavigationGroup,
  type NavigationItem
} from './navigationGroups';

const knownNavigationPaths = new Set(navigationGroups.flatMap((group) => group.items.map((item) => item.path)));

const apiRouteAliases: Record<string, string[]> = {
  '/dashboard/individual': ['/dashboard/plant-operation-status', '/monitoring/dashboard', '/monitoring/dashboard/plant'],
  '/dashboard/integrated': ['/monitoring/dashboard/total'],
  '/monitoring/dashboard': ['/dashboard/individual', '/dashboard/plant-operation-status'],
  '/monitoring/dashboard/plant': ['/dashboard/individual', '/dashboard/plant-operation-status'],
  '/monitoring/dashboard/total': ['/dashboard/integrated'],
  '/monitoring/grid': ['/dashboard/base-generation'],
  '/monitoring/base/plant': ['/dashboard/base-generation'],
  '/monitoring/base/total': ['/dashboard/base-generation'],
  '/monitoring/ess': ['/dashboard/support-generation'],
  '/monitoring/assist': ['/dashboard/support-generation'],
  '/monitoring/diesel1': ['/dashboard/support-generation'],
  '/monitoring/diesel2': ['/dashboard/support-generation'],
  '/monitoring/pcs': ['/dashboard/charge-discharge'],
  '/monitoring/battery': ['/dashboard/charge-discharge'],
  '/monitoring/standby': ['/dashboard/charge-discharge'],
  '/monitoring/ac': ['/dashboard/ac-status'],
  '/monitoring/dispatch': ['/dashboard/power-consumption-status'],
  '/analysis/base/plant/history': ['/history/grid'],
  '/analysis/base/total/history': ['/history/grid'],
  '/analysis/assist/history': ['/history/ess'],
  '/analysis/standby/history': ['/history/pcs'],
  '/analysis/dispatch/history': ['/history/power-consumption'],
  '/system/roles': ['/admin/role'],
  '/system/users': ['/admin/user'],
  '/system/codes': ['/admin/code'],
  '/system/menus': ['/admin/role'],
  '/master/plants': ['/admin/master'],
  '/master/pcs': ['/admin/master'],
  '/master/inverters': ['/admin/master'],
  '/master/batteries': ['/admin/master'],
  '/master/diesels': ['/admin/master'],
  '/report/pcs': ['/reports/operation'],
  '/report/battery': ['/reports/operation'],
  '/report/diesel1': ['/reports/operation'],
  '/report/diesel2': ['/reports/operation'],
  '/report/grid': ['/reports/operation'],
  '/report/ess': ['/reports/operation'],
  '/report/ac': ['/reports/operation'],
  '/report/daily': ['/reports/operation'],
  '/report/weekly': ['/reports/operation'],
  '/report/monthly': ['/reports/operation'],
  '/report/yearly': ['/reports/operation'],
  '/excel': ['/reports/operation']
};

const labelRouteRules: Array<{ includes: string[]; path: string }> = [
  { includes: ['발전소', '운영'], path: '/dashboard/plant-operation-status' },
  { includes: ['기저전력', '개별', '이력'], path: '/analysis/base/plant/history' },
  { includes: ['기저전력', '통합', '이력'], path: '/analysis/base/total/history' },
  { includes: ['보조전력', '이력'], path: '/analysis/assist/history' },
  { includes: ['예비전력', '이력'], path: '/analysis/standby/history' },
  { includes: ['전력급전', '이력'], path: '/analysis/dispatch/history' },
  { includes: ['기저전력', '개별'], path: '/monitoring/base/plant' },
  { includes: ['기저전력', '통합'], path: '/monitoring/base/total' },
  { includes: ['보조전력'], path: '/monitoring/assist' },
  { includes: ['예비전력'], path: '/monitoring/standby' },
  { includes: ['전력급전'], path: '/monitoring/dispatch' },
  { includes: ['GRID', '이력'], path: '/history/grid' },
  { includes: ['ESS', '이력'], path: '/history/ess' },
  { includes: ['PCS', '이력'], path: '/history/pcs' },
  { includes: ['배터리', '이력'], path: '/history/battery' },
  { includes: ['디젤1', '이력'], path: '/history/diesel1' },
  { includes: ['디젤2', '이력'], path: '/history/diesel2' },
  { includes: ['공조기', '이력'], path: '/history/ac' },
  { includes: ['GRID', '현황'], path: '/monitoring/grid' },
  { includes: ['ESS', '현황'], path: '/monitoring/ess' },
  { includes: ['PCS', '현황'], path: '/monitoring/pcs' },
  { includes: ['배터리', '현황'], path: '/monitoring/battery' },
  { includes: ['디젤1', '현황'], path: '/monitoring/diesel1' },
  { includes: ['디젤2', '현황'], path: '/monitoring/diesel2' },
  { includes: ['공조기', '현황'], path: '/monitoring/ac' },
  { includes: ['기저', '이력'], path: '/history/grid' },
  { includes: ['기저'], path: '/dashboard/base-generation' },
  { includes: ['보조', '이력'], path: '/history/ess' },
  { includes: ['보조'], path: '/dashboard/support-generation' },
  { includes: ['충방전', '이력'], path: '/history/pcs' },
  { includes: ['충방전'], path: '/dashboard/charge-discharge' },
  { includes: ['전력', '이력'], path: '/history/power-consumption' },
  { includes: ['전력'], path: '/dashboard/power-consumption-status' },
  { includes: ['리포트'], path: '/reports/operation' },
  { includes: ['엑셀'], path: '/excel' },
  { includes: ['일간', '보고서'], path: '/report/daily' },
  { includes: ['주간', '보고서'], path: '/report/weekly' },
  { includes: ['월간', '보고서'], path: '/report/monthly' },
  { includes: ['년간', '보고서'], path: '/report/yearly' },
  { includes: ['연간', '보고서'], path: '/report/yearly' },
  { includes: ['마스터'], path: '/admin/master' },
  { includes: ['코드'], path: '/admin/code' },
  { includes: ['사용자'], path: '/admin/user' },
  { includes: ['권한'], path: '/admin/role' },
  { includes: ['팝업'], path: '/system/popups' }
];

function hasNestedChildren(menus: AuthSessionMenu[]) {
  return menus.some((menu) => (menu.children?.length ?? 0) > 0);
}

function buildMenuTree(menus: AuthSessionMenu[]) {
  if (hasNestedChildren(menus)) {
    return menus;
  }

  const menuMap = new Map<string, AuthSessionMenu>();
  const rootMenus: AuthSessionMenu[] = [];

  menus.forEach((menu) => {
    menuMap.set(menu.sysMenuId, { ...menu, children: [] });
  });

  menuMap.forEach((menu) => {
    if (menu.sysUprmenuId && menuMap.has(menu.sysUprmenuId)) {
      menuMap.get(menu.sysUprmenuId)?.children?.push(menu);
      return;
    }

    rootMenus.push(menu);
  });

  return rootMenus.map((menu) => ({
    ...menu,
    children: menu.children && menu.children.length > 0 ? sortMenus(menu.children) : undefined
  }));
}

function sortMenus(menus: AuthSessionMenu[]) {
  return [...menus].sort((a, b) => a.sortOrd - b.sortOrd || a.menuNm.localeCompare(b.menuNm, 'ko'));
}

function getNormalizedMenuPath(menu: AuthSessionMenu) {
  const rawPath = menu.menuUrl?.trim();
  return rawPath ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) : '';
}

function resolveMenuPath(menu: AuthSessionMenu) {
  const normalizedPath = getNormalizedMenuPath(menu);
  const aliasPaths = apiRouteAliases[normalizedPath];

  if (knownNavigationPaths.has(normalizedPath)) {
    return { path: normalizedPath, matchPaths: aliasPaths };
  }

  if (aliasPaths) {
    return {
      path: normalizedPath,
      matchPaths: aliasPaths
    };
  }

  const routeRule = labelRouteRules.find((rule) => rule.includes.every((keyword) => menu.menuNm.includes(keyword)));
  return routeRule ? { path: routeRule.path } : undefined;
}

function createMenuKey(prefix: string, value: string) {
  return `${prefix}-${value}`.replace(/[^a-zA-Z0-9가-힣]/g, '-').replace(/-+/g, '-');
}

function getGroupIcon(label: string, firstPath?: string) {
  if (label.includes('이력') || label.includes('통계') || firstPath?.startsWith('/history') || firstPath?.startsWith('/analysis')) {
    return commonIconSources.operationHistory;
  }

  if (label.includes('리포트') || label.includes('보고서') || firstPath?.startsWith('/reports') || firstPath?.startsWith('/report')) {
    return commonIconSources.operationReport;
  }

  if (label.includes('엑셀') || firstPath?.startsWith('/excel')) {
    return commonIconSources.excelSave;
  }

  if (label.includes('관리') || label.includes('마스터') || firstPath?.startsWith('/admin') || firstPath?.startsWith('/master')) {
    return commonIconSources.adminManagement;
  }

  if (label.includes('샘플') || firstPath?.startsWith('/system')) {
    return commonIconSources.systemSamples;
  }

  return commonIconSources.operationStatus;
}

function getItemIcon(label: string, path: string) {
  if (path === '/history/grid' || path.includes('/analysis/base/')) return commonIconSources.gridHistory;
  if (path === '/history/ess' || path.includes('/analysis/assist')) return commonIconSources.supportHistory;
  if (path === '/history/pcs' || path.includes('/analysis/standby')) return commonIconSources.pcsHistory;
  if (path === '/history/battery') return commonIconSources.chargeDischarge;
  if (path === '/history/diesel1' || path === '/history/diesel2') return commonIconSources.supportHistory;
  if (path === '/history/ac') return commonIconSources.acStatus;
  if (path === '/history/power-consumption' || path.includes('/analysis/dispatch')) return commonIconSources.powerHistory;
  if (path.includes('plant-operation') || label.includes('발전소')) return commonIconSources.plantOperation;
  if (path.includes('ac-status') || label.includes('공조기')) return commonIconSources.acStatus;
  if (path.includes('base-generation') || path.includes('/monitoring/base') || label.includes('기저') || label.includes('GRID')) return commonIconSources.baseGeneration;
  if (path.includes('support-generation') || path.includes('/monitoring/assist') || label.includes('보조') || label.includes('ESS') || label.includes('디젤')) {
    return commonIconSources.supportGeneration;
  }
  if (path.includes('charge-discharge') || path.includes('/monitoring/standby') || label.includes('예비') || label.includes('충방전') || label.includes('PCS') || label.includes('배터리')) {
    return commonIconSources.chargeDischarge;
  }
  if (path.includes('power-consumption') || path.includes('/monitoring/dispatch') || label.includes('전력')) return commonIconSources.powerConsumption;
  if (path.includes('reports') || path.startsWith('/report')) return commonIconSources.operationDetail;
  if (path.includes('excel')) return commonIconSources.excelSave;
  if (path.includes('master')) return commonIconSources.masterManagement;
  if (path.includes('code')) return commonIconSources.codeManagement;
  if (path.includes('user')) return commonIconSources.userManagement;
  if (path.includes('role')) return commonIconSources.roleManagement;
  if (path.includes('popups')) return commonIconSources.popupSamples;

  return commonIconSources.operationStatus;
}

function createDashboardSubmenuItems(): NavigationItem[] {
  return [
    {
      label: '대시보드',
      path: '/dashboard/individual',
      matchPaths: ['/dashboard/plant-operation-status', '/monitoring/dashboard', '/monitoring/dashboard/plant'],
      iconSrc: commonIconSources.plantOperation.src,
      iconAlt: commonIconSources.plantOperation.alt,
      source: 'api'
    },
    {
      label: '대시보드 (통합)',
      path: '/dashboard/integrated',
      matchPaths: ['/monitoring/dashboard/total'],
      iconSrc: commonIconSources.plantOperation.src,
      iconAlt: commonIconSources.plantOperation.alt,
      source: 'api'
    }
  ];
}

function isDashboardNavigationItem(item: NavigationItem) {
  const paths = [item.path, ...(item.matchPaths ?? [])];

  return paths.some((path) => path === '/dashboard/individual' || path === '/dashboard/integrated' || path.startsWith('/monitoring/dashboard'));
}

function isDashboardNavigationGroup(menu: AuthSessionMenu, items: NavigationItem[]) {
  return menu.menuNm.includes('대시보드') || items.some((item) => isDashboardNavigationItem(item));
}

function getNavigationItemLabel(menu: AuthSessionMenu, path: string) {
  if (path === '/dashboard/individual') {
    return '대시보드';
  }

  if (path === '/dashboard/integrated') {
    return '대시보드 (통합)';
  }

  return menu.menuNm;
}

function toNavigationItem(menu: AuthSessionMenu): NavigationItem | null {
  const resolvedPath = resolveMenuPath(menu);

  if (!resolvedPath) {
    return null;
  }

  const { path, matchPaths } = resolvedPath;
  const icon = getItemIcon(menu.menuNm, path);
  return {
    label: getNavigationItemLabel(menu, path),
    path,
    matchPaths,
    iconSrc: icon.src,
    iconAlt: icon.alt,
    source: 'api'
  };
}

function toNavigationGroup(menu: AuthSessionMenu): NavigationGroup | null {
  const items = sortMenus(menu.children ?? [])
    .map((childMenu) => toNavigationItem(childMenu))
    .filter((item): item is NavigationItem => Boolean(item));

  const ownItem = toNavigationItem(menu);
  let groupItems = items.length > 0 ? items : ownItem ? [ownItem] : [];
  const isDashboardGroup = isDashboardNavigationGroup(menu, groupItems);

  if (isDashboardGroup) {
    groupItems = createDashboardSubmenuItems();
  }

  if (groupItems.length === 0) {
    return null;
  }

  const icon = getGroupIcon(menu.menuNm, groupItems[0]?.path);
  return {
    key: createMenuKey('api', menu.sysMenuId || menu.menuNm),
    label: isDashboardGroup ? '대시보드' : menu.menuNm,
    iconSrc: icon.src,
    iconAlt: icon.alt,
    items: groupItems,
    source: 'api'
  };
}

function removeDuplicateSampleItems(baseGroups: NavigationGroup[]) {
  const activePaths = new Set(baseGroups.flatMap((group) => group.items.flatMap((item) => [item.path, ...(item.matchPaths ?? [])])));

  return sampleNavigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !activePaths.has(item.path))
    }))
    .filter((group) => group.items.length > 0);
}

/*
 * 필요: /me/menus 응답을 사이드바 렌더링 데이터로 변환한다.
 * 연결: AuthSessionProvider, Sidebar, navigationGroups.
 * 설명: API 메뉴를 우선 사용하고, API 메뉴에 아직 없는 샘플 화면만 별도 그룹으로 보강한다.
 * 수정: 백엔드 메뉴 URL이나 명칭이 확정되면 apiRouteAliases와 labelRouteRules만 조정한다.
 */
export function getNavigationGroups(sessionMenus: AuthSessionMenu[]) {
  const apiGroups = sortMenus(buildMenuTree(sessionMenus))
    .map((menu) => toNavigationGroup(menu))
    .filter((group): group is NavigationGroup => Boolean(group));
  const baseGroups = apiGroups.length > 0 ? apiGroups : productionNavigationGroups;
  const sampleGroups = removeDuplicateSampleItems(baseGroups);

  return [...baseGroups, ...sampleGroups];
}
