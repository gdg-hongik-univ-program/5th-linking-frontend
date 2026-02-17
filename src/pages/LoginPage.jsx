import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Input from '../components/common/Input';
import { useAuthStore } from '../store/useAuthStore';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import LoadingOverlay from '../components/common/LoadingOverlay';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { from, isInitialized } = useAuthRedirect();
  const loginSuccess = useAuthStore((state) => state.loginSuccess);

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
      alert('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axiosInstance.post('/user/sign-in', formData);
      loginSuccess(response.data);

      alert('로그인에 성공했습니다!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('로그인 실패:', error);
      const errorMessage =
        error.response?.data?.message || '아이디 또는 비밀번호를 확인해주세요.';
      alert(errorMessage);
    }
  };

  if (!isInitialized) return <LoadingOverlay />;

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-bg-main">
      <div className="mb-10 text-center flex flex-col items-center">
        <img
          src="/linking.svg"
          alt="main logo"
          width="80"
          height="80"
          className="block"
        />
        <h1 className="text-4xl font-bold text-text-primary mb-2 font-logo tracking-tight">
          LINKING
        </h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 w-full mx-auto">
        <Input
          type="text"
          name="loginId"
          value={formData.loginId}
          onChange={handleChange}
          placeholder="아이디를 입력해주세요"
          onClear={() => setFormData((prev) => ({ ...prev, loginId: '' }))}
        />

        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="비밀번호를 입력해주세요"
          onClear={() => setFormData((prev) => ({ ...prev, password: '' }))}
        />

        <button
          type="submit"
          className="mt-6 w-full bg-primary-500 text-neutral-950 font-bold py-3.5 rounded-full hover:bg-primary-600 transition-colors cursor-pointer"
        >
          로그인
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-sub">
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
