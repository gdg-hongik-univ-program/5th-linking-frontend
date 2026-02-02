import axiosInstance from './axiosInstance';

// 1. 폴더 생성
export const createFolder = async (folderName, parentId = null) => {
  const response = await axiosInstance.post('/folder', {
    folderName,
    parentId,
  });
  return response.data;
};

// 2. 폴더 목록 조회
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

// 4. 폴더 삭제
export const deleteFolder = async (folderId) => {
  const response = await axiosInstance.delete(`/folder/${folderId}`);
  return response.data;
};
