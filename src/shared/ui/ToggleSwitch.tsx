import type { ButtonHTMLAttributes } from 'react';
import './ToggleSwitch.css';

type ToggleSwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  onLabel?: string;
  offLabel?: string;
};

export function ToggleSwitch({
  checked,
  onChange,
  onLabel = 'ON',
  offLabel = 'OFF',
  className = '',
  type = 'button',
  ...props
}: ToggleSwitchProps) {
  return (
    <button
      type={type}
      className={`toggle ${checked ? 'is-checked' : ''} ${className}`.trim()}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      {...props}
    >
      <span className="toggle__thumb" />
      <span className="toggle__label">{checked ? onLabel : offLabel}</span>
    </button>
  );
}
