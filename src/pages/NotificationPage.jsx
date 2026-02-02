import { useState, useEffect } from 'react';
import { X, Hourglass, Brush, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, markAsRead } from '../api/notificationApi';

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        // 에러 처리
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await markAsRead(notif.notificationId);
        // 로컬 상태 업데이트
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notif.notificationId
              ? { ...n, read: true }
              : n,
          ),
        );
      }
      // 알림과 연결된 아이템 상세 페이지로 이동 (itemId 활용)
      if (notif.itemId) navigate(`/view/${notif.itemId}`);
    } catch (error) {
      console.error(error);
    }
  };

  // 읽지 않은 알림이 있는지 확인
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-bg-main text-text-main flex flex-col font-family-sans"
    >
      <header className="flex items-center px-4 py-4 shrink-0 relative">
        <button onClick={() => navigate(-1)} className="p-2">
          <X className="w-6 h-6" />
        </button>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold">
          알림함
        </h2>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-6">
        <div className="mb-6">
          {/* 읽지 않은 알림 유무에 따른 메시지 변경 */}
          <p className="text-[15px] text-text-main">
            {hasUnread ? '새로운 알림이 도착했어요.' : '새로운 알림이 없어요.'}
          </p>
          <div className="h-[1px] bg-neutral-800 mt-4 w-full" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-10">
            <AnimatePresence>
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
      </main>
    </motion.div>
  );
}

function NotificationItem({ item, onClick }) {
  const Icon = item.type === 'DEADLINE' ? Hourglass : Brush;

  // 날짜 포맷 (ISO -> YYYY년 MM월 DD일)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      /* 읽은 알림은 약간 투명하게 처리하여 시각적으로 구분 */
      className={`flex gap-4 items-start cursor-pointer transition-opacity ${item.read ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="pt-1">
        <Icon
          size={18}
          className={item.read ? 'text-text-sub' : 'text-primary-500'}
        />
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <p
          className={`text-[14px] leading-relaxed break-keep ${item.read ? 'text-text-sub' : 'text-text-main font-medium'}`}
        >
          {item.message}
        </p>
        <span className="text-[11px] text-text-sub self-end">
          {formatDate(item.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
