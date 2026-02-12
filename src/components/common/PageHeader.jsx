import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import IconButton from './IconButton';

const PageHeader = ({
  title,
  iconType = 'arrow',
  onBackClick,
  children,
  className = '',
  scrollContainerRef,
}) => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  const handleBack = onBackClick || (() => navigate(-1));
  const IconComponent = iconType === 'close' ? X : ArrowLeft;

  const { scrollY } = useScroll({
    container: scrollContainerRef,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const headerHeight = 80;

    // 1. 최상단 영역 (고정 해제 구간)
    if (latest <= 2) {
      if (isFixed) setIsFixed(false);
      if (hidden) setHidden(false);
      return;
    }

    // 3. 방향 감지 (isFixed 체크 밖으로 꺼내야 함)
    if (latest > previous + 5) {
      // 아래로 스크롤: 헤더가 고정된 상태라면 숨김
      if (latest > headerHeight && !hidden) {
        setHidden(true);
      }
    } else if (latest < previous - 5) {
      // 위로 스크롤: 헤더를 고정하고 보여줌
      if (!isFixed) setIsFixed(true); // 위로 올리는 순간 즉시 고정(Fixed) 모드 진입
      if (hidden) setHidden(false); // 숨겨져 있었다면 보여줌
    }
  });
  return (
    <>
      {isFixed && <div className="h-[92px] w-full shrink-0" />}
      <motion.header
        initial={false}
        animate={{
          y: isFixed && hidden ? -100 : 0,
          opacity: isFixed && hidden ? 0 : 1,
        }}
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.32, 1],
        }}
        className={`
   flex items-center justify-between px-3 pt-8 pb-3 z-50 
    
    ${
      isFixed
        ? `fixed top-0 left-1/2 -translate-x-1/2 shadow-sm bg-bg-main/80 backdrop-blur-md
         w-[388px] min-w-[388px]` // 반응형 구현 시 하드코딩 제거
        : 'relative bg-bg-main w-full'
    }
    ${className}
  `}
      >
        {/* 1. 좌측 뒤로가기 또는 닫기 버튼 */}
        <div className="flex-none flex justify-start items-center top-1/2 z-10 ">
          <IconButton
            icon={IconComponent}
            onClick={handleBack}
            aria-label={iconType === 'close' ? '닫기' : '뒤로가기'}
          />
        </div>

        {/* 2. 중앙 페이지 제목 텍스트 */}
        {title && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-[10px] pointer-events-none">
            <h1 className="text-lg font-bold text-text-main truncate text-center leading-none pb-[2px]">
              {title}
            </h1>
          </div>
        )}

        {/* 3. 우측 가변 버튼 */}
        <div className="flex-none flex justify-end items-center gap-0">
          {children || <div className="w-12 h-12" />}
        </div>
      </motion.header>
    </>
  );
};

export default PageHeader;
