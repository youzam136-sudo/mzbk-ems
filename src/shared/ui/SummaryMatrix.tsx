import type { CSSProperties, ReactNode } from 'react';
import './SummaryMatrix.css';

export type SummaryMatrixMetric = {
  label: string;
  values: ReactNode[];
};

type SummaryMatrixProps = {
  columns: string[];
  metrics: SummaryMatrixMetric[];
  ariaLabel: string;
  minWidth?: number | string;
  className?: string;
};

/*
 * 필요: 발전 현황 상단 요약표처럼 세로선 없는 헤더/지표 구조를 공통으로 렌더링한다.
 * 연결: 기저발전, 보조발전 상단 요약 섹션.
 * 설명: 실제 값은 feature API adapter가 관리하고, 이 컴포넌트는 표시 구조와 가로 스크롤만 담당한다.
 * 수정: 헤더 pill, 행 구분선, 반응형 스크롤 기준은 SummaryMatrix.css에서 조정한다.
 */
export function SummaryMatrix({ columns, metrics, ariaLabel, minWidth = 780, className = '' }: SummaryMatrixProps) {
  const matrixMinWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth;
  const matrixStyle = {
    minWidth: matrixMinWidth,
    '--summary-column-count': columns.length
  } as CSSProperties;

  return (
    <div className={`summary-matrix-wrap ${className}`.trim()}>
      <div className="summary-matrix" role="table" aria-label={ariaLabel} style={matrixStyle}>
        <div className="summary-matrix__header" role="row">
          <span role="columnheader" aria-label="구분" />
          {columns.map((column) => (
            <span key={column} role="columnheader">
              {column}
            </span>
          ))}
        </div>

        <div className="summary-matrix__body">
          {metrics.map((metric) => (
            <div key={metric.label} className="summary-matrix__row" role="row">
              <span className="summary-matrix__label" role="rowheader">
                {metric.label}
              </span>
              {metric.values.map((value, index) => (
                <span key={`${metric.label}-${index}`} className="summary-matrix__value" role="cell">
                  {value}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
