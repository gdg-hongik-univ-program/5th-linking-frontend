import { motion, useTransform } from 'framer-motion';
import { Pencil, Trash2, RotateCcw, ArchiveRestore } from 'lucide-react';

const BUTTON_CASE = {
  edit: { icon: Pencil, label: '수정', colorClass: 'bg-edit-500' },
  delete: { icon: Trash2, label: '삭제', colorClass: 'bg-error-500' },
  restore: { icon: RotateCcw, label: '복원', colorClass: 'bg-success-500' },
  extend: { icon: ArchiveRestore, label: '연장', colorClass: 'bg-archive-500' },
  permanent_delete: {
    icon: Trash2,
    label: '영구삭제',
    colorClass: 'bg-error-500',
  },
};

export default function SwipeActionButton({
  type,
  onClick,
  x,
  direction,
  triggerThreshold = 280,
}) {
  const CASE = BUTTON_CASE[type];
  const Icon = CASE.icon;

  const inputRange =
    direction === 'left'
      ? [0, 80, triggerThreshold]
      : [0, -80, -triggerThreshold];

  const width = useTransform(x, inputRange, [0, 80, triggerThreshold]);

  const opacity = useTransform(x, inputRange, [0, 1, 1]);

  const scale = useTransform(x, inputRange, [0.25, 1, 1.3]);

  return (
    <motion.div
      style={{ width }}
      className="h-full flex items-center justify-center overflow-hidden px-2"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={`
          flex items-center justify-center w-full h-[96px] rounded-[99px] text-white shadow-sm transition-transform active:scale-95
          ${CASE.colorClass}
          ${direction === 'left' ? 'ml-0' : 'mr-0'}
        `}
      >
        <motion.div
          style={{ scale, opacity }}
          className="shrink-0 flex flex-col items-center justify-center w-[44px]"
        >
          <Icon size={24} strokeWidth={2.5} />
        </motion.div>
      </button>
    </motion.div>
  );
}
