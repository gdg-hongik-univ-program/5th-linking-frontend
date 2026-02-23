import { useState, useEffect } from 'react';
import { UserRoundPen } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useModalStore } from '../../store/useModalStore';
import { getProfileAsset } from '../../constants/assets';
import Input from './Input';
import ProfileImageSelectorPopup from './ProfileImageSelectorPopup';

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData, // { nickName, imageCode, maxTier }
  onSuccess, // Callback to re-fetch profile data after successful edit
}) {
  const { openAlert } = useModalStore();
  const [nickName, setNickName] = useState('');
  const [imageCode, setImageCode] = useState('');
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // validation states
  const [message, setMessage] = useState('');

  // regex equivalent from SignupPage
  const nickNameRegex = /^[a-zA-Z가-힣0-9]{2,10}$/;

  useEffect(() => {
    if (isOpen && initialData) {
      setNickName(initialData.nickName || '');
      setImageCode(initialData.imageCode || 'GHOST');
      setMessage('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleNickNameChange = (e) => {
    const value = e.target.value;
    setNickName(value);

    // Inline validation logic
    if (!value) {
      setMessage('');
    } else if (!nickNameRegex.test(value)) {
      setMessage('한글, 영문, 숫자 2~10자 이내로 입력해주세요.');
    } else {
      setMessage('');
    }
  };

  const handleSubmit = async () => {
    if (!nickNameRegex.test(nickName)) {
      setMessage('올바른 닉네임 형식이 아닙니다.');
      return;
    }

    // If no changes were made, just close
    if (
      nickName === initialData.nickName &&
      imageCode === initialData.imageCode
    ) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.patch('/user/nickname', {
        nickName,
        imageCode,
      });

      openAlert({
        title: '프로필 수정 완료',
        message: '프로필 정보가 성공적으로 수정되었어요.',
        confirmText: '확인',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      openAlert({
        title: '프로필 수정 실패',
        message:
          error.response?.data?.message ||
          '프로필 수정 중 오류가 발생했어요. 다시 시도해 주세요.',
        confirmText: '확인',
        isDanger: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const asset = getProfileAsset(imageCode);

  return (
    <>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-4">
        <div
          className="bg-bg-main w-full max-w-xs rounded-2xl p-5 border border-text-main/10 flex flex-col shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <h3 className="text-lg font-bold text-text-main mb-3">프로필 수정</h3>

          {/* Content */}
          <div className="flex flex-col items-center gap-6">
            {/* Image Preview & Selector Trigger */}
            <div
              onClick={() => setIsSelectorOpen(true)}
              className="group relative w-32 h-32 rounded-full flex items-center justify-center border-2 border-text-main/10 hover:border-primary-500 overflow-hidden cursor-pointer shadow-lg transition-all"
              style={{ backgroundColor: asset.bg || '#262626' }}
            >
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  padding: asset.padding ? `calc(${asset.padding})` : '0px',
                }}
              >
                <img
                  src={asset.path}
                  alt="Selected Profile"
                  className="w-full h-full object-contain object-center"
                  style={{ transform: `scale(${asset.scale || 1})` }}
                />
              </div>
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-black/50 transition-all duration-300">
                <UserRoundPen size={28} className="text-white" />
              </div>
            </div>

            <p className="text-xs text-text-sub -mt-3">
              이미지를 터치하여 변경
            </p>

            {/* Input Form */}
            <div className="w-full">
              <div className="w-full mb-3">
                <Input
                  name="nickName"
                  value={nickName}
                  onChange={handleNickNameChange}
                  onClear={() => setNickName('')}
                  placeholder="닉네임 입력 (2~10자 이내)"
                  message={message}
                />
              </div>

              <div className="flex gap-2 w-full mt-2">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-transparent border border-neutral-600 text-text-main text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  취소
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!nickNameRegex.test(nickName) || isSubmitting}
                  className="flex-1 py-3 text-bg-main text-sm font-bold rounded-xl transition-colors disabled:opacity-50 bg-primary-500 hover:bg-primary-500/90"
                >
                  {isSubmitting ? '수정 중...' : '수정'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reused Profile Image Selector */}
      <ProfileImageSelectorPopup
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        currentImageCode={imageCode}
        onSelect={(code) => {
          setImageCode(code);
          setIsSelectorOpen(false);
        }}
        maxTier={initialData?.maxTier || 'PAWN'}
      />
    </>
  );
}
