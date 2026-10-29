'use client';

import React from 'react';
import { Task, TaskMode } from '@/lib/types';
import { Briefcase, Heart, CheckCircle2 } from 'lucide-react';

interface WebOfLifeChartProps {
  tasks: Task[];
  currentMode: TaskMode;
}

export function WebOfLifeChart({ tasks, currentMode }: WebOfLifeChartProps) {
  const isSpider = currentMode === 'SPIDER';

  // Task metrics calculation
  const spiderTasks = tasks.filter(t => t.mode === 'SPIDER');
  const peterTasks = tasks.filter(t => t.mode === 'PETER');

  const spiderPending = spiderTasks.filter(t => t.status === 'PENDING').length;
  const spiderCompleted = spiderTasks.filter(t => t.status === 'COMPLETED').length;

  const peterPending = peterTasks.filter(t => t.status === 'PENDING').length;
  const peterCompleted = peterTasks.filter(t => t.status === 'COMPLETED').length;

  const totalPending = spiderPending + peterPending;
  const totalTasks = tasks.length;
  const totalCompleted = spiderCompleted + peterCompleted;

  // Workload Ratio: Percentage of work tasks among pending tasks
  const workRatio = totalPending > 0 
    ? Math.round((spiderPending / totalPending) * 100) 
    : 50;

  const lifeRatio = 100 - workRatio;

  // Equilibrium Score: 100 is perfect 50/50 balance, 0 is total 100/0 imbalance
  const equilibriumScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(workRatio - 50) * 2)));

  const isCriticalImbalance = totalPending >= 3 && (workRatio >= 70 || workRatio <= 25);
  const isModerateImbalance = totalPending >= 2 && !isCriticalImbalance && (workRatio >= 60 || workRatio <= 40);

  // Web Radar Chart Dimensions (8 axes for everyday people: 4 Work, 4 Personal)
  const spiderIntensity = Math.min(1, Math.max(0.15, spiderPending / 6));
  const peterIntensity = Math.min(1, Math.max(0.15, peterPending / 6));

  const cx = 150;
  const cy = 150;
  const maxR = 100;

  const axes = [
    { label: 'Work Deadlines', mode: 'SPIDER', angle: -90, val: spiderIntensity },
    { label: 'Engineering / Projects', mode: 'SPIDER', angle: -45, val: spiderIntensity * 0.95 },
    { label: 'Strategy / Planning', mode: 'SPIDER', angle: 0, val: spiderIntensity * 1.05 },
    { label: 'Meetings / Clients', mode: 'SPIDER', angle: 45, val: spiderIntensity * 0.85 },
    { label: 'Home & Errands', mode: 'PETER', angle: 90, val: peterIntensity * 0.9 },
    { label: 'Family & Friends', mode: 'PETER', angle: 135, val: peterIntensity * 1.05 },
    { label: 'Health & Wellness', mode: 'PETER', angle: 180, val: peterIntensity },
    { label: 'Rest & Hobbies', mode: 'PETER', angle: 225, val: peterIntensity * 0.8 },
  ];

  const getPoint = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const webPolygonPoints = axes
    .map(a => {
      const pt = getPoint(a.angle, Math.min(maxR, Math.max(20, a.val * maxR)));
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-500 relative overflow-hidden ${
      isSpider
        ? 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-red-900/40 text-slate-100 shadow-[0_8px_30px_rgba(239,68,68,0.07)]'
        : 'bg-gradient-to-b from-[#FFFDF9] to-[#FAF3E7] border-amber-200/80 text-amber-950 shadow-[0_8px_30px_rgba(217,119,6,0.06)]'
    }`}>
      {/* Background Spider-Web Overlay */}
      <div className="absolute -right-16 -top-16 w-56 h-56 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-current fill-none">
          <circle cx="50" cy="50" r="10" />
          <circle cx="50" cy="50" r="25" />
          <circle cx="50" cy="50" r="40" />
          <line x1="50" y1="10" x2="50" y2="90" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="20" y1="20" x2="80" y2="80" />
          <line x1="20" y1="80" x2="80" y2="20" />
        </svg>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕸️</span>
            <h2 className="font-extrabold text-base tracking-tight uppercase">
              Web of Life Balance Chart
            </h2>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isCriticalImbalance
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : isModerateImbalance
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
            }`}>
              {isCriticalImbalance ? '⚡ Overwork Alert' : isModerateImbalance ? 'Shifting Balance' : 'Optimal Equilibrium'}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isSpider ? 'text-slate-400' : 'text-amber-800/80'}`}>
            Visual balance analysis comparing career deliverables (Spider-Man Mode) with personal wellness (Peter Parker Mode).
          </p>
        </div>

        {/* Equilibrium Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
          isSpider 
            ? 'bg-slate-950/80 border-red-900/60 text-slate-200' 
            : 'bg-amber-100/70 border-amber-300 text-amber-950'
        }`}>
          <span>Equilibrium Score:</span>
          <span className={`text-sm font-black ${
            equilibriumScore >= 70 ? 'text-emerald-500' : equilibriumScore >= 45 ? 'text-amber-500' : 'text-red-500 animate-pulse'
          }`}>
            {equilibriumScore}/100
          </span>
        </div>
      </div>

      {/* Main Grid: Visual Spider-Web Radar + Dual-Axis Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* SVG Interactive Spider-Web Radar Chart */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2 relative">
          <svg viewBox="0 0 300 300" className="w-56 h-56 max-w-full drop-shadow-md">
            {/* Concentric Spider Web Rings */}
            {[25, 50, 75, 100].map((r, i) => (
              <polygon
                key={`ring-${i}`}
                points={axes.map(a => {
                  const p = getPoint(a.angle, r);
                  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke={isSpider ? 'rgba(239, 68, 68, 0.2)' : 'rgba(217, 119, 6, 0.25)'}
                strokeWidth={i === 3 ? '1.5' : '1'}
                strokeDasharray={i % 2 === 0 ? '3 3' : 'none'}
              />
            ))}

            {/* Radial Web Strands from Center */}
            {axes.map((a, i) => {
              const outer = getPoint(a.angle, maxR);
              const isWork = a.mode === 'SPIDER';
              return (
                <line
                  key={`strand-${i}`}
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={isWork 
                    ? isSpider ? 'rgba(239, 68, 68, 0.45)' : 'rgba(220, 38, 38, 0.35)' 
                    : isSpider ? 'rgba(245, 158, 11, 0.4)' : 'rgba(217, 119, 6, 0.5)'
                  }
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Active Task Surface */}
            <polygon
              points={webPolygonPoints}
              fill={isSpider ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.28)'}
              stroke={isSpider ? '#EF4444' : '#D97706'}
              strokeWidth="2.5"
              className="transition-all duration-700 ease-out"
            />

            {/* Node dots on axes */}
            {axes.map((a, i) => {
              const pt = getPoint(a.angle, Math.min(maxR, Math.max(20, a.val * maxR)));
              const isWork = a.mode === 'SPIDER';
              return (
                <circle
                  key={`node-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill={isWork ? '#EF4444' : '#F59E0B'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-700 ease-out"
                />
              );
            })}

            {/* Center Emblem */}
            <circle cx={cx} cy={cy} r="18" fill={isSpider ? '#7F1D1D' : '#FDE68A'} stroke={isSpider ? '#EF4444' : '#D97706'} strokeWidth="2" />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill={isSpider ? '#ffffff' : '#78350F'}
            >
              🕷️
            </text>
          </svg>

          {/* Web Labels */}
          <div className="flex items-center justify-between w-full text-[11px] font-bold px-4 mt-1">
            <span className="text-red-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Career / Work Mode
            </span>
            <span className="text-amber-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Personal / Life Mode
            </span>
          </div>
        </div>

        {/* Dynamic Dual Balance Gauge & Cards */}
        <div className="md:col-span-7 flex flex-col justify-between gap-4">
          
          {/* Dual-Persona Balance Meter */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-red-500 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Work & Career ({workRatio}%)</span>
              </span>
              <span className="text-amber-600 flex items-center gap-1">
                <span>Personal & Wellness ({lifeRatio}%)</span>
                <Heart className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Progress Dual Bar */}
            <div className="h-4 w-full bg-slate-800/40 rounded-full overflow-hidden flex border border-slate-700/30 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-l-full transition-all duration-700 relative"
                style={{ width: `${workRatio}%` }}
              >
                {workRatio > 18 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                    {spiderPending} pending
                  </span>
                )}
              </div>
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-r-full transition-all duration-700 relative"
                style={{ width: `${lifeRatio}%` }}
              >
                {lifeRatio > 18 && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-950">
                    {peterPending} pending
                  </span>
                )}
              </div>
            </div>
            
            <p className={`text-[11px] mt-1.5 italic ${isSpider ? 'text-slate-400' : 'text-amber-900/70'}`}>
              {workRatio > 65 
                ? '⚠️ Workload is heavily dominating. Spider-Sense advises taking a break to restore energy.' 
                : workRatio < 35 
                  ? 'Relaxed personal pace! Great personal wellness, though work projects are waiting.'
                  : '✨ Excellent work-life equilibrium! Career deliverables and personal well-being are in sync.'}
            </p>
          </div>

          {/* Breakdown Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Work Mode Stats */}
            <div className={`p-3 rounded-xl border transition-all ${
              isSpider 
                ? 'bg-slate-950/80 border-red-900/50 shadow-inner' 
                : 'bg-white/80 border-red-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Work Mode
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold">
                  {spiderTasks.length} Total
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-red-500">{spiderPending}</span>
                <span className="text-xs text-slate-400">pending tasks</span>
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{spiderCompleted} completed today</span>
              </div>
            </div>

            {/* Personal Mode Stats */}
            <div className={`p-3 rounded-xl border transition-all ${
              !isSpider 
                ? 'bg-amber-100/60 border-amber-300 shadow-inner' 
                : 'bg-slate-950/80 border-amber-900/40'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> Life Mode
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold">
                  {peterTasks.length} Total
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">{peterPending}</span>
                <span className="text-xs text-slate-400">pending errands</span>
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{peterCompleted} completed today</span>
              </div>
            </div>

          </div>

          {/* Productivity Tip */}
          <div className={`text-xs p-2.5 rounded-lg border flex items-center gap-2 ${
            isSpider 
              ? 'bg-red-950/30 border-red-900/40 text-red-200' 
              : 'bg-amber-100/50 border-amber-200 text-amber-900'
          }`}>
            <span className="text-base">🕷️</span>
            <span className="font-medium">
              Spider-Sense Rule: Sustainable high performance requires scheduled recovery. Aim for a 50/50 balance score.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
