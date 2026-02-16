import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useItems } from '../hooks/useItems';

import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';
import ItemCard from '../components/common/ItemCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';
import LoadingOverlay from '../components/common/LoadingOverlay';

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const {
    items,
    loading,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDelete,
    handleUndo,
    handleEdit,
    handleView,
  } = useItems('recent');

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const title = item.itemName || item.title || '';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <>
      <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden h-full">
        <TabHeader title="홈">
          <IconButton
            icon={Bell}
            onClick={() => navigate('/notification')}
            aria-label="알림함"
          />
        </TabHeader>

        <main className="flex-1 px-6 pt-6 flex flex-col overflow-y-auto scrollbar-hide">
          <div className="mb-6">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex justify-center shrink-0 mb-6">
            <QuickActionBar />
          </div>

          <section className="flex flex-col gap-6">
            <h2 className="text-lg font-bold">최근 저장한 링크</h2>
            <div className="flex flex-col divide-y divide-neutral-800">
              {loading ? (
                <LoadingOverlay />
              ) : (
                <div className="flex flex-col relative overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => (
                      <SwipeableWrapper
                        key={item.itemId}
                        itemId={item.itemId}
                        isOpen={openedItemId === item.itemId}
                        onOpen={setOpenedItemId}
                        onClose={() => setOpenedItemId(null)}
                        actionWidth={60}
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

                  {filteredItems.length === 0 && (
                    <div className="text-center py-10 text-text-sub text-sm">
                      {search
                        ? '검색 결과가 없어요'
                        : '최근 저장한 링크가 없어요.'}
                    </div>
                  )}
                </div>
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
    </>
  );
}
