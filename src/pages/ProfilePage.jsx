import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import { useAuthStore } from '../store/useAuthStore';
import { useModalStore } from '../store/useModalStore';
import axiosInstance from '../api/axiosInstance';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { openConfirm } = useModalStore();

  // 실제 로그아웃
  const executeLogout = async () => {
    try {
      await axiosInstance.post('/user/sign-out');
    } catch (error) {
      console.error('서버 로그아웃 실패:', error);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handleLogoutClick = () => {
    openConfirm({
      title: '로그아웃',
      message: '정말 로그아웃하시겠어요?',
      confirmText: '로그아웃',
      cancelText: '취소',
      isDanger: true,
      onConfirm: executeLogout,
    });
  };

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full">
      <TabHeader title="프로필">
        <IconButton
          icon={Settings}
          onClick={() => navigate('/notification')}
          aria-label="설정"
        />
      </TabHeader>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-text-sub text-lg font-medium">
          프로필 페이지 구현 중입니다.
        </p>
        <button
          onClick={handleLogoutClick}
          className="w-full py-3 rounded-full border border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all"
        >
          로그아웃
        </button>
      </main>
    </div>
  );
}
