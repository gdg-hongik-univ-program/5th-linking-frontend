import axiosInstance from './axiosInstance';

export const getItems = async () => {
  try {
    const response = await axiosInstance.post('/item/mine', null, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('아이템 조회 실패:', error);
    throw error;
  }
};
