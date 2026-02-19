import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleX, Search, Plus, MoreHorizontal, Unlink } from 'lucide-react';
import ActionSheet from './ActionSheet';
import IconButton from '../common/IconButton';
import ItemPicker from './ItemPicker';
import LoadingSpinner from './LoadingSpinner';
import { sortData } from '../../utils/sortData';
import { buildMenu } from '../../utils/buildMenu';

// 연결된 아이템 리스트
const ListItem = ({ item, onRemove, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-3 px-8 border-b border-neutral-800/50 hover:bg-neutral-800/30 active:bg-neutral-800 transition-colors cursor-pointer group"
    >
      <div className="flex-1 min-w-0 pr-3">
        <span className="text-sm text-text-main truncate select-none block">
          {item.title || '제목 없음'}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.itemId);
        }}
        className="p-2 text-text-sub hover:text-error-500 hover:bg-error-500/10 rounded-full transition-colors shrink-0"
        aria-label="연결 해제"
      >
        <Unlink size={18} />
      </button>
    </div>
  );
};

export default function BottomSheet({
  isOpen,
  onClose,
  items = [],
  isLoading = false,
  onConnect,
  onDisconnect,
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [sortOption, setSortOption] = useState({ type: 'name', order: 'asc' });

  // 배경 클릭 방지
  useEffect(() => {
    if (isOpen && !isPickerOpen) {
      const root = document.getElementById('root');
      if (root) root.setAttribute('inert', 'true');
    } else if (!isOpen) {
      const root = document.getElementById('root');
      if (root) root.removeAttribute('inert');
    }
  }, [isOpen, isPickerOpen]);

  const handleContentPointerDown = (e) => {
    if (menuAnchor) setMenuAnchor(null);
    e.stopPropagation();
  };

  const handleHeaderPointerDown = (e) => {
    if (menuAnchor) {
      setMenuAnchor(null);
      e.stopPropagation();
    }
  };

  const processedItems = useMemo(() => {
    let result = items;
    if (localSearch.trim()) {
      result = result.filter((item) =>
        (item.title || '').toLowerCase().includes(localSearch.toLowerCase()),
      );
    }
    return sortData(result, sortOption.type, sortOption.order);
  }, [items, localSearch, sortOption]);

  const actionSheetSections = useMemo(() => {
    return buildMenu({
      actions: [],
      sortOption,
      setSortOption,
      sortKeys: ['name'],
      filterKeys: [],
    });
  }, [sortOption]);

  const handlePickerSelect = (selectedItem) => {
    onConnect(selectedItem);
  };

  const handleItemClick = (itemId) => {
    onClose();
    navigate(`/view/${itemId}`);
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[1000] backdrop-blur-sm"
              onClick={onClose}
            />

            {/* 바텀 시트 */}
            <motion.div
              className="fixed left-1/2 bottom-0 z-[1010] bg-bg-main rounded-t-[2rem] shadow-2xl flex flex-col border-t border-neutral-800 overflow-hidden w-full max-w-[390px]"
              style={{ x: '-50%' }}
              initial={{ y: '100%', x: '-50%' }}
              animate={{ y: 0, x: '-50%', height: isExpanded ? '90%' : '60%' }}
              exit={{ y: '100%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) onClose();
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 핸들바 */}
              <div
                className="w-full flex justify-center pt-3 pb-2 cursor-grab bg-bg-main shrink-0"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
              </div>

              {/* 헤더 */}
              <div
                className="px-5 pb-4 bg-bg-main flex flex-col gap-4 shrink-0"
                onPointerDown={handleHeaderPointerDown}
              >
                <div className="relative flex items-center justify-center py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-text-main">
                      연결된 아이템
                    </span>
                    <span className="text-xs font-bold text-primary-500 mt-1">
                      {items.length}개
                    </span>
                  </div>

                  <IconButton
                    icon={MoreHorizontal}
                    size={20}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuAnchor(e.currentTarget);
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    aria-label="더보기"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="목록에서 검색..."
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-text-main placeholder:text-text-disabled focus:outline-none focus:border-primary-500"
                      onPointerDown={handleContentPointerDown}
                    />
                    {localSearch && (
                      <button
                        onClick={() => setLocalSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-main"
                      >
                        <CircleX size={16} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPickerOpen(true);
                    }}
                    className="w-[42px] h-[42px] flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-colors shrink-0"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* 아이템 리스트 */}
              <div
                className="flex-1 min-h-0 bg-bg-main pb-8"
                onPointerDown={handleContentPointerDown}
              >
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : processedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-disabled gap-2 opacity-60">
                    <span className="text-sm">
                      {localSearch
                        ? '검색 결과가 없어요.'
                        : '연결된 아이템이 없습니다.'}
                    </span>
                  </div>
                ) : (
                  <Virtuoso
                    style={{ height: '100%' }}
                    data={processedItems}
                    className="scrollbar-hide"
                    itemContent={(index, item) => (
                      <ListItem
                        key={item.itemId || item.id}
                        item={item}
                        onRemove={onDisconnect}
                        onClick={() => handleItemClick(item.itemId || item.id)}
                      />
                    )}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ItemPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handlePickerSelect}
        title="연결할 아이템 선택"
      />

      <div className="relative z-[1100]">
        <ActionSheet
          isOpen={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          sections={actionSheetSections}
          anchorEl={menuAnchor}
        />
      </div>
    </>,
    document.body,
  );
}
