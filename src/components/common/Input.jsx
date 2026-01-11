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
        <span className={`text-xs ml-1 mt-0.5 transition-colors ${
          isSuccess 
            ? "text-brand-text-main"
            : "text-brand-text-disabled"
        }`}>
          {message}
        </span>
      )}
    </div>
  );
}

export default Input;
