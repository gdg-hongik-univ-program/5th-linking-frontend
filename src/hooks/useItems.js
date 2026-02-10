import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItems, deleteItem, restoreItem } from '../api/itemApi';
export const useItems = (filterType) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);

  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });
  const deleteTimerRef = useRef(null);
  const pendingItemRef = useRef(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getItems(null, filterType);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`${filterType} 로딩 실패:`, error);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchItems();
    const handleGlobalClose = () => setOpenedItemId(null);
    window.addEventListener('scroll', handleGlobalClose, true);
    return () => window.removeEventListener('scroll', handleGlobalClose, true);
  }, [fetchItems]);

  const executeActualDelete = async () => {
    if (!pendingItemRef.current) return;
    try {
      const { item } = pendingItemRef.current;
      await deleteItem(item.itemId);
    } catch (error) {
      console.error('서버 삭제 실패:', error);
      // 삭제 실패 시 목록 갱신을 통해 UI를 동기화하는 것이 안전합니다.
      fetchItems();
    } finally {
      clearDeleteState();
    }
  };

  const handleDeleteRequest = (item) => {
    // 이미 대기 중인 삭제가 있다면 즉시 실행
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    const targetIndex = items.findIndex((i) => i.itemId === item.itemId);
    pendingItemRef.current = { item, index: targetIndex };

    setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
    setSnackbar({ isVisible: true, message: '링크가 삭제되었습니다.' });

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000);
  };

  const handleUndo = () => {
    if (!pendingItemRef.current) return;
    clearTimeout(deleteTimerRef.current);

    const { item, index } = pendingItemRef.current;
    setItems((prev) => {
      const newList = [...prev];
      newList.splice(index, 0, item);
      return newList;
    });
    clearDeleteState();
  };

  const clearDeleteState = () => {
    setSnackbar({ isVisible: false, message: '' });
    deleteTimerRef.current = null;
    pendingItemRef.current = null;
  };

  const handleRestore = async (id) => {
    try {
      await restoreItem(id);
      setItems((prev) => prev.filter((item) => item.itemId !== id));
      return true;
    } catch (error) {
      console.error('보관 실패:', error);
      return false;
    }
  };

  // navigate 관련 핸들러
  const handleDirectEdit = (itemId) => {
    navigate(`/edit/${itemId}`);
  };

  const handleItemClick = (itemId) => {
    navigate(`/link/${itemId}`);
  };

  return {
    items,
    loading,
    navigate,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDeleteRequest,
    handleUndo,
    handleRestore,
    handleDirectEdit,
    handleItemClick,
    refetch: fetchItems,
  };
};
