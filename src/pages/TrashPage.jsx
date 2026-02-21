import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, MoreHorizontal, Trash2 } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useFolders } from '../hooks/useFolders';
import { buildMenu } from '../utils/buildMenu';
import { sortData } from '../utils/sortData';
import { useModalStore } from '../store/useModalStore';
import ActionSheet from '../components/common/ActionSheet';
import IconButton from '../components/common/IconButton';
import ListView from '../components/common/ListView';
import PageHeader from '../components/common/PageHeader';
import SearchBar from '../components/common/SearchBar';
import SelectionHeader from '../components/common/SelectionHeader';
import SwipeActionButton from '../components/common/SwipeActionButton';

export default function TrashPage() {
  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const { openConfirm, openAlert } = useModalStore();

  const {
    items: mixedData,
    isLoading,
    handleRestore: restoreItem,
    handleDeletePermanently: deleteItemPerm,
    handleEmptyTrash: emptyItemTrash,
    handleGoToView,
    refetch: refetchAll,
  } = useItems('trash');

  const {
    handleRestore: restoreFolder,
    handleDeletePermanently: deleteFolderPerm,
  } = useFolders();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);

  // 기본 정렬 옵션
  const [sortOption, setSortOption] = useState({
    type: 'deletedAt',
    order: 'desc',
  });

  const [showImportantOnly, setShowImportantOnly] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState({
    folders: [],
    items: [],
  });
  const [openedSwipeId, setOpenedSwipeId] = useState(null);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // 데이터 매핑
  const { folders, items } = useMemo(() => {
    const foldersList = [];
    const itemsList = [];

    if (Array.isArray(mixedData)) {
      mixedData.forEach((entry) => {
        const isFolder = entry.type === 'FOLDER';
        const isItem = entry.type === 'ITEM';

        if (isFolder) {
          foldersList.push({
            ...entry,
            folderId: entry.id,
            folderName: entry.title || '이름 없음',
            importance: entry.importance === true,
          });
        } else if (isItem) {
          itemsList.push({
            ...entry,
            itemId: entry.id,
            title: entry.title || '제목 없음',
            importance: entry.importance === true,
          });
        }
      });
    }

    return { folders: foldersList, items: itemsList };
  }, [mixedData]);

  // 폴더 복원
  const handleRestoreFolderAction = async (foldersToRestore) => {
    const result = await restoreFolder(foldersToRestore);
    if (result && result.success) refetchAll();
  };

  // 폴더 영구 삭제
  const handleDeleteFolderPermAction = async (foldersToDelete) => {
    const result = await deleteFolderPerm(foldersToDelete);
    if (result && result.success) refetchAll();
  };

  // 아이템 복원
  const handleRestoreItemAction = async (itemsToRestore) => {
    const result = await restoreItem(itemsToRestore);
    if (result && result.success) refetchAll();
  };

  // 아이템 영구 삭제
  const handleDeleteItemPermAction = async (itemsToDelete) => {
    const result = await deleteItemPerm(itemsToDelete);
    if (result && result.success) refetchAll();
  };

  // 필터링된 폴더
  const filteredFolders = useMemo(() => {
    let result = folders;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((f) => f.folderName.toLowerCase().includes(q));
    }
    return result;
  }, [folders, searchQuery]);

  // 필터링된 아이템
  const filteredItems = useMemo(() => {
    let result = items;
    const q = searchQuery.trim().toLowerCase();
    if (q) result = result.filter((i) => i.title?.toLowerCase().includes(q));
    if (showImportantOnly) result = result.filter((i) => i.importance);
    return result;
  }, [items, searchQuery, showImportantOnly]);

  // 정렬된 폴더
  const sortedFolders = useMemo(
    () => sortData(filteredFolders, sortOption.type, sortOption.order),
    [filteredFolders, sortOption],
  );

  // 정렬된 아이템
  const sortedItems = useMemo(
    () => sortData(filteredItems, sortOption.type, sortOption.order),
    [filteredItems, sortOption],
  );

  // 정렬된 항목
  const combinedList = useMemo(
    () => [...sortedFolders, ...sortedItems],
    [sortedFolders, sortedItems],
  );

  const totalSelectedCount =
    selectedIds.folders.length + selectedIds.items.length;
  const isAllSelected =
    combinedList.length > 0 && totalSelectedCount === combinedList.length;

  // 개별 선택 토글
  const handleToggleSelection = (targetId, type) => {
    setSelectedIds((prev) => {
      const key = type === 'item' ? 'items' : 'folders';
      const isSelected = prev[key].includes(targetId);
      return {
        ...prev,
        [key]: isSelected
          ? prev[key].filter((id) => id !== targetId)
          : [...prev[key], targetId],
      };
    });
  };

  // 전체 선택 토글
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

  // 선택된 항목 복원
  const handleRestoreSelected = async () => {
    if (totalSelectedCount === 0) return;
    const { folders: folderIds, items: itemIds } = selectedIds;

    const foldersToRestore = folders.filter((f) =>
      folderIds.includes(f.folderId),
    );
    const itemsToRestore = items.filter((i) => itemIds.includes(i.itemId));

    const promises = [];
    if (foldersToRestore.length > 0)
      promises.push(handleRestoreFolderAction(foldersToRestore));
    if (itemsToRestore.length > 0)
      promises.push(handleRestoreItemAction(itemsToRestore));

    await Promise.all(promises);
    setIsSelectionMode(false);
    setSelectedIds({ folders: [], items: [] });
  };

  // 선택된 항목 영구 삭제
  const handleDeleteSelectedPermanently = async () => {
    if (totalSelectedCount === 0) return;

    openConfirm({
      title: '선택 항목 영구 삭제',
      message:
        '선택한 항목을 영구적으로 삭제할까요? 이 작업은 되돌릴 수 없어요.',
      confirmText: '영구 삭제',
      isDanger: true,
      onConfirm: async () => {
        try {
          const { folders: folderIds, items: itemIds } = selectedIds;
          const foldersToDelete = folders.filter((f) =>
            folderIds.includes(f.folderId),
          );
          const itemsToDelete = items.filter((i) => itemIds.includes(i.itemId));

          const promises = [];
          if (foldersToDelete.length > 0)
            promises.push(handleDeleteFolderPermAction(foldersToDelete));
          if (itemsToDelete.length > 0)
            promises.push(handleDeleteItemPermAction(itemsToDelete));

          await Promise.all(promises);
          setIsSelectionMode(false);
          setSelectedIds({ folders: [], items: [] });
        } catch (error) {
          openAlert({
            title: '영구 삭제 실패',
            message:
              '선택한 항목을 영구 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
            isDanger: true,
          });
        }
      },
    });
  };

  // 휴지통 비우기
  const handleEmptyTrashAction = async () => {
    openConfirm({
      title: '휴지통 비우기',
      message:
        '휴지통에 있는 모든 항목을 비울까요? 이 작업은 되돌릴 수 없어요.',
      confirmText: '비우기',
      isDanger: true,
      onConfirm: async () => {
        try {
          await emptyItemTrash();
          refetchAll();
          setMenuAnchor(null);
        } catch (error) {
          openAlert({
            title: '오류',
            message:
              '휴지통을 비우는 중 오류가 발생했어요. 다시 시도해 주세요.',
            isDanger: true,
          });
        }
      },
    });
  };

  // 항목 클릭
  const handleNavigate = (entry) => {
    if (entry.itemId) {
      openAlert({
        title: '링크 열기 불가',
        message:
          '휴지통에 있는 링크는 열 수 없어요. 내용을 확인하려면 먼저 복원해주세요.',
        confirmText: '확인',
      });
    } else {
      openAlert({
        title: '폴더 열기 불가',
        message:
          '휴지통에 있는 폴더는 열 수 없어요. 내용을 확인하려면 먼저 복원해주세요.',
        confirmText: '확인',
      });
    }
  };

  // 액션 시트
  const actionSheetSections = useMemo(() => {
    return buildMenu({
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
          id: 'emptyTrash',
          label: '휴지통 비우기',
          icon: Trash2,
          textColor: 'text-red-500',
          onClick: handleEmptyTrashAction,
        },
      ],
      sortOption,
      setSortOption,
      sortKeys: ['deletedAt', 'name', 'createdAt', 'dDay'],
      showImportantOnly,
      setShowImportantOnly,
      filterKeys: ['important'],
    });
  }, [sortOption, showImportantOnly]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"
      >
        <div className="relative w-full shrink-0">
          <PageHeader
            title="휴지통"
            iconType="close"
            onBack={() => navigate(-1)}
            collapseBottomGap
          >
            <IconButton
              icon={MoreHorizontal}
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              disabled={isSelectionMode}
              aria-label="더보기"
            />
          </PageHeader>
        </div>

        <div className="sticky top-0 z-20 bg-bg-main px-6 pt-4 pb-4">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="삭제된 항목 검색"
            mb={isSelectionMode ? 'mb-1' : 'mb-0'}
          />

          {isSelectionMode && (
            <SelectionHeader
              selectedCount={totalSelectedCount}
              isAllSelected={isAllSelected}
              onToggleAll={handleToggleAll}
              onClose={() => {
                setIsSelectionMode(false);
                setSelectedIds({ folders: [], items: [] });
              }}
              mode="trash"
              onMove={handleRestoreSelected}
              onDelete={handleDeleteSelectedPermanently}
            />
          )}
        </div>

        <div className="flex-1 min-h-0">
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
            renderLeftAction={(entry, dragX) => (
              <SwipeActionButton
                type="restore"
                x={dragX}
                direction="left"
                onClick={async () => {
                  if (entry.folderId) {
                    await handleRestoreFolderAction([entry]);
                  } else {
                    await handleRestoreItemAction([entry]);
                  }
                  setOpenedSwipeId(null);
                }}
              />
            )}
            renderRightAction={(entry, dragX) => (
              <SwipeActionButton
                type="delete"
                x={dragX}
                direction="right"
                onClick={() => {
                  setOpenedSwipeId(null);
                  const rawName =
                    entry.title || entry.folderName || '이름 없음';
                  const entryName =
                    rawName.length > 15
                      ? `${rawName.slice(0, 15)}...`
                      : rawName;

                  openConfirm({
                    title: '영구 삭제',
                    message: `'${entryName}' 항목을 영구적으로 삭제할까요? 이 작업은 되돌릴 수 없어요.`,
                    confirmText: '영구 삭제',
                    isDanger: true,
                    onConfirm: async () => {
                      try {
                        if (entry.folderId) {
                          await handleDeleteFolderPermAction([entry]);
                        } else {
                          await handleDeleteItemPermAction([entry]);
                        }
                      } catch (error) {
                        openAlert({
                          title: '삭제 실패',
                          message: `'${entryName}' 항목을 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.`,
                          isDanger: true,
                        });
                      }
                    },
                  });
                }}
              />
            )}
            emptyText="휴지통이 비어있어요."
          />
        </div>
      </main>

      <ActionSheet
        isOpen={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        sections={actionSheetSections}
        anchorEl={menuAnchor}
      />
    </div>
  );
}
