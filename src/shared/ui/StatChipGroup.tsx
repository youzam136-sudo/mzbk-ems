import './StatChipGroup.css';

export type StatChipItem = {
  label: string;
  value: string;
};

type StatChipGroupProps = {
  ariaLabel: string;
  items: StatChipItem[];
  className?: string;
};

/*
 * 필요: MAX/MIN/AVG처럼 몇 개의 요약 수치를 좁은 표 대신 보기 편한 카드 형태로 보여준다.
 * 연결: 각 이력 화면의 장비별 상세 패널(인버터/디젤/BANK 선택 시 요약).
 * 설명: 라벨은 흐리게, 값은 크고 진하게 표시해 한눈에 들어오도록 한다.
 * 수정: 칩 색/여백은 StatChipGroup.css에서 조정한다.
 */
export function StatChipGroup({ ariaLabel, items, className = '' }: StatChipGroupProps) {
  return (
    <dl className={`stat-chip-group ${className}`.trim()} aria-label={ariaLabel}>
      {items.map((item) => (
        <div className="stat-chip-group__item" key={item.label}>
          <dt className="stat-chip-group__label">{item.label}</dt>
          <dd className="stat-chip-group__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
