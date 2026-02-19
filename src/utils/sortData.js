// 폴더 여부 확인
const isFolderEntry = (entry) => {
  return !entry.itemId;
};

// 이름 추출
const getName = (entry) => {
  return entry.title || entry.folderName || '';
};

// 날짜 변환
const getTime = (val) => {
  if (!val) return null;
  const date = new Date(val);
  const time = date.getTime();
  return isNaN(time) ? null : time;
};

// 이름 비교
const compareByKoreanName = (a, b) => {
  const rawA = getName(a);
  const rawB = getName(b);

  if (!rawA && !rawB) return 0;
  if (!rawA) return 1;
  if (!rawB) return -1;

  const strA = rawA.toString().normalize('NFC').trim();
  const strB = rawB.toString().normalize('NFC').trim();

  return strA.localeCompare(strB, 'ko-KR', {
    numeric: true,
    sensitivity: 'base',
  });
};

export const sortData = (data, sortType, sortOrder) => {
  if (!data || data.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  return [...data].sort((a, b) => {
    // 이름 기준 정렬
    if (sortType === 'name') {
      const result = compareByKoreanName(a, b);
      return sortOrder === 'asc' ? result : -result;
    }

    // 디데이 기준 정렬
    if (sortType === 'dDay') {
      const isFolderA = isFolderEntry(a);
      const isFolderB = isFolderEntry(b);

      // 폴더끼리는 이름 정렬
      if (isFolderA && isFolderB) return compareByKoreanName(a, b);
      // 폴더는 일반 아이템보다 항상 뒤로
      if (isFolderA) return 1;
      if (isFolderB) return -1;

      const timeA = getTime(a.deadline);
      const timeB = getTime(b.deadline);

      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1;
      if (timeB === null) return -1;

      if (sortOrder === 'asc') {
        const isPastA = timeA < todayTime;
        const isPastB = timeB < todayTime;
        if (isPastA === isPastB) return timeA - timeB;
        return isPastA ? 1 : -1;
      }
      return timeB - timeA;
    }

    // 생성일 기준 정렬
    if (sortType === 'createdAt') {
      const timeA = getTime(a.createdAt);
      const timeB = getTime(b.createdAt);

      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1;
      if (timeB === null) return -1;

      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }

    // 삭제일 기준 정렬
    if (sortType === 'deletedAt') {
      const timeA = getTime(a.deletedAt);
      const timeB = getTime(b.deletedAt);

      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1;
      if (timeB === null) return -1;

      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }

    // 방치된 기간 기준 정렬
    if (sortType === 'updatedAt') {
      const timeA = getTime(a.updatedAt || a.createdAt);
      const timeB = getTime(b.updatedAt || b.createdAt);

      if (timeA === null && timeB === null) return 0;
      if (timeA === null) return 1;
      if (timeB === null) return -1;

      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }

    return 0;
  });
};
