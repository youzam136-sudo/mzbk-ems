import type { ReactNode } from 'react';
import './AuthLayout.css';

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return <main className="auth-layout">{children}</main>;
}
