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
export const getItems = async (folderId = null) => {
  if (folderId) {
    // 폴더
    const response = await axiosInstance.get(`/item/folder/${folderId}`);
    return response.data;
  } else {
    // 전체
    const response = await axiosInstance.post('/item/mine');
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

// 6. 아이템 연결 생성
export const connectItem = async (itemId, linkItemId) => {
  const response = await axiosInstance.post('/item/link', {
    itemId,
    linkItemId,
  });
  return response.data;
};

// 7. 연결된 아이템 목록 조회
export const getConnectedItems = async (itemId) => {
  const response = await axiosInstance.get(`/item/link/${itemId}`);
  return response.data.filter(
    (item) => (item.itemId || item.id) && item.itemId !== 0,
  );
};

// 8. 아이템 연결 삭제
export const disconnectItem = async (itemId, linkItemId) => {
  const response = await axiosInstance.delete('/item/link', {
    data: { itemId, linkItemId },
  });
  return response.data;
};
