import { useState, useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ListView from '../components/common/ListView';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function ImportantItemsPage() {
  const [search, setSearch] = useState('');

  const {
    items,
    isLoading,
    navigate,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDelete,
    handleUndo,
    handleGoToEdit,
    handleGoToView,
  } = useItems('important');

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => (item.title ?? '').toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <PageHeader title="중요" onBackClick={() => navigate(-1)}>
        <IconButton
          icon={MoreHorizontal}
          onClick={() => console.log('더보기 클릭')}
          aria-label="더보기"
        />
      </PageHeader>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-6 shrink-0">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="중요 표시한 링크 검색"
          />
        </div>

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
                type="edit"
                onClick={() => handleGoToEdit(item.itemId)}
              />
            )}
            renderRightAction={(item) => (
              <SwipeActionButton
                type="delete"
                onClick={() => handleDelete(item)}
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
    </div>
  );
}
