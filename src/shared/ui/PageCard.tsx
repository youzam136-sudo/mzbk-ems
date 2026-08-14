import type { ReactNode } from 'react';
import './PageCard.css';

type PageCardProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/*
 * 필요: 파란 테두리 패널, 제목, 우측 액션 영역을 화면마다 같은 구조로 제공한다.
 * 연결: dashboard/history feature section과 ExcelSaveButton 같은 actions.
 * 설명: 화면별 세부 배치는 section CSS에 두고 카드 골격만 공통으로 유지한다.
 * 수정: 카드 공통 여백과 보더는 PageCard.css에서 조정한다.
 */
export function PageCard({ title, subtitle, actions, children, className = '', ariaLabel }: PageCardProps) {
  return (
    <section className={`card ${className}`.trim()} aria-label={ariaLabel}>
      {(title || subtitle || actions) && (
        <header className="card__header">
          <div>
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>

          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}

      <div className="card__body">{children}</div>
    </section>
  );
}
