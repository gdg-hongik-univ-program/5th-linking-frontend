import { Folder, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/formatDate';

export default function FolderCard({
  folder,
  isSelectMode = false,
  isSelected = false,
  onSelect,
  onClick,
}) {
  const { folderName, totalCount, createdAt } = folder;

  const handleClick = () => {
    if (isSelectMode && onSelect) {
      onSelect(folder.folderId);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`flex gap-2 px-2 py-3 cursor-pointer group select-none transition-colors ${
        isSelected ? 'bg-neutral-800' : 'bg-transparent px-0'
      }`}
    >
      {/* 썸네일 */}
      <div className="relative w-24 h-24 bg-neutral-200 rounded-xl shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
        <Folder size={40} className="text-yellow-500 fill-yellow-500" />

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
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        {/* 폴더 이름 */}
        <h3 className="text-sm font-medium text-text-main leading-snug line-clamp-2">
          {folderName}
        </h3>

        <div className="flex flex-col items-end gap-1 min-w-0">
          {/* 하위 항목 개수 */}
          <p className="text-xs text-text-sub font-medium">{totalCount}개</p>

          {/* 생성일 */}
          <p className="text-xs text-text-sub opacity-80 shrink-0">
            {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
