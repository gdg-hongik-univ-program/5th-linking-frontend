import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ListView from '../components/common/ListView';
import QuickActionBar from '../components/common/QuickActionBar';
import Snackbar from '../components/common/Snackbar';
import SwipeActionButton from '../components/common/SwipeActionButton';
import TabHeader from '../components/common/TabHeader';

export default function HomePage() {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const [search, setSearch] = useState('');

  const {
    items,
    isLoading,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDelete,
    handleUndo,
    handleGoToView,
    handleGoToEdit,
  } = useItems('recent');

  const filteredItems = useMemo(() => {
    if (!search) return items;
    return items.filter((item) => {
      const title = item.itemName || item.title || '';
      return title.toLowerCase().includes(search.toLowerCase());
    });
  }, [items, search]);

  const renderListHeader = (
    <div className="px-6 pb-1 flex flex-col">
      <div className="flex justify-center">
        <QuickActionBar />
      </div>

      <h2 className="text-lg font-bold mt-6">최근 생성한 링크</h2>
    </div>
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"
      >
        <div className="relative w-full">
          <TabHeader title="홈">
            <IconButton
              icon={Bell}
              onClick={() => navigate('/notification')}
              aria-label="알림함"
            />
          </TabHeader>
        </div>

        <div className="sticky top-0 z-20 bg-bg-main px-6 pt-4 pb-2">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 min-h-0">
          <ListView
            data={filteredItems}
            isLoading={isLoading}
            searchQuery={search}
            ListHeaderComponent={renderListHeader}
            openedId={openedItemId}
            setOpenedId={setOpenedItemId}
            scrollParentRef={scrollRef}
            isSelectionMode={false}
            selectedIds={{ folders: [], items: [] }}
            onToggleSelection={() => {}}
            onNavigate={(entry) => handleGoToView(entry.itemId)}
            renderLeftAction={(entry) => (
              <SwipeActionButton
                type="edit"
                onClick={() => handleGoToEdit(entry.itemId)}
              />
            )}
            renderRightAction={(entry) => (
              <SwipeActionButton
                type="delete"
                onClick={() => handleDelete(entry)}
              />
            )}
            emptyText="최근 생성한 링크가 없어요."
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
