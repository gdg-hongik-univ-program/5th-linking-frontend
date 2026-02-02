const IconButton = ({
  icon: Icon,
  onClick,
  size = 24,
  color,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        p-3 
        rounded-full 
        transition-all 
        duration-200
        flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:bg-bg-nav 
        active:scale-95 
        group
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <Icon
          size={size}
          className={`transition-colors ${
            color || 'text-text-main group-hover:text-primary-500'
          }`}
        />
      )}
    </button>
  );
};

export default IconButton;
