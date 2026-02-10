import { useState } from 'react';
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

export default function ImportantItemsPage() {
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
  } = useItems('important');

  const filteredItems = items.filter((item) =>
    (item.title || item.itemName || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full">
      <PageHeader title="중요" onBack={() => navigate(-1)}>
        <IconButton
          icon={MoreHorizontal}
          onClick={() => {}}
          aria-label="더보기"
        />
      </PageHeader>

      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="중요 링크 검색"
        />

        <section className="flex flex-col py-6">
          <div className="flex flex-col divide-y divide-neutral-800">
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
                    actionWidth={80}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -100 }}
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
                      onClick={() => handleItemClick(item.itemId)}
                      className="cursor-pointer"
                    >
                      <ItemCard item={item} />
                    </div>
                  </SwipeableWrapper>
                ))}
              </AnimatePresence>
            )}
          </div>
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
