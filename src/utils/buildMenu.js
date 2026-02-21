import {
  CaseSensitive,
  Calendar,
  Hourglass,
  Star,
  CalendarX,
  Ghost,
} from 'lucide-react';

const getSortBadge = (type, order) => {
  if (type === 'name') return order === 'asc' ? '가나다 순' : '하파타 순';
  if (type === 'createdAt') return order === 'desc' ? '최근 순' : '오래된 순';
  if (type === 'dDay') return order === 'asc' ? '임박한 순' : '여유로운 순';
  if (type === 'deletedAt') return order === 'desc' ? '최근 순' : '오래된 순';
  if (type === 'updatedAt') return order === 'asc' ? '오래된 순' : '최근 순';

  return '';
};

export const buildMenu = ({
  actions = [],
  sortOption,
  setSortOption,
  sortKeys = ['name', 'createdAt', 'dDay'],
  showImportantOnly,
  setShowImportantOnly,
  filterKeys = ['important'],
}) => {
  const sections = [];

  // 액션 섹션
  if (actions.length > 0) {
    sections.push({
      items: actions,
    });
  }

  const currentBadge = getSortBadge(sortOption?.type, sortOption?.order);

  // 정렬 섹션
  if (
    sortKeys.length > 0 &&
    sortOption &&
    typeof setSortOption === 'function'
  ) {
    const sortItems = [];

    // 이름 기준 정렬
    if (sortKeys.includes('name')) {
      sortItems.push({
        id: 'name',
        label: '이름',
        icon: CaseSensitive,
        hasCheck: true,
        isChecked: sortOption.type === 'name',
        badge: sortOption.type === 'name' ? currentBadge : undefined,
        onClick: () => {
          setSortOption((prev) => ({
            type: 'name',
            order:
              prev.type === 'name' && prev.order === 'asc' ? 'desc' : 'asc',
          }));
        },
      });
    }

    // 생성일 기준 정렬
    if (sortKeys.includes('createdAt')) {
      sortItems.push({
        id: 'createdAt',
        label: '생성일',
        icon: Calendar,
        hasCheck: true,
        isChecked: sortOption.type === 'createdAt',
        badge: sortOption.type === 'createdAt' ? currentBadge : undefined,
        onClick: () => {
          setSortOption((prev) => ({
            type: 'createdAt',
            order:
              prev.type === 'createdAt' && prev.order === 'desc'
                ? 'asc'
                : 'desc',
          }));
        },
      });
    }

    // 디데이 기준 정렬
    if (sortKeys.includes('dDay')) {
      sortItems.push({
        id: 'dDay',
        label: '디데이',
        icon: Hourglass,
        hasCheck: true,
        isChecked: sortOption.type === 'dDay',
        badge: sortOption.type === 'dDay' ? currentBadge : undefined,
        onClick: () => {
          setSortOption((prev) => ({
            type: 'dDay',
            order:
              prev.type === 'dDay' && prev.order === 'asc' ? 'desc' : 'asc',
          }));
        },
      });
    }

    // 삭제일 기준 정렬
    if (sortKeys.includes('deletedAt')) {
      sortItems.push({
        id: 'deletedAt',
        label: '삭제일',
        icon: CalendarX,
        hasCheck: true,
        isChecked: sortOption.type === 'deletedAt',
        badge: sortOption.type === 'deletedAt' ? currentBadge : undefined,
        onClick: () => {
          setSortOption((prev) => ({
            type: 'deletedAt',
            order:
              prev.type === 'deletedAt' && prev.order === 'desc'
                ? 'asc'
                : 'desc',
          }));
        },
      });
    }

    // 방치된 기간 기준 정렬
    if (sortKeys.includes('updatedAt')) {
      sortItems.push({
        id: 'updatedAt',
        label: '방치된 기간',
        icon: Ghost,
        hasCheck: true,
        isChecked: sortOption.type === 'updatedAt',
        badge: sortOption.type === 'updatedAt' ? currentBadge : undefined,
        onClick: () => {
          setSortOption((prev) => ({
            type: 'updatedAt',
            order:
              prev.type === 'updatedAt' && prev.order === 'desc'
                ? 'asc'
                : 'desc',
          }));
        },
      });
    }

    if (sortItems.length > 0) {
      sections.push({
        header: '정렬',
        items: sortItems,
      });
    }
  }

  // 필터 섹션
  if (
    filterKeys.length > 0 &&
    showImportantOnly !== undefined &&
    typeof setShowImportantOnly === 'function'
  ) {
    const filterItems = [];

    // 중요 표시 필터
    if (filterKeys.includes('important')) {
      filterItems.push({
        id: 'important',
        label: '중요 표시만',
        icon: Star,
        hasCheck: true,
        isChecked: !!showImportantOnly,
        onClick: () => setShowImportantOnly((prev) => !prev),
      });
    }

    if (filterItems.length > 0) {
      sections.push({
        header: '필터',
        items: filterItems,
      });
    }
  }

  return sections;
};
