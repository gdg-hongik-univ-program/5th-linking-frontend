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
        /* 활성화 상태일 때만 배경 hover와 active 효과 발생 */
        enabled:hover:bg-bg-nav 
        enabled:active:scale-95 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        group
        ${className}
      `}
      {...props}
    >
      {Icon && (
        <Icon
          size={size}
          className={`transition-colors ${
            /* color가 넘어오면 그걸 쓰고, 없으면 기본 hover 적용 */
            color || 'text-text-main group-enabled:group-hover:text-primary-500'
          }`}
        />
      )}
    </button>
  );
};

export default IconButton;
