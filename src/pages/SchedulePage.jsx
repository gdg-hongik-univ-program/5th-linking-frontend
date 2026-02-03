import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import CalendarPicker from '../components/common/CalendarPicker';
import LinkCard from '../components/common/LinkCard';
import { getCalendarSummary, getDailyEvents } from '../api/calendarApi';

export default function SchedulePage() {
  const navigate = useNavigate();
  const [today, setToday] = useState(new Date()); // 실제 현재 시점 관리
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [summarySets, setSummarySets] = useState({
    deadlineSet: new Set(),
    createdSet: new Set(),
  });
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);

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
      try {
        const data = await getCalendarSummary(
          viewDate.getFullYear(),
          viewDate.getMonth() + 1,
        );
        const deadlineDates = [],
          createdDates = [];
        if (data.calendarSummary) {
          Object.entries(data.calendarSummary).forEach(([dateStr, counts]) => {
            if (counts.deadlineCount > 0) deadlineDates.push(dateStr);
            if (counts.createdCount > 0) createdDates.push(dateStr);
          });
        }
        setSummarySets({
          deadlineSet: new Set(deadlineDates),
          createdSet: new Set(createdDates),
        });
      } catch (e) {
        console.error(e);
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
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedDate]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden">
      <TabHeader title="일정">
        <IconButton icon={Bell} onClick={() => navigate('/notification')} />
      </TabHeader>

      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
        <CalendarPicker
          viewDate={viewDate}
          setViewDate={setViewDate}
          selectedDate={selectedDate}
          onDateClick={setSelectedDate}
          today={today}
          summarySets={summarySets}
          showDots={true}
          onYearMonthClick={() => setViewDate(new Date())}
        />

        <section className="mt-8 px-6 pb-24">
          <h3 className="text-lg font-bold mb-4">
            {format(selectedDate, 'M월 d일')} 일정
          </h3>
          <div className="flex flex-col gap-3">
            {eventList.length > 0
              ? eventList.map((event) => (
                  <LinkCard key={event.itemId} link={event} />
                ))
              : !loading && (
                  <div className="py-12 text-center text-text-sub text-sm">
                    일정이 없습니다.
                  </div>
                )}
          </div>
        </section>
      </main>
    </div>
  );
}
