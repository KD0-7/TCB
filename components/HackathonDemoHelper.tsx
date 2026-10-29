'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Award } from 'lucide-react';

interface HackathonDemoHelperProps {
  onLoadImbalanceChaos: () => void;
  onResetTasks: () => void;
  onTestReminder: () => void;
}

export function HackathonDemoHelper({ onLoadImbalanceChaos, onResetTasks, onTestReminder }: HackathonDemoHelperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Floating Pill Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white text-xs font-black shadow-xl shadow-red-600/30 hover:scale-105 transition-all border border-white/20 ml-auto"
      >
        <span className="animate-spin" style={{ animationDuration: '4s' }}>🕷️</span>
        <span>Demo & Pitch Guide</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Pitch Guide Card */}
      {isOpen && (
        <div className="mt-2 p-4 rounded-2xl bg-slate-950/95 border border-red-500/50 text-slate-100 shadow-2xl backdrop-blur-md animate-fadeIn text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-black text-red-400 uppercase tracking-tight">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Demo Script for Normal People</span>
            </div>
            <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800">
              Live Demo
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Step 1: The Hook */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                <span>1. The Universal Problem:</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Ask judges: <em>&ldquo;Who feels like their work deadlines constantly eat into their personal life, health, and family?&rdquo;</em>
              </p>
            </div>

            {/* Step 2: The Demo */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                <span>2. The Everyday Brain-Dump:</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Click <strong>&ldquo;🎯 Everyday Balanced Day&rdquo;</strong> preset & hit <strong>Parse Tasks</strong>. Show how AI cleanly partitions Work (Spider-Man Mode) vs Personal Life (Peter Parker Mode) and schedules reminders.
              </p>
            </div>

            {/* Step 3: The Behavioral Monitor */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-red-900/50">
              <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                <span>3. Real-Time Burnout Intervention:</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Click <strong>&ldquo;⚡ Workaholic Crunch Overload&rdquo;</strong> to trigger the live <strong>Spider-Sense Tingling Alert</strong>. Emphasize: <em>The AI is an active behavioral coach, not just a to-do list!</em>
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    onLoadImbalanceChaos();
                    setIsOpen(false);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 font-bold border border-red-500/40 text-[11px] transition-colors"
                >
                  ⚡ Trigger Overload Scenario
                </button>
                <button
                  onClick={() => {
                    onTestReminder();
                    setIsOpen(false);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold border border-amber-500/40 text-[11px] transition-colors"
                >
                  🔔 Test Reminder
                </button>
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <span>Project Spider-Sense</span>
            <button
              onClick={onResetTasks}
              className="text-slate-400 hover:text-white underline"
            >
              Reset All Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
