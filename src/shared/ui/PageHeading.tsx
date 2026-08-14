import type { ReactNode } from 'react';
import { useNavigationPageTitle } from '../navigation/useNavigationPageTitle';
import './PageHeading.css';

type PageHeadingProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  preferMenuTitle?: boolean;
};

/*
 * 필요: 화면 제목과 우측 검색/액션 영역을 공통 위치에 배치한다.
 * 연결: 각 page 컴포넌트와 history 검색 section.
 * 설명: 설명 문구는 납품 화면에 필요할 때만 props로 받으며 기본은 제목만 출력한다.
 * 수정: 제목 크기와 actions 정렬은 PageHeading.css에서 조정한다.
 */
export function PageHeading({ title, description, actions, preferMenuTitle = true }: PageHeadingProps) {
  const displayTitle = useNavigationPageTitle(title, preferMenuTitle);

  return (
    <div className="page-heading">
      <div>
        <h1 className="page-heading__title">{displayTitle}</h1>
        {description && <p className="page-heading__description">{description}</p>}
      </div>

      {actions && <div className="page-heading__actions">{actions}</div>}
    </div>
  );
}
