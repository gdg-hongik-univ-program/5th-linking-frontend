import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import IconButton from './IconButton';

const PageHeader = ({
  title,
  iconType = 'arrow',
  isSelectMode = false,
  onBackClick,
  disabled = false,
  children,
  className = '',
}) => {
  const navigate = useNavigate();

  const IconComponent = iconType === 'close' ? X : ArrowLeft;

  const handleClick = () => {
    if (disabled) return;

    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const ariaLabel = iconType === 'close' ? '닫기' : '뒤로가기';

  return (
    <header
      className={`relative flex items-center justify-between px-3 pt-8 pb-3 z-10 shrink-0 bg-bg-main ${className}`}
    >
      <div className="flex-none flex justify-start items-center">
        <IconButton
          icon={IconComponent}
          onClick={handleClick}
          aria-label={ariaLabel}
          disabled={disabled}
          className={disabled ? 'opacity-40 cursor-not-allowed' : ''}
        />
      </div>

      {title && !isSelectMode && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-[10px] max-w-[50%] pointer-events-none">
          <h1 className="text-lg font-bold text-text-main truncate text-center leading-none pb-[2px]">
            {title}
          </h1>
        </div>
      )}

      <div className="flex-none flex justify-end items-center gap-0">
        {children || <div className="w-12 h-12" />}
      </div>
    </header>
  );
};

export default PageHeader;
