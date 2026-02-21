import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';

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
    const { openAlert } = useModalStore.getState();

    if (response?.status === 401) {
      if (config.url.includes('/user/me')) {
        return Promise.reject(error);
      }

      const publicPaths = ['/login', '/signup'];
      if (publicPaths.includes(window.location.pathname)) {
        return Promise.reject(error);
      }

      if (isAuthenticated) {
        openAlert({
          title: '세션 만료',
          message:
            '일정 시간 활동이 없어 로그인이 만료되었어요. 로그아웃 한 뒤 다시 로그인 해주세요.',
          confirmText: '로그아웃',
          isDanger: true,
          onConfirm: () => {
            logout();
            window.location.href = '/login';
          },
        });
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
