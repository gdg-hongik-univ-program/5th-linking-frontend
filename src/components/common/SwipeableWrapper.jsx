import React, { useState, useEffect } from 'react';
import {
  motion,
  useMotionValue,
  animate,
  useMotionValueEvent,
} from 'framer-motion';

export default function SwipeableWrapper({
  children,
  leftAction,
  rightAction,
  actionWidth = 80,
  threshold = 80,
}) {
  const x = useMotionValue(0);
  const [isOpened, setIsOpened] = useState(false);

  useMotionValueEvent(x, 'change', (latest) => {
    if (Math.abs(latest) >= actionWidth && !isOpened) {
      setIsOpened(true);
    } else if (latest === 0 && isOpened) {
      setIsOpened(false);
    }
  });

  const closeSwipe = () => {
    animate(x, 0, { type: 'spring', bounce: 0.3, duration: 0.3 });
    setIsOpened(false);
  };

  const handleDragEnd = (_, info) => {
    const dragX = info.offset.x;
    if (dragX < -actionWidth / 1.5) {
      animate(x, -actionWidth, { type: 'spring', bounce: 0.3 });
    } else if (dragX > actionWidth / 1.5) {
      animate(x, actionWidth, { type: 'spring', bounce: 0.3 });
    } else {
      closeSwipe();
    }
  };

  return (
    <>
      {isOpened && (
        <div
          className="fixed inset-0 z-10 bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            closeSwipe();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            closeSwipe();
          }}
        />
      )}

      <div className="relative overflow-hidden rounded-xl bg-bg-main">
        <div className="absolute inset-0 flex justify-between items-center px-6 z-20">
          <motion.div className="flex items-center">{leftAction}</motion.div>
          <motion.div className="flex items-center">{rightAction}</motion.div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: -threshold, right: threshold }}
          style={{ x }}
          onDragEnd={handleDragEnd}
          onClick={() => isOpened && closeSwipe()}
          className="relative z-30 bg-bg-main"
        >
          {children}
        </motion.div>
      </div>
    </>
  );
}
