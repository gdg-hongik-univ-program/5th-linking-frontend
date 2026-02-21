import { useState, useEffect } from 'react';
import { searchItems } from '../api/searchApi';
import { useDebounce } from './useDebounce';

export const useSearch = (initialFilter = 'recent') => {
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. keyword가 바뀔 때마다 300ms 딜레이를 주는 디바운스 값
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedKeyword.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchItems({ keyword: debouncedKeyword, filter });
        setResults(data.items.content);
      } finally {
        setIsLoading(false);
      }
    };

    // 2. 디바운스된 값이 확정되었을 때만 API 호출
    fetchResults();
  }, [debouncedKeyword, filter]);

  return { keyword, setKeyword, filter, setFilter, results, isLoading };
};
