export default function ConfirmModal({
  isOpen,
  title = '확인',
  message,
  onClose,
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
  isDanger = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-main w-full max-w-xs rounded-2xl p-5 border border-text-main/10 flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>

        {message && (
          <p className="text-text-sub text-sm mb-6 min-h-[40px] line-clamp-2">
            {message}
          </p>
        )}

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={() => onClose?.()}
            className="flex-1 py-3 bg-transparent border border-neutral-600 text-text-main text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => onConfirm?.()}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors ${
              isDanger
                ? 'bg-error-500 hover:bg-error-600 text-text-main'
                : 'bg-primary-500 hover:bg-primary-500/90 text-bg-main'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
