import { useState, useEffect } from 'react';
import { Loader2, Trash2, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteAllNotifications,
} from '../api/notificationApi';
import PageHeader from '../components/common/PageHeader';
import IconButton from '../components/common/IconButton';
import NotificationItem from '../components/common/NotificationItem';

export const MOCK_NOTIFICATIONS = [
  // --- 오늘 알림 (시간 표시 테스트) ---
  {
    notificationId: 1,
    itemId: 101,
    message: '주방 청소 마감일이 3시간 남았습니다. 서둘러 확인해주세요!',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    notificationId: 2,
    itemId: 102,
    message: '거실 청소 담당자로 지정되었습니다. 상세 일정을 확인하세요.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
  },
  {
    notificationId: 3,
    itemId: 103,
    message: '화장실 청소 검토가 완료되었습니다. 수고하셨습니다!',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4시간 전
  },

  // --- 어제 알림 (날짜 표시 테스트: "M월 D일") ---
  {
    notificationId: 4,
    itemId: 104,
    message: '분리수거 마감일이 지났습니다. 지연 사유를 입력해주세요.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
  },
  {
    notificationId: 5,
    itemId: 105,
    message: '새로운 청소 도구가 보급되었습니다. 창고에서 확인하세요.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },

  // --- 이번 주 알림 ---
  {
    notificationId: 6,
    itemId: 106,
    message: '이번 주 공용 공간 청소 구역이 변경되었습니다.',
    read: true,
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    notificationId: 7,
    itemId: 107,
    message: '마감일이 임박한 작업이 2건 있습니다. 리스트를 확인하세요.',
    read: false,
    createdAt: '2026-02-09T14:20:00Z',
  },
  {
    notificationId: 8,
    itemId: 108,
    message: '청소 용품 구매 요청이 승인되었습니다.',
    read: true,
    createdAt: '2026-02-08T11:00:00Z',
  },

  // --- 과거 알림 (스크롤 테스트용 긴 목록) ---
  {
    notificationId: 9,
    itemId: 109,
    message: '1월 우수 청소 구역으로 선정되었습니다! 보상을 확인하세요.',
    read: true,
    createdAt: '2026-01-31T18:00:00Z',
  },
  {
    notificationId: 10,
    itemId: 110,
    message: '베란다 청소 마감일이 다가오고 있습니다.',
    read: true,
    createdAt: '2026-01-25T13:00:00Z',
  },
  {
    notificationId: 11,
    itemId: 111,
    message: '공지사항: 설 연휴 청소 일정 안내',
    read: true,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    notificationId: 12,
    itemId: 112,
    message: '시스템 정기 점검 안내 (2월 15일 예정)',
    read: true,
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    notificationId: 13,
    itemId: 113,
    message: '냉장고 청소 마감일이 내일까지입니다.',
    read: false,
    createdAt: '2026-01-10T16:40:00Z',
  },
  {
    notificationId: 14,
    itemId: 114,
    message: '신규 팀원이 알림함에 참여했습니다. 환영해주세요!',
    read: true,
    createdAt: '2026-01-05T12:00:00Z',
  },
  {
    notificationId: 15,
    itemId: 115,
    message: '복도 물청소가 완료되었습니다.',
    read: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    notificationId: 16,
    itemId: 116,
    message: '2025년 연말 대청소 결과 보고서가 발행되었습니다.',
    read: true,
    createdAt: '2025-12-31T23:59:59Z',
  },
  {
    notificationId: 17,
    itemId: 117,
    message: '마감일이 지난 항목에 대해 패널티가 부과될 수 있습니다.',
    read: true,
    createdAt: '2025-12-25T10:00:00Z',
  },
  {
    notificationId: 18,
    itemId: 118,
    message: '크리스마스 특별 청소 이벤트 참여 감사 알림',
    read: true,
    createdAt: '2025-12-24T18:00:00Z',
  },
  {
    notificationId: 19,
    itemId: 119,
    message: '창고 정리가 완료되어 위치가 변경되었습니다.',
    read: true,
    createdAt: '2025-12-15T15:00:00Z',
  },
  {
    notificationId: 20,
    itemId: 120,
    message: '서비스 이용 약관 개정 안내',
    read: true,
    createdAt: '2025-12-01T09:00:00Z',
  },
];

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 대신 목데이터를 사용하는 테스트 로직
    const fetchMockData = async () => {
      setLoading(true);

      // 실제 네트워크 통신 느낌을 주기 위해 0.8초 딜레이 추가
      await new Promise((resolve) => setTimeout(resolve, 800));

      setNotifications(MOCK_NOTIFICATIONS);
      setLoading(false);
    };

    fetchMockData();
  }, []);

  /*const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
*/
  const handleReadAll = async () => {
    if (notifications.length === 0 || !notifications.some((n) => !n.read))
      return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await markAllAsRead();
    } catch (error) {
      fetchNotifications();
    }
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('모든 알림을 삭제하시겠습니까?')) return;
    try {
      setNotifications([]);
      await deleteAllNotifications();
    } catch (error) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notif.notificationId
              ? { ...n, read: true }
              : n,
          ),
        );
        await markAsRead(notif.notificationId);
      }
      if (notif.itemId) navigate(`/view/${notif.itemId}`);
    } catch (error) {
      console.error(error);
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden h-screen overflow-y-auto scrollbar-hide"
      >
        <PageHeader title="알림함" iconType="close" />

        <main className="flex-1 flex flex-col px-6">
          {/* 상단 문구 */}
          <div className="shrink-0">
            <div className="flex items-center justify-between py-2 mt-2">
              <p className="text-[15px] text-text-main font-medium">
                {!loading &&
                  (notifications.length > 0
                    ? hasUnread
                      ? '새로운 알림이 도착했어요.'
                      : '새로운 알림이 없어요.'
                    : '알림 내역이 없어요.')}
                {loading && '불러오는 중...'}
              </p>

              <div className="flex items-center gap-1">
                <IconButton
                  icon={CheckCheck}
                  size={20}
                  onClick={handleReadAll}
                  disabled={!hasUnread || loading}
                />
                <IconButton
                  icon={Trash2}
                  size={20}
                  onClick={handleDeleteAll}
                  disabled={notifications.length === 0 || loading}
                  color="group-enabled:group-hover:text-red-500"
                />
              </div>
            </div>
            <div className="h-[1px] bg-text-sub/20 mb-4 w-full" />
          </div>

          {/* 리스트 및 상태 영역 */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={36} className="animate-spin text-primary-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-text-sub opacity-40 text-[15px]">
                  수신된 알림이 없어요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pb-10 mt-2">
                <AnimatePresence initial={false}>
                  {notifications.map((item) => (
                    <NotificationItem
                      key={item.notificationId}
                      item={item}
                      onClick={() => handleNotificationClick(item)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </motion.div>
    </>
  );
}
