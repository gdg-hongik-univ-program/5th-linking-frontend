import axios from 'axios';

export const searchItems = async ({ keyword, filter, page = 0, size = 10 }) => {
  try {
    const response = await axios.get('/search', {
      params: { keyword, filter, page, size },
    });
    return response.data;
  } catch (error) {
    console.error('검색 로드 실패:', error);
    throw error;
  }
};
