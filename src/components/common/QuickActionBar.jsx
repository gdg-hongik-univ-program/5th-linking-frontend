import React from 'react';
import { Hourglass, Star, BrushCleaning, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const actions = [
  { id: 'upcoming', label: '임박', icon: Hourglass, path: '/upcoming' },
  { id: 'important', label: '중요', icon: Star, path: '/important' },
  { id: 'stale', label: '정리', icon: BrushCleaning, path: '/stale' },
  { id: 'trash', label: '휴지통', icon: Trash2, path: '/trash' },
];

export default function QuickActionBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="mx-auto w-full px-1.5 py-3 bg-neutral-800 rounded-xl flex items-center border border-text-main/5 font-family-sans relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-text-main/10 to-transparent" />

      {actions.map((action, index) => {
        const Icon = action.icon;
        const isActive = location.pathname === action.path;

        return (
          <React.Fragment key={action.id}>
            <div className="flex-1 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-1.5 group outline-none py-2 px-2 rounded-xl transition-all ${
                  isActive ? 'bg-primary-500' : 'bg-neutral-800'
                } focus:outline-none`}
              >
                <Icon
                  size="18"
                  strokeWidth="2"
                  className={`transition-colors ${
                    isActive
                      ? 'text-bg-main'
                      : 'text-text-main group-hover:text-primary-400'
                  }`}
                />
                <span
                  className={`text-xs font-normal leading-none transition-colors ${
                    isActive
                      ? 'text-bg-main'
                      : 'text-text-main group-hover:text-primary-400'
                  }`}
                >
                  {action.label}
                </span>
              </motion.button>
            </div>
            {index < actions.length - 1 && (
              <div className="w-px h-3.5 bg-text-main/5 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
