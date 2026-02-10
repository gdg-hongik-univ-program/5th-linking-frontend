import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

import { useItems } from '../hooks/useItems';

import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import QuickActionBar from '../components/common/QuickActionBar';
import LinkCard from '../components/common/LinkCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function HomePage() {
  const [search, setSearch] = useState('');

  const {
    items: links,
    loading,
    navigate,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDeleteRequest,
    handleUndo,
    handleDirectEdit,
    handleItemClick,
  } = useItems('recent');

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans">
      <TabHeader title="홈">
        <IconButton
          icon={Bell}
          onClick={() => navigate('/notification')}
          aria-label="알림함"
        />
      </TabHeader>

      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex justify-center pt-6 shrink-0">
          <QuickActionBar />
        </div>

        <section className="flex flex-col py-6">
          <h2 className="text-lg font-bold pb-4">최근 저장한 링크</h2>
          <div className="flex flex-col divide-y divide-neutral-800">
            {loading ? (
              <div className="text-center py-10 text-text-sub">
                불러오는 중...
              </div>
            ) : (
              <div className="flex flex-col relative overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {links.map((link) => (
                    <SwipeableWrapper
                      key={link.itemId}
                      itemId={link.itemId}
                      isOpen={openedItemId === link.itemId}
                      onOpen={(id) => setOpenedItemId(id)}
                      onClose={() => setOpenedItemId(null)}
                      actionWidth={80}
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
                          type="edit"
                          onClick={() => handleDirectEdit(link.itemId)}
                        />
                      }
                      rightAction={
                        <SwipeActionButton
                          type="delete"
                          onClick={() => handleDeleteRequest(link)}
                        />
                      }
                    >
                      <div onClick={() => handleItemClick(link.itemId)}>
                        <LinkCard link={link} />
                      </div>
                    </SwipeableWrapper>
                  ))}
                </AnimatePresence>
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
  );
}
