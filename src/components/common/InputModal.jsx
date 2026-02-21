import { useState, useEffect, useRef } from 'react';
import { CircleX } from 'lucide-react';

export default function InputModal({
  isOpen,
  title = '입력',
  placeholder = '내용 입력',
  initialValue = '',
  onClose,
  onSubmit,
  submitText = '확인',
  cancelText = '취소',
  isDanger = false,
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSubmit();
    }
  };

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-bg-main w-full max-w-xs rounded-2xl p-5 border border-text-main/10 flex flex-col shadow-lg">
        <h3 className="text-lg font-bold text-text-main mb-3">{title}</h3>

        <div className="relative w-full mb-3">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-neutral-800 text-text-main p-3 pr-10 rounded-xl border border-text-main/5 outline-none focus:ring-1 focus:ring-primary-500 transition-all text-sm"
          />

          {value && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                handleClear();
                inputRef.current?.focus();
              }}
              tabIndex={-1}
              aria-label="입력값 지우기"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-text-main transition-colors p-1"
            >
              <CircleX size={18} />
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-transparent border border-neutral-600 text-text-main text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={`flex-1 py-3 text-text-main text-sm font-bold rounded-xl transition-colors disabled:opacity-50 ${
              isDanger
                ? 'bg-error-500 hover:bg-error-600'
                : 'bg-primary-500 hover:bg-primary-500/90'
            }`}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
