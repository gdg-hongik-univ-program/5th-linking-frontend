import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import { useAuth } from '../context/AuthProvider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
          onClick={logout}
          className="w-full py-3 rounded-full border border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all"
        >
          로그아웃
        </button>
      </main>
    </div>
  );
}
