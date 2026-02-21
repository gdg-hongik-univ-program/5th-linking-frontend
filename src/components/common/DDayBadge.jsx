import { differenceInCalendarDays } from 'date-fns';

export default function DDayBadge({ deadline, className = '' }) {
  if (!deadline) return null;

  const diff = differenceInCalendarDays(new Date(deadline), new Date());

  // 1. 라벨 결정: 0일이면 D-DAY, 그 외에는 D-n 또는 D+n
  const label =
    diff === 0 ? 'D-DAY' : `D${diff > 0 ? '-' : '+'}${Math.abs(diff)}`;

  // 2. 상태 결정: 과거(past), 7일 이내(upcoming), 그 외(normal)
  const status = diff < 0 ? 'past' : diff <= 7 ? 'upcoming' : 'normal';

  // 3. 스타일 매핑
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
