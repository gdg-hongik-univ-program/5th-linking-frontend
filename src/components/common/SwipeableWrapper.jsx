import React, { useState, useEffect, useCallback, forwardRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

const SwipeableWrapper = forwardRef(
  (
    {
      children,
      itemId,
      isOpen,
      onOpen,
      onClose,
      leftAction,
      rightAction,
      actionWidth = 80,

      layout,
      initial,
      animate: animateProp,
      exit,
      transition,
    },
    ref,
  ) => {
    const x = useMotionValue(0);
    const [constraints, setConstraints] = useState({
      left: -actionWidth,
      right: actionWidth,
    });

    useEffect(() => {
      if (!isOpen && x.get() !== 0) {
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
      }
    }, [isOpen, x]);

    const handleDragStart = useCallback(() => {
      const currentX = x.get();
      if (currentX > 5) {
        setConstraints({ left: 0, right: actionWidth });
      } else if (currentX < -5) {
        setConstraints({ left: -actionWidth, right: 0 });
      } else {
        setConstraints({ left: -actionWidth, right: actionWidth });
      }
      onOpen(itemId);
    }, [actionWidth, itemId, onOpen, x]);

    const handleDragEnd = (_, info) => {
      const dragX = x.get();
      const velocity = info.velocity.x;
      const springConfig = { type: 'spring', stiffness: 400, damping: 35 };

      if (dragX < -actionWidth / 2 || velocity < -500) {
        animate(x, -actionWidth, springConfig);
        onOpen(itemId);
      } else if (dragX > actionWidth / 2 || velocity > 500) {
        animate(x, actionWidth, springConfig);
        onOpen(itemId);
      } else {
        animate(x, 0, { ...springConfig, stiffness: 500 });
        onClose();
      }
    };

    return (
      <motion.div
        ref={ref}
        layout={layout}
        initial={initial}
        animate={animateProp}
        exit={exit}
        transition={transition}
        className="relative overflow-hidden rounded-xl bg-bg-main mb-3 select-none shadow-sm"
      >
        {/* 배경 버튼 (z-index 20) */}
        <div className="absolute inset-0 flex items-center justify-between px-6 z-20 pointer-events-none">
          <div className="pointer-events-auto h-full flex items-center">
            {leftAction}
          </div>
          <div className="pointer-events-auto h-full flex items-center">
            {rightAction}
          </div>
        </div>

        {/* 실제 카드 콘텐츠 (z-index 30) */}
        <motion.div
          drag="x"
          onDragStart={handleDragStart}
          dragConstraints={constraints}
          dragElastic={0} // 반대쪽 넘어감 방지를 위해 탄성 제거
          dragMomentum={false}
          style={{ x }}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            if (isOpen || Math.abs(x.get()) > 5) {
              e.stopPropagation();
              onClose();
            }
          }}
          className="relative z-30 bg-bg-main cursor-grab active:cursor-grabbing will-change-transform"
        >
          {children}
        </motion.div>
      </motion.div>
    );
  },
);

export default SwipeableWrapper;
