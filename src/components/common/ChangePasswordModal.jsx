import { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound } from 'lucide-react';
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
      setErrorMsg(
        err.response?.data?.message || '비밀번호가 일치하지 않습니다.',
      );
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
          message: '비밀번호가 성공적으로 변경되었어요.',
        });
        onClose();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || '비밀번호 변경에 실패했습니다.',
      );
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
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-bg-main w-full max-w-xs rounded-2xl p-5 border border-text-main/10 flex flex-col shadow-lg">
        <h3 className="text-lg font-bold text-text-main mb-3">비밀번호 변경</h3>

        {step === 1 ? (
          <div className="w-full mb-3">
            <div className="text-sm text-text-sub/90 mb-3">
              본인 확인을 위해 현재 비밀번호를 입력해주세요.
            </div>
            <div className="flex flex-col gap-4">
              <Input
                type="password"
                placeholder="현재 비밀번호 입력"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setErrorMsg('');
                }}
                onKeyDown={(e) => handleKeyDown(e, handleCurrentPasswordSubmit)}
                leftIcon={<Lock size={18} />}
              />
              {errorMsg && (
                <p className="text-error-500 text-xs ml-1 font-medium">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full mb-3">
            <div className="text-sm text-text-sub/90 mb-3">
              새로운 비밀번호를 설정해주세요.
            </div>
            <div className="flex flex-col gap-4">
              <Input
                type="password"
                placeholder="새 비밀번호 입력"
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
                <p className="text-error-500 text-xs ml-1 font-medium">
                  {errorMsg}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 w-full mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-neutral-600 text-text-main text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            취소
          </button>

          <button
            onClick={
              step === 1 ? handleCurrentPasswordSubmit : handleNewPasswordSubmit
            }
            disabled={
              loading ||
              (step === 1 ? !currentPassword : !newPassword || !confirmPassword)
            }
            className="flex-1 py-3 text-bg-main text-sm font-bold rounded-xl transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-500/90 flex justify-center items-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-bg-main border-t-transparent rounded-full animate-spin" />
            ) : step === 1 ? (
              '다음'
            ) : (
              '변경'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
