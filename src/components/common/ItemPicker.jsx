import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Folder,
  CornerLeftUp,
  ChevronRight,
  Search,
  Plus,
  Database,
  MoreHorizontal,
  Star,
  CircleX,
} from 'lucide-react';
import { useFolders } from '../../hooks/useFolders';
import { useItems } from '../../hooks/useItems';
import { buildMenu } from '../../utils/buildMenu';
import { findFolderNode } from '../../utils/findFolderNode';
import { formatDate } from '../../utils/formatDate';
import { sortData } from '../../utils/sortData';
import ActionSheet from './ActionSheet';
import LoadingSpinner from './LoadingSpinner';

export default function ItemPicker({
  isOpen,
  onClose,
  onSelect,
  title = '연결할 링크 선택',
}) {
  const {
    folders: folderTree,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = useFolders();

  const {
    items: allItems,
    isLoading: isItemsLoading,
    refetch: refetchItems,
  } = useItems('all');

  const [history, setHistory] = useState([{ id: null, name: '저장소 최상위' }]);
  const [searchQuery, setSearchQuery] = useState('');

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [sortOption, setSortOption] = useState({ type: 'name', order: 'asc' });
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  // 배경 제어
  useEffect(() => {
    if (isOpen) {
      // 배경 뒤 클릭 방지
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('inert', 'true');
        root.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }

    return () => {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isOpen]);

  // 데이터 불러오기
  useEffect(() => {
    if (isOpen) {
      setHistory([{ id: null, name: '저장소 최상위' }]);
      setSearchQuery('');
      refetchFolders();
      refetchItems();
    }
  }, [isOpen, refetchFolders, refetchItems]);

  // 3. 뷰 데이터 계산
  const currentFolder = history[history.length - 1];
  const isRoot = history.length === 1;
  const isSearching = searchQuery.trim().length > 0;
  const isLoading = isFoldersLoading || isItemsLoading;

  const combinedList = useMemo(() => {
    let targetFolders = [];
    let targetItems = [];

    if (isSearching) {
      targetItems = allItems.filter((item) =>
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()),
      );
    } else {
      const currentId = currentFolder.id;
      if (currentId === null) {
        targetFolders = folderTree || [];
      } else {
        const foundNode = findFolderNode(folderTree, currentId);
        targetFolders = foundNode?.children || [];
      }
      targetItems = allItems.filter((i) => {
        if (currentId === null) return !i.folderId;
        return String(i.folderId) === String(currentId);
      });
    }

    if (showImportantOnly) {
      targetItems = targetItems.filter((item) => item.importance);
    }

    const sortedFolders = sortData(
      [...targetFolders],
      sortOption.type,
      sortOption.order,
    );
    const sortedItems = sortData(
      [...targetItems],
      sortOption.type,
      sortOption.order,
    );

    return [
      ...sortedFolders.map((f) => ({ ...f, pType: 'folder' })),
      ...sortedItems.map((i) => ({ ...i, pType: 'item' })),
    ];
  }, [
    isSearching,
    searchQuery,
    currentFolder,
    folderTree,
    allItems,
    sortOption,
    showImportantOnly,
  ]);

  const actionSheetSections = useMemo(() => {
    return buildMenu({
      actions: [],
      sortOption,
      setSortOption,
      sortKeys: ['name', 'createdAt'],
      showImportantOnly,
      setShowImportantOnly,
      filterKeys: ['important'],
    });
  }, [sortOption, showImportantOnly]);

  const handleEnterFolder = (folder) => {
    setHistory((prev) => [
      ...prev,
      { id: folder.folderId, name: folder.folderName },
    ]);
    setSearchQuery('');
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    setHistory((prev) => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 isolate">
        {/* 백드롭 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />

        {/* 모달 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-bg-main w-full max-w-[340px] rounded-2xl shadow-lg overflow-hidden flex flex-col h-[75vh] max-h-[650px] border border-text-main/10 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="px-4 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-bg-main relative">
            <div className="flex items-center justify-start min-w-[40px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 -ml-2 text-text-sub hover:text-text-main rounded-full active:bg-neutral-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[180px]">
              <h2 className="text-base font-bold text-text-main truncate">
                {isSearching
                  ? '검색 결과'
                  : isRoot
                    ? title
                    : currentFolder.name}
              </h2>
            </div>

            <div className="flex items-center justify-end min-w-[40px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAnchor(e.currentTarget);
                }}
                className="p-2 -mr-2 text-text-sub hover:text-text-main rounded-full active:bg-neutral-800 transition-colors"
              >
                <MoreHorizontal size={24} />
              </button>
            </div>
          </div>

          {/* 서치 바 */}
          <div className="px-4 py-2 bg-bg-main border-b border-text-main/10">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
                size={16}
              />
              <input
                type="text"
                placeholder="링크 제목 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-800 border border-text-main/5 rounded-lg py-2.5 pl-9 pr-10 text-sm text-text-main placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-text-main transition-colors p-1 rounded-full"
                  aria-label="검색어 지우기"
                >
                  <CircleX size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 리스트 */}
          <div className="flex-1 min-h-0 bg-bg-main relative flex flex-col">
            {!isRoot && !isSearching && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBack();
                }}
                className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-neutral-800 active:bg-neutral-700 transition-colors border-b border-text-main/10 shrink-0"
              >
                <CornerLeftUp className="text-primary-500" size={20} />
                <div className="text-primary-500 text-sm font-semibold truncate">
                  상위 폴더 ({history[history.length - 2]?.name})
                </div>
              </button>
            )}

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : combinedList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-disabled gap-2 opacity-50">
                <Database size={32} strokeWidth={1.5} />
                <span className="text-sm">항목이 없어요.</span>
              </div>
            ) : (
              <Virtuoso
                style={{ height: '100%' }}
                data={combinedList}
                className="custom-scrollbar"
                itemContent={(index, data) => (
                  <div className="px-2 py-0.5">
                    {data.pType === 'folder' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnterFolder(data);
                        }}
                        className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg hover:bg-neutral-800 active:bg-neutral-700 transition-colors group"
                      >
                        <Folder
                          className="text-yellow-500 fill-yellow-500 shrink-0"
                          size={20}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-text-main truncate text-sm font-medium">
                            {data.folderName}
                          </span>
                          <span className="text-text-sub text-xs">
                            {formatDate(data.createdAt)}
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-text-disabled"
                        />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(data);
                          onClose();
                        }}
                        className="flex items-center justify-between gap-3 px-4 py-3 w-full text-left rounded-lg hover:bg-neutral-800 active:bg-neutral-700 transition-colors group"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-main truncate text-sm font-medium">
                              {data.title}
                            </span>
                            {data.importance && (
                              <Star
                                size={12}
                                className="text-primary-500 fill-primary-500 shrink-0"
                                strokeWidth={2.5}
                                strokeLinejoin="round"
                              />
                            )}
                          </div>
                          <span className="text-text-sub text-xs">
                            {isSearching && data.folderId
                              ? `${data.folderName || '내부'} • `
                              : ''}
                            {formatDate(data.createdAt)}
                          </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-neutral-800 text-text-sub group-hover:bg-primary-500 group-hover:text-white transition-all active:scale-90">
                          <Plus size={16} strokeWidth={3} />
                        </div>
                      </button>
                    )}
                  </div>
                )}
              />
            )}
          </div>
        </motion.div>

        {/* 액션 시트 */}
        <ActionSheet
          isOpen={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          sections={actionSheetSections}
          anchorEl={menuAnchor}
        />
      </div>
    </AnimatePresence>,
    document.body,
  );
}
