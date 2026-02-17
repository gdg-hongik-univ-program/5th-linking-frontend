import { useState, useEffect } from 'react';

export default function InputModal({
  isOpen,
  title = '입력',
  placeholder = '내용을 입력하세요',
  initialValue = '',
  onClose,
  onSubmit,
  submitText = '확인',
  cancelText = '취소',
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setValue(initialValue);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-bg-main w-full max-w-xs rounded-xl p-5 shadow-lg border border-neutral-800">
        <h3 className="text-lg font-bold text-text-main mb-3">{title}</h3>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-neutral-800 text-text-main p-3 rounded-lg outline-none focus:ring-1 focus:ring-primary mb-4"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-sub text-sm rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 disabled:hover:bg-primary transition-colors"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
