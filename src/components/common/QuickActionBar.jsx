import React from 'react';
import HourglassIcon from '../../assets/hourglass.svg?react';
import StarIcon from '../../assets/star.svg?react';
import CleanIcon from '../../assets/brush.svg?react';
import TrashIcon from '../../assets/trash.svg?react';
import { Link } from 'react-router-dom';

const actions = [
  {
    id: 'deadline',
    label: '마감임박',
    icon: (
      <Link to="/deadline">
        {' '}
        <HourglassIcon className="w-5 h-5" />{' '}
      </Link>
    ),
  },
  {
    id: 'important',
    label: '중요',
    icon: (
      <Link to="/important ">
        <StarIcon className="w-5 h-5" />{' '}
      </Link>
    ),
  },
  {
    id: 'clean',
    label: '청소',
    icon: (
      <Link to="/cleanup">
        {' '}
        <CleanIcon className="w-5 h-5" />{' '}
      </Link>
    ),
  },
  {
    id: 'trash',
    label: '휴지통',
    icon: (
      <Link to="/trash">
        {' '}
        <TrashIcon className="w-5 h-5" />{' '}
      </Link>
    ),
  },
];

export default function QuickActionBar() {
  return (
    <div className="mx-auto w-full h-[72px] px-[15px] py-[15px] bg-bg-card rounded-[10px] flex items-center shadow-lg">
      {actions.map((action, index) => (
        <React.Fragment key={action.id}>
          <div className="flex-1 flex justify-center">
            <button className="flex flex-col items-center gap-[5px] group">
              <div className="text-text-main group-hover:text-primary-500 transition-colors">
                {action.icon}
              </div>
              <span className="text-text-main text-[11px] font-normal font-family-sans leading-none">
                {action.label}
              </span>
            </button>
          </div>

          {index < actions.length - 1 && (
            <div className="w-[1px] h-[14px] bg-neutral-300 opacity-30 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
