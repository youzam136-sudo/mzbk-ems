import { useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthSession } from '../../features/auth/session/AuthSessionProvider';
import { commonImageSources } from '../assets/images/commonImageSources';
import './Topbar.css';

type TopbarProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

function getPageName(pathname: string) {
  const map: Record<string, string> = {
    '/dashboard/individual': '대시보드',
    '/dashboard/integrated': '대시보드',
    '/dashboard/plant-operation-status': '운영 현황 / 발전소 운영현황',
    '/dashboard/base-generation': '운영 현황 / 기저발전',
    '/dashboard/support-generation': '운영 현황 / 보조발전',
    '/dashboard/charge-discharge': '운영 현황 / 충방전 현황',
    '/dashboard/power-consumption-status': '운영 현황 / 전력 소비 현황',
    '/history/grid-base-generation-history': '이력 / GRID 기저발전 이력',
    '/history/support-generation-history': '이력 / 보조발전 이력',
    '/history/pcs-charge-discharge-history': '이력 / PCS 충방전 이력',
    '/history/power-consumption-history': '이력 / 전력소비 이력',
    '/reports/operation': '운영 리포트',
    '/admin/master': '관리자 화면 / 마스터 관리',
    '/admin/code': '관리자 화면 / 코드 관리',
    '/admin/user': '관리자 화면 / 사용자 관리',
    '/admin/role': '관리자 화면 / 권한 관리',
    '/system/popups': '시스템 샘플 / 팝업 샘플',
    '/search': '검색 결과'
  };

  return map[pathname] ?? 'EMS';
}

function MenuIcon({ openShape }: { openShape: boolean }) {
  if (openShape) {
    return (
      <svg className="topbar__menu-icon is-open-shape" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M4 5H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 10H12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M4 15H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12.5 6L16.5 10L12.5 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg
      className="topbar__menu-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path className="topbar__menu-line topbar__menu-line--top" d="M4 5H14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path className="topbar__menu-line topbar__menu-line--middle" d="M4 10H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path className="topbar__menu-line topbar__menu-line--bottom" d="M4 15H16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M13.2 13.2L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4.25 4.25L11.75 11.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11.75 4.25L4.25 11.75" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function Topbar({ sidebarCollapsed, onToggleSidebar }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuthSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSearchToggle = () => {
    setSearchOpen((current) => {
      const next = !current;
      if (!current) {
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return next;
    });
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchValue('');
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchOpen) {
      setSearchOpen(true);
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
      return;
    }

    const keyword = searchValue.trim();
    if (!keyword) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          type="button"
          className={`topbar__menu-button ${sidebarCollapsed ? 'is-collapsed' : ''}`.trim()}
          aria-label={sidebarCollapsed ? '사이드바 열기' : '사이드바 접기'}
          aria-pressed={!sidebarCollapsed}
          onClick={onToggleSidebar}
        >
          {/* 접힌 상태에서는 버튼이 다음 동작인 열기를 보여주도록 방향을 바꾼다. */}
          <MenuIcon openShape={sidebarCollapsed} />
        </button>
      </div>

      <div className="topbar__right">
        <form className={`topbar__search ${searchOpen ? 'is-open' : ''}`.trim()} role="search" onSubmit={handleSearchSubmit}>
          <input
            ref={searchInputRef}
            className="topbar__search-input"
            type="search"
            placeholder="검색어 입력"
            aria-label={`${getPageName(location.pathname)} 검색어`}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
          {searchOpen && (
            <button
              type="button"
              className="topbar__search-close"
              aria-label="검색창 접기"
              onClick={handleSearchClose}
            >
              <CloseIcon />
            </button>
          )}
          <button
            type={searchOpen ? 'submit' : 'button'}
            className="topbar__search-button"
            aria-label={`${getPageName(location.pathname)} 검색`}
            aria-expanded={searchOpen}
            onClick={() => {
              if (searchOpen) return;
              handleSearchToggle();
            }}
          >
            <SearchIcon />
          </button>
        </form>

        <button
          type="button"
          className="topbar__user-button"
          aria-label="사용자 메뉴 열기"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((current) => !current)}
        >
          <span className="topbar__profile-name">{session?.user.name ?? 'Guest'}</span>
          <img src={commonImageSources.topbarProfile.src} alt={commonImageSources.topbarProfile.alt} className="topbar__avatar" />
        </button>

        {profileOpen && (
          <div className="topbar__profile-menu" role="menu" aria-label="사용자 메뉴">
            <div className="topbar__profile-summary">
              <img src={commonImageSources.topbarProfile.src} alt="" className="topbar__profile-menu-avatar" />
              <div>
                <strong>{session?.user.name ?? 'Guest'}</strong>
                <span>관리자 계정</span>
              </div>
            </div>
            <button
              type="button"
              className="topbar__profile-menu-item"
              role="menuitem"
              onClick={() => {
                setProfileOpen(false);
                navigate('/system/users');
              }}
            >
              관리자 화면
            </button>
            <button type="button" className="topbar__profile-menu-item is-danger" role="menuitem" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
