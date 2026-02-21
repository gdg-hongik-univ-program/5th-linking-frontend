import { CircleX } from 'lucide-react';

const CheckIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function Input({
  label,
  type,
  placeholder,
  value,
  onChange,
  onClear,
  name,
  message,
  rightElement,
  leftIcon,
  ...props
}) {
  const isSuccess =
    message?.includes('가능') || message?.includes('일치합니다');

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="text-sm font-medium text-text-main ml-1">
          {label}
        </label>
      )}
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`
              w-full py-3 rounded-xl transition-all
              bg-neutral-800 text-text-main placeholder:text-text-disabled
              border border-text-main/5
              focus:outline-none focus:ring-1 focus:ring-primary-500
              ${leftIcon ? 'pl-11' : 'px-4'}
              ${onClear && value ? 'pr-11' : 'pr-4'}
            `}
            {...props}
          />
          {value && onClear && (
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-text-main transition-colors p-1 rounded-full"
              aria-label="입력값 지우기"
            >
              <CircleX size={18} />
            </button>
          )}
        </div>

        {rightElement && <div className="flex shrink-0">{rightElement}</div>}
      </div>

      {message && (
        <div
          className={`flex items-center gap-1 ml-1 mt-0.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors ${
            isSuccess ? 'text-success-500' : 'text-error-500'
          }`}
        >
          <span className="flex-shrink-0">
            {isSuccess ? <CheckIcon /> : <ErrorIcon />}
          </span>
          <span className="leading-none">{message}</span>
        </div>
      )}
    </div>
  );
}

export default Input;
