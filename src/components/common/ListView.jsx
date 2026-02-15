import { Virtuoso } from 'react-virtuoso';
import ItemCard from './ItemCard';
import FolderCard from './FolderCard';
import SwipeableWrapper from './SwipeableWrapper';
import LoadingSpinner from './LoadingSpinner';

export default function ListView({
  data,
  isLoading,
  searchQuery,
  ListHeaderComponent = null,
  openedId,
  setOpenedId,
  isSelectionMode,
  selectedIds,
  onToggleSelection,
  onNavigate,
  swipeEnabled = true,
  renderLeftAction,
  renderRightAction,
  emptyText = '목록이 비어있어요.',
}) {
  // 스크롤 시 스와이프 닫기
  const handleScroll = () => {
    if (openedId) {
      setOpenedId(null);
    }
  };
  // 리스트 뷰 렌더링
  const renderRow = (_, entry) => {
    const isItem = entry.itemId !== undefined;
    const id = isItem ? entry.itemId : entry.folderId;
    const type = isItem ? 'item' : 'folder';
    const isSelected = isSelectionMode
      ? isItem
        ? selectedIds.items.includes(id)
        : selectedIds.folders.includes(id)
      : false;
    const handleClick = () => {
      if (isSelectionMode) {
        onToggleSelection(id, type);
      } else {
        onNavigate?.(entry);
      }
    };

    const isSwipeDisabled = isSelectionMode || !swipeEnabled;

    return (
      <div className="p-0">
        <SwipeableWrapper
          key={`${type}-${id}`}
          itemId={id}
          isOpen={openedId === id}
          onOpen={setOpenedId}
          onClose={() => setOpenedId(null)}
          actionWidth={80}
          disabled={isSwipeDisabled}
          leftAction={renderLeftAction ? renderLeftAction(entry) : null}
          rightAction={renderRightAction ? renderRightAction(entry) : null}
        >
          <div onClick={handleClick} className="cursor-pointer">
            {isItem ? (
              <ItemCard
                item={entry}
                isSelectMode={isSelectionMode}
                isSelected={isSelected}
              />
            ) : (
              <FolderCard
                folder={entry}
                isSelectMode={isSelectionMode}
                isSelected={isSelected}
              />
            )}
          </div>
        </SwipeableWrapper>
      </div>
    );
  };

  return (
    <Virtuoso
      style={{ height: '100%' }}
      data={isLoading ? [] : data}
      itemContent={renderRow}
      onScroll={handleScroll}
      components={{
        Header: () =>
          ListHeaderComponent ? <div>{ListHeaderComponent}</div> : null,
        EmptyPlaceholder: () => (
          <div className="flex flex-col items-center justify-center py-20 text-text-sub text-sm">
            {isLoading ? (
              <LoadingSpinner size="lg" color="text-primary-main" />
            ) : (
              <span>{searchQuery ? '검색 결과가 없어요.' : emptyText}</span>
            )}
          </div>
        ),
        Footer: () => <div className="h-6" />,
      }}
    />
  );
}
