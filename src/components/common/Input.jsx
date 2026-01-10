function Input({ label, type, placeholder, value, onChange, name }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-brand-text-main ml-1">
        {label}
      </label>
      
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
    </div>
  );
}

export default Input;
