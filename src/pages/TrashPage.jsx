import { useState, useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ListView from '../components/common/ListView';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function TrashPage() {
  const [search, setSearch] = useState('');

  const {
    items,
    isLoading,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleRestore,
    handleDeletePermanently,
    handleUndo,
    handleGoToView,
  } = useItems('trash');

  // 검색 필터
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) => (item.title ?? '').toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      {/* 헤더 */}
      <PageHeader title="휴지통" onBack={() => navigate(-1)}>
        <IconButton
          icon={MoreHorizontal}
          onClick={() => console.log('더보기 클릭')}
          aria-label="더보기"
        />
      </PageHeader>

      {/* 메인 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 서치 바 */}
        <div className="px-6 pt-6 shrink-0">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="삭제된 항목 검색"
          />
        </div>

        {/* 리스트 뷰 */}
        <div className="flex-1 min-h-0">
          <ListView
            data={filteredItems}
            isLoading={isLoading}
            searchQuery={search}
            openedId={openedItemId}
            setOpenedId={setOpenedItemId}
            isSelectionMode={false}
            selectedIds={{ folders: [], items: [] }}
            onToggleSelection={() => {}}
            onNavigate={(entry) => handleGoToView(entry.itemId)}
            renderLeftAction={(item) => (
              <SwipeActionButton
                type="restore"
                onClick={() => handleRestore(item)}
              />
            )}
            renderRightAction={(item) => (
              <SwipeActionButton
                type="delete"
                onClick={() => handleDeletePermanently(item)}
              />
            )}
            emptyText="휴지통이 비어있어요."
          />
        </div>
      </main>

      {/* 스낵바 */}
      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        onUndo={handleUndo}
      />
    </div>
  );
}
