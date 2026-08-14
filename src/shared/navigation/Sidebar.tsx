import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthSession } from '../../features/auth/session/AuthSessionProvider';
import { commonLogoSources } from '../assets/logos/commonLogoSources';
import { getNavigationGroups } from './navigationMenuAdapter';
import './Sidebar.css';

type SidebarProps = {
  collapsed: boolean;
  onRequestExpand?: () => void;
  onRequestClose?: () => void;
  onNavigate?: () => void;
};

function SidebarChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`sidebar__caret ${open ? 'is-open' : ''}`.trim()}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidebarCloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 5L13 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 5L5 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function getMatchPaths(item: { path: string; matchPaths?: string[] }) {
  return [item.path, ...(item.matchPaths ?? [])];
}

export function Sidebar({ collapsed, onRequestExpand, onRequestClose, onNavigate }: SidebarProps) {
  const location = useLocation();
  const { session } = useAuthSession();

  // API 권한 메뉴를 우선 사용하고, 샘플/확인용 메뉴는 adapter에서 별도 그룹으로 붙인다.
  const navigationGroups = useMemo(() => getNavigationGroups(session?.menus ?? []), [session?.menus]);

  // 현재 경로를 기준으로 기본 펼침 상태를 맞춘다.
  const defaultOpenState = useMemo(() => {
    return navigationGroups.reduce<Record<string, boolean>>((acc, group) => {
      acc[group.key] = group.items.some((item) => getMatchPaths(item).some((path) => location.pathname.startsWith(path)));
      return acc;
    }, {});
  }, [location.pathname, navigationGroups]);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(defaultOpenState);

  useEffect(() => {
    setOpenMap((current) => ({ ...current, ...defaultOpenState }));
  }, [defaultOpenState]);

  const toggleGroup = (key: string) => {
    setOpenMap((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleGroupButtonClick = (key: string) => {
    if (collapsed) {
      onRequestExpand?.();
      setOpenMap((current) => ({ ...current, [key]: true }));
      return;
    }

    toggleGroup(key);
  };

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`.trim()}>
      <div className="sidebar__top">
        <NavLink to="/dashboard/individual" className="sidebar__brand" aria-label="대시보드로 이동" onClick={onNavigate}>
          <img src={commonLogoSources.sidebarBrand.src} alt={commonLogoSources.sidebarBrand.alt} className="sidebar__logo" />
        </NavLink>

        <button type="button" className="sidebar__close-button" aria-label="모바일 메뉴 닫기" onClick={onRequestClose}>
          <SidebarCloseIcon />
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="주 메뉴">
        {navigationGroups.map((group) => {
          const groupCurrent = group.items.some((item) => getMatchPaths(item).some((path) => location.pathname.startsWith(path)));

          return (
            <div key={group.key} className={`sidebar__group ${openMap[group.key] ? 'is-open' : ''} ${groupCurrent ? 'is-current' : ''}`.trim()}>
              <button
                type="button"
                className="sidebar__group-button"
                aria-label={collapsed ? `${group.label} 메뉴 펼치기` : undefined}
                onClick={() => handleGroupButtonClick(group.key)}
              >
                <span className="sidebar__group-label">
                  <img src={group.iconSrc} alt={group.iconAlt} className="sidebar__group-icon" />
                  {!collapsed && <span>{group.label}</span>}
                </span>
                {!collapsed && <SidebarChevron open={openMap[group.key]} />}
              </button>

              <div className={`sidebar__items ${openMap[group.key] ? 'is-open' : ''}`.trim()}>
                {/* 서브영역은 확정 시안 기준으로 아이콘 없이 텍스트만 노출한다. */}
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={() =>
                      `sidebar__item ${getMatchPaths(item).some((path) => location.pathname.startsWith(path)) ? 'is-active' : ''}`.trim()
                    }
                    onClick={onNavigate}
                  >
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <footer className="sidebar__footer">MG EMS System</footer>
    </aside>
  );
}
