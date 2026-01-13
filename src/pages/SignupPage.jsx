import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Input from '../components/common/Input';
import { VALIDATION } from '../constants/validation';

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    email: '',
    nickName: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [statusMessages, setStatusMessages] = useState({
    loginId: '',
    password: '',
    email: '',
    nickName: '',
  });

  // 유효성 검사 함수
  const validate = (name, value) => {
    let message = '';
    const rule = VALIDATION[name];

    if (rule) {
      const isValid = rule.regex ? rule.regex.test(value) : rule.test(value);
      if (!value) message = '';
      else if (!isValid) {
        message = rule.error;
      } else {
        const labels = {
          loginId: '아이디',
          password: '비밀번호',
          email: '이메일',
          nickName: '닉네임',
        };
        message = `사용 가능한 ${labels[name]}입니다!`;
      }
    }
    setStatusMessages((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);

    if (name === 'loginId') {
      setIsIdAvailable(false);
    }
  };

  const handleSignup = async () => {
    try {
      const response = await axiosInstance.post('/user/sign-up', formData);
      if (response.status === 201 || response.status === 200) {
        alert('회원가입이 완료되었습니다!');
        navigate('/');
      }
    } catch (error) {
      alert(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  const handleCheckDuplicate = async () => {
    const idValue = formData.loginId;
    const idRule = VALIDATION.loginId;
    const isFormatValid = idRule.regex.test(idValue);

    if (!idValue || !isFormatValid) {
      alert('올바른 아이디 형식을 먼저 입력해주세요.');
      return;
    }
    try {
      const response = await axiosInstance.post('/user/user/dup', idValue, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      if (response.data === true) {
        setIsIdAvailable(true);
        setStatusMessages((prev) => ({
          ...prev,
          loginId: '사용 가능한 아이디입니다!',
        }));
      } else {
        setIsIdAvailable(false);
        setStatusMessages((prev) => ({
          ...prev,
          loginId: '이미 사용 중인 아이디입니다.',
        }));
      }
    } catch (error) {
      setIsIdAvailable(false);
      const serverMessage = error.response?.data?.message;
      if (error.response?.status === 409) {
        setStatusMessages((prev) => ({
          ...prev,
          loginId: '이미 사용 중인 아이디입니다.',
        }));
      } else {
        setStatusMessages((prev) => ({
          ...prev,
          loginId: serverMessage || '중복 확인 중 오류가 발생했습니다.',
        }));
      }
    }
  };

  const isAllValid =
    Object.values(formData).every((val) => val.trim() !== '') &&
    confirmPassword !== '' &&
    formData.password === confirmPassword &&
    isIdAvailable;

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-bg-main">
      <div className="mb-5 text-center flex flex-col items-center">
        <img
          src="linking.svg"
          alt="main logo"
          width="60"
          height="60"
          className="block"
        />
        <h1 className="text-3xl font-bold text-text-primary mb-2 font-logo tracking-tight">
          Linking
        </h1>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="아이디"
                type="text"
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                message={statusMessages.loginId}
                placeholder="아이디를 입력해주세요"
                rightElement={
                  <button
                    type="button"
                    onClick={handleCheckDuplicate}
                    disabled={
                      !formData.loginId ||
                      (!!statusMessages.loginId.includes('가능') === false &&
                        statusMessages.loginId !== '')
                    }
                    className={`px-4 font-bold rounded-xl whitespace-nowrap transition-all text-sm h-full ${
                      isIdAvailable
                        ? 'bg-text-disabled text-bg-main cursor-default' /* 확인됨: 회색 배경 */
                        : 'bg-primary-500 text-neutral-950 hover:bg-primary-600 cursor-pointer' /* 중복확인: 노랑 배경 */
                    }`}
                  >
                    {isIdAvailable ? '확인됨' : '중복확인'}
                  </button>
                }
              />
            </div>
          </div>
        </div>

        <Input
          label="비밀번호"
          type="password"
          value={formData.password}
          onChange={handleChange}
          name="password"
          message={statusMessages.password}
          placeholder="비밀번호를 입력해주세요"
        />
        <Input
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="비밀번호를 다시 입력해주세요"
          message={
            formData.password !== confirmPassword && confirmPassword !== ''
              ? '비밀번호가 일치하지 않습니다.'
              : ''
          }
        />
        <Input
          label="이메일"
          type="text"
          value={formData.email}
          onChange={handleChange}
          name="email"
          message={statusMessages.email}
          placeholder="이메일을 입력해주세요"
        />

        <Input
          label="닉네임"
          type="text"
          value={formData.nickName}
          onChange={handleChange}
          name="nickName"
          message={statusMessages.nickName}
          placeholder="닉네임을 입력해주세요"
        />

        <button
          type="button"
          onClick={handleSignup}
          disabled={!isAllValid}
          className={`mt-6 w-full font-bold py-3.5 rounded-xl transition-all duration-300 ${
            isAllValid
              ? 'bg-primary-500 text-neutral-950 hover:bg-primary-600 shadow-lg cursor-pointer'
              : 'bg-text-disabled text-text-sub opacity-50 cursor-not-allowed'
          }`}
        >
          회원가입
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-text-sub">
        계정이 이미 존재하나요?{' '}
        <Link
          to="/"
          className="text-text-primary font-bold cursor-pointer hover:underline"
        >
          로그인
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
