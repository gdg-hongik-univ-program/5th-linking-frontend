import { useNavigate } from 'react-router-dom';
import {
  moveItems,
  restoreItems,
  deleteItems,
  deleteItemsPermanently,
} from '../api/itemApi';

export const useItemCommon = () => {
  const navigate = useNavigate();

  const handleMove = async (itemIds, targetFolderId) => {
    try {
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
      await moveItems(ids, targetFolderId);
      return { success: true };
    } catch (error) {
      console.error('아이템 이동 실패:', error);
      return { success: false, error };
    }
  };

  const handleRestore = async (itemIds) => {
    try {
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
      await restoreItems(ids);
      return { success: true };
    } catch (error) {
      console.error('아이템 복원 실패:', error);
      return { success: false, error };
    }
  };

  const handleDelete = async (itemIds) => {
    try {
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
      await deleteItems(ids);
      return { success: true };
    } catch (error) {
      console.error('아이템 삭제 실패:', error);
      return { success: false, error };
    }
  };

  const handleDeletePermanently = async (itemIds) => {
    try {
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
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
