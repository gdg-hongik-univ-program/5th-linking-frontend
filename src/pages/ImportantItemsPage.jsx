import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, CircleCheck } from 'lucide-react';
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

export default function ImportantItemsPage() {
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
  } = useItems('important');

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  // 기본 정렬 옵션
  const [sortOption, setSortOption] = useState({
    type: 'createdAt',
    order: 'desc',
  });

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

    return result;
  }, [items, searchQuery]);

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

  // 선택 항목 삭제
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
    });
  }, [sortOption]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"
      >
        <div className="relative w-full shrink-0">
          <PageHeader
            title="중요"
            iconType="close"
            onBack={() => navigate(-1)}
            collapseBottomGap
          >
            <IconButton
              icon={MoreHorizontal}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              disabled={isSelectionMode}
              aria-label="더보기"
            />
          </PageHeader>
        </div>

        <div className="sticky top-0 z-20 bg-bg-main px-6 pt-4 pb-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="중요 표시한 링크 검색"
            mb={isSelectionMode ? 'mb-1' : 'mb-0'}
          />

          {isSelectionMode && (
            <SelectionHeader
              mode="default"
              selectedCount={totalSelectedCount}
              isAllSelected={isAllSelected}
              onToggleAll={handleToggleAll}
              onClose={() => setIsSelectionMode(false)}
              onDelete={handleDeleteSelected}
            />
          )}
        </div>

        <div className="flex-1 min-h-0">
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
            emptyText="중요 표시한 링크가 없어요."
          />
        </div>
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
