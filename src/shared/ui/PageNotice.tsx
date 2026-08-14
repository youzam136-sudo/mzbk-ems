import './PageNotice.css';

type PageNoticeProps = {
  children: string;
};

export function PageNotice({ children }: PageNoticeProps) {
  return <div className="page-notice">{children}</div>;
}
