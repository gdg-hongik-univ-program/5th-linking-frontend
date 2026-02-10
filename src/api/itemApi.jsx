import axiosInstance from './axiosInstance';

// 1. 아이템 생성
export const createItem = async (payload) => {
  const response = await axiosInstance.post('/item', payload);
  return response.data;
};

// 2. 아이템 단건 조회
export const getItem = async (itemId) => {
  const response = await axiosInstance.get(`/item/${itemId}`);
  return response.data;
};

// 3. 아이템 목록 조회
export const getItems = async (folderId = null, filter = null) => {
  if (folderId) {
    // 폴더별 조회
    const response = await axiosInstance.get(`/item/folder/${folderId}`);
    return response.data;
  } else {
    // 필터별 조회
    const params = filter ? { filter } : {};
    const response = await axiosInstance.get('/item', { params });
    return response.data;
  }
};

// 4. 아이템 수정
export const updateItem = async (payload) => {
  const response = await axiosInstance.put('/item', payload);
  return response.data;
};

// 5. 아이템 삭제
export const deleteItem = async (itemId) => {
  const response = await axiosInstance.delete(`/item/${itemId}`);
  return response.data;
};

// 6. 휴지통에서 아이템 복구
export const restoreItem = async (itemId) => {
  const response = await axiosInstance.post(`/item/${itemId}/restore`);
  return response.data;
};

// 7. 휴지통에서 아이템 영구 삭제
export const deleteItemPermanently = async (itemId) => {
  const response = await axiosInstance.delete(`/item/trash/${itemId}`);
  return response.data;
};

// 8. 휴지통 비우기
export const emptyTrash = async () => {
  const response = await axiosInstance.delete('/item/trash/all');
  return response.data;
};

// 9. 아이템 연결 생성
export const connectItem = async (itemId, linkItemId) => {
  const response = await axiosInstance.post('/item/link', {
    itemId,
    linkItemId,
  });
  return response.data;
};

// 10. 연결된 아이템 목록 조회
export const getConnectedItems = async (itemId) => {
  const response = await axiosInstance.get(`/item/link/${itemId}`);
  return response.data.filter(
    (item) => (item.itemId || item.id) && item.itemId !== 0,
  );
};

// 11. 아이템 연결 해제
export const disconnectItem = async (itemId, linkItemId) => {
  const response = await axiosInstance.delete('/item/link', {
    data: { itemId, linkItemId },
  });
  return response.data;
};
