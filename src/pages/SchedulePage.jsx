import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';

export default function SchedulePage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full">
      <TabHeader title="일정">
        <IconButton
          icon={Bell}
          onClick={() => navigate('/notification')}
          aria-label="알림함"
        />
      </TabHeader>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-text-sub text-lg font-medium">
          일정 페이지 구현 중입니다.
        </p>
      </main>
    </div>
  );
}
