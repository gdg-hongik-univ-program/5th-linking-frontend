import React from 'react';
import { Hourglass, Star, BrushCleaning, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const actions = [
  { id: 'upcoming', label: '마감임박', icon: Hourglass, path: '/upcoming' },
  { id: 'important', label: '중요', icon: Star, path: '/important' },
  { id: 'stale', label: '청소', icon: BrushCleaning, path: '/stale' },
  { id: 'trash', label: '휴지통', icon: Trash2, path: '/trash' },
];

export default function QuickActionBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="mx-auto w-[340px] h-[72px] px-[5px] py-[15px] bg-bg-card rounded-[10px] flex items-center shadow-lg font-family-sans">
      {actions.map((action, index) => {
        const Icon = action.icon;
        const isActive = location.pathname === action.path;

        return (
          <React.Fragment key={action.id}>
            <div className="flex-1 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-[5px] group outline-none"
              >
                <Icon
                  size="18"
                  strokeWidth="2"
                  className={`transition-colors ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-text-main group-hover:text-primary-400'
                  }`}
                />
                <span
                  className={`text-[12px] font-normal leading-none transition-colors ${
                    isActive
                      ? 'text-primary-500'
                      : 'text-text-main group-hover:text-primary-400'
                  }`}
                >
                  {action.label}
                </span>
              </motion.button>
            </div>
            {index < actions.length - 1 && (
              <div className="w-[1px] h-[14px] bg-neutral-300 opacity-30 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
