'use client';

import React from 'react';
import { Task, TaskPriority } from '@/lib/types';
import { sound } from '@/lib/sound';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  Clock, 
  Tag, 
  Heart, 
  Briefcase,
  Bell,
  Home,
  Laptop,
  ShoppingCart,
  Users
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleMode: (id: string, currentMode: string) => void;
  onTriggerReminder?: (task: Task) => void;
}

export function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onToggleMode,
  onTriggerReminder,
}: TaskCardProps) {
  const isSpider = task.mode === 'SPIDER';
  const isCompleted = task.status === 'COMPLETED';

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playWebThwip();

    if (!isCompleted) {
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.7 },
        colors: isSpider ? ['#EF4444', '#DC2626', '#38BDF8'] : ['#F59E0B', '#D97706', '#10B981'],
      });
    }

    onToggleStatus(task.id, task.status);
  };

  const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string; border: string }> = {
    HIGH: {
      label: 'High Priority',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/40',
    },
    MEDIUM: {
      label: 'Medium',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
    },
    LOW: {
      label: 'Low',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/40',
    },
  };

  const pConfig = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  const renderCategoryIcon = () => {
    const cat = (task.category || '').toLowerCase();
    if (cat.includes('grocer') || cat.includes('food') || cat.includes('meal')) return <ShoppingCart className="w-3 h-3 text-amber-600" />;
    if (cat.includes('family') || cat.includes('friend') || cat.includes('parents')) return <Users className="w-3 h-3 text-rose-500" />;
    if (cat.includes('health') || cat.includes('doctor') || cat.includes('fitness')) return <Heart className="w-3 h-3 text-rose-500" />;
    if (cat.includes('engineer') || cat.includes('code') || cat.includes('tech')) return <Laptop className="w-3 h-3 text-blue-400" />;
    if (cat.includes('work') || cat.includes('client') || cat.includes('meet')) return <Briefcase className="w-3 h-3 text-red-400" />;
    return <Tag className="w-3 h-3" />;
  };

  return (
    <div
      className={`group relative rounded-2xl border p-4 transition-all duration-300 hover:shadow-lg ${
        isCompleted ? 'opacity-65' : 'opacity-100'
      } ${
        isSpider
          ? isCompleted
            ? 'bg-slate-950/60 border-slate-800 text-slate-400'
            : 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-red-950/80 text-slate-100 hover:border-red-600/50 hover:shadow-[0_4px_20px_rgba(239,68,68,0.12)]'
          : isCompleted
            ? 'bg-[#F7EFE2]/60 border-amber-200 text-amber-900/50'
            : 'bg-gradient-to-br from-white to-[#FDF8EE] border-amber-200/90 text-amber-950 hover:border-amber-400 hover:shadow-[0_4px_20px_rgba(217,119,6,0.08)]'
      }`}
    >
      {/* Top Row: Mode Pill, Priority & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Mode Badge with 1-click Toggle */}
          <button
            onClick={() => {
              sound.playModeSwitch(task.mode === 'PETER');
              onToggleMode(task.id, task.mode);
            }}
            title="Click to shift between Work (Spider) and Personal (Peter) Mode"
            className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
              isSpider
                ? 'bg-red-950 text-red-300 border-red-800 hover:bg-red-900'
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            }`}
          >
            {isSpider ? <Briefcase className="w-2.5 h-2.5 text-red-400" /> : <Home className="w-2.5 h-2.5 text-amber-600" />}
            <span>{isSpider ? 'SPIDER-MAN (WORK)' : 'PETER PARKER (LIFE)'}</span>
          </button>

          {/* Priority Badge */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pConfig.bg} ${pConfig.color} ${pConfig.border}`}>
            {pConfig.label}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onTriggerReminder && (
            <button
              onClick={() => onTriggerReminder(task)}
              title="Test Task Reminder Now"
              className="p-1 rounded-md hover:bg-slate-800/40 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1 rounded-md hover:bg-slate-800/40 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            className="p-1 rounded-md hover:bg-red-950/40 text-slate-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content: Checkbox & Title */}
      <div className="flex items-start gap-3 mt-1">
        <button
          onClick={handleStatusClick}
          className="mt-0.5 flex-shrink-0 focus:outline-none transition-transform active:scale-90"
          title={isCompleted ? 'Mark Pending' : 'Mark Completed (THWIP!)'}
        >
          {isCompleted ? (
            <CheckCircle2 className={`w-5 h-5 ${isSpider ? 'text-red-500' : 'text-amber-600'}`} />
          ) : (
            <Circle className="w-5 h-5 text-slate-500 hover:text-red-500 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold tracking-tight break-words ${
            isCompleted ? 'line-through opacity-70' : ''
          }`}>
            {task.title}
          </h4>

          {task.description && (
            <p className={`text-xs mt-1 leading-relaxed ${
              isCompleted ? 'line-through opacity-50' : 'opacity-80'
            }`}>
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer: Category, Deadline & Reminder */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-inherit text-[11px] opacity-75 flex-wrap">
        <div className="flex items-center gap-1.5 truncate">
          {renderCategoryIcon()}
          <span className="truncate font-medium">{task.category || (isSpider ? 'Work Deliverable' : 'Personal Life')}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {task.reminderTime && (
            <div className="flex items-center gap-1 font-semibold text-amber-500" title="Reminder Scheduled">
              <Bell className="w-3 h-3" />
              <span>{task.reminderTime.includes('T') ? new Date(task.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : task.reminderTime}</span>
            </div>
          )}

          {task.deadline && (
            <div className="flex items-center gap-1 font-semibold text-rose-500">
              <Clock className="w-3 h-3" />
              <span>{task.deadline.includes('T') ? new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : task.deadline}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
