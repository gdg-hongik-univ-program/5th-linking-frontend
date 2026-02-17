import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';

const SMOOTH_SPRING = { type: 'spring', stiffness: 120, damping: 20, mass: 1 };

const SwipeableWrapper = ({
  children,
  itemId,
  isOpen,
  onOpen,
  onClose,
  leftAction,
  rightAction,
  actionWidth = 80,
  triggerThreshold = 280,
  layout,
  initial,
  animate: animateProp,
  exit,
  transition,
  disabled = false,
}) => {
  const x = useMotionValue(0);
  const wrapperRef = useRef(null);
  const dragStartX = useRef(0);

  // 1. 기존 투명도 로직 복구 및 확장
  const leftOpacity = useTransform(x, [0, actionWidth], [0, 1]);
  const rightOpacity = useTransform(x, [0, -actionWidth], [0, 1]);

  // 2. 카드 콘텐츠의 투명도 (끝까지 밀 때 흐려짐)
  const contentOpacity = useTransform(
    x,
    [-triggerThreshold, -actionWidth, 0, actionWidth, triggerThreshold],
    [0.5, 1, 1, 1, 0.5],
  );

  // 3. ✨ 그림자 애니메이션 추가 (움직일 때만 그림자가 생김)
  const contentShadow = useTransform(
    x,
    [-actionWidth, 0, actionWidth],
    [
      '0px 10px 20px rgba(0,0,0,0.1)',
      '0px 0px 0px rgba(0,0,0,0)',
      '0px 10px 20px rgba(0,0,0,0.1)',
    ],
  );

  const [constraints, setConstraints] = useState({ left: -1000, right: 1000 });

  useEffect(() => {
    if (isOpen) {
      const currentX = x.get();
      if (currentX > 0) setConstraints({ left: 0, right: 1000 });
      else setConstraints({ left: -1000, right: 0 });
    } else {
      setConstraints({ left: -1000, right: 1000 });
      animate(x, 0, SMOOTH_SPRING);
    }
  }, [isOpen, x]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isOpen, onClose]);

  const handleDragStart = () => {
    dragStartX.current = x.get();
    onOpen(itemId);
  };

  const handleDragEnd = (_, info) => {
    const dragX = x.get();
    const velocity = info.velocity.x;
    const startX = dragStartX.current;

    const isLeftTrigger =
      dragX > triggerThreshold && leftAction?.props?.onClick;
    const isRightTrigger =
      dragX < -triggerThreshold && rightAction?.props?.onClick;

    if (isLeftTrigger || isRightTrigger) {
      const isValidTrigger = isLeftTrigger ? startX >= 0 : startX <= 0;
      if (isValidTrigger) {
        if (isLeftTrigger) leftAction.props.onClick();
        else rightAction.props.onClick();
        onClose();
        return;
      }
    }

    if (startX > 10) {
      if (dragX < actionWidth / 2 || velocity < -300) onClose();
      else animate(x, actionWidth, SMOOTH_SPRING);
      return;
    }

    if (startX < -10) {
      if (dragX > -actionWidth / 2 || velocity > 300) onClose();
      else animate(x, -actionWidth, SMOOTH_SPRING);
      return;
    }

    if (dragX > actionWidth / 2 || velocity > 300) {
      animate(x, actionWidth, SMOOTH_SPRING);
      onOpen(itemId);
    } else if (dragX < -actionWidth / 2 || velocity < -300) {
      animate(x, -actionWidth, SMOOTH_SPRING);
      onOpen(itemId);
    } else {
      animate(x, 0, SMOOTH_SPRING);
      onClose();
    }
  };

  if (disabled) {
    return (
      <motion.div
        className="relative w-full select-none"
        {...{ layout, initial, animate: animateProp, exit, transition }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={wrapperRef}
      layout={layout}
      initial={initial}
      animate={animateProp}
      exit={exit}
      transition={transition}
      className="relative w-full overflow-hidden bg-bg-main select-none rounded-xl"
    >
      {/* 배경 액션 영역 */}
      <div className="absolute inset-0 flex items-center justify-between z-0 pointer-events-none px-1">
        {/* 왼쪽 액션 */}
        <motion.div
          style={{ opacity: leftOpacity }} // 기존 투명도 로직 적용
          className="absolute left-0 h-full flex items-center pointer-events-auto"
        >
          {leftAction &&
            React.cloneElement(leftAction, {
              x,
              direction: 'left',
              triggerThreshold,
            })}
        </motion.div>

        {/* 오른쪽 액션 */}
        <motion.div
          style={{ opacity: rightOpacity }} // 기존 투명도 로직 적용
          className="absolute right-0 h-full flex items-center pointer-events-auto"
        >
          {rightAction &&
            React.cloneElement(rightAction, {
              x,
              direction: 'right',
              triggerThreshold,
            })}
        </motion.div>
      </div>

      {/* 상단 카드 콘텐츠 */}
      <motion.div
        drag="x"
        dragConstraints={constraints}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // ✨ x축 이동, 투명도, 그림자 애니메이션 통합 적용
        style={{
          x,
          opacity: contentOpacity,
          boxShadow: contentShadow,
        }}
        onClick={(e) => {
          if (Math.abs(x.get()) > 5) {
            e.stopPropagation();
            onClose();
          }
        }}
        className="relative w-full z-10 bg-bg-main cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default SwipeableWrapper;
