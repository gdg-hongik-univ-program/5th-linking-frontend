import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Snackbar({ isVisible, message, onUndo }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 left-1/2 z-[9999] w-[90%] max-w-[350px]"
        >
          <div className="bg-bg-nav text-text-main px-4 py-3 rounded-2xl shadow-lg flex items-center justify-between border border-text-main/10 relative overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="absolute top-0 left-0 h-[3px] bg-primary-500"
            />

            <span className="text-sm font-medium">{message}</span>
            <button
              onClick={onUndo}
              className="text-primary-500 text-sm font-bold px-2 py-1 active:scale-90 transition-transform"
            >
              실행 취소
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
