import axiosInstance from './axiosInstance';

// [월별 요약 조회]
export const getCalendarSummary = async (year, month) => {
  const response = await axiosInstance.get('/calendar/mon', {
    params: { year, month },
  });
  return response.data;
};

// [일별 상세 조회]
export const getDailyEvents = async (selectedDate) => {
  const response = await axiosInstance.get('/calendar/day', {
    params: { selectedDate },
  });
  return response.data;
};
