import axiosInstance from './axiosInstance';

// 1. 아이템 생성
export const createItem = async (payload) => {
  const response = await axiosInstance.post('/item', payload);
  return response.data;
};

// 2. 아이템 상세 조회
export const getItem = async (itemId) => {
  const response = await axiosInstance.get(`/item/${itemId}`);
  return response.data;
};

// 3. 아이템 다수 조회
export const getItems = async (
  folderId = null,
  filter = null,
  keyword = null,
) => {
  // 폴더별 조회
  if (folderId) {
    const response = await axiosInstance.get(`/item/folder/${folderId}`);
    return response.data;
  }
  // 필터 및 검색 조회
  else {
    const params = {};
    if (filter) params.filter = filter;
    if (keyword) params.keyword = keyword;

    const response = await axiosInstance.get('/item', { params });
    return response.data;
  }
};

// 4. 아이템 수정
export const updateItem = async (payload) => {
  const response = await axiosInstance.put('/item', payload);
  return response.data;
};

// 5. 아이템 중요도 수정
export const updateItemImportance = async (itemId, importance) => {
  const response = await axiosInstance.patch(`/item/${itemId}`, {
    importance,
  });
  return response.data;
};

// 6. 아이템 다수 이동
export const moveItems = async (itemIds, folderId) => {
  const response = await axiosInstance.patch('/item/move', {
    itemIds,
    folderId,
  });
  return response.data;
};

// 7. 아이템 다수 삭제
export const deleteItems = async (itemIds) => {
  const response = await axiosInstance.delete('/item', {
    data: { itemIds },
  });
  return response.data;
};

// 8. 아이템 다수 복원
export const restoreItems = async (itemIds) => {
  const response = await axiosInstance.post('/item/restore', { itemIds });
  return response.data;
};

// 9. 아이템 다수 영구 삭제
export const deleteItemsPermanently = async (itemIds) => {
  const response = await axiosInstance.delete('/item/trash', {
    data: { itemIds },
  });
  return response.data;
};

// 10. 아이템 휴지통 비우기
export const emptyTrash = async () => {
  const response = await axiosInstance.delete('/item/trash/all');
  return response.data;
};

// 11. 아이템 연결 생성
export const connectItem = async (itemId, linkItemId) => {
  const response = await axiosInstance.post('/item/connect', {
    itemId,
    linkItemId,
  });
  return response.data;
};

// 12. 연결된 아이템 다수 조회
export const getConnectedItems = async (itemId) => {
  const response = await axiosInstance.get(`/item/connect/${itemId}`);
  if (Array.isArray(response.data)) {
    return response.data.filter(
      (item) => (item.itemId || item.id) && item.itemId !== 0,
    );
  }
  return [];
};

// 13. 아이템 연결 해제
export const disconnectItem = async (itemId, linkItemId) => {
  const response = await axiosInstance.delete('/item/connect', {
    data: { itemId, linkItemId },
  });
  return response.data;
};
