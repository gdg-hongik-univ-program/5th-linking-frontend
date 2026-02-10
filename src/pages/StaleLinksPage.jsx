import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useItems } from '../hooks/useItems';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import LinkCard from '../components/common/LinkCard';
import SwipeableWrapper from '../components/common/SwipeableWrapper';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';

export default function StaleLinksPage() {
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
    handleRestore, // 보관 기능 사용
    handleItemClick,
  } = useItems('cleanup');

  const filteredLinks = links.filter((link) =>
    (link.title || link.itemName || '')
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col h-full">
      <PageHeader title="정리가 필요한 링크" onBack={() => navigate(-1)} />
      <main className="flex-1 px-6 pt-6 pb-24 flex flex-col overflow-y-auto">
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="오래된 링크 검색"
        />
        <section className="flex flex-col py-6">
          {loading ? (
            <div className="text-center py-10 text-text-sub">
              불러오는 중...
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredLinks.map((link) => (
                <SwipeableWrapper
                  key={link.itemId}
                  itemId={link.itemId}
                  onClick={() => handleItemClick(link.itemId)}
                  isOpen={openedItemId === link.itemId}
                  onOpen={setOpenedItemId}
                  onClose={() => setOpenedItemId(null)}
                  // 청소 페이지 특성상 '수정' 대신 '보관(기한 연장)'을 배치
                  leftAction={
                    <SwipeActionButton
                      type="restore"
                      onClick={() => handleRestore(link.itemId)}
                    />
                  }
                  rightAction={
                    <SwipeActionButton
                      type="delete"
                      onClick={() => handleDeleteRequest(link)}
                    />
                  }
                >
                  <LinkCard link={link} />
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
