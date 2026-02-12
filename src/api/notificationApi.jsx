import axiosInstance from './axiosInstance';

// 1. 알림 목록 조회
export const getNotifications = async () => {
  try {
    const response = await axiosInstance.get('/notification');
    return response.data;
  } catch (error) {
    console.error('알림 조회 실패:', error);
    throw error;
  }
};

// 2. 알림 읽음 처리
export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.patch(
      `/notification/${notificationId}/read`,
    );
    return response.data;
  } catch (error) {
    console.error('읽음 처리 실패:', error);
    throw error;
  }
};

// 3. 전체 읽음 처리
export const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.patch('/notification/all/read');
    return response.data;
  } catch (error) {
    console.error('전체 읽음 처리 실패:', error);
    throw error;
  }
};

// 4. 전체 삭제 처리
export const deleteAllNotifications = async () => {
  try {
    const response = await axiosInstance.delete('/notification/all');
    return response.data;
  } catch (error) {
    console.error('전체 삭제 처리 실패:', error);
    throw error;
  }
};
