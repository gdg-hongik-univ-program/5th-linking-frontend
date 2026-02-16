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

  // 스낵바 보이기
  const showSnackbar = (message) => {
    setSnackbar({ isVisible: true, message });
  };

  // 스낵바 가리기
  const hideSnackbar = () => {
    setSnackbar({ isVisible: false, message: '' });
  };

  // 아이템 조회
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let apiFolderId = folderId;
      let apiFilter = filterType;

      if (typeof folderId === 'string' && isNaN(Number(folderId))) {
        apiFolderId = null;
        apiFilter = folderId;
      }

      const data = await getItems(apiFolderId, apiFilter);
      let result = Array.isArray(data) ? data : [];

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
    return () => {
      window.removeEventListener('scroll', handleGlobalClose, true);
    };
  }, []);

  // 언마운트 클린업
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current && pendingDeleteRef.current) {
        console.log('즉시 삭제');
        clearTimeout(deleteTimerRef.current);

        const { items: deletedItems } = pendingDeleteRef.current;
        const itemIds = deletedItems.map((item) => item.itemId);

        commonDeleteRef.current(itemIds);
      }
    };
  }, []);

  // 아이템 삭제 클린업
  const clearDeleteState = () => {
    hideSnackbar();
    deleteTimerRef.current = null;
    pendingDeleteRef.current = null;
  };

  // 아이템 이동
  const handleMove = async (itemsOrItem, targetFolderId) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];
    const result = await commonMove(itemIds, targetFolderId);
    if (result.success)
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    else alert('링크를 옮기는 데에 실패했어요.');
    return result;
  };

  // 아이템 삭제
  const handleDelete = (itemsOrItem) => {
    const itemsToDelete = Array.isArray(itemsOrItem)
      ? itemsOrItem
      : [itemsOrItem];

    // 기존 타이머가 있을 시 즉시 삭제
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    // 복구용 인덱스 저장
    const itemsWithIndex = itemsToDelete.map((item) => ({
      item,
      index: items.findIndex((i) => i.itemId === item.itemId),
    }));

    pendingDeleteRef.current = { items: itemsToDelete, itemsWithIndex };

    // UI 선 제거
    const itemIdsToRemove = itemsToDelete.map((item) => item.itemId);
    setItems((prev) => prev.filter((i) => !itemIdsToRemove.includes(i.itemId)));

    // 스낵바 보이기
    showSnackbar(
      itemsToDelete.length === 1
        ? '링크를 삭제했어요.'
        : `${itemsToDelete.length}개의 링크를 삭제했어요.`,
    );

    // 3초 후 실제 삭제
    deleteTimerRef.current = setTimeout(executeActualDelete, 3000);
  };

  // 아이템 실제 삭제
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
  const handleRestore = async (itemsOrItem) => {
    const itemIds = Array.isArray(itemsOrItem)
      ? itemsOrItem.map((i) => i.itemId)
      : [itemsOrItem.itemId];
    const result = await commonRestore(itemIds);
    if (result.success)
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    else alert('링크를 복원하는 데에 실패했어요.');
    return result;
  };

  // 아이템 영구 삭제
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
    if (result.success)
      setItems((prev) => prev.filter((i) => !itemIds.includes(i.itemId)));
    else alert('링크클 영구적으로 삭제하는 데에 실패했어요.');
    return result;
  };

  // 휴지통 비우기
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
    } catch {
      alert('휴지통을 비우는 데에 실패했어요.');
    }
  };

  // 아이템 뷰어 페이지로 페이지 이동
  const handleGoToView = (itemId) => {
    if (itemId) {
      navigate(`/view/${itemId}`);
    }
  };

  // 아이템 수정 페이지로 페이지 이동
  const handleGoToEdit = (itemId) => {
    if (itemId) {
      commonEdit(itemId);
    }
  };

  // 아이템 생성 페이지로 페이지 이동
  // 아이템 생성 페이지로 페이지 이동
  const handleGoToCreate = () => {
    const targetFolderId =
      folderId && !isNaN(Number(folderId)) ? folderId : null;
    if (targetFolderId) {
      navigate(`/create?folderId=${targetFolderId}`);
    } else {
      navigate('/create');
    }
  };

  return {
    items,
    isLoading,
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
  };
};
