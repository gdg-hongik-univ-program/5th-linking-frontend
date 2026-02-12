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

export default function ItemCard({ item }) {
  const { title, tags, importance, createdAt } = item;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex gap-3 py-1 cursor-pointer group select-none"
    >
      {/* 1. 좌측 썸네일 영역 */}
      <div className="relative w-24 h-24 bg-neutral-200 rounded-xl shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
        <LinkIcon size={40} className="text-neutral-600" />
        {/* 1-1. 중요 표시 */}
        {importance && (
          <div className="absolute top-1.5 right-1.5 drop-shadow-md">
            <Star size={20} fill="currentColor" className="text-primary-500" />
          </div>
        )}
        {/* 1-2. D-Day 배지 */}
        <div className="absolute bottom-1.5 right-1.5 drop-shadow-md">
          <DDayBadge deadline={item.deadline} />
        </div>
      </div>

      {/* 2. 우측 정보 영역 */}
      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        {/* 2-1. 상단 링크 제목 (최대 2줄) */}
        <h3 className="text-sm font-medium text-text-main leading-snug line-clamp-2">
          {title}
        </h3>

        {/* 2-2. 하단 세부 사항 영역 */}
        <div className="flex flex-col items-end gap-1 min-w-0">
          {/* 2-2-1. 태그 영역 (최대 1줄) */}
          {tags && tags.length > 0 && (
            <div className="w-full flex flex-wrap justify-end gap-1 overflow-hidden max-h-[20px]">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-neutral-700 rounded-full text-[10px] text-text-sub font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 2-2-2. 생성일 */}
          <p className="text-[11px] text-text-sub opacity-80 shrink-0">
            {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
