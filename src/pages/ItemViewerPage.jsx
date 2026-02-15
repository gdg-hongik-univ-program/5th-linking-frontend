import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';
import { useItem } from '../hooks/useItem';
import { useFolders } from '../hooks/useFolders';
import { formatDate } from '../utils/formatDate';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import BottomSheet from '../components/common/BottomSheet';
import Snackbar from '../components/common/Snackbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  PenLine,
  MoreHorizontal,
  Star,
  ExternalLink,
  Link as LinkIcon,
  Share2,
  Unlink,
} from 'lucide-react';

// 폴더 경로 찾기
const findFolderPath = (nodes, targetId, currentPath = []) => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (String(node.folderId) === String(targetId)) {
      return [...currentPath, node.folderName];
    }
    if (node.children) {
      const foundPath = findFolderPath(node.children, targetId, [
        ...currentPath,
        node.folderName,
      ]);
      if (foundPath) return foundPath;
    }
  }
  return null;
};

// 유튜브 ID 추출
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function ItemViewerPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();

  const {
    item,
    connectedItems,
    isLoading,
    isLoadingConnectedItems,
    snackbar,
    handleToggleImportance,
    handleConnect,
    handleDisconnect,
    handleUndo,
    handleEdit,
    handleVisit,
    handleShare,
  } = useItem(itemId);

  const { folders: folderTree } = useFolders();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  // 폴더 경로 표시
  const folderPathDisplay = useMemo(() => {
    if (!item?.folderId) return '저장소';
    const pathArray = findFolderPath(folderTree, item.folderId);
    return pathArray ? pathArray.join('/') : '알 수 없는 폴더';
  }, [folderTree, item?.folderId]);

  // 디데이 표시
  const dDayDisplay = useMemo(() => {
    if (!item?.deadline) return null;
    const diff = differenceInCalendarDays(new Date(item.deadline), new Date());

    let status = 'normal';
    if (diff < 0) status = 'past';
    else if (diff <= 7) status = 'upcoming';

    const label =
      diff === 0 ? 'D-DAY' : `D${diff > 0 ? '-' : '+'}${Math.abs(diff)}`;

    return { diff, label, status };
  }, [item?.deadline]);

  // 디데이 배지 스타일
  const dDayStyles = {
    upcoming: 'bg-error-500 text-text-main',
    normal: 'bg-error-50 text-text-error',
    past: 'bg-neutral-500 text-text-main opacity-60',
  };

  if (isLoading || !item) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-main">
        <LoadingSpinner size="lg" color="text-primary-500" />
      </div>
    );
  }

  const videoId = getYoutubeId(item.url);

  return (
    <div className="h-full flex flex-col font-family-sans bg-bg-main text-text-main relative overflow-hidden">
      <PageHeader onBack={() => navigate(-1)}>
        <IconButton icon={PenLine} onClick={handleEdit} aria-label="수정하기" />
        <IconButton icon={MoreHorizontal} aria-label="더보기" />
      </PageHeader>

      <main className="flex-1 flex flex-col pt-2 overflow-y-auto pb-20 scrollbar-hide">
        {/* 비디오 */}
        <div className="w-full aspect-video bg-black shrink-0 relative">
          {videoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              allowFullScreen
              title="video"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-nav text-text-sub text-sm">
              동영상 없음
            </div>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* 디데이 및 태그 */}
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {dDayDisplay && dDayDisplay.diff >= -30 && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${dDayStyles[dDayDisplay.status]}`}
              >
                {dDayDisplay.label}
              </span>
            )}
            {item.tags?.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-neutral-700 rounded-full text-xs text-text-sub"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 제목 및 상세 정보 */}
          <div>
            <h1 className="text-xl font-bold leading-tight mb-2 break-words">
              {item.title || '제목 없음'}
            </h1>

            <div className="text-sm text-text-sub">
              {!isDetailExpanded ? (
                // 축소 상태
                <div className="flex items-center gap-2">
                  <span className="text-xs">{formatDate(item.createdAt)}</span>
                  <span className="text-neutral-700 text-[10px]">|</span>
                  <button
                    className="underline text-xs"
                    onClick={() => setIsDetailExpanded(true)}
                  >
                    더보기
                  </button>
                </div>
              ) : (
                // 확장 상태
                <div className="flex flex-col gap-2 mt-2 bg-bg-nav/50 p-4 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 border border-border-default">
                  {/* 생성일 */}
                  {item.createdAt && (
                    <div className="flex gap-3">
                      <span className="min-w-[50px] text-text-sub text-xs">
                        생성일
                      </span>
                      <span className="text-text-main text-xs">
                        {format(new Date(item.createdAt), 'yyyy년 MM월 dd일')}
                      </span>
                    </div>
                  )}

                  {/* 수정일 */}
                  {item.updatedAt && (
                    <div className="flex gap-3">
                      <span className="min-w-[50px] text-text-sub text-xs">
                        수정일
                      </span>
                      <span className="text-text-main text-xs">
                        {format(new Date(item.updatedAt), 'yyyy년 MM월 dd일')}
                      </span>
                    </div>
                  )}

                  {/* 마감일 */}
                  {item.deadline && (
                    <div className="flex gap-3">
                      <span className="min-w-[50px] text-text-sub text-xs">
                        마감일
                      </span>
                      <span className="text-text-main text-xs">
                        {format(new Date(item.deadline), 'yyyy년 MM월 dd일')}
                      </span>
                    </div>
                  )}

                  {/* URL */}
                  {item.url && (
                    <div className="flex gap-3">
                      <span className="min-w-[50px] text-text-sub text-xs">
                        URL
                      </span>
                      <span className="text-text-main text-xs truncate break-all line-clamp-1">
                        {item.url}
                      </span>
                    </div>
                  )}

                  {/* 위치 */}
                  <div className="flex gap-3">
                    <span className="min-w-[50px] text-text-sub text-xs">
                      위치
                    </span>
                    <span className="text-text-main text-xs">
                      {folderPathDisplay}
                    </span>
                  </div>

                  <button
                    className="text-xs underline self-end mt-1 text-text-sub"
                    onClick={() => setIsDetailExpanded(false)}
                  >
                    줄이기
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-between items-center px-4 py-1">
            <ActionItem
              icon={Star}
              label="중요"
              isActive={item.importance}
              activeColor="text-primary-500"
              fill={item.importance ? '#eabe2f' : 'none'}
              onClick={handleToggleImportance}
            />
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

          <div className="text-base leading-relaxed whitespace-pre-wrap pb-10 min-h-[100px]">
            {item.memo ? (
              item.memo
            ) : (
              <span className="text-text-sub opacity-50">
                메모 내용이 없어요.
              </span>
            )}
          </div>
        </div>
      </main>

      {/* 바텀 시트 */}
      <BottomSheet
        title="연결된 링크"
        count={connectedItems ? `${connectedItems.length}개` : '0개'}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onConnectById={handleConnect}
      >
        {isLoadingConnectedItems ? (
          <div className="py-10 text-center text-text-sub flex flex-col items-center gap-2">
            <LoadingSpinner size="md" color="text-text-sub" />
            <span className="text-sm">목록을 불러오는 중...</span>
          </div>
        ) : connectedItems && connectedItems.length > 0 ? (
          <div className="flex flex-col gap-3 pb-6">
            {connectedItems.map((cItem) => (
              <div
                key={cItem.itemId}
                className="flex items-center gap-3 p-3 rounded-xl bg-bg-nav border border-border-default active:bg-neutral-700 transition-colors cursor-pointer group"
                onClick={() => {
                  setIsSheetOpen(false);
                  navigate(`/viewer/${cItem.itemId}`);
                }}
              >
                <div className="w-10 h-10 rounded-lg bg-bg-card flex items-center justify-center shrink-0">
                  <LinkIcon size={18} className="text-text-sub" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-main truncate">
                    {cItem.title || '제목 없음'}
                  </div>
                  <div className="text-xs text-text-sub truncate">
                    {cItem.url || 'URL 없음'}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDisconnect(cItem.itemId, e)}
                  className="p-2 rounded-full hover:bg-neutral-600 text-text-sub hover:text-error-500 transition-colors"
                >
                  <Unlink size={16} />
                </button>
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

      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        onUndo={handleUndo}
      />
    </div>
  );
}

function ActionItem({
  icon: Icon,
  label,
  isActive,
  activeColor,
  onClick,
  fill = 'none',
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 min-w-[60px] text-text-sub transition-transform active:scale-95 hover:text-text-main"
    >
      <div className={`p-1 ${isActive ? activeColor : ''}`}>
        <Icon size={24} strokeWidth={1.5} fill={fill} />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
