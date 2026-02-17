import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createItem,
  getItem,
  updateItem,
  updateItemImportance,
  getConnectedItems,
  connectItem,
  disconnectItem,
} from '../api/itemApi';
import { useItemCommon } from './useItemCommon';

export const useItem = (itemId) => {
  const navigate = useNavigate();

  const {
    handleMove: commonMove,
    handleRestore: commonRestore,
    handleDelete: commonDelete,
    handleDeletePermanently: commonDeletePermanently,
    handleGoToEdit: commonEdit,
  } = useItemCommon();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectedItems, setConnectedItems] = useState([]);
  const [isLoadingConnectedItems, setIsLoadingConnectedItems] = useState(false);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });

  const deleteTimerRef = useRef(null);
  const pendingDeleteRef = useRef(false);
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
  const fetchItem = useCallback(async () => {
    if (!itemId) return;
    setIsLoading(true);
    try {
      const data = await getItem(itemId);
      setItem(data);
    } catch (error) {
      console.error('아이템 조회 실패:', error);
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  }, [itemId, navigate]);

  // 연결된 아이템 조회
  const fetchConnectedItems = useCallback(async () => {
    if (!itemId) return;
    setIsLoadingConnectedItems(true);
    try {
      const data = await getConnectedItems(itemId);
      setConnectedItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('연결된 아이템 조회 실패:', error);
      setConnectedItems([]);
    } finally {
      setIsLoadingConnectedItems(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchItem();
    fetchConnectedItems();
  }, [fetchItem, fetchConnectedItems]);

  // 언마운트 클린업
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current && pendingDeleteRef.current) {
        console.log('즉시 삭제');
        clearTimeout(deleteTimerRef.current);
        commonDeleteRef.current(itemId);
      }
    };
  }, [itemId]);

  // 아이템 생성
  const handleCreate = async (payload) => {
    try {
      const newItem = await createItem(payload);
      navigate(`/view/${newItem.itemId}`);
      return { success: true, item: newItem };
    } catch (error) {
      alert('링크를 생성하는 데에 실패했어요.');
      return { success: false, error };
    }
  };

  // 아이템 수정
  const handleUpdate = async (payload) => {
    if (!itemId) return;

    try {
      const updatedData = await updateItem({
        itemId: Number(itemId),
        ...payload,
      });

      setItem((prev) => ({ ...prev, ...updatedData }));
      navigate(`/view/${itemId}`);

      return { success: true, item: updatedData };
    } catch (error) {
      console.error('아이템 수정 실패:', error);
      alert('링크를 수정하는 데에 실패했어요.');
      return { success: false, error };
    }
  };

  // 아이템 중요도 토글
  const handleToggleImportance = async () => {
    if (!item) return;
    try {
      const newImportance = !item.importance;
      await updateItemImportance(item.itemId, newImportance);
      setItem((prev) => ({ ...prev, importance: newImportance }));
    } catch (error) {
      alert('링크의 중요도를 변경하는 데에 실패했어요.');
    }
  };

  // 아이템 이동
  const handleMove = async (targetFolderId) => {
    const result = await commonMove(itemId, targetFolderId);
    if (result.success) {
      setItem((prev) => ({ ...prev, folderId: targetFolderId }));
      return { success: true };
    } else {
      alert('링크를 옮기는 데에 실패했어요.');
      return { success: false };
    }
  };

  // 아이템 삭제
  const handleDelete = () => {
    if (!itemId) return;

    // 기존 타이머가 있을 시 초기화
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
    }

    pendingDeleteRef.current = true;

    // 스낵바 보이기
    showSnackbar('링크를 삭제했어요.');

    // 3초 뒤 실제 삭제
    deleteTimerRef.current = setTimeout(executeActualDelete, 3000);
  };

  // 아이템 삭제 클린업
  const clearDeleteState = () => {
    hideSnackbar();
    deleteTimerRef.current = null;
    pendingDeleteRef.current = null;
  };

  // 아이템 실제 삭제
  const executeActualDelete = useCallback(async () => {
    if (!pendingDeleteRef.current) return;

    const result = await commonDelete(itemId);

    if (result.success) {
      navigate(-1);
    } else {
      alert('링크를 삭제하는 데에 실패했어요.');
      clearDeleteState();
    }
  }, [itemId, commonDelete, navigate]);

  // 아이템 삭제 취소
  const handleUndo = () => {
    if (!pendingDeleteRef.current) return;
    clearTimeout(deleteTimerRef.current);
    pendingDeleteRef.current = false;
    hideSnackbar();
  };

  // 아이템 복원
  const handleRestore = async () => {
    const result = await commonRestore(itemId);
    if (result.success) navigate('/home');
    else alert('링크를 복원하는 데에 실패했어요.');
  };

  // 아이템 영구 삭제
  const handleDeletePermanently = async () => {
    const result = await commonDeletePermanently(itemId);
    if (result.success) navigate('/trash');
    else alert('링크클 영구적으로 삭제하는 데에 실패했어요');
  };

  // 아이템 에디터로 페이지 이동
  const handleGoToEdit = () => {
    if (item?.itemId) {
      commonEdit(item.itemId);
    }
  };

  // 아이템 원본 방문
  const handleVisit = () => {
    if (item?.url) window.open(item.url, '_blank');
  };

  // 아이템 공유
  const handleShare = () => {
    if (!item) return;
    if (navigator.share) {
      navigator.share({ title: item.title, url: item.url });
    } else {
      navigator.clipboard.writeText(item.url);
      alert('링크의 URL이 복사되었어요.');
    }
  };

  // 아이템 연결
  const handleConnect = async (targetLinkItemId) => {
    try {
      await connectItem(itemId, targetLinkItemId);
      await fetchConnectedItems();
      return { success: true };
    } catch (error) {
      alert('이 링크를 연결하는 데에 실패했어요.');
      return { success: false, error };
    }
  };

  // 아이템 연결 해제
  const handleDisconnect = async (targetId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('이 링크와의 연결을 해제할까요?')) return;

    try {
      await disconnectItem(itemId, targetId);
      setConnectedItems((prev) => prev.filter((i) => i.itemId !== targetId));
      return { success: true };
    } catch (error) {
      alert('이 링크를 연결 해제하는 데에 실패했어요.');
      return { success: false };
    }
  };

  return {
    item,
    connectedItems,
    isLoading,
    isLoadingConnectedItems,
    snackbar,
    refetch: fetchItem,
    refetchConnectedItems: fetchConnectedItems,
    handleCreate,
    handleUpdate,
    handleToggleImportance,
    handleMove,
    handleDelete,
    handleUndo,
    handleRestore,
    handleDeletePermanently,
    handleGoToEdit,
    handleVisit,
    handleShare,
    handleConnect,
    handleDisconnect,
  };
};
