import React from 'react';
import { differenceInCalendarDays } from 'date-fns';

export default function DDayBadge({ deadline, className = '' }) {
  if (!deadline) return null;

  const today = new Date();
  const targetDate = new Date(deadline);
  const diff = differenceInCalendarDays(targetDate, today);

  let label = '';
  let status = 'normal'; // normal, urgent, past

  if (diff === 0) {
    label = 'D-Day';
    status = 'urgent';
  } else if (diff > 0) {
    label = `D-${diff}`;
    status = diff <= 7 ? 'urgent' : 'normal'; // 7일 이내면 강조
  } else {
    label = `D+${Math.abs(diff)}`;
    status = 'past';
  }

  const styles = {
    urgent: 'bg-red-500 text-text-main', // 당일 및 임박
    normal: 'bg-red-500/10 text-text-error border border-red-500/20', // 여유 있는 마감
    past: 'bg-bg-card text-text-main opacity-60', // 지난 마감
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm inline-block ${styles[status]} ${className}`}
    >
      {label}
    </span>
  );
}
