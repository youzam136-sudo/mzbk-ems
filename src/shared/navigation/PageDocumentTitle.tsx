import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigationPageTitle } from './useNavigationPageTitle';

const SITE_TITLE = 'MZBK EMS';

type PageDocumentTitleProps = {
  title: string;
  preferMenuTitle?: boolean;
};

/*
 * 필요: 브라우저 탭 제목에 현재 페이지명과 사이트명을 함께 표시한다.
 * 연결: AppRouter, useNavigationPageTitle, 백엔드 메뉴명.
 * 설명: 최종 형식은 "페이지명 | 사이트명"으로 고정한다.
 */
export function PageDocumentTitle({ title, preferMenuTitle = true }: PageDocumentTitleProps) {
  const location = useLocation();
  const displayTitle = useNavigationPageTitle(title, preferMenuTitle);

  useEffect(() => {
    const pageTitle = displayTitle.trim() || title;
    document.title = `${pageTitle} | ${SITE_TITLE}`;
  }, [displayTitle, location.pathname, title]);

  return null;
}
