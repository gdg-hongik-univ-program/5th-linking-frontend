import { motion, AnimatePresence } from 'framer-motion';

export default function Snackbar({ isVisible, message, onUndo, onClose }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[350px]"
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
    </AnimatePresence>
  );
}
