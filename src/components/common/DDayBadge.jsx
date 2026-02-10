import { differenceInCalendarDays } from 'date-fns';

export default function DDayBadge({ deadline, className = '' }) {
  if (!deadline) return null;

  const today = new Date();
  const targetDate = new Date(deadline);
  const diff = differenceInCalendarDays(targetDate, today);

  let label = '';
  // 상태 (upcoming, normal, past)
  let status = 'normal';
  // D-7 이후부터 D-DAY 이전까지 upcoming
  if (diff === 0) {
    label = 'D-Day';
    status = 'upcoming';
  }
  // D-8 이전까지 normal
  else if (diff > 0) {
    label = `D-${diff}`;
    status = diff <= 7 ? 'upcoming' : 'normal';
  }
  // D+1과 이후부터 past
  else {
    label = `D+${Math.abs(diff)}`;
    status = 'past';
  }

  const styles = {
    upcoming: 'bg-error-500 text-text-main',
    normal: 'bg-error-50 text-text-error',
    past: 'bg-neutral-500 text-text-main',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-medium shadow-sm inline-block ${styles[status]} ${className}`}
    >
      {label}
    </span>
  );
}
