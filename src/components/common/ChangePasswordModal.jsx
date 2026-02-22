import { useState, useEffect, useRef } from 'react';
import { X, Lock, KeyRound } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Input from './Input';
import { useModalStore } from '../../store/useModalStore';
import { VALIDATION } from '../../constants/validation';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { openAlert } = useModalStore();

  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validatePassword = (pwd) => {
    return VALIDATION.password.regex.test(pwd);
  };

  const handleCurrentPasswordSubmit = async () => {
    if (!currentPassword.trim()) {
      setErrorMsg('현재 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const response = await axiosInstance.post('/user/check-password', {
        password: currentPassword,
      });

      if (response.status === 200 && response.data === true) {
        setStep(2);
      } else {
        setErrorMsg('비밀번호가 일치하지 않습니다.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || '비밀번호가 일치하지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async () => {
    if (!validatePassword(newPassword)) {
      setErrorMsg(VALIDATION.password.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const response = await axiosInstance.patch('/user/password', {
        password: newPassword,
      });

      if (response.status === 200) {
        openAlert({
          title: '비밀번호 변경 완료',
          message: '비밀번호가 성공적으로 변경되었습니다.',
        });
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-bg-main w-full max-w-sm rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-text-main/10 animate-scale-in">
        <div className="px-5 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-neutral-900/50 relative">
          <div className="min-w-[40px]" />
          <h2 className="text-base font-bold text-text-main">비밀번호 변경</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-text-sub hover:text-text-main rounded-full transition-colors min-w-[40px]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-sm text-text-sub/90 mb-2">
                본인 확인을 위해 현재 비밀번호를 입력해주세요.
              </div>
              <Input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrorMsg('');
                }}
                onKeyDown={(e) => handleKeyDown(e, handleCurrentPasswordSubmit)}
                leftIcon={<Lock size={18} />}
              />
              {errorMsg && (
                <p className="text-error-500 text-xs ml-1 font-medium">{errorMsg}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-sm text-text-sub/90 mb-2">
                새로운 비밀번호를 설정해주세요.
              </div>
              <Input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrorMsg('');
                }}
                leftIcon={<KeyRound size={18} />}
              />
              <Input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrorMsg('');
                }}
                onKeyDown={(e) => handleKeyDown(e, handleNewPasswordSubmit)}
                leftIcon={<KeyRound size={18} />}
              />
              {errorMsg && (
                <p className="text-error-500 text-xs ml-1 font-medium">{errorMsg}</p>
              )}
            </div>
          )}
        </div>

        <div className="p-5 pt-0 mt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-neutral-800/50 text-text-main text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={step === 1 ? handleCurrentPasswordSubmit : handleNewPasswordSubmit}
            disabled={loading || (step === 1 ? !currentPassword : (!newPassword || !confirmPassword))}
            className="flex-1 py-3.5 bg-primary-500 text-bg-main text-sm font-bold rounded-xl transition-colors hover:bg-primary-500/90 disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
            ) : step === 1 ? (
              '다음'
            ) : (
              '변경 완료'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
