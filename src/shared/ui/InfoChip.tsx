import './InfoChip.css';

type InfoChipProps = {
  label: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
};

export function InfoChip({ label, tone = 'default' }: InfoChipProps) {
  return <span className={`chip chip--${tone}`}>{label}</span>;
}
