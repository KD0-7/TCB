'use client';

import React from 'react';
import { SpiderSenseAnalysis } from '@/lib/types';
import { Coffee, ShieldAlert, Sparkles, X, Heart } from 'lucide-react';
import { sound } from '@/lib/sound';

interface SpiderSenseWarningModalProps {
  analysis: SpiderSenseAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onAddSelfCareTask: () => void;
}

export function SpiderSenseWarningModal({
  analysis,
  isOpen,
  onClose,
  onAddSelfCareTask,
}: SpiderSenseWarningModalProps) {
  if (!isOpen || !analysis) return null;

  const { warningTitle, warningMessage, workloadStats, spiderWisdomQuote } = analysis;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      {/* Spider-Sense Radiation / Comic Tingling Aura */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-red-950/40 border-2 border-red-500 rounded-3xl p-6 sm:p-7 text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden">
        
        {/* Animated Spider-Sense Wave Lines */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-4 text-red-500 font-black text-xl tracking-widest select-none pointer-events-none animate-bounce">
          <span className="scale-x-[-1] animate-pulse">⚡~⚡</span>
          <span className="text-xs uppercase bg-red-600 text-white font-black px-3 py-1 rounded-full shadow-lg shadow-red-600/50">
            Spider-Sense Tingling!
          </span>
          <span className="animate-pulse">⚡~⚡</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Spider Avatar with Tingling Glow */}
        <div className="flex flex-col items-center text-center mt-6">
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full bg-red-600/30 blur-xl animate-ping" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex items-center justify-center border-2 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)]">
              <svg className="w-10 h-10 fill-white" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3 0 .8-.31 1.52-.82 2.05l1.6 3.2c.14.28.02.62-.26.76-.28.14-.62.02-.76-.26L13.2 10.6C12.83 10.85 12.43 11 12 11s-.83-.15-1.2-.4l-1.56 3.15c-.14.28-.48.4-.76.26-.28-.14-.4-.48-.26-.76l1.6-3.2C9.31 9.52 9 8.8 9 8c0-1.66 1.34-3 3-3zm-4 8c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2zm8 0c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2z"/>
              </svg>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-md">
            {warningTitle || 'WORKAHOLIC OVERLOAD DETECTED!'}
          </h3>

          <p className="text-xs text-red-400 font-bold uppercase tracking-wider mt-0.5">
            Work-Life Behavioral Monitor • Burnout Prevention
          </p>
        </div>

        {/* Workload Metric Readout */}
        <div className="grid grid-cols-3 gap-2 my-4 bg-slate-900/90 border border-red-950 p-3 rounded-2xl text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Work (Spider)</div>
            <div className="text-lg font-black text-red-500">{workloadStats.workCount} Tasks</div>
          </div>
          <div className="border-x border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Life (Peter)</div>
            <div className="text-lg font-black text-amber-400">{workloadStats.personalCount} Tasks</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Workload Ratio</div>
            <div className="text-lg font-black text-rose-400">
              {Math.round(workloadStats.imbalanceRatio * 100)}%
            </div>
          </div>
        </div>

        {/* Spider-Man Dialogue Speech Bubble */}
        <div className="relative bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-800/80 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">🎙️</span>
            <div>
              <span className="font-extrabold text-red-400 text-xs uppercase tracking-wider block mb-1">
                Spider-Sense Coach says:
              </span>
              <p className="italic font-medium text-slate-100">
                &ldquo;{warningMessage}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Wisdom Quote */}
        <div className="text-center my-3 text-xs text-amber-300 font-semibold italic flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>&ldquo;{spiderWisdomQuote}&rdquo;</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-5">
          <button
            onClick={() => {
              sound.playWebThwip();
              onClose();
              onAddSelfCareTask();
            }}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
          >
            <Coffee className="w-4 h-4" />
            <span>Add Self-Care Task Now</span>
          </button>

          <button
            onClick={() => {
              sound.playWebThwip();
              onClose();
            }}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>I’ll Take a Break</span>
          </button>
        </div>

      </div>
    </div>
  );
}
