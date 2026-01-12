const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function Input({ label, type, placeholder, value, onChange, name, message,rightElement}) {
  const isSuccess = message?.includes("가능");

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-medium text-brand-text-main ml-1">
        {label}
      </label>

      <div className="flex gap-2">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl 
                   bg-brand-card 
                   border border-brand-border 
                   text-brand-text-main 
                   placeholder:text-brand-text-disabled
                   focus:outline-none focus:ring-1 focus:ring-brand-key focus:border-brand-key 
                   transition-all"
      />
      {rightElement && (
          <div className="flex shrink-0">
            {rightElement}
          </div>
        )}
      </div>

{message && (
        <div className={`flex items-center gap-1 ml-1 mt-0.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors ${
          isSuccess ? "text-brand-text-main" : "text-status-error"
        }`}>
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
