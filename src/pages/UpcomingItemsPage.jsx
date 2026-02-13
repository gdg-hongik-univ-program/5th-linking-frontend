import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import ItemCard from '../components/common/ItemCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function UpcomingItemsPage() {
  const [search, setSearch] = useState('');
  const scrollRef = useRef(null);
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
    handleView,
  } = useItems('upcoming');

  const filteredItems = items.filter((item) =>
    (item.title || item.itemName || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div
      ref={scrollRef}
      className="flex-1 h-screen bg-bg-main text-text-main flex flex-col overflow-y-auto font-family-sans overflow-hidden"
    >
      <PageHeader
        title="마감 임박"
        onBack={() => navigate(-1)}
        scrollContainerRef={scrollRef}
      >
        <IconButton
          icon={MoreHorizontal}
          onClick={() => {}}
          aria-label="더보기"
        />
      </PageHeader>

      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="디데이가 7일 이내인 링크 검색"
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
                  <div
                    onClick={() => handleView(item.itemId)}
                    className="cursor-pointer"
                  >
                    <ItemCard item={item} />
                  </div>
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
