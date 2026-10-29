'use client';

import React from 'react';
import { TaskMode, TaskPriority, TaskStatus } from '@/lib/types';
import { Search, Plus, Filter, CheckCircle2, Clock, Shield, Heart } from 'lucide-react';

interface TaskFilterBarProps {
  currentMode: TaskMode;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: TaskPriority | 'ALL';
  onPriorityChange: (p: TaskPriority | 'ALL') => void;
  statusFilter: TaskStatus | 'ALL';
  onStatusChange: (s: TaskStatus | 'ALL') => void;
  onOpenCreateModal: () => void;
  taskCounts: {
    total: number;
    pending: number;
    completed: number;
  };
}

export function TaskFilterBar({
  currentMode,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  onOpenCreateModal,
  taskCounts,
}: TaskFilterBarProps) {
  const isSpider = currentMode === 'SPIDER';

  return (
    <div className={`p-3.5 rounded-2xl border transition-all ${
      isSpider
        ? 'bg-slate-900/90 border-red-950/80 text-slate-100 shadow-sm'
        : 'bg-[#FFFDF9] border-amber-200 text-amber-950 shadow-sm'
    }`}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={`Search ${isSpider ? 'Spider-Man work missions...' : 'Peter Parker life tasks...'}`}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 transition-all ${
              isSpider
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-red-500 focus:ring-red-500/20'
                : 'bg-white border-amber-200 text-amber-950 placeholder-amber-700/40 focus:border-amber-500 focus:ring-amber-500/20'
            }`}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Status Segmented Control */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 text-xs font-semibold ${
            isSpider ? 'bg-slate-950 border-slate-800' : 'bg-[#F5ECE0] border-amber-200'
          }`}>
            <button
              onClick={() => onStatusChange('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? isSpider ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-amber-950 shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              All ({taskCounts.total})
            </button>
            <button
              onClick={() => onStatusChange('PENDING')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'PENDING'
                  ? isSpider ? 'bg-red-600 text-white shadow-sm' : 'bg-amber-400 text-amber-950 shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Active ({taskCounts.pending})</span>
            </button>
            <button
              onClick={() => onStatusChange('COMPLETED')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                statusFilter === 'COMPLETED'
                  ? isSpider ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Done ({taskCounts.completed})</span>
            </button>
          </div>

          {/* Priority Dropdown Filter */}
          <select
            value={priorityFilter}
            onChange={e => onPriorityChange(e.target.value as any)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none ${
              isSpider ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-amber-200 text-amber-950'
            }`}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔴 High Priority</option>
            <option value="MEDIUM">🟡 Medium Priority</option>
            <option value="LOW">🔵 Low Priority</option>
          </select>

          {/* Create Task Button */}
          <button
            onClick={onOpenCreateModal}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
              isSpider
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-700/30'
                : 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-amber-500/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

        </div>

      </div>
    </div>
  );
}
