import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { getCalendarSummary, getDailyEvents } from '../api/calendarApi';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import CalendarPicker from '../components/common/CalendarPicker';
import ListView from '../components/common/ListView';

export default function SchedulePage() {
  const navigate = useNavigate();

  const [today, setToday] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summarySets, setSummarySets] = useState({
    deadlineSet: new Set(),
    createdSet: new Set(),
  });
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthCache, setMonthCache] = useState({});
  const [openedSwipeId, setOpenedSwipeId] = useState(null);

  // 자정 마다 실제 오늘 날짜 동기화
  useEffect(() => {
    let timer;
    const updateToday = () => {
      const now = new Date();
      setToday((prev) =>
        prev.toDateString() !== now.toDateString() ? now : prev,
      );
      const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = setTimeout(updateToday, tomorrow.getTime() - now.getTime() + 100);
    };
    updateToday();
    window.addEventListener('focus', updateToday);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('focus', updateToday);
    };
  }, []);

  // 월별 요약 조회
  useEffect(() => {
    const fetchSummary = async () => {
      const cacheKey = format(viewDate, 'yyyy-MM');
      if (monthCache[cacheKey]) {
        setSummarySets(monthCache[cacheKey]);
        return;
      }
      try {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth() + 1;
        const data = await getCalendarSummary(year, month);
        const deadlineDates = [];
        const createdDates = [];
        if (data.calendarSummary) {
          Object.entries(data.calendarSummary).forEach(([dateStr, counts]) => {
            if (counts.deadlineCount > 0) deadlineDates.push(dateStr);
            if (counts.createdCount > 0) createdDates.push(dateStr);
          });
        }
        const newSets = {
          deadlineSet: new Set(deadlineDates),
          createdSet: new Set(createdDates),
        };
        setSummarySets(newSets);
        setMonthCache((prev) => ({ ...prev, [cacheKey]: newSets }));
      } catch (e) {
        console.error('월별 요약 로드 실패:', e);
      }
    };
    fetchSummary();
  }, [viewDate]);

  // 일별 상세 일정 조회
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getDailyEvents(format(selectedDate, 'yyyy-MM-dd'));
        setEventList(data.eventList || []);
      } catch (e) {
        console.error(e);
        setEventList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    setOpenedSwipeId(null);
  }, [selectedDate]);

  // 리스트 헤더 렌더링
  const renderListHeader = (
    <div className="bg-bg-main pb-2">
      <CalendarPicker
        viewDate={viewDate}
        setViewDate={setViewDate}
        selectedDate={selectedDate}
        onDateClick={setSelectedDate}
        today={today}
        summarySets={summarySets}
        showDots={true}
      />
      <div className="px-6 mt-6 mb-2">
        <h3 className="text-lg font-bold">
          {format(selectedDate, 'M월 d일')} 일정
        </h3>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <TabHeader title="일정">
        <IconButton
          icon={Bell}
          onClick={() => navigate('/notification')}
          aria-label="알림함"
        />
      </TabHeader>

      <main className="flex-1 h-full overflow-hidden">
        <ListView
          data={eventList}
          isLoading={loading}
          ListHeaderComponent={renderListHeader}
          openedId={openedSwipeId}
          setOpenedId={setOpenedSwipeId}
          isSelectionMode={false}
          selectedIds={{ folders: [], items: [] }}
          onToggleSelection={() => {}}
          onNavigate={(entry) => handleView(entry.itemId)}
          swipeEnabled={false}
          renderLeftAction={null}
          renderRightAction={null}
          emptyText="일정이 없습니다."
        />
      </main>
    </div>
  );
}
