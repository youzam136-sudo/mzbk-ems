import { useEffect, useState } from 'react';

export function useAutoRefresh(intervalMs = 60_000) {
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setRefreshedAt(new Date());
    }, intervalMs);

    return () => {
      window.clearInterval(timerId);
    };
  }, [intervalMs]);

  return refreshedAt;
}
