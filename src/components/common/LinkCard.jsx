import { Star, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import DDayBadge from './DDayBadge';

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
  if (!dateString) return '생성일 없음';
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return '생성일 없음';

  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${ampm} ${hours}:${strMinutes}`;
  }

  if (isThisYear) {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default function LinkCard({ link }) {
  const { title, tags, importance, createdAt } = link;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex gap-4 py-2 cursor-pointer group select-none"
    >
      {/* 1. 좌측 썸네일 영역 */}
      <div className="relative w-24 h-24 bg-neutral-200 rounded-xl shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
        <LinkIcon size={40} className="text-neutral-600" />
        {/* 1-1. 중요 표시 */}
        {importance && (
          <div className="absolute top-1.5 right-1.5 drop-shadow-md">
            <Star size={14} fill="currentColor" className="text-primary-500" />
          </div>
        )}
        {/* 1-2. D-Day 배지 */}
        <div className="absolute bottom-1.5 right-1.5">
          <DDayBadge deadline={link.deadline} />
        </div>
      </div>

      {/* 2. 우측 정보 영역 */}
      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        {/* 2-1. 상단 링크 제목 */}
        <h3 className="text-[15px] font-medium text-text-main leading-snug line-clamp-2 overflow-hidden text-ellipsis break-keep">
          {title}
        </h3>

        {/* 2-2. 하단 세부 사항 영역 */}
        <div className="flex flex-col items-end gap-0.5 min-w-0">
          {/* 2-2-1. 태그 (최대 1줄) */}
          <div className="w-full text-right truncate">
            {tags && tags.length > 0 ? (
              <span className="text-[11px] text-text-sub font-medium">
                {tags.map((tag) => `#${tag}`).join(' ')}
              </span>
            ) : (
              <span className="text-[11px] text-text-sub font-medium">
                태그 없음
              </span>
            )}
          </div>

          {/* 2-2-2. 생성일 */}
          <p className="text-[11px] text-text-sub opacity-80 shrink-0">
            {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
