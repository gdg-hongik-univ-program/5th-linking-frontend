import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CalendarPicker from './CalendarPicker';
import { format } from 'date-fns';

export default function DatePickerModal({
  isOpen,
  onClose,
  onSelect,
  initialDate,
  title = '날짜 선택',
}) {
  const [today] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 모달이 열릴 때 초기 날짜 설정
  useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        const dateObj = new Date(initialDate);
        setSelectedDate(dateObj);
        setViewDate(dateObj);
      } else {
        setSelectedDate(today);
        setViewDate(today);
      }
    }
  }, [isOpen, initialDate, today]);

  // 배경 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const root = document.getElementById('root');
      if (root) {
        root.setAttribute('inert', 'true');
        root.setAttribute('aria-hidden', 'true');
      }
    } else {
      document.body.style.overflow = 'unset';
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
    }
    return () => {
      document.body.style.overflow = 'unset';
      const root = document.getElementById('root');
      if (root) {
        root.removeAttribute('inert');
        root.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onSelect(selectedDate);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 isolate">
        {/* 백드롭 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 pointer-events-auto"
          onClick={onClose}
        />

        {/* 모달 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-bg-main w-full max-w-[340px] rounded-2xl shadow-lg overflow-hidden flex flex-col border border-text-main/10 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="px-4 h-14 border-b border-text-main/10 flex items-center justify-between shrink-0 bg-bg-main relative">
            <div className="flex items-center justify-start min-w-[40px]">
              <button
                onClick={onClose}
                className="p-2 -ml-2 text-text-sub hover:text-text-main rounded-full active:bg-neutral-800 transition-colors"
                aria-label="닫기"
              >
                <X size={24} />
              </button>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[180px]">
              <h2 className="text-base font-bold text-text-main truncate">
                {title}
              </h2>
            </div>
            
            <div className="min-w-[40px]" />
          </div>

          {/* 달력 영역 */}
          <div className="flex-1 min-h-0 bg-bg-main overflow-y-auto custom-scrollbar pb-4 pt-2">
            <CalendarPicker
              viewDate={viewDate}
              setViewDate={setViewDate}
              selectedDate={selectedDate}
              onDateClick={setSelectedDate}
              today={today}
              showDots={false}
            />
          </div>

          {/* 푸터 */}
          <div className="p-4 border-t border-text-main/10 bg-bg-main shrink-0">
            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-text-main font-bold py-3 rounded-lg transition-colors shadow-lg shadow-primary-500/20 px-4"
            >
              <div className="truncate min-w-0">
                <span>{format(selectedDate, 'yyyy년 M월 d일')} 선택</span>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
