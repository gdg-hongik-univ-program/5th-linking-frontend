import { memo } from 'react';
import { motion } from 'framer-motion';
import { Hourglass, BrushCleaning } from 'lucide-react';

const NotificationItem = memo(({ item, onClick }) => {
  const Icon = item.message.includes('마감일이') ? Hourglass : BrushCleaning;

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
          className={item.read ? 'text-text-sub' : 'text-primary-500'}
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
          {formatDate(item.createdAt)}
        </span>
      </div>
    </motion.div>
  );
});

NotificationItem.displayName = 'NotificationItem';
export default NotificationItem;
