export default function AlertModal({
  isOpen,
  title = '알림',
  message,
  onConfirm,
  confirmText = '확인',
  isDanger = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-4">
      <div
        className="bg-bg-main w-full max-w-xs rounded-2xl p-5 border border-text-main/10 flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()} // ✅ 카드 클릭이 배경으로 새는 것만 방지
      >
        <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>

        {message && (
          <p className="text-text-sub text-sm mb-6 min-h-[40px] line-clamp-2">
            {message}
          </p>
        )}

        <div className="w-full mt-2">
          <button
            type="button"
            onClick={() => onConfirm?.()}
            className={`w-full py-3 text-text-main text-sm font-bold rounded-xl transition-colors ${
              isDanger
                ? 'bg-error-500 hover:bg-error-600'
                : 'bg-primary-500 hover:bg-primary-500/90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
