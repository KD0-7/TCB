'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Terminal, Shield, Award, HelpCircle } from 'lucide-react';

interface HackathonDemoHelperProps {
  onLoadImbalanceChaos: () => void;
  onResetTasks: () => void;
}

export function HackathonDemoHelper({ onLoadImbalanceChaos, onResetTasks }: HackathonDemoHelperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Floating Pill Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white text-xs font-black shadow-xl shadow-red-600/30 hover:scale-105 transition-all border border-white/20 ml-auto"
      >
        <span className="animate-spin" style={{ animationDuration: '4s' }}>🕷️</span>
        <span>Hackathon Pitch Guide</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Pitch Guide Card */}
      {isOpen && (
        <div className="mt-2 p-4 rounded-2xl bg-slate-950/95 border border-red-500/50 text-slate-100 shadow-2xl backdrop-blur-md animate-fadeIn text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-black text-red-400 uppercase tracking-tight">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Judge Presentation Script</span>
            </div>
            <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800">
              Live Demo Ready
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Step 1: The Hook */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                <span>1. The Hook:</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Ask judges: <em>&ldquo;Who feels overwhelmed by chaotic thoughts every single morning?&rdquo;</em> Show the Brain-Dump box.
              </p>
            </div>

            {/* Step 2: The Demo */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
                <span>2. The GenAI Demo:</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Click <strong>&ldquo;🎯 The Classic Chaos&rdquo;</strong> preset & hit <strong>Activate Spider-Sense AI</strong>. Show how it automatically separates into Peter (Life) vs Spidey (Work).
              </p>
            </div>

            {/* Step 3: The Aha Moment */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-red-900/50">
              <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1">
                <span>3. The &ldquo;Aha&rdquo; Moment:</span>
              </div>
              <p className="text-slate-300 leading-snug">
                Click <strong>&ldquo;⚡ Crunch Overload&rdquo;</strong> to trigger the live <strong>Spider-Sense Tingling Alert</strong>. Explain that GenAI is an active behavioral monitor, not just a chatbot!
              </p>
              <button
                onClick={() => {
                  onLoadImbalanceChaos();
                  setIsOpen(false);
                }}
                className="mt-2 w-full py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 font-bold border border-red-500/40 text-[11px] transition-colors"
              >
                ⚡ Trigger Overload Scenario Now
              </button>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <span>Project Spider-Sense • V1.0</span>
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
