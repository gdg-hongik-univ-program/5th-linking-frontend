export const sortData = (data, sortType, sortOrder) => {
  if (!data || data.length === 0) return [];

  return [...data].sort((a, b) => {
    // 이름 정렬
    if (sortType === 'name') {
      const getName = (entry) =>
        entry.title || entry.folderName || entry.itemName || '';

      const rawA = getName(a);
      const rawB = getName(b);

      if (!rawA && !rawB) return 0;
      if (!rawA) return 1;
      if (!rawB) return -1;

      const strA = rawA.toString().normalize('NFC').trim();
      const strB = rawB.toString().normalize('NFC').trim();

      const result = strA.localeCompare(strB, 'ko-KR', {
        numeric: true,
        sensitivity: 'base',
      });
      // 가나다 순
      return sortOrder === 'asc' ? result : -result;
    }

    // 날짜 정렬 (생성일, 디데이)
    if (sortType === 'createdAt' || sortType === 'dDay') {
      const valueA = sortType === 'createdAt' ? a.createdAt : a.deadline;
      const valueB = sortType === 'createdAt' ? b.createdAt : b.deadline;

      const getTime = (val) => {
        if (!val) return null;
        const date = new Date(val);
        const time = date.getTime();
        return isNaN(time) ? null : time;
      };

      const timeA = getTime(valueA);
      const timeB = getTime(valueB);

      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1;
      if (timeB === null) return -1;
      // 오래된 순, 임박한 순
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }

    return 0;
  });
};
