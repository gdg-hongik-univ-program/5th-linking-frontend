import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import { getCalendarSummary, getDailyEvents } from '../api/calendarApi';
import TabHeader from '../components/common/TabHeader';
import IconButton from '../components/common/IconButton';
import CalendarPicker from '../components/common/CalendarPicker';
import ListView from '../components/common/ListView';

export default function SchedulePage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

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

  const [activeTab, setActiveTab] = useState('all'); // all | deadline | created

  const handleGoToView = (itemId) => {
    if (!itemId) return;
    navigate(`/view/${itemId}`);
  };

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

  const filteredEvents = useMemo(() => {
    const targetDateStr = format(selectedDate, 'yyyy-MM-dd');

    return eventList.filter((item) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'deadline') {
        return item.deadline && item.deadline.startsWith(targetDateStr);
      }
      if (activeTab === 'created') {
        return item.createdAt && item.createdAt.startsWith(targetDateStr);
      }
      return true;
    });
  }, [eventList, activeTab, selectedDate]);

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
        <h3 className="text-lg font-bold">{format(selectedDate, 'M월 d일')}</h3>
      </div>

      {/* 탭 버튼들 */}
      <div className="px-5 mt-3 mb-1">
        <div className="flex items-center p-1 bg-bg-nav border border-neutral-800/80 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neutral-600/30 to-transparent" />

          {[
            { id: 'all', label: '전체' },
            { id: 'deadline', label: '마감일' },
            { id: 'created', label: '생성일' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-bold tracking-wide rounded-lg transition-colors relative z-10 ${
                activeTab === tab.id
                  ? 'text-primary-400'
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="scheduleTabIndicator"
                  layout="position"
                  className="absolute inset-0 bg-bg-card rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.4)] border border-neutral-700/60 -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-bg-main text-text-main flex flex-col font-family-sans h-full overflow-hidden">
      <main
        ref={scrollRef}
        className="flex-1 flex flex-col overflow-y-auto scrollbar-hide"
      >
        <div className="relative w-full shrink-0">
          <TabHeader title="일정" collapseBottomGap>
            <IconButton
              icon={Bell}
              onClick={() => navigate('/notification')}
              aria-label="알림함"
            />
          </TabHeader>
        </div>
        <ListView
          data={filteredEvents}
          isLoading={loading}
          ListHeaderComponent={renderListHeader}
          openedId={openedSwipeId}
          setOpenedId={setOpenedSwipeId}
          isSelectionMode={false}
          selectedIds={{ folders: [], items: [] }}
          scrollParentRef={scrollRef}
          onToggleSelection={() => {}}
          onNavigate={(entry) => handleGoToView(entry.itemId)}
          swipeEnabled={false}
          renderLeftAction={null}
          renderRightAction={null}
          emptyText="관련 링크가 없습니다."
        />
      </main>
    </div>
  );
}
