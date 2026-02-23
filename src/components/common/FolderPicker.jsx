import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Folder,
  FolderPlus,
  CornerLeftUp,
  ChevronRight,
  Search,
  Database,
  MoreHorizontal,
  CircleX,
} from 'lucide-react';
import { useFolders } from '../../hooks/useFolders';
import { buildMenu } from '../../utils/buildMenu';
import { findFolderNode } from '../../utils/findFolderNode';
import { formatDate } from '../../utils/formatDate';
import { sortData } from '../../utils/sortData';
import { useModalStore } from '../../store/useModalStore';
import ActionSheet from './ActionSheet';
import InputModal from './InputModal';
import LoadingSpinner from './LoadingSpinner';

export default function FolderPicker({
  isOpen,
  onClose,
  onSelect,
  title = '저장할 위치 선택',
}) {
  const { folders, isLoading, refetch, handleCreate } = useFolders();
  const rootFolders = folders || [];

  const [history, setHistory] = useState([{ id: null, name: '저장소 최상위' }]);
  const [searchQuery, setSearchQuery] = useState('');

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [sortOption, setSortOption] = useState({ type: 'name', order: 'asc' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentFolder = history[history.length - 1];
  const isRoot = history.length === 1;
  const isSearching = searchQuery.trim().length > 0;

  const { openAlert } = useModalStore();

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
    } else {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
      document.body.style.overflow = 'unset';
    }
    return () => {
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 데이터 불러오기
  useEffect(() => {
    if (isOpen) {
      setHistory([{ id: null, name: '저장소 최상위' }]);
      setSearchQuery('');
      if (refetch) refetch();
    }
  }, [isOpen, refetch]);

  // 평면화된 트리
  const flattenedFolders = useMemo(() => {
    const result = [];
    const recurse = (nodes) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children) recurse(node.children);
      });
    };
    recurse(rootFolders);
    return result;
  }, [rootFolders]);

  // 뷰 데이터
  const viewFolders = useMemo(() => {
    let folders = [];
    if (isSearching) {
      folders = flattenedFolders.filter((f) =>
        (f.folderName || '').toLowerCase().includes(searchQuery.toLowerCase()),
      );
    } else {
      if (currentFolder.id === null) {
        folders = rootFolders;
      } else {
        const node = findFolderNode(rootFolders, currentFolder.id);
        folders = node?.children || [];
      }
    }
    return sortData([...folders], sortOption.type, sortOption.order);
  }, [
    isSearching,
    searchQuery,
    currentFolder,
    rootFolders,
    flattenedFolders,
    sortOption,
  ]);

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

  const handleCreateFolderSubmit = async (folderName) => {
    if (!folderName.trim()) return;
    try {
      if (handleCreate) {
        await handleCreate(folderName, currentFolder.id);
      }
      if (refetch) await refetch();
      setIsCreateModalOpen(false);
    } catch (error) {
      openAlert({
        title: '폴더 생성 실패',
        message: '폴더를 생성하는 중 오류가 발생했어요. 다시 시도해 주세요.',
        isDanger: true,
        confirmText: '확인',
      });
    }
  };

  const actionSheetSections = useMemo(() => {
    return buildMenu({
      actions: [
        {
          id: 'createFolder',
          label: '새 폴더 생성',
          icon: FolderPlus,
          onClick: () => {
            setIsCreateModalOpen(true);
            setMenuAnchor(null);
          },
        },
      ],
      sortOption,
      setSortOption,
      sortKeys: ['name', 'createdAt'],
      filterKeys: [],
    });
  }, [sortOption]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 isolate">
        {/* 백드롭 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={onClose}
        />

        {/* 모달 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-bg-main w-full max-w-[340px] rounded-2xl shadow-lg overflow-hidden flex flex-col h-[75vh] max-h-[600px] border border-text-main/10 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="px-4 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-bg-main relative">
            <div className="flex items-center justify-start min-w-[40px]">
              <button
                onClick={onClose}
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
                onClick={(e) => setMenuAnchor(e.currentTarget)}
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
                placeholder="폴더 이름 검색"
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
                onClick={handleBack}
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
            ) : viewFolders.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-disabled gap-2 opacity-50">
                <Database size={32} strokeWidth={1.5} />
                <span className="text-sm">폴더가 없어요.</span>
              </div>
            ) : (
              <Virtuoso
                style={{ height: '100%' }}
                data={viewFolders}
                className="custom-scrollbar"
                itemContent={(index, folder) => (
                  <div className="px-2 py-0.5">
                    <button
                      onClick={() => handleEnterFolder(folder)}
                      className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg hover:bg-neutral-800 active:bg-neutral-700 transition-colors group"
                    >
                      <Folder
                        className="text-yellow-500 fill-yellow-500 shrink-0"
                        size={20}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-text-main truncate text-sm font-medium">
                          {folder.folderName}
                        </span>
                        <span className="text-text-sub text-xs">
                          {formatDate(folder.createdAt)}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  </div>
                )}
              />
            )}
          </div>

          {/* 푸터 (저장 버튼 유지) */}
          <div className="p-4 border-t border-text-main/10 bg-bg-main shrink-0">
            <button
              onClick={() => {
                onSelect(currentFolder.id);
                onClose();
              }}
              className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-bg-main font-bold py-3 rounded-lg transition-colors shadow-lg shadow-primary-500/20 px-4"
            >
              <div className="truncate min-w-0">
                {currentFolder.id === null ? (
                  <span>저장소 최상위에 저장</span>
                ) : (
                  <span>'{currentFolder.name}'에 저장</span>
                )}
              </div>
            </button>
          </div>
        </motion.div>

        {/* 액션 시트 */}
        <div className="z-[2100]">
          <ActionSheet
            isOpen={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            sections={actionSheetSections}
            anchorEl={menuAnchor}
          />
        </div>

        {/* 인풋 모달 */}
        <InputModal
          isOpen={isCreateModalOpen}
          title="새 폴더 생성"
          placeholder="폴더 이름 입력"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateFolderSubmit}
          submitText="생성"
          cancelText="취소"
        />
      </div>
    </AnimatePresence>,
    document.body,
  );
}
