import type { ButtonHTMLAttributes } from 'react';
import './DetailToggleBar.css';

type DetailToggleBarProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  expanded: boolean;
};

/*
 * 필요: 인버터, Diesel, BATTERY 상세 내역 보기 토글 UI를 공통화한다.
 * 연결: 각 feature table section의 expanded state.
 * 설명: 상태는 화면 section이 갖고 이 컴포넌트는 표시와 aria-expanded만 담당한다.
 * 수정: 라벨은 호출부에서 바꾸고 화살표/간격은 DetailToggleBar.css에서 조정한다.
 */
export function DetailToggleBar({ label, expanded, className = '', type = 'button', ...props }: DetailToggleBarProps) {
  return (
    <button
      type={type}
      className={`detail-toggle-bar ${expanded ? 'is-open' : ''} ${className}`.trim()}
      aria-expanded={expanded}
      {...props}
    >
      <span>{label}</span>
      <span className="detail-toggle-bar__caret" aria-hidden="true">
        ▾
      </span>
    </button>
  );
}
