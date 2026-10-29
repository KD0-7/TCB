'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { Bell, Check, Clock, X, Shield, Heart } from 'lucide-react';
import { sound } from '@/lib/sound';

interface ReminderAlertToastProps {
  task: Task | null;
  onClose: () => void;
  onCompleteTask: (id: string) => void;
}

export function ReminderAlertToast({
  task,
  onClose,
  onCompleteTask,
}: ReminderAlertToastProps) {
  if (!task) return null;

  const isSpider = task.mode === 'SPIDER';

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce">
      <div className={`p-4 rounded-2xl border-2 shadow-2xl transition-all ${
        isSpider
          ? 'bg-slate-950/95 border-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]'
          : 'bg-[#FFFDF9] border-amber-500 text-amber-950 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-600 text-white animate-pulse">
              <Bell className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Spider-Sense Reminder!
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold">
            {isSpider ? (
              <span className="text-red-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Work Task Due
              </span>
            ) : (
              <span className="text-amber-600 flex items-center gap-1">
                <Heart className="w-3 h-3" /> Personal Life Errand
              </span>
            )}
            {task.deadline && (
              <span className="flex items-center gap-1 opacity-75">
                <Clock className="w-3 h-3" /> {task.deadline}
              </span>
            )}
          </div>

          <h4 className="font-bold text-sm tracking-tight">{task.title}</h4>
          {task.description && (
            <p className="text-xs opacity-75 mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-inherit">
          <button
            onClick={() => {
              sound.playWebThwip();
              onCompleteTask(task.id);
              onClose();
            }}
            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark Complete</span>
          </button>

          <button
            onClick={onClose}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
