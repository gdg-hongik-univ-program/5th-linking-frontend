import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getItems, emptyTrash } from '../api/itemApi';
import { useItemCommon } from './useItemCommon';
import { useModalStore } from '../store/useModalStore';

export const useItems = (
  folderId = null,
  filterType = null,
  keyword = null,
  options = {},
) => {
  const navigate = useNavigate();

  const location = useLocation();

  const { openAlert } = useModalStore();

  const {
    handleMove: commonMove,
    handleRestore: commonRestore,
    handleDelete: commonDelete,
    handleDeletePermanently: commonDeletePermanently,
    handleGoToEdit: commonEdit,
  } = useItemCommon();

  const enabled = options.enabled ?? true;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });

  const deleteTimerRef = useRef(null);
  const pendingDeleteRef = useRef(null);
  const commonDeleteRef = useRef(commonDelete);
  const executeActualDeleteRef = useRef();

  // 스낵바 보이기
  const showSnackbar = (message) => {
    setSnackbar({ isVisible: true, message });
  };

  // 스낵바 가리기
  const hideSnackbar = () => {
    setSnackbar({ isVisible: false, message: '' });
  };

  // 아이템 다수 조회
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let apiFolderId = folderId;
      let apiFilter = filterType;
      let apiKeyword = keyword;

      if (typeof folderId === 'string' && isNaN(Number(folderId))) {
        apiFolderId = null;
        apiFilter = folderId;
      }

      const data = await getItems(apiFolderId, apiFilter, apiKeyword);
      let result = Array.isArray(data) ? data : [];

      if (!apiFolderId && !apiFilter && !apiKeyword) {
        result = result.filter((item) => !item.folderId);
      }

      setItems(result);
    } catch (error) {
      console.error('아이템 조회 실패:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, filterType, keyword]);

  useEffect(() => {
    if (!enabled) return;
    fetchItems();
  }, [fetchItems, location.key, enabled]);

  // 스크롤 시 아이템 스와이프 닫기
  useEffect(() => {
    const handleGlobalClose = () => setOpenedItemId(null);
    window.addEventListener('scroll', handleGlobalClose, true);
    return () => window.removeEventListener('scroll', handleGlobalClose, true);
  }, []);

  // 언마운트 시 대기 중인 삭제 즉시 실행
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current && pendingDeleteRef.current) {
        clearTimeout(deleteTimerRef.current);
        if (executeActualDeleteRef.current) {
          executeActualDeleteRef.current();
        }
      }
    };
  }, []);

  // 아이템 삭제 클린업
  const clearDeleteState = () => {
    hideSnackbar();
    deleteTimerRef.current = null;
    pendingDeleteRef.current = null;
  };

  // commonDelete 클린업
  useEffect(() => {
    commonDeleteRef.current = commonDelete;
  }, [commonDelete]);

  // 아이템 실제 삭제
  const executeActualDelete = useCallback(
    async (options = { showError: true }) => {
      if (!pendingDeleteRef.current) return;

      const { items: deletedItems, itemsWithIndex } = pendingDeleteRef.current;
      const itemIds = deletedItems.map((item) => item.itemId);

      const result = await commonDelete(itemIds);

      if (!result.success) {
        if (options.showError) {
          openAlert({
            title: '링크 삭제 실패',
            message:
              '링크를 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
            isDanger: true,
          });
        }
        setItems((prev) => {
          const newList = [...prev];
          itemsWithIndex
            .sort((a, b) => a.index - b.index)
            .forEach(({ item, index }) => {
              newList.splice(index, 0, item);
            });
          return newList;
        });
      }

      clearDeleteState();
    },
    [commonDelete, openAlert],
  );

  // 아이템 실제 삭제 클린업
  useEffect(() => {
    executeActualDeleteRef.current = executeActualDelete;
  }, [executeActualDelete]);

  // 아이템 이동
  const handleMove = async (
    itemsOrItem,
    targetFolderId,
    options = { showError: true },
  ) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];

    const result = await commonMove(itemIds, targetFolderId);
    if (result.success) {
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    } else {
      if (options.showError) {
        openAlert({
          title: '링크 이동 실패',
          message: '링크를 이동하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
    }
    return result;
  };

  // 아이템 삭제
  const handleDelete = (itemsOrItem) => {
    const itemsToDelete = Array.isArray(itemsOrItem)
      ? itemsOrItem
      : [itemsOrItem];

    // 이미 삭제 대기 중인 것이 있다면 즉시 삭제
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    const itemsWithIndex = itemsToDelete.map((item) => ({
      item,
      index: items.findIndex((i) => i.itemId === item.itemId),
    }));

    // 복구용 데이터 저장
    pendingDeleteRef.current = { items: itemsToDelete, itemsWithIndex };

    const itemIdsToRemove = itemsToDelete.map((item) => item.itemId);
    setItems((prev) => prev.filter((i) => !itemIdsToRemove.includes(i.itemId)));

    const message =
      itemsToDelete.length === 1
        ? '링크를 삭제했어요.'
        : `${itemsToDelete.length}개의 링크를 삭제했어요.`;
    showSnackbar(message);

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000);
  };

  // 아이템 삭제 취소
  const handleUndo = () => {
    if (!pendingDeleteRef.current) return;

    clearTimeout(deleteTimerRef.current);
    const { itemsWithIndex } = pendingDeleteRef.current;

    setItems((prev) => {
      const newList = [...prev];
      itemsWithIndex
        .sort((a, b) => a.index - b.index)
        .forEach(({ item, index }) => {
          newList.splice(index, 0, item);
        });
      return newList;
    });

    clearDeleteState();
  };

  // 아이템 복원
  const handleRestore = async (itemsOrItem, options = { showError: true }) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];

    const result = await commonRestore(itemIds);
    if (result.success) {
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    } else {
      if (options.showError) {
        openAlert({
          title: '링크 복원 실패',
          message: '링크를 복원하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
    }
    return result;
  };

  // 아이템 영구 삭제
  const handleDeletePermanently = async (
    itemsOrItem,
    options = { showError: true },
  ) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];
    const result = await commonDeletePermanently(itemIds);
    if (result.success) {
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    } else {
      if (options.showError) {
        openAlert({
          title: '링크 영구 삭제 실패',
          message:
            '링크를 영구 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
    }
    return result;
  };

  // 아이템 휴지통 비우기
  const handleEmptyTrash = async (options = { showError: true }) => {
    try {
      await emptyTrash();
      setItems([]);
      return { success: true };
    } catch (error) {
      if (options.showError) {
        openAlert({
          title: '휴지통 비우기 실패',
          message: '휴지통을 비우는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 아이템 보기 페이지로 이동
  const handleGoToView = (itemId) => {
    if (itemId) navigate(`/view/${itemId}`);
  };

  // 아이템 수정 페이지로 이동
  const handleGoToEdit = (itemId) => {
    if (itemId) commonEdit(itemId);
  };

  // 아이템 생성 페이지로 이동
  const handleGoToCreate = () => {
    const targetFolderId =
      folderId && !isNaN(Number(folderId)) ? folderId : null;

    if (targetFolderId) navigate(`/create?folderId=${targetFolderId}`);
    else navigate('/create');
  };

  return {
    items,
    isLoading,
    openedItemId,
    setOpenedItemId,
    snackbar,
    refetch: fetchItems,
    handleMove,
    handleDelete,
    handleUndo,
    handleRestore,
    handleDeletePermanently,
    handleEmptyTrash,
    handleGoToView,
    handleGoToEdit,
    handleGoToCreate,
  };
};
