import React, { useState, useMemo } from 'react';
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
  isToday as checkIsToday,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPicker({
  viewDate,
  setViewDate,
  selectedDate,
  onDateClick,
  summarySets = { deadlineSet: new Set(), createdSet: new Set() },
  showDots = false,
  onYearMonthClick,
}) {
  const handleGoToday = () => {
    const today = new Date();
    setViewDate(today);
    onDateClick(today);
  };
  // 그리드 날짜 계산
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate));
    const end = endOfWeek(endOfMonth(viewDate));
    return eachDayOfInterval({ start, end });
  }, [viewDate]);

  return (
    <div className="w-full bg-bg-main flex flex-col font-family-sans">
      {/* 월 이동 헤더 */}
      <div className="relative flex items-center justify-center w-full py-4 px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="text-text-sub p-1 active:opacity-50 transition-opacity"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={onYearMonthClick}
            className="text-xl font-bold text-center text-text-main flex items-center gap-1 active:opacity-60 transition-opacity"
          >
            {format(viewDate, 'yyyy년 M월')}
          </button>

          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="text-text-sub p-1 active:opacity-50 transition-opacity"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <button
          onClick={handleGoToday}
          className="absolute right-4 text-xs font-bold text-primary-500 border border-primary-500/30 px-2 py-1 rounded-md active:scale-95 transition-all"
        >
          오늘
        </button>
      </div>

      {/* 요일 라벨 */}
      <div className="grid grid-cols-7 mb-2 px-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
          <span
            key={d}
            className="text-center text-xs text-text-sub font-medium"
          >
            {d}
          </span>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1 px-2">
        {calendarDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, viewDate);
          const isTodayDate = checkIsToday(day);
          return (
            <div
              key={i}
              onClick={() => onDateClick(day)}
              className="flex flex-col items-center justify-start h-14 cursor-pointer"
            >
              <div
                className={`
                flex items-center justify-center w-9 h-9 text-sm font-semibold rounded-full transition-all
                ${isSelected ? 'bg-primary-500 text-bg-main shadow-md' : 'text-text-main'}
                ${!isSelected && isTodayDate ? 'border border-neutral-600' : ''}
                ${!isCurrentMonth ? 'opacity-20' : ''}
              `}
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
