import { motion } from 'framer-motion';
import { Star, Link as LinkIcon, Check } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import DDayBadge from './DDayBadge';

export default function ItemCard({
  item,
  isSelectMode = false,
  isSelected = false,
  onSelect,
  onClick,
}) {
  const { title, tags, importance, createdAt } = item;

  const handleClick = () => {
    if (isSelectMode && onSelect) {
      onSelect(item.itemId);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`flex gap-3 px-2 py-3 cursor-pointer group select-none transition-colors
      ${isSelected ? 'bg-neutral-800' : 'bg-transparent-0'}
    `}
    >
      {/* 썸네일 */}
      <div className="relative w-24 h-24 bg-neutral-200 rounded-xl shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
        <LinkIcon size={40} className="text-neutral-600" />

        {/* 선택 모드 체크박스 */}
        {isSelectMode && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-primary border-primary'
                  : 'bg-neutral-800/60 border-white'
              }`}
            >
              {isSelected && (
                <Check size={20} className="text-text-main" strokeWidth={3} />
              )}
            </div>
          </div>
        )}

        {/* 중요 표시 */}
        {importance && (
          <div className="absolute top-1.5 right-1.5 drop-shadow-md">
            <Star size={20} fill="currentColor" className="text-primary-500" />
          </div>
        )}

        {/* 디데이 배지 */}
        <div className="absolute bottom-1.5 right-1.5 drop-shadow-md">
          <DDayBadge deadline={item.deadline} />
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        {/* 아이템 제목 */}
        <h3 className="text-sm font-medium text-text-main leading-snug line-clamp-2">
          {title}
        </h3>

        <div className="flex flex-col items-end gap-1 min-w-0">
          {/* 태그 */}
          {tags && tags.length > 0 && (
            <div className="flex justify-start gap-1 overflow-hidden max-h-[20px] w-fit max-w-full">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-neutral-700 rounded-full text-[10px] text-text-sub font-medium whitespace-nowrap shrink-0"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 생성일 */}
          <p className="text-xs text-text-sub opacity-80 shrink-0">
            {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
