import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 초기화 시 세션 체크
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await axiosInstance.get('/user/me');
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('인증 확인 실패:', error.response?.status);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/user/sign-out');
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);

      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, loginSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
