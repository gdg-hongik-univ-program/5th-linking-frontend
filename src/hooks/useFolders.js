import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createFolder,
  getFolders,
  updateFolder,
  moveFolders,
  restoreFolders,
  deleteFolders,
  deleteFoldersPermanently,
} from '../api/folderApi';

export const useFolders = () => {
  const location = useLocation();

  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openedFolderId, setOpenedFolderId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });

  const deleteTimerRef = useRef(null);
  const pendingFoldersRef = useRef(null);

  // 스낵바 보이기
  const showSnackbar = (message) => {
    setSnackbar({ isVisible: true, message });
  };

  // 스낵바 가리기
  const hideSnackbar = () => {
    setSnackbar({ isVisible: false, message: '' });
  };

  // 폴더 다수 조회
  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFolders();
      setFolders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('폴더 조회 실패:', error);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders, location.key]);

  // 스크롤 시 아이템 닫기
  useEffect(() => {
    const handleGlobalClose = () => setOpenedFolderId(null);
    window.addEventListener('scroll', handleGlobalClose, true);

    return () => {
      window.removeEventListener('scroll', handleGlobalClose, true);

      if (deleteTimerRef.current && pendingFoldersRef.current) {
        clearTimeout(deleteTimerRef.current);
        const { folders: deletedFolders } = pendingFoldersRef.current;
        const folderIds = deletedFolders.map((folder) => folder.folderId);
        deleteFolders(folderIds);
      }
    };
  }, []);

  // 아이템 삭제 클린업
  const clearDeleteState = () => {
    hideSnackbar();
    deleteTimerRef.current = null;
    pendingFoldersRef.current = null;
  };

  // 폴더 생성
  const handleCreate = async (folderName, parentId = null) => {
    try {
      const newFolder = await createFolder(folderName, parentId);
      await fetchFolders();
      return { success: true, folder: newFolder };
    } catch (error) {
      console.error('폴더 생성 실패:', error);
      alert('폴더를 생성하는 데에 실패했어요.');
      return { success: false, error };
    }
  };

  // 폴더 이름 수정
  const handleUpdate = async (folderId, folderName) => {
    try {
      const updatedFolder = await updateFolder(folderId, folderName);
      setFolders((prev) =>
        prev.map((folder) =>
          folder.folderId === folderId ? updatedFolder : folder,
        ),
      );
      return { success: true };
    } catch (error) {
      console.error('폴더 수정 실패:', error);
      alert('폴더를 수정하는 데에 실패했어요.');
      return { success: false, error };
    }
  };

  // 폴더 이동
  const handleMove = async (foldersOrFolder, targetParentId) => {
    const foldersToMove = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];
    const folderIds = foldersToMove.map((folder) => folder.folderId);

    try {
      await moveFolders(folderIds, targetParentId);
      await fetchFolders();
    } catch (error) {
      console.error('폴더 이동 실패:', error);
      alert('폴더를 옮기는 데에 실패했어요.');
    }
  };

  // 폴더 삭제
  const handleDelete = (foldersOrFolder) => {
    const foldersToDelete = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];

    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    const foldersWithIndex = foldersToDelete.map((folder) => ({
      folder,
      index: folders.findIndex((f) => f.folderId === folder.folderId),
    }));

    pendingFoldersRef.current = { folders: foldersToDelete, foldersWithIndex };

    const folderIdsToRemove = foldersToDelete.map((folder) => folder.folderId);
    setFolders((prev) =>
      prev.filter((f) => !folderIdsToRemove.includes(f.folderId)),
    );

    const message =
      foldersToDelete.length === 1
        ? '폴더를 삭제했어요.'
        : `${foldersToDelete.length}개의 폴더를 삭제했어요.`;
    showSnackbar(message);

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000);
  };

  // 폴더 실제 삭제
  const executeActualDelete = async () => {
    if (!pendingFoldersRef.current) return;
    const { folders: deletedFolders } = pendingFoldersRef.current;
    const folderIds = deletedFolders.map((folder) => folder.folderId);

    try {
      await deleteFolders(folderIds);
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
      alert('폴더를 삭제하는 데에 실패했어요.');
      setFolders((prev) => {
        const newList = [...prev];
        pendingFoldersRef.current.foldersWithIndex
          .sort((a, b) => a.index - b.index)
          .forEach(({ folder, index }) => {
            newList.splice(index, 0, folder);
          });
        return newList;
      });
    }
    clearDeleteState();
  };

  // 폴더 삭제 취소
  const handleUndo = () => {
    if (!pendingFoldersRef.current) return;
    clearTimeout(deleteTimerRef.current);

    const { foldersWithIndex } = pendingFoldersRef.current;
    setFolders((prev) => {
      const newList = [...prev];
      foldersWithIndex
        .sort((a, b) => a.index - b.index)
        .forEach(({ folder, index }) => {
          newList.splice(index, 0, folder);
        });
      return newList;
    });

    clearDeleteState();
  };

  // 폴더 복원
  const handleRestore = async (foldersOrFolder) => {
    const foldersToRestore = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];
    const folderIds = foldersToRestore.map((folder) => folder.folderId);

    try {
      await restoreFolders(folderIds);
      setFolders((prev) => prev.filter((f) => !folderIds.includes(f.folderId)));
    } catch (error) {
      console.error('폴더 복원 실패:', error);
      alert('폴더를 복원하는 데에 실패했어요.');
    }
  };

  // 폴더 영구 삭제
  const handleDeletePermanently = async (foldersOrFolder) => {
    const foldersToDelete = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];
    const folderIds = foldersToDelete.map((folder) => folder.folderId);

    try {
      await deleteFoldersPermanently(folderIds);
      setFolders((prev) => prev.filter((f) => !folderIds.includes(f.folderId)));
    } catch (error) {
      console.error('폴더 영구 삭제 실패:', error);
      alert('폴더를 영구 삭제하는 데에 실패했어요.');
    }
  };

  return {
    folders,
    refetch: fetchFolders,
    isLoading,
    openedFolderId,
    setOpenedFolderId,
    snackbar,
    handleCreate,
    handleUpdate,
    handleMove,
    handleRestore,
    handleDelete,
    handleUndo,
    handleDeletePermanently,
  };
};
