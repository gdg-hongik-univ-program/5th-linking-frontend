import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => config);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const { logout, isAuthenticated } = useAuthStore.getState();

    if (response?.status === 401) {
      if (config.url.includes('/user/me')) {
        return Promise.reject(error);
      }

      const publicPaths = ['/login', '/signup'];
      if (publicPaths.includes(window.location.pathname)) {
        return Promise.reject(error);
      }

      if (isAuthenticated) {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
