import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { differenceInCalendarDays, format } from 'date-fns';
import {
  X,
  Maximize2,
  MoreHorizontal,
  PenLine,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { useItem } from '../../hooks/useItem';
import { useFolders } from '../../hooks/useFolders';
import { findFolderPath } from '../../utils/findFolderPath';
import { formatDate } from '../../utils/formatDate';
import { getYoutubeId } from '../../utils/getYoutubeId';
import { useModalStore } from '../../store/useModalStore';
import ActionSheet from './ActionSheet';
import LoadingSpinner from './LoadingSpinner';
import IconButton from './IconButton';
import Snackbar from './Snackbar';

export default function ItemDetailPopup({ itemId, onClose }) {
  const navigate = useNavigate();
  const { openAlert } = useModalStore();
  const {
    item,
    isLoading,
    snackbar,
    handleUndo,
    handleGoToEdit,
    handleShare,
    handleVisit,
  } = useItem(itemId);

  const { folders: folderTree } = useFolders();
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [imageBgColor, setImageBgColor] = useState('');

  useEffect(() => {
    const url = item?.imageUrl;
    if (!url) {
      if (imageBgColor) setImageBgColor('');
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = url;

    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const w = 32;
        const h = 32;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const { data } = ctx.getImageData(0, 0, w, h);
        const counts = new Map();
        let maxKey = null;
        let maxCount = 0;

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 128) continue;
          const r = data[i] >> 4;
          const g = data[i + 1] >> 4;
          const b = data[i + 2] >> 4;
          const key = (r << 8) | (g << 4) | b;
          const next = (counts.get(key) || 0) + 1;
          counts.set(key, next);
          if (next > maxCount) {
            maxCount = next;
            maxKey = key;
          }
        }

        if (maxKey === null) return;
        const rr = ((maxKey >> 8) & 0xf) * 17;
        const gg = ((maxKey >> 4) & 0xf) * 17;
        const bb = (maxKey & 0xf) * 17;
        setImageBgColor(`rgb(${rr}, ${gg}, ${bb})`);
      } catch {
        setImageBgColor('');
      }
    };

    img.onerror = () => {
      if (cancelled) return;
      setImageBgColor('');
    };

    return () => {
      cancelled = true;
    };
  }, [item?.imageUrl]);


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

  const actionSheetSections = [
    {
      items: [
        {
          id: 'fullscreen',
          label: '전체 화면',
          icon: Maximize2,
          onClick: () => {
            setMenuAnchor(null);
            navigate(`/view/${itemId}`);
          },
        },
        {
          id: 'edit',
          label: '수정',
          icon: PenLine,
          onClick: () => {
            setMenuAnchor(null);
            handleGoToEdit();
          },
        },
        {
          id: 'visit',
          label: '방문',
          icon: ExternalLink,
          onClick: () => {
            setMenuAnchor(null);
            handleVisit();
          },
        },
        {
          id: 'share',
          label: '공유',
          icon: Share2,
          onClick: () => {
            setMenuAnchor(null);
            handleShare();
          },
        },
      ],
    },
  ];

  if (isLoading || !item) {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-bg-main w-[90%] max-w-sm h-64 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-center border border-neutral-800">
        <LoadingSpinner size="lg" color="text-primary-500" />
      </div>
    );
  }

  const videoId = getYoutubeId(item.url);

  return (
    <div 
      className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-bg-main w-[90%] max-w-sm max-h-[42vh] rounded-xl shadow-[0_15px_60px_rgba(0,0,0,0.9)] z-50 flex flex-col pt-1 shadow-inner border border-neutral-800 animate-in slide-in-from-bottom-12 fade-in duration-300"
      onClick={() => {
        if (menuAnchor) setMenuAnchor(null);
      }}
    >
      {/* 닫기 헤더 영역 */}
      <div className="flex justify-between items-center px-2 py-0 shrink-0 border-b border-neutral-800/60 sticky top-0 bg-bg-main rounded-t-xl z-10 box-border">
        <IconButton
          icon={X}
          onClick={onClose}
          aria-label="닫기"
          className="text-neutral-400"
          size={20}
        />
        <div className="flex items-center gap-0">
          <IconButton
            icon={MoreHorizontal}
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(menuAnchor ? null : e.currentTarget);
            }}
            aria-label="더보기"
            size={20}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
        {/* 비디오 및 썸네일 */}
        {(videoId || item.imageUrl) && (
          <div
            className="w-full aspect-video bg-black shrink-0 relative overflow-hidden"
            style={
              !videoId && item.imageUrl && imageBgColor
                ? { backgroundColor: imageBgColor }
                : undefined
            }
          >
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

        <div className="px-6 py-3 flex flex-col gap-3">
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
            <h1 className="text-xl font-bold leading-tight mb-2 break-words text-text-main">
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
          
          <hr className="border-border-default" />

          {/* 메모 */}
          <div className="text-base leading-relaxed whitespace-pre-wrap pb-10 min-h-[100px] text-text-main">
            {item.memo || (
              <span className="text-text-sub opacity-50">
                메모 내용이 없어요.
              </span>
            )}
          </div>
        </div>
      </div>
      {/* 액션 시트 (더보기), 스낵바 등을 포털로 빼서 transform으로 인한 fixed 포지셔닝 오류 방지 */}
      {createPortal(
        <>
          <ActionSheet
            isOpen={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            sections={actionSheetSections}
            anchorEl={menuAnchor}
          />
          <Snackbar
            isVisible={snackbar.isVisible}
            message={snackbar.message}
            onUndo={handleUndo}
          />
        </>,
        document.body
      )}
    </div>
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
