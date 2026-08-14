import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../navigation/Sidebar';
import { Topbar } from '../navigation/Topbar';
import './DashboardLayout.css';
import { getPageLayoutConfig } from './pageLayoutConfig';

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const pageLayoutConfig = getPageLayoutConfig(location.pathname);

  // 모바일은 처음부터 닫힌 상태로 시작해 메뉴 버튼이 실제 온오프 역할을 하게 한다.
  const [isMobileSidebar, setIsMobileSidebar] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false;
    return isMobile || pageLayoutConfig.sidebarOnEnter === 'collapsed';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const syncSidebarMode = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobileSidebar(event.matches);
      if (event.matches) {
        setSidebarCollapsed(true);
        return;
      }

      if (getPageLayoutConfig(window.location.pathname).sidebarOnEnter === 'collapsed') {
        setSidebarCollapsed(true);
      }
    };

    syncSidebarMode(mediaQuery);
    mediaQuery.addEventListener('change', syncSidebarMode);

    return () => {
      mediaQuery.removeEventListener('change', syncSidebarMode);
    };
  }, []);

  useEffect(() => {
    if (pageLayoutConfig.sidebarOnEnter === 'collapsed') {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, pageLayoutConfig.sidebarOnEnter]);

  const closeMobileSidebar = () => {
    if (isMobileSidebar) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="dashboard-layout">
      {isMobileSidebar && !sidebarCollapsed && (
        <button type="button" className="dashboard-layout__scrim" aria-label="모바일 메뉴 닫기" onClick={closeMobileSidebar} />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onRequestExpand={() => setSidebarCollapsed(false)}
        onRequestClose={closeMobileSidebar}
        onNavigate={closeMobileSidebar}
      />

      <div className="dashboard-layout__main">
        <Topbar sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed((current) => !current)} />
        <main className="dashboard-layout__content">{children}</main>
      </div>
    </div>
  );
}
