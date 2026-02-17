import { useState, useEffect, useRef, useCallback } from 'react';
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
import LoadingOverlay from '../components/common/LoadingOverlay';

export default function NotificationPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleReadAll = async () => {
    if (notifications.length === 0 || !notifications.some((n) => !n.read))
      return;
    try {
      // 낙관적 업데이트
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await markAllAsRead();
    } catch (error) {
      fetchNotifications(); // 실패 시 롤백
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
      // 아이템 상세 페이지로 이동
      if (notif.itemId) navigate(`/view/${notif.itemId}`);
      else navigate('/stale');
    } catch (error) {
      console.error(error);
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <motion.div
      ref={scrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full bg-bg-main text-text-main flex flex-col font-family-sans overflow-hidden h-screen overflow-y-auto"
    >
      <PageHeader
        title="알림함"
        iconType="close"
        scrollContainerRef={scrollRef}
      />
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
        <div className="flex flex-col divide-y divide-neutral-800">
          {loading ? (
            <LoadingOverlay />
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <p className="text-text-sub opacity-40 text-[15px]">
                수신된 알림이 없어요.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-10 mt-2">
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
  );
}
