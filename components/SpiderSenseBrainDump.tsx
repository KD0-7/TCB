'use client';

import React, { useState } from 'react';
import { Task, TaskMode, TaskPriority, SpiderSenseAnalysis } from '@/lib/types';
import { sound } from '@/lib/sound';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Zap, 
  Check, 
  X, 
  AlertTriangle, 
  Heart, 
  Shield, 
  Flame, 
  Clock, 
  Tag, 
  Copy 
} from 'lucide-react';

interface SpiderSenseBrainDumpProps {
  currentMode: TaskMode;
  onTasksAdded: (tasks: any[]) => void;
  onWarningTriggered: (analysis: SpiderSenseAnalysis) => void;
}

export function SpiderSenseBrainDump({
  currentMode,
  onTasksAdded,
  onWarningTriggered,
}: SpiderSenseBrainDumpProps) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SpiderSenseAnalysis | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSpider = currentMode === 'SPIDER';

  // Hackathon Presentation Presets
  const presets = [
    {
      title: '🎯 The Classic Chaos',
      badge: 'Balanced Day',
      text: 'I need to finish the Oscorp financial report by 3 PM, grab Aunt May\'s medicine on the way home, fix my web-shooters, and email Mr. Stark.',
    },
    {
      title: '⚡ Crunch Overload',
      badge: 'Triggers Warning!',
      text: 'Need to prepare the Oscorp Q3 earnings pitch deck, debug the Stark nanotech patch, finish board presentation slides, lead 4 PM client architecture sync, deploy hotfix to production cluster, and draft quarterly review report tonight.',
    },
    {
      title: '🍕 Queens Recovery Day',
      badge: 'Self-Care Focus',
      text: 'Bake Aunt May\'s special wheatcakes, photograph pigeon on Brooklyn Bridge for Daily Bugle, swing by Joe\'s Pizza for two pies, study biophysics with Ned, and get 8 hours of sleep.',
    },
  ];

  const handleRunBrainDump = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);
    sound.playWebThwip();

    try {
      const response = await fetch('/api/spider-sense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          includeExisting: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process brain dump');
      }

      const analysis: SpiderSenseAnalysis = data.analysis;
      setAnalysisResult(analysis);
      setSelectedTasks(analysis.extractedTasks.map((_, i) => i));

      // Check if Spider-Sense warning was triggered
      if (analysis.warningTriggered) {
        sound.playSpiderSenseTingle();
        onWarningTriggered(analysis);
      }
    } catch (err: any) {
      console.error('Brain dump error:', err);
      setErrorMessage(err.message || 'Something went wrong processing brain dump.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleTaskSelection = (idx: number) => {
    setSelectedTasks(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleTaskModeToggle = (idx: number) => {
    if (!analysisResult) return;
    const updated = [...analysisResult.extractedTasks];
    updated[idx].mode = updated[idx].mode === 'SPIDER' ? 'PETER' : 'SPIDER';
    setAnalysisResult({ ...analysisResult, extractedTasks: updated });
  };

  const handleTaskPriorityChange = (idx: number, priority: TaskPriority) => {
    if (!analysisResult) return;
    const updated = [...analysisResult.extractedTasks];
    updated[idx].priority = priority;
    setAnalysisResult({ ...analysisResult, extractedTasks: updated });
  };

  const handleConfirmAddTasks = async () => {
    if (!analysisResult || selectedTasks.length === 0) return;

    const tasksToCreate = selectedTasks.map(idx => {
      const item = analysisResult.extractedTasks[idx];
      return {
        title: item.title,
        description: item.description || null,
        mode: item.mode,
        priority: item.priority,
        category: item.category || (item.mode === 'SPIDER' ? 'Oscorp / Work' : 'Personal Errands'),
        deadline: item.deadline || null,
        status: 'PENDING',
      };
    });

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToCreate }),
      });

      const data = await response.json();
      if (data.success) {
        sound.playWebThwip();
        onTasksAdded(data.tasks);
        setAnalysisResult(null);
        setInputText('');
      }
    } catch (err) {
      console.error('Failed to create extracted tasks:', err);
    }
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-500 relative ${
      isSpider
        ? 'bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-red-950/20 border-red-900/50 text-slate-100 shadow-[0_4px_25px_rgba(239,68,68,0.08)]'
        : 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E8] to-amber-100/40 border-amber-200 text-amber-950 shadow-[0_4px_25px_rgba(217,119,6,0.06)]'
    }`}>
      
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
            isSpider ? 'bg-red-600 text-white shadow-md shadow-red-600/30' : 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
          }`}>
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight uppercase flex items-center gap-2">
              <span>Spider-Sense Smart Brain-Dump</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isSpider ? 'bg-red-950/80 text-red-300 border-red-800' : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                GenAI Task Parser & Monitor
              </span>
            </h3>
            <p className={`text-xs ${isSpider ? 'text-slate-400' : 'text-amber-800/80'}`}>
              Type or paste your messy thoughts. Spider-Sense AI parses tasks, categorizes dual modes, and enforces life balance.
            </p>
          </div>
        </div>

        {/* AI Provider Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium opacity-80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>GenAI Engine: Active</span>
        </div>
      </div>

      {/* Hackathon Preset Pills */}
      <div className="mb-3">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5 opacity-70 flex items-center gap-1">
          <span>⚡ Hackathon Demo Presets (1-Click Fill):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                setInputText(preset.text);
                sound.playWebThwip();
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all text-left flex items-center gap-1.5 ${
                isSpider
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-red-600 hover:text-red-300 hover:bg-slate-900'
                  : 'bg-white/90 border-amber-200 text-amber-900 hover:border-amber-400 hover:bg-amber-50'
              }`}
            >
              <span className="font-bold">{preset.title}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                preset.badge.includes('Warning')
                  ? 'bg-red-500/20 text-red-400 font-bold'
                  : isSpider ? 'bg-slate-800 text-slate-300' : 'bg-amber-100 text-amber-800'
              }`}>
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Text Area */}
      <div className="relative">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder='e.g. "I need to finish the Oscorp financial report by 3 PM, grab Aunt May&apos;s medicine on the way home, fix my web-shooters, and email Mr. Stark."'
          rows={3}
          className={`w-full text-xs sm:text-sm p-3.5 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none ${
            isSpider
              ? 'bg-slate-950/90 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-red-600 focus:ring-red-600/30'
              : 'bg-white border-amber-200/90 text-amber-950 placeholder-amber-700/40 focus:border-amber-500 focus:ring-amber-500/20'
          }`}
        />

        {/* Submit Button */}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="text-[11px] opacity-60">
            {inputText.length > 0 ? `${inputText.length} characters` : 'Tip: Dump multiple tasks in a single run.'}
          </div>

          <div className="flex items-center gap-2">
            {inputText.length > 0 && (
              <button
                onClick={() => setInputText('')}
                className="text-xs px-2.5 py-1.5 opacity-70 hover:opacity-100 transition-opacity"
              >
                Clear
              </button>
            )}

            <button
              onClick={handleRunBrainDump}
              disabled={isProcessing || !inputText.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 ${
                isSpider
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-red-700/30 hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-amber-950 shadow-amber-500/20 hover:scale-[1.02]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Spider-Sense Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Activate Spider-Sense AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Review & Approve Extracted Tasks Drawer */}
      {analysisResult && (
        <div className={`mt-5 p-4 rounded-xl border transition-all animate-fadeIn ${
          isSpider ? 'bg-slate-950 border-red-900/60' : 'bg-white border-amber-300'
        }`}>
          {/* Header of review */}
          <div className="flex items-center justify-between border-b pb-3 mb-3 border-inherit">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm uppercase">Spider-Sense Extracted Tasks</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                  {analysisResult.extractedTasks.length} Found
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Engine: {analysisResult.providerUsed}
                </span>
              </div>
              <p className="text-xs opacity-75 mt-0.5">
                Review and customize before committing to your board.
              </p>
            </div>

            <button
              onClick={() => setAnalysisResult(null)}
              className="p-1 rounded hover:bg-slate-800/40 opacity-70 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Extracted Tasks */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {analysisResult.extractedTasks.map((task, idx) => {
              const isSelected = selectedTasks.includes(idx);
              const isItemSpider = task.mode === 'SPIDER';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? isItemSpider
                        ? 'bg-red-950/20 border-red-900/60'
                        : 'bg-amber-500/10 border-amber-300'
                      : 'opacity-50 bg-transparent border-dashed'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleTaskSelection(idx)}
                      className="mt-1 w-4 h-4 rounded text-red-600 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm tracking-tight">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] opacity-70 mt-0.5">{task.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                        {task.category && (
                          <span className="flex items-center gap-1 opacity-70">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{task.category}</span>
                          </span>
                        )}
                        {task.deadline && (
                          <span className="flex items-center gap-1 font-semibold text-rose-500">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{task.deadline}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mode & Priority Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Mode Toggle */}
                    <button
                      onClick={() => handleTaskModeToggle(idx)}
                      title="Click to toggle Peter vs Spider Mode"
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1 transition-all ${
                        isItemSpider
                          ? 'bg-red-950/80 text-red-300 border-red-800'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {isItemSpider ? <Shield className="w-3 h-3 text-red-400" /> : <Heart className="w-3 h-3 text-amber-600" />}
                      <span>{isItemSpider ? 'Spider (Work)' : 'Peter (Life)'}</span>
                    </button>

                    {/* Priority Selector */}
                    <select
                      value={task.priority}
                      onChange={e => handleTaskPriorityChange(idx, e.target.value as TaskPriority)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border bg-transparent ${
                        task.priority === 'HIGH'
                          ? 'text-red-500 border-red-800'
                          : task.priority === 'MEDIUM'
                            ? 'text-amber-500 border-amber-700'
                            : 'text-slate-400 border-slate-700'
                      }`}
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Med Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Commit Actions */}
          <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between gap-3">
            <span className="text-xs opacity-75 font-medium">
              {selectedTasks.length} of {analysisResult.extractedTasks.length} tasks ready to commit
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAnalysisResult(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800/40"
              >
                Discard
              </button>

              <button
                onClick={handleConfirmAddTasks}
                disabled={selectedTasks.length === 0}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
                  isSpider
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-700/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-amber-500/20'
                } disabled:opacity-50`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add Selected to Board</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
