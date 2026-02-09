import { useState, useEffect } from 'react';
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

  // 날짜 상태 관리
  const [today, setToday] = useState(new Date()); // 실제 오늘 (자정 갱신용)
  const [viewDate, setViewDate] = useState(new Date()); // 달력에 표시되는 월
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택된 일자

  // 데이터 상태 관리
  const [summarySets, setSummarySets] = useState({
    deadlineSet: new Set(),
    createdSet: new Set(),
  });
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);

  //캐시 저장
  const [monthCache, setMonthCache] = useState({});

  // 자정 마다 실제 오늘 날짜(today) 동기화
  useEffect(() => {
    let timer;
    const updateToday = () => {
      const now = new Date();
      setToday((prev) =>
        prev.toDateString() !== now.toDateString() ? now : prev,
      );

      // 다음 자정까지 남은 시간 계산
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

  // 월별 요약 조회 (캐싱 적용)
  useEffect(() => {
    const fetchSummary = async () => {
      const cacheKey = format(viewDate, 'yyyy-MM');

      // A. 캐시 적중(Hit): API 호출 없이 즉시 적용
      if (monthCache[cacheKey]) {
        setSummarySets(monthCache[cacheKey]);
        return;
      }

      // B. 캐시 미적중(Miss): 서버 요청
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

        // UI 업데이트 및 캐시에 저장
        setSummarySets(newSets);
        setMonthCache((prev) => ({ ...prev, [cacheKey]: newSets }));
      } catch (e) {
        console.error('월별 요약 로드 실패:', e);
      }
    };

    fetchSummary();
  }, [viewDate]); // monthCache는 의존성에서 제외 (무한 루프 방지)

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
        />

        <section className="mt-8 px-6 pb-24">
          <h3 className="text-lg font-bold mb-4">
            {format(selectedDate, 'M월 d일')} 일정
          </h3>
          <div className="flex flex-col gap-3">
            {eventList.length > 0
              ? eventList.map((event) => (
                  <div
                    key={event.itemId}
                    onClick={() => navigate(`/link/${event.itemId}`)}
                  >
                    <LinkCard link={event} />
                  </div>
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
