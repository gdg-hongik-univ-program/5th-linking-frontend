import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getItem,
  getConnectedItems,
  connectItem,
  updateItemImportance,
} from '../api/itemApi';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import BottomSheet from '../components/common/BottomSheet';
import {
  Star,
  ExternalLink,
  Link as LinkIcon,
  Share2,
  MoreHorizontal,
  PenLine,
} from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';

export default function ItemViewerPage() {
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
    updatedAt: '',
  });
  const [connectedItems, setConnectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  const refreshData = async () => {
    const targetId = itemId || 23;
    try {
      const itemData = await getItem(targetId);
      setData(itemData);
      try {
        const validItems = await getConnectedItems(targetId);
        setConnectedItems(validItems);
      } catch (connectError) {
        console.warn('연결된 아이템 목록 조회 실패:', connectError);
        setConnectedItems([]);
      }
    } catch (error) {
      console.error('아이템 상세 조회 실패:', error);
      alert('링크를 불러오는데 실패했어요.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshData();
  }, [itemId, navigate]);

  const handleEdit = () => {
    navigate(`/edit/${data.itemId || itemId || 23}`, { state: { data } });
  };

  const handleView = (targetId) => {
    navigate(`/view/${targetId}`);
    setIsSheetOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: data.title, url: data.url });
    } else {
      navigator.clipboard.writeText(data.url);
      alert('URL이 복사되었어요.');
    }
  };

  const handleVisit = () => {
    if (data.url) window.open(data.url, '_blank');
  };

  const handleConnectById = async (targetLinkItemId) => {
    try {
      const targetId = data.itemId || itemId;
      await connectItem(targetId, targetLinkItemId);
      alert('링크가 서로 연결되었어요.');
      refreshData();
    } catch (error) {
      console.error('아이템 연결 실패:', error);
      alert('링크를 서로 연결하는데 실패했어요. ID를 확인해주세요.');
    }
  };

  const handleToggleImportance = async () => {
    try {
      const targetId = data.itemId || itemId;
      await updateItemImportance(targetId, !data.importance);
      setData((prev) => ({ ...prev, importance: !prev.importance }));
    } catch (error) {
      console.error('중요도 변경 실패:', error);
      alert('중요도 변경에 실패했어요.');
    }
  };

  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getDDay = (dateString) => {
    if (!dateString) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-DAY';
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const formatSmartTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const isThisYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (isThisYear) {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    } else {
      return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
  };

  const formatDateDetail = (dateString, fallback = '-') => {
    if (!dateString) return fallback;
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return null;

    const today = new Date();
    const targetDate = new Date(deadline);
    const diff = differenceInCalendarDays(targetDate, today);

    if (diff === 0 || (diff > 0 && diff <= 7)) {
      return 'upcoming';
    } else if (diff > 7) {
      return 'normal';
    } else {
      return 'past';
    }
  };

  const deadlineStyles = {
    upcoming: 'bg-error-500 text-text-main',
    normal: 'bg-error-50 text-text-error',
    past: 'bg-neutral-500 text-text-main opacity-60',
  };

  const videoId = getYoutubeId(data.url);
  const displayCount = connectedItems.length;

  if (loading) return <div className="h-full bg-bg-main" />;

  return (
    <div className="h-full flex flex-col font-family-sans bg-bg-main text-text-main relative overflow-hidden">
      <PageHeader>
        <IconButton icon={PenLine} onClick={handleEdit} aria-label="수정하기" />
        <IconButton icon={MoreHorizontal} aria-label="더보기" />
      </PageHeader>

      <main className="flex-1 flex flex-col pt-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-20">
        <div className="w-full aspect-video bg-black shrink-0 relative">
          {videoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-nav text-text-sub">
              <span className="text-sm">동영상 없음</span>
            </div>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* 태그 및 디데이 영역 */}
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {data.deadline && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${deadlineStyles[getDeadlineStatus(data.deadline)]}`}
              >
                {getDDay(data.deadline)}
              </span>
            )}
            {data.tags &&
              data.tags.length > 0 &&
              data.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-neutral-700 rounded-full text-xs text-text-sub"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* 제목 및 상세 정보 확장 영역 */}
          <div>
            <h1 className="text-xl font-bold leading-tight mb-1.5 text-text-main break-words">
              {data.title || '제목 없음'}
            </h1>

            <div className="text-sm text-text-sub">
              {!isDetailExpanded ? (
                <div className="flex items-center gap-2">
                  <span>
                    {data.createdAt
                      ? formatSmartTime(data.createdAt)
                      : formatSmartTime(new Date())}
                  </span>
                  <button
                    className="text-text-sub ml-1 underline hover:text-text-main"
                    onClick={() => setIsDetailExpanded(true)}
                  >
                    더보기
                  </button>
                </div>
              ) : (
                //확장 상태
                <div className="flex flex-col gap-1.5 mt-2 bg-neutral-700 p-3 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
                  {/* 생성일 영역 */}
                  <div className="flex gap-2">
                    <span className="min-w-[40px] text-text-sub">생성일</span>
                    <span className="text-text-main">
                      {formatDateDetail(data.createdAt)}
                    </span>
                  </div>

                  {/* 수정일 영역 */}
                  <div className="flex gap-2">
                    <span className="min-w-[40px] text-text-sub">수정일</span>
                    <span className="text-text-main">
                      {formatDateDetail(data.updatedAt || data.createdAt)}
                    </span>
                  </div>

                  {/* 마감일 영역 */}
                  <div className="flex gap-2">
                    <span className="min-w-[40px] text-text-sub">마감일</span>
                    <span className="text-text-main">
                      {formatDateDetail(data.deadline, '기한 없음')}
                    </span>
                  </div>

                  {/* URL 영역 */}
                  <div className="flex gap-2">
                    <span className="min-w-[40px] text-text-sub shrink-0">
                      URL
                    </span>
                    <span className="text-text-main truncate">{data.url}</span>
                  </div>

                  {/* 위치 및 줄이기 버튼 영역 */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <span className="min-w-[40px] text-text-sub">위치</span>
                      <span className="text-text-main">
                        {data.folderId}번 폴더
                      </span>
                    </div>
                    <button
                      className="text-xs text-text-sub underline hover:text-text-main ml-2"
                      onClick={() => setIsDetailExpanded(false)}
                    >
                      줄이기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* 액션 버튼 영역 */}
          <div className="flex justify-between items-center px-4 py-1">
            <button
              onClick={handleToggleImportance}
              className="flex flex-col items-center gap-1.5 min-w-[60px] text-text-sub hover:text-text-main transition-colors active:scale-95"
            >
              <div
                className={`p-1 ${data.importance ? 'text-primary-500' : ''}`}
              >
                <Star
                  size={24}
                  strokeWidth={1.5}
                  fill={data.importance ? '#eabe2f' : 'none'}
                />
              </div>
              <span className="text-xs font-medium">중요</span>
            </button>
            <ActionItem
              icon={ExternalLink}
              label="방문"
              onClick={handleVisit}
            />
            <ActionItem
              icon={LinkIcon}
              label="연결"
              onClick={() => setIsSheetOpen(true)}
            />
            <ActionItem icon={Share2} label="공유" onClick={handleShare} />
          </div>

          <hr className="border-border-default" />

          <div className="text-base leading-relaxed text-text-main whitespace-pre-wrap pb-10 mt-1">
            {data.memo || '메모 내용이 없어요.'}
          </div>
        </div>
      </main>

      <BottomSheet
        title="연결된 링크"
        count={`${displayCount}개`}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onConnectById={handleConnectById}
      >
        {displayCount > 0 ? (
          <div className="flex flex-col gap-3 pb-6">
            {connectedItems.map((item) => (
              <div
                key={item.itemId || item.id}
                onClick={() => handleView(item.itemId || item.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-nav active:bg-neutral-700 transition-colors cursor-pointer border border-border-default"
              >
                <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center shrink-0">
                  <LinkIcon size={18} className="text-text-sub" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-main truncate">
                    {item.title || '제목 없음'}
                  </div>
                  <div className="text-xs text-text-sub truncate">
                    {item.url || 'URL 없음'}
                  </div>
                </div>
                <ExternalLink size={16} className="text-text-sub" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-sub gap-2 py-10">
            <LinkIcon size={40} className="opacity-20 mb-2" />
            <p className="text-sm">연결된 링크가 없어요.</p>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

function ActionItem({ icon: Icon, label, isActive, activeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 min-w-[60px] text-text-sub hover:text-text-main transition-colors active:scale-95"
    >
      <div className={`p-1 ${isActive ? activeColor : ''}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
