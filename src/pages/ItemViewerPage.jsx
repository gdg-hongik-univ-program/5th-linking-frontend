import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';
import {
  PenLine,
  MoreHorizontal,
  Star,
  ExternalLink,
  Link as LinkIcon,
  Share2,
  FolderInput,
  WandSparkles,
  Trash2,
} from 'lucide-react';
import { useFolders } from '../hooks/useFolders';
import { useItem } from '../hooks/useItem';
import { findFolderPath } from '../utils/findFolderPath';
import { formatDate } from '../utils/formatDate';
import { getYoutubeId } from '../utils/getYoutubeId';
import { useModalStore } from '../store/useModalStore';
import ActionSheet from '../components/common/ActionSheet';
import BottomSheet from '../components/common/BottomSheet';
import FolderPicker from '../components/common/FolderPicker';
import IconButton from '../components/common/IconButton';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';
import Snackbar from '../components/common/Snackbar';

export default function ItemViewerPage() {
  const navigate = useNavigate();

  const { itemId } = useParams();

  const { openAlert } = useModalStore();

  const {
    item,
    isLoading,
    snackbar,
    handleToggleImportance,
    handleUndo,
    handleGoToEdit,
    handleVisit,
    handleShare,
    connectedItems,
    isLoadingConnections,
    handleConnect,
    handleDisconnect,
    handleMove,
    handleDelete,
  } = useItem(itemId);

  const { folders: folderTree } = useFolders();

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const folderPathDisplay = useMemo(() => {
    if (!item?.folderId) return '저장소 최상단';
    const pathArray = findFolderPath(folderTree, item.folderId);
    return pathArray ? pathArray.join('/') : '알 수 없는 폴더';
  }, [folderTree, item?.folderId]);

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

  const dDayStyles = {
    upcoming: 'bg-error-500 text-text-main',
    normal: 'bg-error-50 text-text-error',
    past: 'bg-neutral-500 text-text-main opacity-60',
  };

  const handleFolderSelect = async (selectedId) => {
    setIsPickerOpen(false);
    await handleMove(selectedId);
  };

  const safeConnectedItems = useMemo(() => {
    const selfId = item?.itemId ?? itemId;
    if (!connectedItems || selfId == null) return connectedItems;

    return connectedItems.filter((it) => {
      const id =
        typeof it === 'object' && it !== null
          ? (it.itemId ?? it.id ?? it._id)
          : it;
      if (id == null) return true;
      return String(id) !== String(selfId);
    });
  }, [connectedItems, itemId, item?.itemId]);

  const handleConnectSafe = async (target) => {
    const selfId = item?.itemId ?? itemId;
    const targetId =
      typeof target === 'object' && target !== null
        ? (target.itemId ?? target.id ?? target._id)
        : target;

    if (
      selfId != null &&
      targetId != null &&
      String(targetId) === String(selfId)
    ) {
      openAlert({
        title: '연결 불가',
        message: '자기 자신과는 연결할 수 없어요.',
      });
      return;
    }

    await handleConnect(target);
  };

  const actionSheetSections = [
    {
      items: [
        {
          id: 'move',
          label: '이동',
          icon: FolderInput,
          onClick: () => {
            setMenuAnchor(null);
            setIsPickerOpen(true);
          },
        },
        {
          id: 'ai-summary',
          label: 'AI 요약',
          badge: 'BETA',
          icon: WandSparkles,
          onClick: () => {
            setMenuAnchor(null);
            openAlert({
              title: 'AI 요약',
              message:
                'AI 요약 기능은 아직 준비 중이에요. 곧 만나볼 수 있어요.',
            });
          },
        },
        {
          id: 'delete',
          label: '삭제',
          icon: Trash2,
          onClick: () => {
            setMenuAnchor(null);
            handleDelete();
          },
        },
      ],
    },
  ];

  if (isLoading || !item) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-main">
        <LoadingSpinner size="lg" color="text-primary-500" />
      </div>
    );
  }

  const videoId = getYoutubeId(item.url);

  return (
    <div className="h-full flex flex-col font-family-sans bg-bg-main text-text-main overflow-y-auto scrollbar-hide">
      <PageHeader onBack={() => navigate(-1)}>
        <IconButton
          icon={PenLine}
          onClick={handleGoToEdit}
          aria-label="수정하기"
        />
        <IconButton
          icon={MoreHorizontal}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          aria-label="더보기"
        />
      </PageHeader>

      <main className="flex-1 flex flex-col pt-2 pb-20">
        {/* 비디오 */}
        {(videoId || item.imageUrl) && (
          <div className="w-full aspect-video bg-black shrink-0 relative overflow-hidden">
            {videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                allowFullScreen
                title="video"
              />
            ) : item.imageUrl ? (
              <>
                <img
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-60"
                  src={item.imageUrl}
                  alt=""
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    className="max-w-full max-h-full object-contain"
                    src={item.imageUrl}
                    alt=""
                  />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg-nav text-text-sub text-sm">
                썸네일 없음
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* 디데이 및 태그 */}
          {((dDayDisplay && dDayDisplay.diff >= -30) ||
            (item.tags && item.tags.length > 0)) && (
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
          )}

          {/* 제목 및 상세정보 토글 */}
          <div>
            <h1 className="text-2xl font-bold leading-tight mb-2 break-words">
              {item.title || '제목 없음'}
            </h1>

            <div className="text-sm text-text-sub">
              {!isDetailExpanded ? (
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
                <div className="flex flex-col gap-3 mt-3 bg-neutral-800/40 p-5 rounded-2xl animate-in fade-in zoom-in-95 duration-200 border border-text-main/10 shadow-sm">
                  {item.createdAt && (
                    <InfoRow
                      label="생성일"
                      value={format(
                        new Date(item.createdAt),
                        'yyyy년 MM월 dd일',
                      )}
                    />
                  )}
                  {item.updatedAt && (
                    <InfoRow
                      label="수정일"
                      value={format(
                        new Date(item.updatedAt),
                        'yyyy년 MM월 dd일',
                      )}
                    />
                  )}
                  {item.deadline && (
                    <InfoRow
                      label="마감일"
                      value={format(
                        new Date(item.deadline),
                        'yyyy년 MM월 dd일',
                      )}
                    />
                  )}
                  {item.url && (
                    <InfoRow label="URL" value={item.url} truncate />
                  )}
                  <InfoRow label="위치" value={folderPathDisplay} />

                  <div className="flex justify-end mt-1">
                    <button
                      className="text-[11px] underline text-text-disabled hover:text-text-sub transition-colors py-1 px-1"
                      onClick={() => setIsDetailExpanded(false)}
                    >
                      줄이기
                    </button>
                  </div>
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

          {/* 메모 */}
          <div className="text-base leading-relaxed whitespace-pre-wrap pb-10 min-h-[100px]">
            {item.memo || (
              <span className="text-text-sub opacity-50">
                메모 내용이 없어요.
              </span>
            )}
          </div>
        </div>
      </main>

      {/* 바텀 시트 */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        items={safeConnectedItems}
        isLoading={isLoadingConnections}
        onConnect={handleConnectSafe}
        onDisconnect={handleDisconnect}
      />

      <ActionSheet
        isOpen={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        sections={actionSheetSections}
        anchorEl={menuAnchor}
      />

      <FolderPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleFolderSelect}
        title="이동할 폴더 선택"
      />

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

function InfoRow({ label, value, truncate }) {
  return (
    <div className="flex gap-3">
      <span className="min-w-[50px] text-text-sub text-xs">{label}</span>
      <span
        className={`text-text-main text-xs ${truncate ? 'truncate break-all line-clamp-1' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
