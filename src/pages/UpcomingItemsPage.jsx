import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, MoreHorizontal } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { buildMenu } from '../utils/buildMenu';
import { sortData } from '../utils/sortData';
import ActionSheet from '../components/common/ActionSheet';
import IconButton from '../components/common/IconButton';
import ListView from '../components/common/ListView';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import SelectionHeader from '../components/common/SelectionHeader';
import Snackbar from '../components/common/Snackbar';
import SwipeActionButton from '../components/common/SwipeActionButton';

export default function UpcomingItemsPage() {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const {
    items,
    isLoading,
    snackbar,
    handleDelete,
    handleUndo,
    handleGoToEdit,
    handleGoToView,
    refetch: refetchAll,
  } = useItems('upcoming');

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  // 기본 정렬 옵션
  const [sortOption, setSortOption] = useState({
    type: 'dDay',
    order: 'asc',
  });

  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState({ items: [] });
  const [openedSwipeId, setOpenedSwipeId] = useState(null);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    let result = items || [];
    const q = searchQuery.trim().toLowerCase();

    if (q) result = result.filter((i) => i.title?.toLowerCase().includes(q));
    if (showImportantOnly) result = result.filter((i) => i.importance);

    return result;
  }, [items, searchQuery, showImportantOnly]);

  // 정렬된 아이템
  const sortedItems = useMemo(
    () => sortData(filteredItems, sortOption.type, sortOption.order),
    [filteredItems, sortOption],
  );

  const totalSelectedCount = selectedIds.items.length;
  const isAllSelected =
    sortedItems.length > 0 && totalSelectedCount === sortedItems.length;

  // 개별 선택 토글
  const handleToggleSelection = (targetId) => {
    setSelectedIds((prev) => {
      const isSelected = prev.items.includes(targetId);
      return {
        items: isSelected
          ? prev.items.filter((id) => id !== targetId)
          : [...prev.items, targetId],
      };
    });
  };

  // 전체 선택 토글
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds({ items: [] });
    } else {
      setSelectedIds({
        items: sortedItems.map((i) => i.itemId),
      });
    }
  };

  // 선택한 아이템 삭제
  const handleDeleteSelected = async () => {
    if (selectedIds.items.length === 0) return;
    const itemsToDelete = items.filter((i) =>
      selectedIds.items.includes(i.itemId),
    );

    const result = await handleDelete(itemsToDelete);
    if (result?.success) {
      setIsSelectionMode(false);
      setSelectedIds({ items: [] });
      refetchAll();
    }
  };

  // 액션 시트 구성
  const actionSheetSections = useMemo(() => {
    return buildMenu({
      actions: [
        {
          id: 'select',
          label: '선택',
          icon: CircleCheck,
          onClick: () => {
            setIsSelectionMode(true);
            setMenuAnchor(null);
          },
        },
      ],
      sortOption,
      setSortOption,
      sortKeys: ['name', 'createdAt', 'dDay'],
      showImportantOnly,
      setShowImportantOnly,
      filterKeys: ['important'],
    });
  }, [sortOption, showImportantOnly]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col h-full overflow-hidden font-family-sans">
      <PageHeader title="임박" onBackClick={() => navigate(-1)}>
        <IconButton
          icon={MoreHorizontal}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={isSelectionMode}
          aria-label="더보기"
        />
      </PageHeader>

      <div className="sticky top-0 z-20 bg-bg-main px-6 pt-4 pb-2">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="마감일까지 7일 이내인 링크 검색"
          mb={isSelectionMode ? 'mb-2' : 'mb-0'}
        />

        {isSelectionMode && (
          <div className="pb-1">
            <SelectionHeader
              mode="default"
              selectedCount={totalSelectedCount}
              isAllSelected={isAllSelected}
              onToggleAll={handleToggleAll}
              onClose={() => setIsSelectionMode(false)}
              onDelete={handleDeleteSelected}
            />
          </div>
        )}
      </div>

      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pt-3"
      >
        <ListView
          data={sortedItems}
          isLoading={isLoading}
          searchQuery={searchQuery}
          openedId={openedSwipeId}
          setOpenedId={setOpenedSwipeId}
          scrollParentRef={scrollRef}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelection={(id) => handleToggleSelection(id)}
          onNavigate={(entry) => handleGoToView(entry.itemId)}
          renderLeftAction={(item, dragX) => (
            <SwipeActionButton
              type="edit"
              x={dragX}
              direction="left"
              onClick={() => handleGoToEdit(item.itemId)}
            />
          )}
          renderRightAction={(item, dragX) => (
            <SwipeActionButton
              type="delete"
              x={dragX}
              direction="right"
              onClick={async () => {
                const result = await handleDelete(item);
                if (result?.success) {
                  setOpenedSwipeId(null);
                  refetchAll();
                }
              }}
            />
          )}
          emptyText="마감일까지 7일 이내인 링크가 없어요."
        />
      </main>

      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        onUndo={handleUndo}
      />

      <ActionSheet
        isOpen={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        sections={actionSheetSections}
        anchorEl={menuAnchor}
      />
    </div>
  );
}
