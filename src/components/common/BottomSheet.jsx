import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const BottomSheet = ({
  title = '연결된 아이템',
  children,
  isOpen,
  onClose,
  onConnectById,
}) => {
  // true: 90% (확장), false: 60% (기본)
  const [isExpanded, setIsExpanded] = useState(false);
  const [directId, setDirectId] = useState('');

  // 시트가 열릴 때마다 기본 높이(60%)로 초기화
  useEffect(() => {
    if (isOpen) {
      setIsExpanded(false);
    } else {
      setDirectId('');
    }
  }, [isOpen]);

  const springTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  const onDragEnd = (event, info) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    // 위로 드래그 시 -> 확장 (90%)
    if (offset < -50 || velocity < -300) {
      setIsExpanded(true);
    }
    // 아래로 드래그 시
    else if (offset > 50 || velocity > 300) {
      if (isExpanded) {
        setIsExpanded(false); // 확장 상태라면 60%로 축소
      } else {
        onClose(); // 기본 상태라면 닫기
      }
    }
  };

  const handleDirectConnect = () => {
    if (directId.trim() && onConnectById) {
      onConnectById(directId);
      setDirectId('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 z-40"
            onClick={onClose}
          />

          {/* 바텀시트 본체 */}
          <motion.div
            className="absolute left-0 right-0 bottom-0 z-50 bg-bg-nav rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col border-t border-border-default overflow-hidden font-family-sans"
            initial={{ y: '100%' }}
            animate={{
              y: 0,
              height: isExpanded ? '90%' : '60%', // 60% <-> 90% 전환
            }}
            exit={{ y: '100%' }}
            transition={springTransition}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={onDragEnd}
          >
            {/* 핸들바 및 헤더 (드래그 영역) */}
            <div
              className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 bg-bg-nav z-10"
              onClick={() => setIsExpanded(!isExpanded)} // 클릭 시 토글 기능
            >
              <div className="w-12 h-1 bg-neutral-600 rounded-full mb-3" />
              <div className="w-full flex justify-center items-center pb-2">
                <span className="text-base font-semibold text-text-main tracking-tight">
                  {title}
                </span>
              </div>
            </div>

            {/* ID 직접 입력 영역 (항상 표시됨) */}
            {onConnectById && (
              <div className="px-4 pb-4 shrink-0 bg-bg-nav pt-2">
                <div className="flex items-center gap-2 bg-neutral-800 p-1.5 rounded-xl border border-border-default">
                  <input
                    type="number"
                    placeholder="ID로 직접 연결"
                    value={directId}
                    onChange={(e) => setDirectId(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-sm text-text-main placeholder:text-text-sub focus:outline-none"
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectConnect();
                    }}
                    disabled={!directId}
                    className="p-2 bg-primary-500 text-text-main rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus
                      size={18}
                      strokeWidth={3}
                      className="text-neutral-900"
                    />{' '}
                    {/* 아이콘 색상 조정 (배경이 밝으므로 어둡게) */}
                  </button>
                </div>
              </div>
            )}

            {/* 리스트 영역 */}
            <div
              className="flex-1 overflow-y-auto px-2 pb-6 scrollbar-hide bg-bg-nav"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
