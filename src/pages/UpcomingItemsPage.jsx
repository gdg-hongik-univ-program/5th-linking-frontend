import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useItems } from '../hooks/useItems';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import ItemCard from '../components/common/ItemCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function UpcomingItemsPage() {
  const [search, setSearch] = useState('');
  const {
    items,
    loading,
    navigate,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDelete,
    handleUndo,
    handleEdit,
    handleItemClick,
  } = useItems('upcoming');

  const filteredItems = items.filter((item) =>
    (item.title || item.itemName || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full">
      <PageHeader title="마감임박" onBack={() => navigate(-1)} />
      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="마감일 있는 링크 검색"
        />
        <section className="flex flex-col py-6">
          {loading ? (
            <div className="text-center py-10 text-text-sub">
              불러오는 중...
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <SwipeableWrapper
                  key={item.itemId}
                  itemId={item.itemId}
                  onClick={() => handleItemClick(item.itemId)}
                  isOpen={openedItemId === item.itemId}
                  onOpen={setOpenedItemId}
                  onClose={() => setOpenedItemId(null)}
                  leftAction={
                    <SwipeActionButton
                      type="edit"
                      onClick={() => handleEdit(item.itemId)}
                    />
                  }
                  rightAction={
                    <SwipeActionButton
                      type="delete"
                      onClick={() => handleDelete(item)}
                    />
                  }
                >
                  <ItemCard item={item} />
                </SwipeableWrapper>
              ))}
            </AnimatePresence>
          )}
        </section>
      </main>
      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        onUndo={handleUndo}
      />
    </div>
  );
}
