import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <PageHeader />

      <main className="flex-1 px-6 flex flex-col items-center justify-center pb-24">
        <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-primary" />
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center text-text-main">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-text-sub text-center mb-10 leading-relaxed">
          요청하신 페이지가 사라졌거나 <br />
          잘못된 경로로 접근했어요.
        </p>

        <div className="flex flex-col w-full gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3.5 px-4 rounded-full bg-neutral-800 text-text-main font-bold hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            이전 페이지로 이동
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-3.5 px-4 rounded-full bg-primary-500 text-neutral-950 font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5" />
            홈으로 이동
          </button>
        </div>
      </main>
    </div>
  );
}
