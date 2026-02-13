import axiosInstance from './axiosInstance';

const BASE_PATH = '/notification';

// 1. 알림 목록 조회
export const getNotifications = async () => {
  const { data } = await axiosInstance.get(BASE_PATH);
  return data;
};

// 2. 개별 읽음
export const markAsRead = async (notificationId) => {
  const { data } = await axiosInstance.patch(
    `${BASE_PATH}/${notificationId}/read`,
  );
  return data;
};

// 3. 전체읽음
export const markAllAsRead = async () => {
  const { data } = await axiosInstance.patch(`${BASE_PATH}/all/read`);
  return data;
};

// 4. 전체삭제
export const deleteAllNotifications = async () => {
  const { data } = await axiosInstance.delete(`${BASE_PATH}/all`);
  return data;
};
