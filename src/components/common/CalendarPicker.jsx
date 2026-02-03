import React, { useMemo } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPicker({
  viewDate,
  setViewDate,
  selectedDate,
  onDateClick,
  today, // 실제 오늘 날짜
  summarySets = { deadlineSet: new Set(), createdSet: new Set() },
  showDots = false,
  onYearMonthClick,
}) {
  // 오늘로 바로 이동 핸들러
  const handleGoToday = () => {
    setViewDate(today); // 달력 시점을 실제 오늘로
    onDateClick(today); // 오늘 날짜 선택
  };

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate));
    const end = endOfWeek(endOfMonth(viewDate));
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  return (
    <div className="w-full bg-bg-main flex flex-col px-4">
      {/* 헤더: 연월 선택 + 오늘 버튼*/}
      <div className="relative flex items-center justify-center py-4 px-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="text-text-sub"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={onYearMonthClick}
            className="text-xl font-bold text-text-main flex items-center gap-1"
          >
            {format(viewDate, 'yyyy년 M월')}
            <span className="text-[10px] text-text-sub opacity-50">▼</span>
          </button>

          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="text-text-sub"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <button
          onClick={handleGoToday}
          className="absolute right-2 text-[11px] font-bold text-primary-500 border border-primary-500/30 px-2 py-0.5 rounded-md active:scale-95"
        >
          오늘
        </button>
      </div>

      {/* 요일 및 날짜 그리드 */}
      <div className="grid grid-cols-7 mb-4">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <span
            key={d}
            className="text-center text-xs text-text-sub font-medium"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-3">
        {calendarDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate); // 선택된 날짜 여부
          const isCurrentMonth = isSameMonth(day, viewDate); // 현재 달 여부
          const isTodayReal = isSameDay(day, today); // 실제 오늘 날짜 여부

          return (
            <div
              key={i}
              onClick={() => onDateClick(day)}
              className="flex flex-col items-center h-14 cursor-pointer"
            >
              <div
                className={`flex items-center justify-center w-9 h-9 text-sm font-semibold rounded-full transition-all
                ${isSelected ? 'bg-primary-500 text-bg-main shadow-md' : 'text-text-main'}
                ${!isSelected && isTodayReal ? 'border border-neutral-600' : ''}
                ${!isCurrentMonth ? 'opacity-20' : ''}`}
              >
                {format(day, 'd')}
              </div>
              {showDots && (
                <div className="flex gap-1 mt-1 h-1">
                  {summarySets.deadlineSet.has(dateStr) && (
                    <div className="w-1 h-1 rounded-full bg-red-500" />
                  )}
                  {summarySets.createdSet.has(dateStr) && (
                    <div className="w-1 h-1 rounded-full bg-primary-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
