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
import { useModalStore } from '../store/useModalStore';

export const useItem = (itemId) => {
  const navigate = useNavigate();

  const { openAlert, openConfirm } = useModalStore();

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
  const handleCreate = async (payload, options = { showError: true }) => {
    try {
      const newItem = await createItem(payload);
      navigate(`/view/${newItem.itemId}`, { replace: true });
      return { success: true, item: newItem };
    } catch (error) {
      if (options.showError) {
        openAlert({
          title: '링크 생성 실패',
          message: '링크를 생성하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 아이템 수정
  const handleUpdate = async (payload, options = { showError: true }) => {
    if (!itemId) return;

    try {
      const updatedData = await updateItem({
        itemId: Number(itemId),
        ...payload,
      });

      setItem((prev) => ({ ...prev, ...updatedData }));
      navigate(`/view/${itemId}`, { replace: true });

      return { success: true, item: updatedData };
    } catch (error) {
      console.error('아이템 수정 실패:', error);
      if (options.showError) {
        openAlert({
          title: '링크 수정 실패',
          message: '링크를 수정하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 아이템 중요도 토글
  const handleToggleImportance = async (options = { showError: true }) => {
    if (!item) return;
    try {
      const newImportance = !item.importance;
      await updateItemImportance(item.itemId, newImportance);
      setItem((prev) => ({ ...prev, importance: newImportance }));
    } catch (error) {
      if (options.showError) {
        openAlert({
          title: '링크 중요도 변경 실패',
          message:
            '링크의 중요도를 변경하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
    }
  };

  // 아이템 이동
  const handleMove = async (targetFolderId, options = { showError: true }) => {
    const result = await commonMove(itemId, targetFolderId);
    if (result.success) {
      setItem((prev) => ({ ...prev, folderId: targetFolderId }));
      return { success: true };
    } else {
      if (options.showError) {
        openAlert({
          title: '링크 이동 실패',
          message: '링크를 이동하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
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
  const executeActualDelete = useCallback(
    async (options = { showError: true }) => {
      if (!pendingDeleteRef.current) return;

      const result = await commonDelete(itemId);

      if (result.success) {
        navigate(-1);
      } else {
        if (options.showError) {
          openAlert({
            title: '링크 삭제 실패',
            message:
              '링크를 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
            isDanger: true,
          });
        }
        clearDeleteState();
      }
    },
    [itemId, commonDelete, navigate, openAlert],
  );

  // 아이템 삭제 취소
  const handleUndo = () => {
    if (!pendingDeleteRef.current) return;
    clearTimeout(deleteTimerRef.current);
    pendingDeleteRef.current = false;
    hideSnackbar();
  };

  // 아이템 복원
  const handleRestore = async (options = { showError: true }) => {
    const result = await commonRestore(itemId);
    if (result.success) navigate('/home');
    else {
      if (options.showError) {
        openAlert({
          title: '링크 복원 실패',
          message: '링크를 복원하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
    }
  };

  // 아이템 영구 삭제
  const handleDeletePermanently = async (options = { showError: true }) => {
    const result = await commonDeletePermanently(itemId);
    if (result.success) navigate('/trash');
    else {
      if (options.showError) {
        openAlert({
          title: '링크 영구 삭제 실패',
          message:
            '링크를 영구 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
    }
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

    if (!item.url || item.url.trim() === '') {
      return;
    }

    if (navigator.share) {
      navigator.share({ title: item.title, url: item.url });
    } else {
      navigator.clipboard.writeText(item.url);
      showSnackbar('원본의 URL이 복사되었어요.');
    }
  };

  // 아이템 연결
  const handleConnect = async (targetItem, options = { showError: true }) => {
    try {
      const linkItemId = Number(
        typeof targetItem === 'object' ? targetItem.itemId : targetItem,
      );
      const currentItemId = Number(itemId);

      await connectItem(currentItemId, linkItemId);

      await fetchConnectedItems();
      return { success: true };
    } catch (error) {
      if (options.showError) {
        openAlert({
          title: '링크 연결 실패',
          message: '링크를 연결하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 아이템 연결 해제
  const handleDisconnect = async (
    targetItem,
    e,
    options = { showError: true },
  ) => {
    if (e) e.stopPropagation();

    const linkItemId = Number(
      typeof targetItem === 'object' ? targetItem.itemId : targetItem,
    );
    const currentItemId = Number(itemId);

    openConfirm({
      title: '링크 연결 해제',
      message: '이 링크와의 연결을 해제할까요?',
      confirmText: '해제',
      isDanger: true,
      onConfirm: async () => {
        try {
          await disconnectItem(currentItemId, linkItemId);

          setConnectedItems((prev) =>
            prev.filter((i) => i.itemId !== linkItemId),
          );
        } catch (error) {
          if (options.showError) {
            openAlert({
              title: '링크 연결 해제 실패',
              message:
                '링크 연결을 해제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
              isDanger: true,
            });
          }
        }
      },
    });
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
