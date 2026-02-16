import { motion, useTransform } from 'framer-motion';
import { Pencil, Trash2, RotateCcw, ArchiveRestore } from 'lucide-react';

const BUTTON_CASE = {
  edit: { icon: Pencil, label: '수정', colorClass: 'bg-blue-500' },
  delete: { icon: Trash2, label: '삭제', colorClass: 'bg-error-600' },
  restore: { icon: RotateCcw, label: '복원', colorClass: 'bg-success-600' },
  extend: { icon: ArchiveRestore, label: '연장', colorClass: 'bg-primary-500' },
  permanent_delete: {
    icon: Trash2,
    label: '영구삭제',
    colorClass: 'bg-error-600',
  },
};

export default function SwipeActionButton({ type, onClick, x, direction }) {
  const CASE = BUTTON_CASE[type];
  const Icon = CASE.icon;

  // 1. 드래그 거리(x)에 따라 버튼의 너비를 직접 변형
  // x가 0일 땐 너비 0, 당길수록 x의 절대값만큼 너비가 늘어납니다.
  const width = useTransform(
    x,
    direction === 'left' ? [0, 280] : [0, -280],
    [0, 280],
  );

  return (
    <motion.div
      style={{ width }}
      className="h-full flex items-center justify-center overflow-hidden"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        // 캡슐 형태(rounded-[99px])와 고정 높이를 유지하며 가로로만 늘어납니다.
        className={`
          flex items-center justify-center w-full h-[96px] rounded-[99px] text-white shadow-sm transition-transform active:scale-95
          ${CASE.colorClass}
          ${direction === 'left' ? 'ml-0' : 'mr-0'}
        `}
      >
        <div className={`shrink-0 flex items-center justify-center w-[44px]`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </button>
    </motion.div>
  );
}
