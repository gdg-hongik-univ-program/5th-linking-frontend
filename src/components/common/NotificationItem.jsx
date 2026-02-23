import { memo } from 'react';
import { motion } from 'framer-motion';
import { Hourglass, Trophy, Sparkles, Bell } from 'lucide-react';

const NotificationItem = memo(({ item, onClick }) => {
  const getConfig = (type) => {
    switch (type) {
      case 'LEVEL_UP': return { icon: Trophy, color: 'text-violet-400' };
      case 'UPCOMING': return { icon: Hourglass, color: 'text-primary-500' };
      case 'CLEANUP': return { icon: Sparkles, color: 'text-emerald-400' };
      default: return { icon: Bell, color: 'text-primary-500' };
    }
  };
  const { icon: Icon, color } = getConfig(item.type);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    if (isNaN(date.getTime())) return '';

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? '오후' : '오전';
      hours = hours % 12 || 12;
      return `${ampm} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={`flex gap-4 items-start cursor-pointer transition-opacity py-1 ${
        item.read ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="pt-1">
        <Icon
          size={18}
          className={item.read ? 'text-text-sub' : color}
        />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <p
          className={`text-[14px] leading-relaxed break-keep ${
            item.read ? 'text-text-sub' : 'text-text-main font-medium'
          }`}
        >
          {item.message}
        </p>
        <span className="text-[11px] text-text-sub self-end">
          {formatDate(item.scheduledDate)}
        </span>
      </div>
    </motion.div>
  );
});

NotificationItem.displayName = 'NotificationItem';
export default NotificationItem;
