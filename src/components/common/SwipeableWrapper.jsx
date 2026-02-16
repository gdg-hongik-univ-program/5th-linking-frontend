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
  actionWidth = 60,
  triggerThreshold = 280,
  layout,
  initial,
  animate: animateProp,
  exit,
  transition,
}) => {
  const x = useMotionValue(0);
  const wrapperRef = useRef(null);
  const dragStartX = useRef(0);

  // 카드 투명도 조절
  const contentOpacity = useTransform(
    x,
    [-triggerThreshold, -actionWidth, 0, actionWidth, triggerThreshold],
    [0.5, 1, 1, 1, 0.5],
  );

  const [constraints, setConstraints] = useState({ left: -1000, right: 1000 });

  // 좌우 스와이프 막기
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

  // 드래그 종료 시 판정 로직
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

  return (
    <motion.div
      ref={wrapperRef}
      layout={layout}
      initial={initial}
      animate={animateProp}
      exit={exit}
      transition={transition}
      className="relative overflow-hidden rounded-xl bg-bg-main mb-3 select-none shadow-sm"
    >
      <div className="absolute inset-0 flex items-center justify-between z-0 pointer-events-none px-2">
        <div className="absolute left-0 h-full flex items-center pointer-events-auto">
          {leftAction &&
            React.cloneElement(leftAction, {
              x,
              direction: 'left',
              triggerThreshold,
            })}
        </div>
        <div className="absolute right-0 h-full flex items-center pointer-events-auto">
          {rightAction &&
            React.cloneElement(rightAction, {
              x,
              direction: 'right',
              triggerThreshold,
            })}
        </div>
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
        className="relative z-10 bg-bg-main cursor-grab active:cursor-grabbing border border-neutral-800/50 rounded-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default SwipeableWrapper;
