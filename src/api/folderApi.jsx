import axiosInstance from './axiosInstance';

// 1. 폴더 생성
export const createFolder = async (folderName, parentId = null) => {
  const response = await axiosInstance.post('/folder', {
    folderName,
    parentId,
  });
  return response.data;
};

// 2. 폴더 다수 조회
export const getFolders = async () => {
  const response = await axiosInstance.get('/folder');
  return response.data;
};

// 3. 폴더 이름 수정
export const updateFolder = async (folderId, folderName) => {
  const response = await axiosInstance.patch(`/folder/${folderId}`, {
    folderName,
  });
  return response.data;
};

// 4. 폴더 다수 이동
export const moveFolders = async (folderIds, parentId) => {
  const response = await axiosInstance.patch('/folder/move', {
    folderIds,
    parentId,
  });
  return response.data;
};

// 5. 폴더 다수 삭제
export const deleteFolders = async (folderIds) => {
  const response = await axiosInstance.delete('/folder', {
    data: { folderIds },
  });
  return response.data;
};

// 6. 폴더 다수 복원
export const restoreFolders = async (folderIds) => {
  const response = await axiosInstance.post('/folder/restore', {
    folderIds,
  });
  return response.data;
};

// 7. 폴더 다수 영구 삭제
export const deleteFoldersPermanently = async (folderIds) => {
  const response = await axiosInstance.delete('/folder/trash', {
    data: {
      folderIds: folderIds,
    },
  });
  return response.data;
};
