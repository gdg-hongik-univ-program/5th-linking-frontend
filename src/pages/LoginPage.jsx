import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Input from '../components/common/Input';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import LoadingOverlay from '../components/common/LoadingOverlay';
import { useModalStore } from '../store/useModalStore';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, isInitialized } = useAuthRedirect();
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const { openAlert } = useModalStore();

  const [formData, setFormData] = useState({
    loginId: location.state?.loginId || '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    if (!formData.loginId || !formData.password) {
      openAlert({
        title: '로그인 실패',
        message: '아이디와 비밀번호를 모두 입력해주세요.',
        confirmText: '확인',
      });
      return;
    }

    try {
      const response = await axiosInstance.post('/user/sign-in', formData);
      loginSuccess(response.data);
    } catch (error) {
      console.error('로그인 실패:', error);
      const errorMessage =
        error.response?.data?.message ||
        '아이디 또는 비밀번호를 다시 확인해주세요.';
      openAlert({
        title: '로그인 실패',
        message: errorMessage,
        confirmText: '확인',
        isDanger: true,
      });
    }
  };

  if (!isInitialized) return <LoadingOverlay />;

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-bg-main items-center">
      <div className="mb-8 text-center flex flex-col items-center w-full max-w-xs">
        <img
          src="/linking.svg"
          alt="main logo"
          width="80"
          height="80"
          className="block"
        />
        <h1 className="text-4xl font-bold text-text-main font-['Outfit'] tracking-wide">
          LINKING
        </h1>
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-4 w-full max-w-xs mx-auto"
      >
        <Input
          type="text"
          name="loginId"
          value={formData.loginId}
          onChange={handleChange}
          placeholder="아이디 입력"
          onClear={() => setFormData((prev) => ({ ...prev, loginId: '' }))}
        />

        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호 입력"
          onClear={() => setFormData((prev) => ({ ...prev, password: '' }))}
        />

        <button
          type="submit"
          className="mt-6 w-full bg-primary-500 text-bg-main font-bold py-3 rounded-xl hover:bg-primary-500/90 transition-colors cursor-pointer"
        >
          로그인
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-sub w-full max-w-xs">
        계정이 없으신가요?{' '}
        <Link
          to="/signup"
          className="text-text-primary font-bold cursor-pointer hover:underline"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
