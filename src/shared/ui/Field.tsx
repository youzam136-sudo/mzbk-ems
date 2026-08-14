import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react';
import './Field.css';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  requiredMark?: boolean;
};

function FieldLabel({ label, requiredMark }: { label: string; requiredMark: boolean }) {
  const normalizedLabel = label.replace(/\(\*\)\s*$/, '');
  const hasInlineRequiredMark = normalizedLabel !== label;
  const shouldShowRequiredMark = requiredMark || hasInlineRequiredMark;

  return (
    <span className="field__label">
      {normalizedLabel}
      {shouldShowRequiredMark && <span className="field__required" aria-hidden="true">(*)</span>}
    </span>
  );
}

export function TextField({ label, requiredMark = false, className = '', required, ...props }: TextFieldProps) {
  return (
    <label className="field">
      {label && <FieldLabel label={label} requiredMark={requiredMark || Boolean(required)} />}
      <input className={`input ${className}`.trim()} required={required} {...props} />
    </label>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  requiredMark?: boolean;
  options: string[];
};

export function SelectField({ label, requiredMark = false, options, className = '', required, ...props }: SelectFieldProps) {
  return (
    <label className="field">
      {label && <FieldLabel label={label} requiredMark={requiredMark || Boolean(required)} />}
      <select className={`select ${className}`.trim()} required={required} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
