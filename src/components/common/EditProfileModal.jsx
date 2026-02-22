import { useState, useEffect } from 'react';
import { X, UserRoundPen } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useModalStore } from '../../store/useModalStore';
import { getProfileAsset } from '../../constants/assets';
import Input from './Input';
import ProfileImageSelectorPopup from './ProfileImageSelectorPopup';

export default function EditProfileModal({
  isOpen,
  onClose,
  initialData, // { nickName, imageCode, maxTier }
  onSuccess,   // Callback to re-fetch profile data after successful edit
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
    if (nickName === initialData.nickName && imageCode === initialData.imageCode) {
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
        title: '수정 완료',
        message: '프로필 정보가 성공적으로 변경되었습니다.',
        confirmText: '확인',
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      openAlert({
        title: '수정 실패',
        message: error.response?.data?.message || '프로필 수정 중 오류가 발생했습니다.',
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
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div 
          className="bg-bg-main w-full max-w-sm rounded-3xl shadow-2xl border border-text-main/10 flex flex-col relative animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-text-main/5 relative">
            <div className="w-8" />
            <h3 className="text-lg font-bold text-text-main">프로필 수정</h3>
            <button
              onClick={onClose}
              className="p-1 -mr-1 text-text-sub hover:text-text-main hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col items-center gap-6">
            {/* Image Preview & Selector Trigger */}
            <div
              onClick={() => setIsSelectorOpen(true)}
              className="group relative w-32 h-32 rounded-full flex items-center justify-center border-2 border-text-main/10 hover:border-primary-500 overflow-hidden cursor-pointer shadow-lg transition-all"
              style={{ backgroundColor: asset.bg || '#262626' }}
            >
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ padding: asset.padding ? `calc(${asset.padding})` : '0px' }}
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

            <p className="text-xs text-text-sub -mt-3">이미지를 터치하여 변경</p>

            {/* Input Form */}
            <div className="w-full">
              <label className="text-sm font-medium text-text-sub mb-2 block ml-1">닉네임</label>
              <Input
                name="nickName"
                value={nickName}
                onChange={handleNickNameChange}
                onClear={() => setNickName('')}
                placeholder="닉네임 (2~10자 이내)"
                message={message}
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-neutral-800 text-text-main hover:bg-neutral-700 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!nickNameRegex.test(nickName) || isSubmitting}
                className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-primary-500 text-bg-main hover:bg-primary-500/90 disabled:opacity-50 disabled:bg-neutral-700 disabled:text-text-sub disabled:cursor-not-allowed shadow-[0_0_20px_rgba(var(--color-primary-500),0.3)]"
              >
                {isSubmitting ? '수정 중...' : '수정 완료'}
              </button>
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
