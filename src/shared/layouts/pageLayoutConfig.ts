type SidebarOnEnter = 'preserve' | 'collapsed';

type PageLayoutRule = {
  path: string;
  match: 'exact' | 'prefix';
  sidebarOnEnter: SidebarOnEnter;
};

type PageLayoutConfig = {
  sidebarOnEnter: SidebarOnEnter;
};

const defaultPageLayoutConfig: PageLayoutConfig = {
  sidebarOnEnter: 'preserve'
};

const pageLayoutRules: PageLayoutRule[] = [
  {
    path: '/dashboard/plant-operation-status',
    match: 'exact',
    sidebarOnEnter: 'collapsed'
  },
  {
    path: '/dashboard/individual',
    match: 'exact',
    sidebarOnEnter: 'collapsed'
  },
  {
    path: '/dashboard/integrated',
    match: 'exact',
    sidebarOnEnter: 'collapsed'
  },
  {
    path: '/monitoring/dashboard',
    match: 'prefix',
    sidebarOnEnter: 'collapsed'
  }
];

function matchesPageLayoutRule(pathname: string, rule: PageLayoutRule) {
  if (rule.match === 'exact') {
    return pathname === rule.path;
  }

  return pathname === rule.path || pathname.startsWith(`${rule.path}/`);
}

export function getPageLayoutConfig(pathname: string): PageLayoutConfig {
  const matchedRule = pageLayoutRules.find((rule) => matchesPageLayoutRule(pathname, rule));

  return matchedRule ? { sidebarOnEnter: matchedRule.sidebarOnEnter } : defaultPageLayoutConfig;
}
