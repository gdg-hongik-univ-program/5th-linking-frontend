import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getItems, deleteItem, restoreItem } from '../api/itemApi';

export const useItems = (filterType) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openedItemId, setOpenedItemId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });

  const deleteTimerRef = useRef(null);
  const pendingItemRef = useRef(null);

  // 데이터 불러오기
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getItems(null, filterType);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(`${filterType} 로딩 실패:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  // 페이지 진입 및 location 변경 시 데이터 fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems, location.key]);

  // 스크롤 시 스와이프 닫기 및 cleanup 로직
  useEffect(() => {
    const handleGlobalClose = () => setOpenedItemId(null);
    window.addEventListener('scroll', handleGlobalClose, true);

    return () => {
      window.removeEventListener('scroll', handleGlobalClose, true);
      // [핵심] 페이지 이탈 시 대기 중인 삭제 즉시 실행
      if (deleteTimerRef.current && pendingItemRef.current) {
        clearTimeout(deleteTimerRef.current);
        const { item } = pendingItemRef.current;
        deleteItem(item.itemId).catch(console.error);
        // 필요 시 로컬 스토리지 등에 기록 보관 가능
        localStorage.setItem('latestDeletedItem', JSON.stringify(item));
      }
    };
  }, []);

  const executeActualDelete = async () => {
    if (!pendingItemRef.current) return;
    try {
      const { item } = pendingItemRef.current;
      await deleteItem(item.itemId);
    } catch (error) {
      console.error('서버 삭제 실패:', error);
      fetchItems(); // 실패 시 UI 복구
    } finally {
      clearDeleteState();
    }
  };

  const handleDelete = (item) => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    const targetIndex = items.findIndex((i) => i.itemId === item.itemId);
    pendingItemRef.current = { item, index: targetIndex };

    setItems((prev) => prev.filter((i) => i.itemId !== item.itemId));
    setSnackbar({ isVisible: true, message: '링크를 삭제했어요.' });

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

  const handleRestore = async (itemId) => {
    try {
      await restoreItem(itemId);
      setSnackbar({ isVisible: true, message: '링크를 복구했어요.' });
      fetchItems(); // 복구 후 리스트 다시 불러오기
    } catch (error) {
      console.error('복구 실패:', error);
      setSnackbar({ isVisible: true, message: '복구에 실패했어요.' });
    } finally {
      setOpenedItemId(null);
    }
  };

  return {
    items,
    loading,
    openedItemId,
    setOpenedItemId,
    snackbar,
    handleDelete,
    handleUndo,
    handleRestore,
    handleEdit: (itemId) => navigate(`/edit/${itemId}`),
    handleView: (itemId) => navigate(`/view/${itemId}`),
    refetch: fetchItems,
  };
};
