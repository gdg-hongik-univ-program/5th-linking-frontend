import { useNavigate } from 'react-router-dom';
import {
  moveItems,
  restoreItems,
  deleteItems,
  deleteItemsPermanently,
} from '../api/itemApi';

export const useItemCommon = () => {
  const navigate = useNavigate();

  // 헬퍼 함수: 인자가 배열이면 그대로, 아니면 배열로 감싸서 반환
  const ensureArray = (data) => {
    if (Array.isArray(data)) return data;
    return data ? [data] : [];
  };

  const handleMove = async (itemIds, targetFolderId) => {
    try {
      // 1. 확실하게 단일 차원 배열로 만듦 [1, 2, 3]
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds];

      // 2. targetFolderId를 숫자로 변환 (최상위 null은 그대로 유지)
      const fId = targetFolderId === null ? null : Number(targetFolderId);

      // 3. 수정된 API 호출
      await moveItems(ids, fId);
      return { success: true };
    } catch (error) {
      console.error('아이템 이동 실패:', error);
      return { success: false, error };
    }
  };

  const handleRestore = async (itemIds) => {
    try {
      const ids = ensureArray(itemIds);
      await restoreItems(ids);
      return { success: true };
    } catch (error) {
      console.error('아이템 복원 실패:', error);
      return { success: false, error };
    }
  };

  const handleDelete = async (itemIds) => {
    try {
      const ids = ensureArray(itemIds);
      await deleteItems(ids);
      return { success: true };
    } catch (error) {
      console.error('아이템 삭제 실패:', error);
      return { success: false, error };
    }
  };

  const handleDeletePermanently = async (itemIds) => {
    try {
      const ids = ensureArray(itemIds);
      await deleteItemsPermanently(ids);
      return { success: true };
    } catch (error) {
      console.error('아이템 영구 삭제 실패:', error);
      return { success: false, error };
    }
  };

  const handleGoToEdit = (itemId) => {
    if (!itemId) {
      console.error('아이템 ID가 없습니다.');
      return;
    }
    navigate(`/edit/${itemId}`);
  };

  return {
    handleMove,
    handleRestore,
    handleDelete,
    handleDeletePermanently,
    handleGoToEdit,
  };
};
