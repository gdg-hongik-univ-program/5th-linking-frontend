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
import LoadingOverlay from '../components/common/LoadingOverlay';

export default function StaleItemsPage() {
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
    handleRestore,
    handleView,
  } = useItems('stale');

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
        title="정리가 필요한 링크"
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
          placeholder="오래된 링크 검색"
        />

        <section className="flex flex-col py-6">
          {loading ? (
            <LoadingOverlay />
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <SwipeableWrapper
                  key={item.itemId}
                  itemId={item.itemId}
                  isOpen={openedItemId === item.itemId}
                  onOpen={(id) => setOpenedItemId(id)}
                  onClose={() => setOpenedItemId(null)}
                  actionWidth={60}
                  layout
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: -100,
                    transition: { duration: 0.2, ease: 'easeIn' },
                  }}
                  transition={{
                    duration: 0.2,
                    ease: 'easeOut',
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                  leftAction={
                    <SwipeActionButton
                      type="extend"
                      onClick={() => handleRestore(item.itemId)}
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
                    onClick={(e) => {
                      // 어떤 카드라도 열려있는 상태라면 상세 페이지 이동 차단
                      if (openedItemId !== null) {
                        e.stopPropagation();
                        setOpenedItemId(null);
                        return;
                      }

                      handleView(item.itemId);
                    }}
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
