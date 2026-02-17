import { useState, useEffect, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import {
  X,
  Folder,
  MoreHorizontal,
  FolderPlus,
  CornerLeftUp,
} from 'lucide-react';
import { getFolders, createFolder } from '../../api/folderApi';
import { buildMenu } from '../../utils/buildMenu';
import { findFolderNode } from '../../utils/findFolderNode';
import { formatDate } from '../../utils/formatDate';
import { sortData } from '../../utils/sortData';
import LoadingSpinner from './LoadingSpinner';
import InputModal from './InputModal';
import ActionSheet from './ActionSheet';

export default function FolderPicker({
  isOpen,
  onClose,
  onSelect,
  title = '위치 선택',
}) {
  const [rootFolders, setRootFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [history, setHistory] = useState([{ id: null, name: '저장소 최상위' }]);
  const [isLoading, setIsLoading] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [sortOption, setSortOption] = useState({
    type: 'name',
    order: 'asc',
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentFolderId(null);
      setHistory([{ id: null, name: '저장소 최상위' }]);
      fetchFolderTree();
    }
  }, [isOpen]);

  const fetchFolderTree = async () => {
    setIsLoading(true);
    try {
      const data = await getFolders();
      setRootFolders(data);
    } catch (error) {
      console.error('폴더 목록 로딩 실패:', error);
      setRootFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentViewFolders = useMemo(() => {
    let folders = [];
    if (currentFolderId === null) {
      folders = rootFolders;
    } else {
      const node = findFolderNode(rootFolders, currentFolderId);
      folders = node?.children || [];
    }
    return sortData([...folders], sortOption.type, sortOption.order);
  }, [rootFolders, currentFolderId, sortOption]);

  const handleEnterFolder = (folder) => {
    setHistory((prev) => [
      ...prev,
      { id: folder.folderId, name: folder.folderName },
    ]);
    setCurrentFolderId(folder.folderId);
  };

  // 상위 폴더로 가기
  const handleBack = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    const prevFolder = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setCurrentFolderId(prevFolder.id);
  };

  const handleConfirm = () => {
    onSelect(currentFolderId);
    onClose();
  };

  const handleOpenMenu = (e) => setMenuAnchor(e.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setMenuAnchor(null);
  };

  const handleCreateFolderSubmit = async (folderName) => {
    if (!folderName.trim()) return;
    try {
      await createFolder(folderName, currentFolderId);
      await fetchFolderTree();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('폴더 생성 실패:', error);
      alert('폴더를 생성하는 데에 실패했어요.');
    }
  };

  const actionSheetSections = useMemo(() => {
    return buildMenu({
      actions: [
        {
          id: 'createFolder',
          label: '새 폴더 생성',
          icon: FolderPlus,
          onClick: handleOpenCreateModal,
        },
      ],
      sortOption,
      setSortOption,
      sortKeys: ['name', 'createdAt'],
      filterKeys: [],
    });
  }, [sortOption]);

  if (!isOpen) return null;

  const currentFolderName = history[history.length - 1].name;
  const isRoot = history.length <= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-bg-main w-[90%] max-w-[360px] mx-auto rounded-xl shadow-2xl overflow-hidden flex flex-col h-[65vh] max-h-[600px] border border-neutral-800 animate-scale-in">
        {/* 헤더 */}
        <div className="px-4 h-14 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/50 relative">
          {/* 닫기 버튼 */}
          <div className="flex items-center justify-start min-w-[40px]">
            <button
              onClick={onClose}
              className="p-1 -ml-1 text-text-sub hover:text-text-main rounded-full transition-colors"
              aria-label="닫기"
            >
              <X size={24} />
            </button>
          </div>

          {/* 폴더 이름 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[180px]">
            <h2 className="text-base font-bold text-text-main truncate w-full">
              {isRoot ? title : currentFolderName}
            </h2>
          </div>

          {/* 더보기 */}
          <div className="flex items-center justify-end min-w-[40px]">
            <button
              onClick={handleOpenMenu}
              className="p-1 -mr-1 text-text-sub hover:text-text-main rounded-full transition-colors"
              aria-label="더보기"
            >
              <MoreHorizontal size={24} />
            </button>
          </div>
        </div>

        {/* 바디 */}
        <div className="flex-1 min-h-0 bg-bg-main relative flex flex-col">
          {/* 상위 폴더 이동 버튼 */}
          {!isRoot && (
            <button
              onClick={handleBack}
              className="flex items-center gap-3 px-5 py-3 w-full text-left hover:bg-neutral-800 transition-colors border-b border-neutral-800/50 shrink-0"
            >
              <CornerLeftUp className="text-primary-500 shrink-0" size={20} />
              <div className="flex items-center text-primary-500 text-sm font-semibold min-w-0 flex-1">
                <span className="whitespace-nowrap">상위 폴더로 이동 (</span>
                <span className="truncate block">
                  {history[history.length - 2]?.name}
                </span>
                <span className="whitespace-nowrap">)</span>
              </div>
            </button>
          )}

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : currentViewFolders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-text-disabled gap-2 opacity-50">
              <span className="text-sm">하위 폴더가 없어요.</span>
            </div>
          ) : (
            <Virtuoso
              style={{ height: '100%' }}
              data={currentViewFolders}
              className="custom-scrollbar"
              itemContent={(index, folder) => (
                <div className="px-2 py-1">
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
                      <span className="text-text-sub text-xs truncate">
                        {formatDate(folder.createdAt)}
                      </span>
                    </div>

                    {folder.children && folder.children.length > 0 && (
                      <span className="text-xs text-text-disabled shrink-0 bg-neutral-800 px-1.5 py-0.5 rounded">
                        {folder.children.length}
                      </span>
                    )}
                  </button>
                </div>
              )}
            />
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-neutral-800 bg-bg-main shrink-0">
          <button
            onClick={handleConfirm}
            className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-text-main font-bold py-3 rounded-lg transition-colors shadow-lg shadow-primary-500/20 px-4"
          >
            <div className="flex items-center justify-center min-w-0">
              {currentFolderId === null ? (
                <span>저장소 최상위에 저장</span>
              ) : (
                <>
                  <span className="whitespace-nowrap">'</span>
                  <span className="truncate max-w-[150px] xs:max-w-[200px] block">
                    {currentFolderName}
                  </span>
                  <span className="whitespace-nowrap">'에 저장</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <ActionSheet
        isOpen={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        sections={actionSheetSections}
        anchorEl={menuAnchor}
      />

      <InputModal
        isOpen={isCreateModalOpen}
        title="새 폴더 생성"
        placeholder="폴더 이름을 입력하세요."
        initialValue=""
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFolderSubmit}
        submitText="생성"
        cancelText="취소"
      />
    </div>
  );
}
