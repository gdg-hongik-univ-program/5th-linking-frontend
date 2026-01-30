import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react'; // 아이콘 추가

const BottomSheet = ({ title, count, children, onToggle, onConnectById }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [directId, setDirectId] = useState('');

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

  const handleDirectConnect = () => {
    if (directId.trim() && onConnectById) {
      onConnectById(directId);
      setDirectId('');
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

      {/* ID 직접 입력 영역 (확장되었을 때만 표시) */}
      <AnimatePresence>
        {isExpanded && onConnectById && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2 shrink-0"
          >
            <div className="flex items-center gap-2 bg-neutral-800 p-1 rounded-xl border border-neutral-700">
              <input
                type="number"
                placeholder="ID로 직접 연결"
                value={directId}
                onChange={(e) => setDirectId(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none"
                onClick={(e) => e.stopPropagation()} // 드래그 방지
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectConnect();
                }}
                disabled={!directId}
                className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 바디 (검색 결과 및 목록) */}
      <motion.div
        className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-hide pt-2"
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
