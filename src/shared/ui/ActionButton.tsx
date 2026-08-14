import type { ButtonHTMLAttributes } from 'react';
import './ActionButton.css';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

/*
 * 필요: 조회, 로그인, 저장처럼 반복되는 버튼의 variant와 size 기준을 맞춘다.
 * 연결: LoginForm, SearchConditionBar, ExcelSaveButton.
 * 설명: 기능별 동작은 호출부가 넘기고 이 컴포넌트는 버튼 클래스만 정리한다.
 * 수정: 버튼 색상과 크기 기준은 ActionButton.css에서 조정한다.
 */
export function ActionButton({
  variant = 'outline',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}: ActionButtonProps) {
  return <button type={type} className={`button button--${variant} button--${size} ${className}`.trim()} {...props} />;
}
