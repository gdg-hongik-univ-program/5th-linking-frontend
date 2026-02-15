import { useState, useEffect, useRef } from 'react';
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

  // 1. 배경 버튼 투명도
  const leftOpacity = useTransform(x, [0, actionWidth], [0, 1]);
  const rightOpacity = useTransform(x, [0, -actionWidth], [0, 1]);

  const contentOpacity = useTransform(
    x,
    // [왼쪽 풀 스와이프 끝, 왼쪽 액션 열림, 중앙, 오른쪽 액션 열림, 오른쪽 풀 스와이프 끝]
    [-triggerThreshold, -actionWidth, 0, actionWidth, triggerThreshold],
    // [흐려짐(0.5), 선명함(1), 선명함(1), 선명함(1), 흐려짐(0.5)]
    [0.5, 1, 1, 1, 0.5],
  );

  const [constraints, setConstraints] = useState({
    left: -1000,
    right: 1000,
  });

  useEffect(() => {
    if (isOpen) {
      const currentX = x.get();
      if (currentX > 0) {
        setConstraints({ left: 0, right: 1000 });
      } else {
        setConstraints({ left: -1000, right: 0 });
      }
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
      if (dragX < actionWidth / 2 || velocity < -300) {
        onClose();
      } else {
        animate(x, actionWidth, SMOOTH_SPRING);
      }
      return;
    }

    if (startX < -10) {
      if (dragX > -actionWidth / 2 || velocity > 300) {
        onClose();
      } else {
        animate(x, -actionWidth, SMOOTH_SPRING);
      }
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
        layout={layout}
        initial={initial}
        animate={animateProp}
        exit={exit}
        transition={transition}
        className="relative w-full select-none"
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
      className="relative w-full overflow-hidden rounded-xl bg-bg-main select-none shadow-sm"
    >
      <div className="absolute inset-0 flex items-center justify-between z-0 pointer-events-none">
        <motion.div
          style={{ opacity: leftOpacity }}
          className="flex items-center justify-start h-full pl-4 w-1/2"
        >
          <div className="pointer-events-auto">{leftAction}</div>
        </motion.div>
        <motion.div
          style={{ opacity: rightOpacity }}
          className="flex items-center justify-end h-full pr-4 w-1/2"
        >
          <div className="pointer-events-auto">{rightAction}</div>
        </motion.div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={constraints}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, opacity: contentOpacity }}
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
