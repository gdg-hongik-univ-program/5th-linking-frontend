import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  createFolder,
  getFolders,
  updateFolder,
  moveFolders,
  restoreFolders,
  deleteFolders,
  deleteFoldersPermanently,
} from '../api/folderApi';
import { removeFoldersFromTree } from '../utils/removeFoldersFromTree';
import { useModalStore } from '../store/useModalStore';

export const useFolders = () => {
  const location = useLocation();

  const { folderId } = useParams();

  const { openAlert } = useModalStore();

  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openedFolderId, setOpenedFolderId] = useState(null);
  const [snackbar, setSnackbar] = useState({ isVisible: false, message: '' });

  const deleteTimerRef = useRef(null);
  const pendingDeleteRef = useRef(null);
  const executeActualDeleteRef = useRef();

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

  // 스크롤 시 폴더 스와이프 닫기
  useEffect(() => {
    const handleGlobalClose = () => setOpenedFolderId(null);
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

  // 폴더 삭제 클린업
  const clearDeleteState = () => {
    hideSnackbar();
    deleteTimerRef.current = null;
    pendingDeleteRef.current = null;
  };

  // 폴더 실제 삭제
  const executeActualDelete = useCallback(
    async (options = { showError: true }) => {
      if (!pendingDeleteRef.current) return;
      const { folders: deletedFolders } = pendingDeleteRef.current;
      const folderIds = deletedFolders.map((folder) => folder.folderId);

      try {
        await deleteFolders(folderIds);
      } catch (error) {
        console.error('폴더 삭제 실패:', error);
        if (options.showError) {
          openAlert({
            title: '폴더 삭제 실패',
            message:
              '폴더를 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
            isDanger: true,
          });
        }
        fetchFolders();
      }
      clearDeleteState();
    },
    [fetchFolders, openAlert],
  );

  // 폴더 실제 삭제 클린업
  useEffect(() => {
    executeActualDeleteRef.current = executeActualDelete;
  }, [executeActualDelete]);

  // 폴더 생성
  const handleCreate = async (
    folderName,
    parentId = null,
    options = { showError: true },
  ) => {
    const targetParentId = parentId ?? (folderId ? Number(folderId) : null);
    try {
      const newFolder = await createFolder(folderName, targetParentId);
      await fetchFolders();
      return { success: true, folder: newFolder };
    } catch (error) {
      console.error('폴더 생성 실패:', error);
      if (options.showError) {
        openAlert({
          title: '폴더 생성 실패',
          message: '폴더를 생성하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 폴더 이름 수정
  const handleUpdate = async (
    folderId,
    folderName,
    options = { showError: true },
  ) => {
    try {
      await updateFolder(folderId, folderName);
      await fetchFolders();
      return { success: true };
    } catch (error) {
      console.error('폴더 이름 변경 실패:', error);
      if (options.showError) {
        openAlert({
          title: '폴더 이름 변경 실패',
          message:
            '폴더 이름을 변경하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 폴더 이동
  const handleMove = async (
    foldersOrFolder,
    targetParentId,
    options = { showError: true },
  ) => {
    const foldersToMove = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];

    const folderIds = foldersToMove.map((folder) => folder.folderId);
    try {
      await moveFolders(folderIds, targetParentId);
      await fetchFolders();
      return { success: true };
    } catch (error) {
      console.error('폴더 이동 실패:', error);
      if (options.showError) {
        openAlert({
          title: '폴더 이동 실패',
          message: '폴더를 이동하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 폴더 삭제
  const handleDelete = (foldersOrFolder) => {
    const foldersToDelete = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];

    // 이미 삭제 대기 중인 것이 있다면 즉시 삭제
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      executeActualDelete();
    }

    // 복구용 데이터 저장
    pendingDeleteRef.current = { folders: foldersToDelete };

    const folderIdsToRemove = foldersToDelete.map((folder) => folder.folderId);
    setFolders((prev) => removeFoldersFromTree(prev, folderIdsToRemove));

    const message =
      foldersToDelete.length === 1
        ? '폴더를 삭제했어요.'
        : `${foldersToDelete.length}개의 폴더를 삭제했어요.`;
    showSnackbar(message);

    deleteTimerRef.current = setTimeout(() => {
      executeActualDelete();
    }, 3000);
  };

  // 폴더 삭제 취소
  const handleUndo = () => {
    if (!pendingDeleteRef.current) return;

    clearTimeout(deleteTimerRef.current);
    fetchFolders();
    clearDeleteState();
  };

  // 폴더 복원
  const handleRestore = async (
    foldersOrFolder,
    options = { showError: true },
  ) => {
    const foldersToRestore = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];
    const folderIds = foldersToRestore.map((folder) => folder.folderId);

    try {
      await restoreFolders(folderIds);
      setFolders((prev) => removeFoldersFromTree(prev, folderIds));
      return { success: true };
    } catch (error) {
      console.error('폴더 복원 실패:', error);
      if (options.showError) {
        openAlert({
          title: '폴더 복원 실패',
          message: '폴더를 복원하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  // 폴더 영구 삭제
  const handleDeletePermanently = async (
    foldersOrFolder,
    options = { showError: true },
  ) => {
    const foldersToDelete = Array.isArray(foldersOrFolder)
      ? foldersOrFolder
      : [foldersOrFolder];
    const folderIds = foldersToDelete.map((folder) => folder.folderId);
    try {
      await deleteFoldersPermanently(folderIds);
      setFolders((prev) => removeFoldersFromTree(prev, folderIds));
      return { success: true };
    } catch (error) {
      console.error('폴더 영구 삭제 실패:', error);
      if (options.showError) {
        openAlert({
          title: '폴더 영구 삭제 실패',
          message:
            '폴더를 영구 삭제하는 중 오류가 발생했어요. 다시 시도해 주세요.',
          isDanger: true,
        });
      }
      return { success: false, error };
    }
  };

  return {
    folders,
    isLoading,
    openedFolderId,
    setOpenedFolderId,
    snackbar,
    refetch: fetchFolders,
    handleCreate,
    handleUpdate,
    handleMove,
    handleDelete,
    handleUndo,
    handleRestore,
    handleDeletePermanently,
  };
};
