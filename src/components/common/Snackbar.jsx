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
          <div className="bg-neutral-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between border border-neutral-700">
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
