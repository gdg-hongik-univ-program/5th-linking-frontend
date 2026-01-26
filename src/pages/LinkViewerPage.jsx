import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import BottomSheet from '../components/common/BottomSheet';
import {
  ArrowLeft,
  Star,
  MoreHorizontal,
  PenLine,
  ExternalLink,
} from 'lucide-react';

const LinkViewerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState({
    itemId: null,
    title: '',
    url: '',
    folderId: null,
    tags: [],
    memo: '',
    importance: false,
    deadline: '',
    createdAt: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkDetail = async () => {
      setLoading(true);
      try {
        const targetId = id || 23;
        const response = await axiosInstance.get(`/item/${targetId}`);
        setData(response.data);
      } catch (error) {
        console.error('상세 정보 조회 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkDetail();
  }, [id, navigate]);

  const handleEdit = () => {
    navigate(`/edit/${data.itemId || id || 23}`, { state: { data } });
  };

  const formatDateParts = (dateString) => {
    if (!dateString) return { year: '', month: '', day: '' };
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return { year: '', month: '', day: '' };

    const year = dateObj.getFullYear().toString();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');

    return { year, month, day };
  };

  const { year, month, day } = formatDateParts(data.deadline);
  const hasDate = year && month && day;
  const hasTags = data.tags && data.tags.length > 0;

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(data.url);

  const getColor = (val) => (val ? 'text-text-main' : 'text-text-disabled');

  if (loading) return <div className="h-full bg-bg-main" />;

  return (
    <div className="h-full flex flex-col font-family-sans relative overflow-hidden bg-bg-main">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 z-10 shrink-0">
        <button
          className="p-3 -ml-2 hover:bg-bg-nav rounded-full transition active:scale-95"
          type="button"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={24} className="text-text-main" />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleEdit}
            className="p-3 hover:bg-bg-nav rounded-full transition group active:scale-95"
          >
            <PenLine
              size={24}
              className="text-text-main group-hover:text-primary-500 transition-colors"
            />
          </button>

          <div className="p-3 cursor-default">
            {/* importance 값에 따라 별 색상 변경 */}
            <Star
              size={24}
              className={`transition-colors duration-200 ${
                data.importance
                  ? 'text-primary-500 fill-primary-500'
                  : 'text-neutral-600'
              }`}
            />
          </div>

          <button className="p-3 -mr-2 hover:bg-bg-nav rounded-full transition active:scale-95">
            <MoreHorizontal size={24} className="text-text-main" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 pt-2 pb-40 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        {/* Title */}
        <div className="w-full bg-transparent text-2xl font-bold text-text-main shrink-0 py-1 leading-normal break-keep">
          {data.title || <span className="text-text-disabled">제목 없음</span>}
        </div>

        {/* 메타 정보 컨테이너 */}
        <div className="flex flex-col gap-3 shrink-0">
          {/* URL Row */}
          <div className="flex items-center min-h-[40px]">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              URL
            </label>
            <div className="flex items-center flex-1 relative min-w-0">
              {data.url ? (
                <>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-text-main hover:text-primary-500 transition-colors text-base truncate block mr-2"
                  >
                    {data.url}
                  </a>

                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-text-sub hover:text-primary-500 transition-colors shrink-0 -mr-2"
                  >
                    <ExternalLink size={20} />
                  </a>
                </>
              ) : (
                <span className="text-text-disabled text-base">URL 입력</span>
              )}
            </div>
          </div>

          {/* Deadline Row */}
          <div className="flex items-center min-h-[40px]">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              마감일
            </label>
            <div className="flex items-center flex-1 relative">
              <div className="flex items-center mr-1">
                <div
                  className={`w-9 bg-transparent text-base text-right ${getColor(year)}`}
                >
                  {year || 'YYYY'}
                </div>
                <span className={`text-base ${getColor(year)}`}>년</span>
              </div>

              <div className="flex items-center mr-1">
                <div
                  className={`w-6 bg-transparent text-base text-right ${getColor(month)}`}
                >
                  {month || 'MM'}
                </div>
                <span className={`text-base ${getColor(month)}`}>월</span>
              </div>

              <div className="flex items-center mr-auto">
                <div
                  className={`w-6 bg-transparent text-base text-right ${getColor(day)}`}
                >
                  {day || 'DD'}
                </div>
                <span className={`text-base ${getColor(day)}`}>
                  {hasDate ? '일' : '일 입력'}
                </span>
              </div>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex min-h-[40px] items-center">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              태그
            </label>

            <div className="flex-1 flex flex-wrap gap-2">
              {hasTags ? (
                data.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-700 text-text-main rounded-full text-sm font-medium"
                  >
                    <span>{tag}</span>
                  </div>
                ))
              ) : (
                <span className="text-text-disabled text-base">태그 없음</span>
              )}
            </div>
          </div>

          {/* Location Row */}
          <div className="flex items-center min-h-[40px]">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              위치
            </label>
            <div className="flex items-center flex-1 relative">
              <div
                className={`flex-1 bg-transparent text-base mr-auto ${data.folderId ? 'text-text-main' : 'text-text-disabled'}`}
              >
                {data.folderId ? `${data.folderId}번 폴더` : '폴더 없음'}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Section */}
        {videoId && (
          <div className="w-full shrink-0 rounded-xl overflow-hidden bg-black aspect-video relative mb-6">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* Memo Area */}
        <div
          className={`w-full flex-1 min-h-[200px] bg-transparent text-base leading-loose py-2 resize-none whitespace-pre-wrap ${data.memo ? 'text-text-main' : 'text-text-disabled'}`}
        >
          {data.memo || '메모 입력'}
        </div>
      </main>

      {/* BottomSheet */}
      <BottomSheet title="연결된 링크" count="0개 연결됨">
        <div className="p-4 text-center text-text-sub text-sm">
          아직 연결된 링크 데이터가 없습니다.
        </div>
      </BottomSheet>
    </div>
  );
};

export default LinkViewerPage;
