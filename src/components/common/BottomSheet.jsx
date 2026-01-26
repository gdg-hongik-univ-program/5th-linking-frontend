import { useState } from 'react';
import { motion } from 'framer-motion';

const BottomSheet = ({ title, count, children, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const springTransition = {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 1,
    restDelta: 0.001,
    restSpeed: 0.001,
  };

  const onDragEnd = (event, info) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;
    if (offset < -60 || velocity < -300) {
      setIsExpanded(true);
      onToggle?.(true);
    } else if (offset > 60 || velocity > 300) {
      setIsExpanded(false);
      onToggle?.(false);
    }
  };

  return (
    <motion.div
      className="absolute left-0 right-0 bottom-0 z-50 bg-bg-card rounded-t-[2rem] shadow-[0_-12px_40px_rgba(0,0,0,0.6)] flex flex-col border-t border-border-default"
      initial={{ y: 'calc(100% - 80px)' }}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={{
        expanded: { y: 0, transition: springTransition },
        collapsed: { y: 'calc(100% - 80px)', transition: springTransition },
      }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.15}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={{ height: '85%' }}
    >
      {/* 헤더 */}
      <div
        className="w-full flex flex-col items-center pt-3 pb-4 cursor-grab active:cursor-grabbing shrink-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-neutral-600 rounded-full mb-4 shadow-sm"></div>
        <div className="w-full px-6 flex items-center gap-2">
          <span className="text-lg font-bold text-text-main">{title}</span>
          <span className="text-sm text-text-sub font-normal ml-auto">
            {count}
          </span>
        </div>
      </div>

      {/* 콘텐츠 */}
      <motion.div
        className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default BottomSheet;
