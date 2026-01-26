import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default function LinkCard({ link }) {
  const { itemId, title, tags, importance, deadline, createdAt } = link;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="flex gap-4 py-3 cursor-pointer group"
    >
      <div className="relative w-24 h-24 bg-neutral-200 rounded-xl shrink-0 overflow-hidden shadow-sm">
        <div className="w-full h-full bg-neutral-300" />

        {importance && (
          <div className="absolute top-1.5 right-1.5 drop-shadow-md">
            <Star size={14} fill="#EABE2F" className="text-primary-500" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        <h3 className="text-[15px] font-medium text-text-main leading-snug line-clamp-2">
          {title}
        </h3>

        <div className="text-right">
          <p className="text-[11px] text-text-sub mb-0.5">
            {formatDate(createdAt)}
          </p>
          <div className="flex flex-wrap justify-end gap-x-1">
            {tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] text-text-sub">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
