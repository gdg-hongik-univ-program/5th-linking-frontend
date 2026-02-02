import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import BottomSheet from '../components/common/BottomSheet';
import {
  Star,
  MoreHorizontal,
  PenLine,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';

const LinkViewerPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();

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

  const [connectedLinks, setConnectedLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  useEffect(() => {
    const fetchLinkDetail = async () => {
      setLoading(true);
      const targetId = itemId || 23;

      try {
        const response = await axiosInstance.get(`/item/${targetId}`);
        setData(response.data);

        try {
          const connectedRes = await axiosInstance.get(
            `/item/link/${targetId}`,
          );
          const validLinks = connectedRes.data.filter(
            (item) => (item.itemId || item.id) && item.itemId !== 0,
          );
          setConnectedLinks(validLinks);
        } catch (linkError) {
          console.warn('연결된 링크 조회 실패:', linkError);
          setConnectedLinks([]);
        }
      } catch (error) {
        console.error('상세 정보 조회 실패:', error);
        alert('데이터를 불러오는데 실패했습니다.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkDetail();
  }, [itemId, navigate]);

  const handleEdit = () => {
    navigate(`/edit/${data.itemId || itemId || 23}`, { state: { data } });
  };

  const handleLinkClick = (linkId) => {
    navigate(`/link/${linkId}`);
  };

  // 날짜 포맷팅 함수
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

  // 유튜브 ID 추출 함수
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(data.url);
  const getColor = (val) => (val ? 'text-text-main' : 'text-text-disabled');
  const displayCount = connectedLinks.length;

  if (loading) return <div className="h-full bg-bg-main" />;

  return (
    <div className="h-full flex flex-col font-family-sans relative overflow-hidden bg-bg-main">
      <PageHeader>
        <IconButton icon={PenLine} onClick={handleEdit} aria-label="수정하기" />
        <div
          className="p-3 flex items-center justify-center cursor-default"
          aria-label="중요도 표시"
        >
          <Star
            size={24}
            className={`transition-colors duration-200 ${
              data.importance
                ? 'text-primary-500 fill-primary-500'
                : 'text-neutral-600'
            }`}
          />
        </div>

        <IconButton icon={MoreHorizontal} aria-label="더보기" />
      </PageHeader>

      <main className="flex-1 px-6 pt-2 pb-40 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
        <div className="w-full bg-transparent text-2xl font-bold text-text-main shrink-0 py-1 leading-normal break-keep">
          {data.title || <span className="text-text-disabled">제목 없음</span>}
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          {/* URL */}
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
                <span className="text-text-disabled text-base">URL 없음</span>
              )}
            </div>
          </div>

          {/* 마감일 */}
          <div className="flex items-center min-h-[40px]">
            <label className="w-20 text-text-sub text-sm font-medium shrink-0">
              마감일
            </label>
            <div className="flex items-center flex-1 relative">
              {hasDate ? (
                <>
                  <div className="flex items-center mr-1">
                    <div
                      className={`w-9 bg-transparent text-base text-right ${getColor(year)}`}
                    >
                      {year}
                    </div>
                    <span className={`text-base ${getColor(year)}`}>년</span>
                  </div>
                  <div className="flex items-center mr-1">
                    <div
                      className={`w-6 bg-transparent text-base text-right ${getColor(month)}`}
                    >
                      {month}
                    </div>
                    <span className={`text-base ${getColor(month)}`}>월</span>
                  </div>
                  <div className="flex items-center mr-auto">
                    <div
                      className={`w-6 bg-transparent text-base text-right ${getColor(day)}`}
                    >
                      {day}
                    </div>
                    <span className={`text-base ${getColor(day)}`}>일</span>
                  </div>
                </>
              ) : (
                <span className="text-text-disabled text-base">
                  마감일 없음
                </span>
              )}
            </div>
          </div>

          {/* 태그 */}
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

          {/* 위치 */}
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

        {/* 유튜브 플레이어 */}
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

        {/* 메모 */}
        <div
          className={`w-full flex-1 min-h-[200px] bg-transparent text-base leading-loose py-2 resize-none whitespace-pre-wrap ${data.memo ? 'text-text-main' : 'text-text-disabled'}`}
        >
          {data.memo || '메모 없음'}
        </div>
      </main>

      {/* 바텀시트 */}
      <BottomSheet title="연결된 링크" count={`${displayCount}개 연결됨`}>
        <div className="flex flex-col h-full mt-2">
          {displayCount > 0 ? (
            <div className="flex flex-col gap-2 pb-6">
              {connectedLinks.map((item) => {
                const linkId = item.itemId || item.id;
                return (
                  <div
                    key={linkId}
                    onClick={() => handleLinkClick(linkId)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700 active:bg-neutral-700 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800">
                      <LinkIcon size={18} className="text-text-sub" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-sm text-text-main truncate">
                        {item.title || '제목 없음'}
                      </div>
                      <div className="text-xs text-text-sub truncate">
                        {item.url || 'URL 없음'}
                      </div>
                    </div>
                    <div className="p-2 text-text-sub">
                      <ExternalLink size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-text-sub gap-2">
              <LinkIcon size={32} className="opacity-20" />
              <div className="text-sm">연결된 링크가 없습니다.</div>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default LinkViewerPage;
