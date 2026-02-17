import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MoreHorizontal,
  CircleCheck,
  FilePlus,
  FolderPlus,
} from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useFolders } from '../hooks/useFolders';
import { buildMenu } from '../utils/buildMenu';
import { findFolderNode } from '../utils/findFolderNode';
import { sortData } from '../utils/sortData';
import TabHeader from '../components/common/TabHeader';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import SearchBar from '../components/common/SearchBar';
import SelectionHeader from '../components/common/SelectionHeader';
import ListView from '../components/common/ListView';
import SwipeActionButton from '../components/common/SwipeActionButton';
import Snackbar from '../components/common/Snackbar';
import ActionSheet from '../components/common/ActionSheet';
import InputModal from '../components/common/InputModal';

export default function StoragePage() {
  const { folderId } = useParams();
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const {
    items: currentItems,
    refetch: refetchItems,
    isLoading: isItemsLoading,
    snackbar: itemSnackbar,
    handleDelete: deleteItem,
    handleUndo: undoItemDelete,
    handleGoToCreate: goToCreateItem,
  } = useItems(folderId);

  const {
    folders: rootFolders,
    isLoading: isFoldersLoading,
    snackbar: folderSnackbar,
    handleUpdate: updateFolder,
    handleDelete: deleteFolder,
    handleUndo: undoFolderDelete,
    handleCreate: createFolder,
  } = useFolders();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const isMoreMenuOpen = Boolean(menuAnchor);
  const [sortOption, setSortOption] = useState({
    type: 'name',
    order: 'asc',
  });
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState({
    folders: [],
    items: [],
  });
  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [openedSwipeId, setOpenedSwipeId] = useState(null);

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderRenameModal, setFolderRenameModal] = useState({
    isOpen: false,
    folder: null,
    initialValue: '',
  });

  // 아이템 생성 페이지로 페이지 이동
  const handleCreateItemAction = () => {
    goToCreateItem();
    setMenuAnchor(null);
  };

  // 폴더 생성 모달 열기
  const handleCreateFolderAction = () => {
    setIsCreateFolderModalOpen(true);
    setMenuAnchor(null);
  };

  // 폴더 생성
  const handleCreateFolderSubmit = async (folderName) => {
    if (!folderName.trim()) return;

    const result = await createFolder(folderName);

    if (result.success) {
      setIsCreateFolderModalOpen(false);
    }
  };

  // 선택된 항목 개수
  const totalSelectedCount =
    selectedIds.folders.length + selectedIds.items.length;

  // 선택된 항목 이동
  const handleMoveSelected = () => {
    console.log('이동:', selectedIds);
  };

  const handleDeleteSelected = async () => {
    const { folders: folderIds, items: itemIds } = selectedIds;
    const totalCount = folderIds.length + itemIds.length;

    if (totalCount === 0) return;

    // ID를 기반으로 실제 객체 찾기
    const foldersToDelete = currentFolderChildren.filter((f) =>
      folderIds.includes(f.folderId),
    );
    const itemsToDelete = currentItems.filter((i) =>
      itemIds.includes(i.itemId),
    );

    // 폴더 삭제
    if (foldersToDelete.length > 0) {
      deleteFolder(foldersToDelete);
    }

    // 아이템 삭제
    if (itemsToDelete.length > 0) {
      deleteItem(itemsToDelete);
    }

    // 선택 모드 초기화
    setIsSelectionMode(false);
    setSelectedIds({ folders: [], items: [] });
  };

  // 현재 폴더의 하위 폴더 목록
  const currentFolderChildren = useMemo(() => {
    if (!folderId) return rootFolders;
    const currentNode = findFolderNode(rootFolders, folderId);
    return currentNode?.children || [];
  }, [rootFolders, folderId]);

  // 현재 폴더 이름
  const currentFolderName = useMemo(() => {
    if (!folderId) return '-';
    const node = findFolderNode(rootFolders, folderId);
    return node ? node.folderName : '-';
  }, [rootFolders, folderId]);

  // 아이템 검색 필터
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentItems;

    return currentItems.filter((item) =>
      (item.title ?? '').toLowerCase().includes(q),
    );
  }, [currentItems, searchQuery]);

  // 폴더 검색 필터
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return currentFolderChildren;
    return currentFolderChildren.filter((folder) =>
      folder.folderName.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [currentFolderChildren, searchQuery]);

  // 아이템 중요 표시 필터
  const finalFilteredItems = useMemo(() => {
    if (!showImportantOnly) return filteredItems;
    return filteredItems.filter((item) => item.isImportant);
  }, [filteredItems, showImportantOnly]);

  // 정렬된 아이템
  const sortedItems = useMemo(() => {
    return sortData(finalFilteredItems, sortOption.type, sortOption.order);
  }, [finalFilteredItems, sortOption]);

  // 정렬된 폴더
  const sortedFolders = useMemo(() => {
    return sortData(filteredFolders, sortOption.type, sortOption.order);
  }, [filteredFolders, sortOption]);

  const totalVisibleCount = sortedFolders.length + sortedItems.length;

  // 전체 선택 여부
  const isAllSelected =
    totalVisibleCount > 0 && totalSelectedCount === totalVisibleCount;
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds({ folders: [], items: [] });
    } else {
      setSelectedIds({
        folders: sortedFolders.map((f) => f.folderId),
        items: sortedItems.map((i) => i.itemId),
      });
    }
  };

  // 항목 목록
  const combinedList = useMemo(() => {
    return [...sortedFolders, ...sortedItems];
  }, [sortedFolders, sortedItems]);

  // 폴더 이동 시 데이터 갱신 및 스와이프 초기화
  useEffect(() => {
    refetchItems();
    setOpenedSwipeId(null);
    setSearchQuery('');
  }, [folderId, refetchItems]);

  // 항목 클릭
  const handleNavigate = (entry) => {
    if (entry.itemId) {
      // 아이템이면 아이템 뷰어로 페이지 이동
      navigate(`/view/${entry.itemId}`);
    } else {
      // 폴더면 해당 폴더로 진입
      navigate(`/storage/${entry.folderId}`);
    }
  };

  // 선택 토글
  const handleToggleSelection = (targetId, type) => {
    setSelectedIds((prev) => {
      const list = type === 'item' ? prev.items : prev.folders;
      const isSelected = list.includes(targetId);
      const newList = isSelected
        ? list.filter((id) => id !== targetId)
        : [...list, targetId];

      return {
        ...prev,
        [type === 'item' ? 'items' : 'folders']: newList,
      };
    });
  };

  // 항목 왼쪽 스와이프
  const handleGoToEditAction = (entry) => {
    // 아이템이면 아이템 에디터로 페이지 이동
    if (entry.itemId) {
      navigate(`/edit/${entry.itemId}`);
    } else {
      // 폴더면 폴더 이름 변경 모달 열기
      setFolderRenameModal({
        isOpen: true,
        folder: entry,
        initialValue: entry.folderName || '',
      });
    }
    setOpenedSwipeId(null);
  };

  // 항목 오른쪽 스와이프
  const handleDeleteAction = (entry) => {
    // 아이템이면 아이템 삭제
    if (entry.itemId) {
      deleteItem(entry);
    }
    // 폴더면 폴더 삭제
    else {
      deleteFolder(entry);
    }
    setOpenedSwipeId(null);
  };

  // 폴더 이름 변경 모달 닫기
  const handleCloseRenameModal = () => {
    setFolderRenameModal({
      isOpen: false,
      folder: null,
      initialValue: '',
    });
  };

  // 폴더 이름 변경 제출
  const handleRenameFolderSubmit = async (newName) => {
    if (folderRenameModal.folder && newName.trim()) {
      await updateFolder(folderRenameModal.folder.folderId, newName);
      handleCloseRenameModal();
    }
  };

  // 선택 모드 종료
  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds({ folders: [], items: [] });
  };

  const isLoading = isFoldersLoading || isItemsLoading;

  // 스낵바 상태 병합
  const activeSnackbar = itemSnackbar.isVisible
    ? itemSnackbar
    : folderSnackbar.isVisible
      ? folderSnackbar
      : { isVisible: false, message: '' };

  const handleSnackbarUndoAction = itemSnackbar.isVisible
    ? undoItemDelete
    : undoFolderDelete;

  const actionSheetSections = useMemo(() => {
    return buildMenu({
      // 1. 상단 액션 버튼들 (선택 / 새 링크 / 새 폴더)
      actions: [
        {
          id: 'select',
          label: '선택',
          icon: CircleCheck,
          onClick: () => {
            setIsSelectionMode(true);
            setMenuAnchor(null);
          },
        },
        {
          id: 'createItem',
          label: '새 링크',
          icon: FilePlus,
          onClick: handleCreateItemAction,
        },
        {
          id: 'createFolder',
          label: '새 폴더',
          icon: FolderPlus,
          onClick: handleCreateFolderAction,
        },
      ],

      // 2. 정렬 옵션 및 키 설정
      sortOption,
      setSortOption,
      // [핵심] 이 페이지에서 보여줄 정렬 기준 모두 나열
      sortKeys: ['name', 'createdAt', 'dDay'],

      // 3. 필터 옵션 및 키 설정
      showImportantOnly,
      setShowImportantOnly,
      // [핵심] 이 페이지에서 보여줄 필터 나열
      filterKeys: ['important'],
    });
  }, [sortOption, showImportantOnly]);

  const handleOpenMenu = (e) => {
    setMenuAnchor(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"
      >
        <div className="relative w-full shrink-0">
          {folderId ? (
            <PageHeader
              title={currentFolderName}
              onBackClick={() => navigate(-1)}
            >
              <IconButton
                icon={MoreHorizontal}
                onClick={handleOpenMenu}
                aria-label="더보기"
              />
            </PageHeader>
          ) : (
            <TabHeader title="저장소">
              <IconButton
                icon={MoreHorizontal}
                onClick={handleOpenMenu}
                aria-label="더보기"
              />
            </TabHeader>
          )}
        </div>

        <div className="sticky top-0 z-20 bg-bg-main px-6 pt-4 pb-2">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="폴더 또는 링크 검색"
            mb={isSelectionMode ? 'mb-2' : 'mb-0'} // 여백 최적화
          />

          {isSelectionMode && (
            <div className="pb-1">
              <SelectionHeader
                selectedCount={totalSelectedCount}
                isAllSelected={isAllSelected}
                onToggleAll={handleToggleAll}
                onClose={handleExitSelectionMode}
                onMove={handleMoveSelected}
                onDelete={handleDeleteSelected}
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 pt-3">
          <ListView
            data={combinedList}
            isLoading={isLoading}
            searchQuery={searchQuery}
            openedId={openedSwipeId}
            setOpenedId={setOpenedSwipeId}
            scrollParentRef={scrollRef}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelection={handleToggleSelection}
            onNavigate={handleNavigate}
            renderLeftAction={(entry) => (
              <SwipeActionButton
                type="edit"
                onClick={() => handleGoToEditAction(entry)}
              />
            )}
            renderRightAction={(entry) => (
              <SwipeActionButton
                type="delete"
                onClick={() => handleDeleteAction(entry)}
              />
            )}
            emptyText="폴더가 비어있어요."
          />
        </div>
      </main>

      {/* 폴더 생성 모달 */}
      <InputModal
        isOpen={isCreateFolderModalOpen}
        title="새 폴더 생성"
        placeholder="폴더 이름을 입력하세요"
        initialValue=""
        onClose={() => setIsCreateFolderModalOpen(false)}
        onSubmit={handleCreateFolderSubmit}
        submitText="생성"
        cancelText="취소"
      />

      {/* 폴더 이름 변경 모달 */}
      <InputModal
        isOpen={folderRenameModal.isOpen}
        title="폴더 이름 변경"
        placeholder="폴더 이름을 입력하세요"
        initialValue={folderRenameModal.initialValue}
        onClose={handleCloseRenameModal}
        onSubmit={handleRenameFolderSubmit}
        submitText="확인"
        cancelText="취소"
      />

      <Snackbar
        isVisible={activeSnackbar.isVisible}
        message={activeSnackbar.message}
        onUndo={handleSnackbarUndoAction}
      />

      <ActionSheet
        isOpen={isMoreMenuOpen}
        onClose={handleCloseMenu}
        sections={actionSheetSections}
        anchorEl={menuAnchor}
      />
    </div>
  );
}
