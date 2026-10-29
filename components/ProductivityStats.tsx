'use client';

import React from 'react';
import { Task, TaskMode } from '@/lib/types';
import { Zap, Heart, CheckCircle2, Award, Briefcase } from 'lucide-react';

interface ProductivityStatsProps {
  tasks: Task[];
  currentMode: TaskMode;
}

export function ProductivityStats({ tasks, currentMode }: ProductivityStatsProps) {
  const isSpider = currentMode === 'SPIDER';

  const spiderTasks = tasks.filter(t => t.mode === 'SPIDER');
  const peterTasks = tasks.filter(t => t.mode === 'PETER');

  const spiderDone = spiderTasks.filter(t => t.status === 'COMPLETED').length;
  const spiderTotal = spiderTasks.length;
  const spiderPercent = spiderTotal > 0 ? Math.round((spiderDone / spiderTotal) * 100) : 0;

  const peterDone = peterTasks.filter(t => t.status === 'COMPLETED').length;
  const peterTotal = peterTasks.length;
  const peterPercent = peterTotal > 0 ? Math.round((peterDone / peterTotal) * 100) : 0;

  const totalDone = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length;
  const overallPercent = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      {/* 1. Work Stamina & Completion Meter (Spider-Man Work Mode) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isSpider 
          ? 'bg-slate-900/80 border-red-900/40 text-slate-100 shadow-[0_4px_20px_rgba(239,68,68,0.06)]' 
          : 'bg-[#FFFDF9] border-red-200 text-amber-950 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-tight block">Work Stamina Meter</span>
              <span className="text-[10px] text-slate-400">Career & Deliverables Output</span>
            </div>
          </div>
          <span className="text-sm font-black text-red-500">{spiderPercent}%</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-red-950/60">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${spiderPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>{spiderDone} of {spiderTotal} work tasks done</span>
          <span className="font-semibold text-red-400">
            {spiderPercent === 100 ? '⚡ Peak Output Achieved!' : 'In Progress...'}
          </span>
        </div>
      </div>

      {/* 2. Personal Wellness & Energy Meter (Peter Parker Mode) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        !isSpider 
          ? 'bg-[#FFFDF9] border-amber-300 text-amber-950 shadow-[0_4px_20px_rgba(245,158,11,0.08)]' 
          : 'bg-slate-900/80 border-amber-900/40 text-slate-100 shadow-sm'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-tight block">Personal Wellness Meter</span>
              <span className="text-[10px] text-slate-400">Self-Care, Health & Errands</span>
            </div>
          </div>
          <span className="text-sm font-black text-amber-500">{peterPercent}%</span>
        </div>

        {/* Heart Peace Meter Bar */}
        <div className="w-full h-3 bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-amber-950/40">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full transition-all duration-700 relative overflow-hidden"
            style={{ width: `${peterPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/25 -skew-x-12 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>{peterDone} of {peterTotal} life errands done</span>
          <span className="font-semibold text-amber-500">
            {peterPercent === 100 ? '✨ Recharged & Ready!' : 'Self-Care Active'}
          </span>
        </div>
      </div>

      {/* 3. Overall Daily Equilibrium & Productivity */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isSpider
          ? 'bg-slate-900/80 border-slate-800 text-slate-100'
          : 'bg-[#FFFDF9] border-amber-200 text-amber-950'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-tight block">Overall Productivity</span>
              <span className="text-[10px] text-slate-400">Across Both Dimensions</span>
            </div>
          </div>
          <span className="text-sm font-black text-emerald-500">{overallPercent}%</span>
        </div>

        <div className="w-full h-3 bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>{totalDone} total tasks completed</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{totalTasks - totalDone} remaining</span>
          </span>
        </div>
      </div>

    </div>
  );
}
