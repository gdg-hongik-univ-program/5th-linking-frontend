import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import IconButton from './IconButton';

const PageHeader = ({
  title,
  iconType = 'arrow',
  onBackClick,
  children,
  className = '',
}) => {
  const navigate = useNavigate();
  const handleBack = onBackClick || (() => navigate(-1));
  const IconComponent = iconType === 'close' ? X : ArrowLeft;

  return (
    <header
      className={`relative flex items-center justify-between px-3 pt-8 pb-3 z-10 shrink-0 bg-bg-main ${className}`}
    >
      {/* 1. 좌측 뒤로가기 또는 닫기 버튼 */}
      <div className="flex-none flex justify-start items-center">
        <IconButton
          icon={IconComponent}
          onClick={handleBack}
          aria-label={iconType === 'close' ? '닫기' : '뒤로가기'}
        />
      </div>

      {/* 2. 중앙 페이지 제목 텍스트 */}
      {title && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-[10px] max-w-[50%] pointer-events-none">
          <h1 className="text-lg font-bold text-text-main truncate text-center leading-none pb-[2px]">
            {title}
          </h1>
        </div>
      )}

      {/* 3. 우측 가변 버튼 */}
      <div className="flex-none flex justify-end items-center gap-0">
        {children || <div className="w-12 h-12" />}
      </div>
    </header>
  );
};

export default PageHeader;
