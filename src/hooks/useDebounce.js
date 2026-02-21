import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay(ms) 후에 값을 업데이트
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 값이 바뀌어 다시 호출되면 이전 타이머를 취소 (핵심 로직)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
