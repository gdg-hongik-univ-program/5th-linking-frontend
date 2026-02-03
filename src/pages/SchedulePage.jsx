import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import LinkCard from '../components/common/LinkCard';
import CalendarPicker from '../components/common/CalendarPicker';
import { getCalendarSummary, getDailyEvents } from '../api/calendarApi';

export default function SchedulePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // 캘린더 뷰 제어 (연/월) 및 선택된 날짜
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [summarySets, setSummarySets] = useState({
    deadlineSet: new Set(),
    createdSet: new Set(),
  });
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 월별 요약 데이터 불러오기
  useEffect(() => {
    const fetchSummary = async () => {
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

        setSummarySets({
          deadlineSet: new Set(deadlineDates),
          createdSet: new Set(createdDates),
        });
      } catch (error) {
        console.error('월별 요약 로드 실패:', error);
      }
    };
    fetchSummary();
  }, [viewDate]);

  // 일별 상세 일정 불러오기
  useEffect(() => {
    const fetchDailyEvents = async () => {
      setLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const data = await getDailyEvents(dateStr);
        setEventList(data.eventList || []);
        console.log(
          '일별 일정 데이터:',
          data,
          '선택된 날짜:',
          dateStr,
          '\nformat함수:',
          format(new Date(), 'yyyy-MM-dd'),
          '\nviewDate:',
          viewDate,
          '\nnew Date',
          new Date(),
        );
      } catch (error) {
        console.error('일별 일정 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDailyEvents();
  }, [selectedDate]);

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden">
      <TabHeader title="일정">
        <IconButton
          icon={Bell}
          onClick={() => navigate('/notification')}
          aria-label="알림함"
        />
      </TabHeader>

      {/* 캘린더 내비게이션 및 그리드 */}
      <CalendarPicker
        viewDate={viewDate}
        setViewDate={setViewDate}
        selectedDate={selectedDate}
        onDateClick={setSelectedDate}
        summarySets={summarySets}
        showDots={true}
        onYearMonthClick={() => {
          console.log('년/월 선택 모달 열기');
        }}
      />

      {/* 하단 상세 일정 리스트 */}
      <section className="mt-8 px-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">
            {format(selectedDate, 'M월 d일')}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {loading && (
            <span className="py-12 text-center text-text-sub test-sm animate-pulse">
              불러오는 중...
            </span>
          )}
          {eventList.length > 0
            ? eventList.map((event) => (
                <div
                  key={event.itemId}
                  onClick={() => navigate(`/view/${event.itemId}`)}
                  className="cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <LinkCard link={event} />
                </div>
              ))
            : !loading && (
                <div className="py-12 text-center text-text-sub text-sm">
                  저장한 링크가 없습니다.
                </div>
              )}
        </div>
      </section>
    </div>
  );
}
