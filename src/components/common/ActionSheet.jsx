import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

export default function ActionSheet({ isOpen, onClose, sections, anchorEl }) {
  const menuRef = useRef(null);

  if (!isOpen || !anchorEl) return null;

  // 더보기 버튼 아래로 위치 계산
  const buttonRect = anchorEl.getBoundingClientRect();
  const menuStyle = {
    position: 'fixed',
    top: `${buttonRect.bottom + 8}px`,
    right: `${window.innerWidth - buttonRect.right}px`,
    maxWidth: 'calc(100vw - 32px)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* 메뉴 */}
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            style={menuStyle}
            className="z-50 bg-neutral-800 rounded-xl w-56 shadow-2xl border border-neutral-700 flex flex-col max-h-[80vh] origin-top-right"
          >
            <div className="overflow-y-auto overflow-x-hidden">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {section.header && (
                    <div className="px-4 py-2 text-xs text-neutral-400 font-medium sticky top-0 bg-neutral-800 z-10">
                      {section.header}
                    </div>
                  )}

                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700 active:bg-neutral-600 transition-colors text-left"
                        onClick={() => {
                          item.onClick?.();
                          if (item.closeOnClick !== false) {
                            onClose();
                          }
                        }}
                        disabled={item.disabled}
                      >
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {item.hasCheck && item.isChecked && (
                            <Check size={16} className="text-primary-500" />
                          )}
                        </div>
                        {Icon && (
                          <div className="flex items-center justify-center flex-shrink-0">
                            <Icon
                              size={20}
                              className={
                                item.disabled
                                  ? 'text-neutral-600'
                                  : 'text-text-main'
                              }
                            />
                          </div>
                        )}
                        <span
                          className={`flex-1 text-sm leading-5 ${
                            item.disabled
                              ? 'text-neutral-600'
                              : 'text-text-main'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="text-xs bg-primary text-text-sub px-2 py-1 rounded-full font-medium flex-shrink-0 leading-none">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {sectionIndex < sections.length - 1 && (
                    <div className="h-px bg-neutral-700 my-2" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
