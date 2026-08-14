import { useEffect, useState } from 'react';

function formatClock(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

export function useClock() {
  const [value, setValue] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setValue(formatClock(new Date()));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  return value;
}
