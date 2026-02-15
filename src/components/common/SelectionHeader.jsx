import {
  CircleX,
  FolderInput,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import IconButton from './IconButton';

export default function SelectionHeader({
  selectedCount = 0,
  isAllSelected = false,
  onClose,
  onMove,
  onDelete,
  onToggleAll,
}) {
  const toggleLabel = isAllSelected ? '전체 선택 해제' : '전체 선택';
  const isActionDisabled = selectedCount === 0;

  const disabledClass =
    'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-inherit';

  return (
    <div className="pb-1 border-neutral-800 animate-fade-in-down">
      {/* 상단 */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* 선택 모드 종료 버튼 */}
        <div className="justify-self-start">
          <IconButton
            icon={CircleX}
            onClick={onClose}
            aria-label="선택 모드 종료"
            size={18}
            className="text-text-sub hover:text-text-main"
          />
        </div>

        {/* 선택된 개수 */}
        <span className="justify-self-center text-text-main font-medium text-sm">
          {selectedCount}개 선택됨
        </span>

        {/* 액션 버튼 모음 */}
        <div className="justify-self-end flex items-center">
          <IconButton
            icon={FolderInput}
            onClick={isActionDisabled ? undefined : onMove}
            aria-label="선택 항목 이동"
            size={18}
            disabled={isActionDisabled}
            className={isActionDisabled ? disabledClass : undefined}
          />
          <IconButton
            icon={Trash2}
            onClick={isActionDisabled ? undefined : onDelete}
            aria-label="선택 항목 삭제"
            size={18}
            disabled={isActionDisabled}
            className={
              isActionDisabled
                ? disabledClass
                : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
            }
          />
        </div>
      </div>

      {/* 하단 */}
      <div className="mt-1 flex justify-center">
        <button
          type="button"
          onClick={onToggleAll}
          aria-label={toggleLabel}
          className="flex items-center gap-1.5 text-text-sub hover:text-text-main transition-colors"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-primary-500" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          <span className="text-xs">{toggleLabel}</span>
        </button>
      </div>
    </div>
  );
}
