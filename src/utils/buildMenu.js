import {
  CircleCheck,
  CaseSensitive,
  Calendar,
  Hourglass,
  Star,
} from 'lucide-react';

const getSortBadge = (type, order) => {
  if (type === 'name') return order === 'asc' ? '가나다 순' : '하파타 순';
  if (type === 'createdAt') return order === 'desc' ? '최신 순' : '오래된 순';
  if (type === 'dDay') return order === 'asc' ? '임박한 순' : '여유로운 순';
  return '';
};

export const buildMenu = ({
  onSelect,
  sortOption,
  setSortOption,
  showImportantOnly,
  setShowImportantOnly,
  customActions = [],
  showSortSection = true,
  showFilterSection = true,
}) => {
  const sections = [];

  const currentBadge = getSortBadge(sortOption?.type, sortOption?.order);

  // 선택
  sections.push({
    items: [
      {
        id: 'select',
        label: '선택',
        icon: CircleCheck,
        onClick: onSelect,
      },
      ...customActions,
    ],
  });

  // 정렬 섹션
  if (showSortSection && typeof setSortOption === 'function' && sortOption) {
    sections.push({
      header: '정렬',
      items: [
        {
          id: 'name',
          label: '이름',
          icon: CaseSensitive,
          hasCheck: true,
          isChecked: sortOption?.type === 'name',
          badge: sortOption?.type === 'name' ? currentBadge : undefined,
          onClick: () => {
            setSortOption((prev) => ({
              type: 'name',
              order:
                prev?.type === 'name' && prev?.order === 'asc' ? 'desc' : 'asc',
            }));
          },
        },
        {
          id: 'createdAt',
          label: '생성일',
          icon: Calendar,
          hasCheck: true,
          isChecked: sortOption?.type === 'createdAt',
          badge: sortOption?.type === 'createdAt' ? currentBadge : undefined,
          onClick: () => {
            setSortOption((prev) => ({
              type: 'createdAt',
              order:
                prev?.type === 'createdAt' && prev?.order === 'desc'
                  ? 'asc'
                  : 'desc',
            }));
          },
        },
        {
          id: 'dDay',
          label: '디데이',
          icon: Hourglass,
          hasCheck: true,
          isChecked: sortOption?.type === 'dDay',
          badge: sortOption?.type === 'dDay' ? currentBadge : undefined,
          onClick: () => {
            setSortOption((prev) => ({
              type: 'dDay',
              order:
                prev?.type === 'dDay' && prev?.order === 'asc' ? 'desc' : 'asc',
            }));
          },
        },
      ],
    });
  }

  // 필터 섹션
  if (
    showFilterSection &&
    showImportantOnly !== undefined &&
    typeof setShowImportantOnly === 'function'
  ) {
    sections.push({
      header: '필터',
      items: [
        {
          id: 'important',
          label: '중요 표시한 링크만',
          icon: Star,
          hasCheck: true,
          isChecked: !!showImportantOnly,
          badge: showImportantOnly ? 'ON' : undefined,
          onClick: () => setShowImportantOnly((prev) => !prev),
        },
      ],
    });
  }

  return sections;
};
