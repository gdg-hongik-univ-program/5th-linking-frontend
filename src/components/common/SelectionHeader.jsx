import {
  X,
  FolderInput,
  RotateCcw,
  ArchiveRestore,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import IconButton from './IconButton';

export default function SelectionHeader({
  selectedCount = 0,
  isAllSelected = false,
  onClose,
  onToggleAll,
  onMove,
  onExtend,
  onDelete,
  mode = 'default',
}) {
  const toggleLabel = isAllSelected ? '전체 선택 해제' : '전체 선택';
  const isActionDisabled = selectedCount === 0;
  const disabledClass =
    'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-inherit';

  const deleteLabel = mode === 'trash' ? '영구 삭제' : '삭제';

  let ActionIcon = null;
  let actionLabel = '';
  let onActionClick = undefined;

  if (mode === 'storage') {
    ActionIcon = FolderInput;
    actionLabel = '선택 항목 이동';
    onActionClick = onMove;
  } else if (mode === 'stale') {
    ActionIcon = ArchiveRestore;
    actionLabel = '선택 항목 보관';
    onActionClick = onExtend;
  } else if (mode === 'trash') {
    ActionIcon = RotateCcw;
    actionLabel = '선택 항목 복원';
    onActionClick = onMove;
  }
  return (
    <div className="pb-1 border-neutral-800 animate-fade-in-down">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        {/* 닫기 버튼 */}
        <div className="justify-self-start">
          <IconButton
            icon={X}
            onClick={onClose}
            aria-label="선택 모드 종료"
            size={18}
            className="text-text-sub hover:text-text-main"
          />
        </div>

        {/* 선택 개수 */}
        <span className="justify-self-center text-text-main font-medium text-sm">
          {selectedCount}개 선택됨
        </span>

        {/* 액션 버튼 영역 */}
        <div className="justify-self-end flex items-center gap-1">
          {/* 이동/보관/복원 버튼 */}
          {ActionIcon && (
            <IconButton
              icon={ActionIcon}
              onClick={isActionDisabled ? undefined : onActionClick}
              aria-label={actionLabel}
              size={18}
              disabled={isActionDisabled}
              className={isActionDisabled ? disabledClass : undefined}
            />
          )}

          {/* 삭제 버튼 */}
          <IconButton
            icon={Trash2}
            onClick={isActionDisabled ? undefined : onDelete}
            aria-label={deleteLabel}
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

      {/* 전체 선택 토글 */}
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
