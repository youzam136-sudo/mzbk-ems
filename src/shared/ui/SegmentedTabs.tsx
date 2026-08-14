import './SegmentedTabs.css';

type SegmentedTabsProps<T extends string> = {
  value: T;
  options: readonly T[];
  onChange: (nextValue: T) => void;
};

export function SegmentedTabs<T extends string>({ value, options, onChange }: SegmentedTabsProps<T>) {
  return (
    <div className="segmented" role="tablist" aria-label="리포트 조회 단위">
      {options.map((option) => {
        const selected = value === option;

        return (
          <button
            key={option}
            type="button"
            className={`segmented__item ${selected ? 'is-active' : ''}`.trim()}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
