import './MetricTabs.css';

type MetricTabsProps<T extends string> = {
  value: T;
  options: readonly T[];
  onChange: (nextValue: T) => void;
  ariaLabel: string;
};

/*
 * 필요: Max/Min/AVG 같은 이력 지표 탭을 공통으로 렌더링한다.
 * 연결: history feature의 지표 constants와 result section state.
 * 설명: 화면별 탭 목록만 props로 받고 화면명을 variant로 만들지 않는다.
 * 수정: 탭 라벨은 feature constants, 탭 모양은 MetricTabs.css에서 조정한다.
 */
export function MetricTabs<T extends string>({ value, options, onChange, ariaLabel }: MetricTabsProps<T>) {
  return (
    <div className="metric-tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = option === value;

        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`metric-tabs__item ${selected ? 'is-active' : ''}`.trim()}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
