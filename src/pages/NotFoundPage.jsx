import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <PageHeader />

      <main className="flex-1 px-6 flex flex-col items-center justify-center pb-24">
        <div className="bg-bg-main w-full max-w-xs rounded-2xl p-5 flex flex-col">
          <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-5 mx-auto">
            <AlertCircle className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-lg font-bold text-text-main mb-2 text-center">
            페이지 오류
          </h1>

          <p className="text-text-sub text-sm mb-6 min-h-[40px] line-clamp-2 text-center leading-relaxed">
            요청하신 페이지가 사라졌거나 <br />
            잘못된 경로로 접근했어요.
          </p>

          <div className="flex gap-2 w-full mt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 bg-transparent border border-neutral-600 text-text-main text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
            >
              뒤로가기
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="flex-1 py-3 text-bg-main text-sm font-bold rounded-xl transition-colors bg-primary-500 hover:bg-primary-500/90 flex items-center justify-center gap-2"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
