import axiosInstance from './axiosInstance';

export const getItems = async () => {
  try {
    const response = await axiosInstance.post('/item/mine', null, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('홈 화면 최근 아이템 조회 실패:', error);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`/item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('삭제 실패:', error);
    throw error;
  }
};
