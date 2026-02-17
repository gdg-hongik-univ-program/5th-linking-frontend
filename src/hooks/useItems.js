import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getItems, emptyTrash } from '../api/itemApi';
import { useItemCommon } from './useItemCommon';

export const useItems = (folderId = null, filterType = null) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    handleMove: commonMove,
    handleRestore: commonRestore,
    handleDelete: commonDelete,
    handleDeletePermanently: commonDeletePermanently,
    handleGoToEdit: commonEdit,
  } = useItemCommon();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });

  const deleteTimerRef = useRef(null);
  const pendingDeleteRef = useRef(null);
  const commonDeleteRef = useRef(commonDelete);

  // commonDelete 클린업
  useEffect(() => {
    commonDeleteRef.current = commonDelete;
  }, [commonDelete]);

  const showSnackbar = (message) => {
    setSnackbar({ isVisible: true, message });
  };

  const hideSnackbar = () => {
    setSnackbar({ isVisible: false, message: '' });
  };

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let apiFolderId = folderId;
      let apiFilter = filterType;

      // folderId 자리에 filter 문자열이 오는 경우 대응
      if (typeof folderId === 'string' && isNaN(Number(folderId))) {
        apiFolderId = null;
        apiFilter = folderId;
      }

      const data = await getItems(apiFolderId, apiFilter);
      let result = Array.isArray(data) ? data : [];

      // filter도 folderId도 없는 경우: root(미분류)만
      if (!apiFolderId && !apiFilter) {
        result = result.filter((item) => !item.folderId);
      }

      setItems(result);
    } catch (error) {
      console.error('아이템 조회 실패:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, filterType]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, location.key]);

  // 스크롤 시 아이템 닫기
  useEffect(() => {
    const handleGlobalClose = () => setOpenedItemId(null);
    window.addEventListener('scroll', handleGlobalClose, true);
    return () => window.removeEventListener('scroll', handleGlobalClose, true);
  }, []);

  // 언마운트 시 대기중 삭제 즉시 실행
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current && pendingDeleteRef.current) {
        clearTimeout(deleteTimerRef.current);
        const { items: deletedItems } = pendingDeleteRef.current;
        const itemIds = deletedItems.map((item) => item.itemId);
        commonDeleteRef.current(itemIds);
      }
    };
  }, []);

  const clearDeleteState = () => {
    hideSnackbar();
    deleteTimerRef.current = null;
    pendingDeleteRef.current = null;
  };

  const executeActualDelete = useCallback(async () => {
    if (!pendingDeleteRef.current) return;

    const { items: deletedItems, itemsWithIndex } = pendingDeleteRef.current;
    const itemIds = deletedItems.map((item) => item.itemId);

    const result = await commonDelete(itemIds);

    if (!result.success) {
      alert('링크를 삭제하는 데에 실패했어요.');
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
  }, [commonDelete]);

  const handleMove = async (itemsOrItem, targetFolderId) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];

    const result = await commonMove(itemIds, targetFolderId);
    if (result.success) {
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    } else {
      alert('링크를 옮기는 데에 실패했어요.');
    }
    return result;
  };

  const handleDelete = (itemsOrItem) => {
    const itemsToDelete = Array.isArray(itemsOrItem) ? itemsOrItem : [itemsOrItem];

    // 기존 타이머가 있을 시 즉시 삭제
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    const itemsWithIndex = itemsToDelete.map((item) => ({
      item,
      index: items.findIndex((i) => i.itemId === item.itemId),
    }));

    pendingDeleteRef.current = { items: itemsToDelete, itemsWithIndex };

    const itemIdsToRemove = itemsToDelete.map((item) => item.itemId);
    setItems((prev) => prev.filter((i) => !itemIdsToRemove.includes(i.itemId)));

    showSnackbar(
      itemsToDelete.length === 1
        ? '링크를 삭제했어요.'
        : `${itemsToDelete.length}개의 링크를 삭제했어요.`,
    );

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000);
  };

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

  const handleRestore = async (itemsOrItem) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];

    const result = await commonRestore(itemIds);
    if (result.success) {
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    } else {
      alert('링크를 복원하는 데에 실패했어요.');
    }
    return result;
  };

  const handleDeletePermanently = async (itemsOrItem) => {
    if (
      !window.confirm(
        '링크를 영구적으로 삭제할까요? 한 번 영구적으로 삭제하면 되돌릴 수 없어요.',
      )
    ) {
      return { success: false };
    }

    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];

    const result = await commonDeletePermanently(itemIds);
    if (result.success) {
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    } else {
      alert('링크를 영구적으로 삭제하는 데에 실패했어요.');
    }
    return result;
  };

  const handleEmptyTrash = async () => {
    if (
      !window.confirm(
        '휴지통에 있는 모든 항목들을 비울까요? 한 번 영구적으로 삭제하면 되돌릴 수 없어요.',
      )
    ) {
      return { success: false };
    }
    try {
      await emptyTrash();
      setItems([]);
      return { success: true };
    } catch (error) {
      console.error('휴지통 비우기 실패:', error);
      alert('휴지통을 비우는 데에 실패했어요.');
      return { success: false, error };
    }
  };

  const handleGoToView = (itemId) => {
    if (itemId) navigate(`/view/${itemId}`);
  };

  const handleGoToEdit = (itemId) => {
    if (itemId) commonEdit(itemId);
  };

  const handleGoToCreate = () => {
    const targetFolderId =
      folderId && !isNaN(Number(folderId)) ? folderId : null;

    if (targetFolderId) navigate(`/create?folderId=${targetFolderId}`);
    else navigate('/create');
  };

  return {
    items,
    isLoading,
    loading: isLoading,
    navigate,
    openedItemId,
    setOpenedItemId,
    snackbar,
    refetch: fetchItems,
    handleMove,
    handleRestore,
    handleDelete,
    handleUndo,
    handleDeletePermanently,
    handleEmptyTrash,
    handleGoToView,
    handleGoToEdit,
    handleGoToCreate,
    handleEdit: (itemId) => navigate(`/edit/${itemId}`),
    handleView: (itemId) => navigate(`/view/${itemId}`),
  };
};
