import { useMemo, useState } from 'react';
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
  isSameYear,
  setMonth,
  addYears,
  subYears,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPicker({
  viewDate,
  setViewDate,
  selectedDate,
  onDateClick,
  today,
  summarySets = { deadlineSet: new Set(), createdSet: new Set() },
  showDots = false,
}) {
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  // 피커가 열렸을 때 임시로 보여줄 날짜 상태
  const [tempViewDate, setTempViewDate] = useState(viewDate);

  const toggleMonthPicker = () => {
    if (!isMonthPickerOpen) {
      setTempViewDate(viewDate);
    }
    setIsMonthPickerOpen((prev) => !prev);
  };

  // 오늘로 이동
  const handleGoToday = () => {
    setViewDate(today);
    onDateClick(today);
    setIsMonthPickerOpen(false);
  };

  // 달력 그리드 계산
  const calendarDays = useMemo(() => {
    if (isMonthPickerOpen) return [];
    const start = startOfWeek(startOfMonth(viewDate));
    const end = endOfWeek(endOfMonth(viewDate));
    return eachDayOfInterval({ start, end });
  }, [viewDate, isMonthPickerOpen]);

  // 연/월 선택 로직
  const handleYearChange = (amount) => {
    setTempViewDate((prev) =>
      amount > 0 ? addYears(prev, 1) : subYears(prev, 1),
    );
  };

  // 월 선택: 최종 결정 시점에 부모 setViewDate 호출
  const handleMonthSelect = (monthIndex) => {
    const newDate = setMonth(tempViewDate, monthIndex);
    setViewDate(newDate);
    setIsMonthPickerOpen(false);
  };

  return (
    <div className="w-full bg-bg-main flex flex-col px-4">
      {/* 헤더 영역 */}
      <div className="relative flex items-center justify-center py-4 px-2">
        <div className="flex items-center gap-3">
          {/* 달력 모드일 때만 월 이동 화살표 노출 */}
          {!isMonthPickerOpen && (
            <button
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="text-text-sub p-1 mx-1"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* 연/월 텍스트 클릭 시 모드 토글 */}
          <button
            onClick={toggleMonthPicker}
            className={`text-xl font-bold text-text-main flex items-center gap-1 transition-colors ${isMonthPickerOpen ? 'text-primary-500' : ''}`}
          >
            {/* 피커가 열려있으면 임시 날짜, 닫혀있으면 실제 날짜 표시 */}
            {format(isMonthPickerOpen ? tempViewDate : viewDate, 'yyyy년 M월')}
            <span
              className={`text-[10px] text-text-sub ml-0.5 opacity-50 transition-transform duration-200 ${isMonthPickerOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </button>

          {!isMonthPickerOpen && (
            <button
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="text-text-sub p-1"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        <button
          onClick={handleGoToday}
          className="absolute right-2 text-[11px] font-bold text-primary-500 border border-primary-500 px-1.5 py-0.5 rounded-md active:scale-95"
        >
          오늘
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="min-h-[300px]">
        {isMonthPickerOpen ? (
          <div className="flex flex-col animate-fadeIn">
            {/* 연도 컨트롤 */}
            <div className="flex items-center justify-center gap-8 mb-6 mt-2">
              <button
                onClick={() => handleYearChange(-1)}
                className="p-2 text-text-sub bg-bg-sub rounded-full active:bg-neutral-800"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-2xl font-bold text-text-main">
                {format(tempViewDate, 'yyyy년')}
              </span>
              <button
                onClick={() => handleYearChange(1)}
                className="p-2 text-text-sub bg-bg-sub rounded-full active:bg-neutral-800"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 1-12월 그리드 */}
            <div className="grid grid-cols-3 gap-4 px-2">
              {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => {
                // 연도가 변경되면 선택 상태를 해제하기 위해 viewDate와 tempViewDate의 연도까지 비교
                const isSelectedMonth =
                  viewDate.getMonth() === monthIndex &&
                  viewDate.getFullYear() === tempViewDate.getFullYear();

                const isThisMonthReal =
                  isSameYear(tempViewDate, today) &&
                  today.getMonth() === monthIndex;

                return (
                  <button
                    key={monthIndex}
                    onClick={() => handleMonthSelect(monthIndex)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all active:scale-95
                      ${isSelectedMonth ? 'bg-primary-500 text-bg-main shadow-md' : 'bg-bg-sub text-text-main hover:bg-neutral-800'}
                      ${!isSelectedMonth && isThisMonthReal ? 'border border-primary-500 text-primary-500' : ''}
                    `}
                  >
                    {monthIndex + 1}월
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
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
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, viewDate);
                const isTodayReal = isSameDay(day, today);

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
        )}
      </div>
    </div>
  );
}
