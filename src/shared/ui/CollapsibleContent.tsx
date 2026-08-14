import { useEffect, useState, type ReactNode } from 'react';
import './CollapsibleContent.css';

type CollapsibleContentProps = {
  open: boolean;
  children: ReactNode;
  className?: string;
};

/*
 * 필요: 상세 표 영역이 뚝 끊기지 않고 공통 애니메이션으로 열고 닫히게 한다.
 * 연결: DetailToggleBar를 쓰는 dashboard table section.
 * 설명: 닫힐 때는 전환이 끝난 뒤 DOM에서 제거해 접힌 영역의 포커스 문제를 줄인다.
 * 수정: 애니메이션 속도와 여백은 CollapsibleContent.css에서 조정한다.
 */
export function CollapsibleContent({ open, children, className = '' }: CollapsibleContentProps) {
  const [rendered, setRendered] = useState(open);

  useEffect(() => {
    if (open) setRendered(true);
  }, [open]);

  if (!rendered) return null;

  return (
    <div
      className={`collapsible-content ${open ? 'is-open' : ''} ${className}`.trim()}
      aria-hidden={!open}
      onTransitionEnd={() => {
        if (!open) setRendered(false);
      }}
    >
      <div className="collapsible-content__inner">{children}</div>
    </div>
  );
}
