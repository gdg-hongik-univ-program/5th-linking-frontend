import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Input from '../components/common/Input';
import { VALIDATION } from '../constants/validation';
import PageHeader from '../components/common/PageHeader';
import { UserRoundPen, X } from 'lucide-react';
import { PROFILE_ASSETS, getProfilePath } from '../constants/assets';
import { useAuthRedirect } from '../hooks/useAuthRedirect';
import LoadingOverlay from '../components/common/LoadingOverlay';

const SignupPage = () => {
  const navigate = useNavigate();
  const { isInitialized } = useAuthRedirect();

  const [step, setStep] = useState(1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    email: '',
    nickName: '',
    imageCode: PROFILE_ASSETS[0].id,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const [statusMessages, setStatusMessages] = useState({
    loginId: '',
    password: '',
    email: '',
    nickName: '',
  });

  // 폼 데이터 초기화 로직
  const handleClear = (name) => {
    if (name === 'confirmPassword') {
      setConfirmPassword('');
    } else {
      setFormData((prev) => ({ ...prev, [name]: '' }));
    }

    setStatusMessages((prev) => ({ ...prev, [name]: '' }));
    if (name === 'loginId') setIsIdAvailable(false);
  };

  const validate = (name, value) => {
    let message = '';
    const rule = VALIDATION[name];
    if (!value) message = '';
    else if (rule) {
      const isValid = rule.regex ? rule.regex.test(value) : rule.test(value);
      if (!isValid) message = rule.error;
      else {
        if (name === 'loginId' && !isIdAvailable)
          message = '아이디 중복 확인을 해주세요.';
        else {
          const labels = {
            loginId: '아이디',
            password: '비밀번호',
            email: '이메일',
            nickName: '닉네임',
          };
          message = `사용 가능한 ${labels[name]}입니다!`;
        }
      }
    }
    setStatusMessages((prev) => ({ ...prev, [name]: message }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'loginId') setIsIdAvailable(false);
    validate(name, value);
  };

  const handleCheckDuplicate = async () => {
    const idValue = formData.loginId;
    if (!idValue || !VALIDATION.loginId.regex.test(idValue)) {
      alert('올바른 아이디 형식을 먼저 입력해주세요.');
      return;
    }
    try {
      const response = await axiosInstance.post('/user/dup', {
        loginId: idValue,
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
      alert('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const isStep1Valid =
    isIdAvailable &&
    VALIDATION.password.regex.test(formData.password) &&
    formData.password === confirmPassword &&
    VALIDATION.email.regex.test(formData.email);
  const isStep2Valid = VALIDATION.nickName.regex.test(formData.nickName);

  const handleSignup = async () => {
    try {
      await axiosInstance.post('/user/sign-up', formData);
      alert('회원가입이 완료되었습니다!');
      navigate('/login', { state: { loginId: formData.loginId } });
    } catch (error) {
      alert(error.response?.data?.message || '회원가입 실패');
    }
  };

  if (!isInitialized) return <LoadingOverlay />;

  return (
    <div className="min-h-screen flex flex-col bg-bg-main relative">
      <PageHeader
        title="회원가입"
        onBack={() => (step === 2 ? setStep(1) : navigate(-1))}
      />

      {/* Progress Bar */}
      <div className="flex gap-2 px-6 py-2">
        {[1, 2, 3, 4, 5].map((i) => {
          const isDone =
            (i === 1 && isIdAvailable) ||
            (i === 2 && VALIDATION.password.regex.test(formData.password)) ||
            (i === 3 &&
              confirmPassword !== '' &&
              formData.password === confirmPassword) ||
            (i === 4 && VALIDATION.email.regex.test(formData.email)) ||
            (i === 5 &&
              step === 2 &&
              VALIDATION.nickName.regex.test(formData.nickName));
          return (
            <div
              key={i}
              className={`h-[2px] flex-1 rounded-full transition-all duration-300 ${isDone ? 'bg-white' : 'bg-neutral-800'}`}
            />
          );
        })}
      </div>

      <div className="flex-1 px-6 flex flex-col">
        {step === 1 ? (
          <div className="flex flex-col pt-8 animate-in fade-in duration-300">
            <div className="min-h-[85px]">
              <Input
                name="loginId"
                value={formData.loginId}
                onChange={handleChange}
                onClear={() => handleClear('loginId')}
                message={statusMessages.loginId}
                placeholder="아이디 입력"
                rightElement={
                  <button
                    type="button"
                    onClick={handleCheckDuplicate}
                    className={`px-4 w-24 h-12 rounded-[99px] font-bold text-sm transition-all ${isIdAvailable ? 'bg-text-disabled text-bg-main' : 'bg-primary-500 text-neutral-950'}`}
                  >
                    {isIdAvailable ? '확인됨' : '중복확인'}
                  </button>
                }
              />
            </div>
            <div className="min-h-[85px]">
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onClear={() => handleClear('password')}
                message={statusMessages.password}
                placeholder="비밀번호 입력"
              />
            </div>
            <div className="min-h-[85px]">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onClear={() => handleClear('confirmPassword')}
                placeholder="비밀번호 확인"
                message={
                  confirmPassword &&
                  (formData.password === confirmPassword
                    ? '비밀번호가 일치합니다!'
                    : '비밀번호가 일치하지 않습니다.')
                }
              />
            </div>
            <div className="min-h-[85px]">
              <Input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onClear={() => handleClear('email')}
                message={statusMessages.email}
                placeholder="이메일 입력"
                inputMode="email"
                lang="en"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center pb-20 animate-in fade-in">
            <div
              onClick={() => setIsPopupOpen(true)}
              className="group relative w-40 h-40 bg-neutral-800 rounded-full flex items-center justify-center mb-10 border-2 border-primary-500 overflow-hidden cursor-pointer shadow-[0_0_12px_rgba(234,190,47,0.25)] transition-all"
            >
              <img
                src={getProfilePath(formData.imageCode)}
                alt="Selected"
                className="w-full h-full object-cover p-2 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-40 group-hover:opacity-90 group-hover:bg-black/40 transition-all duration-300">
                <UserRoundPen size={36} className="text-white" />
              </div>
            </div>
            <div className="w-full max-w-[400px]">
              <Input
                name="nickName"
                value={formData.nickName}
                onChange={handleChange}
                onClear={() => handleClear('nickName')}
                placeholder="닉네임 입력"
                message={statusMessages.nickName}
              />
            </div>
          </div>
        )}
      </div>

      {/* 프로필 선택 팝업 */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-main w-[90%] max-w-[360px] mx-auto rounded-xl shadow-2xl overflow-hidden flex flex-col h-[65vh] max-h-[600px] border border-neutral-800 animate-scale-in">
            <div className="px-4 h-14 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-900/50 relative text-center">
              <div className="min-w-[40px]" />
              <h2 className="text-base font-bold text-text-main">
                프로필 선택
              </h2>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="p-1 text-text-sub hover:text-text-main rounded-full transition-colors min-w-[40px]"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-bg-main overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-3 gap-5 place-items-center">
                {PROFILE_ASSETS.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, imageCode: asset.id }));
                      setIsPopupOpen(false);
                    }}
                    className={`relative w-18 h-18 rounded-full overflow-hidden border-2 transition-all ${formData.imageCode === asset.id ? 'border-primary-500 bg-primary-500/10' : 'border-neutral-800 hover:border-neutral-700'}`}
                  >
                    <img
                      src={asset.path}
                      alt={asset.id}
                      className="w-full h-full object-cover p-2"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pb-10 flex justify-center px-6">
        <button
          type="button"
          onClick={step === 1 ? () => setStep(2) : handleSignup}
          disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
          className={`font-bold w-full h-12 rounded-[99px] transition-all duration-300 ${(step === 1 ? isStep1Valid : isStep2Valid) ? 'bg-primary-500 text-neutral-950 shadow-lg cursor-pointer' : 'bg-text-disabled text-text-sub opacity-50'}`}
        >
          {step === 1 ? '다음' : '회원가입'}
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
