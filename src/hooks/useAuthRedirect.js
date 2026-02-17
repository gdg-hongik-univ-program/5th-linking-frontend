import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // 이전 페이지 정보가 없으면 홈('/')으로 설정
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // 세션 체크가 끝났고, 이미 로그인된 상태라면 튕겨내기
    if (isInitialized && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate, from]);

  return { from, isInitialized };
};
