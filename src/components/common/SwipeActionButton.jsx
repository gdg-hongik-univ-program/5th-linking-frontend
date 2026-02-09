import { Pencil, Trash2, RotateCcw } from 'lucide-react';

const BUTTON_CASE = {
  edit: {
    icon: Pencil,
    label: '수정',
    colorClass: 'bg-blue-500',
  },
  delete: {
    icon: Trash2,
    label: '삭제',
    colorClass: 'bg-error-600',
  },
  restore: {
    icon: RotateCcw,
    label: '복구',
    colorClass: 'bg-success-600',
  },
  permanent_delete: {
    icon: Trash2,
    label: '영구삭제',
    colorClass: 'bg-error-600',
  },
};
export default function SwipeActionButton({ type, onClick }) {
  const CASE = BUTTON_CASE[type];
  const { icon: Icon, colorClass } = CASE;

  return (
    <div className="relative z-25">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={`flex flex-col items-center justify-center w-[44px] h-[96px] rounded-[99px] text-white transition-transform active:scale-95 shadow-sm ${colorClass}`}
      >
        <Icon size={24} strokeWidth={2} />
      </button>
    </div>
  );
}
