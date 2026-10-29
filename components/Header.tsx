'use client';

import React, { useState, useEffect } from 'react';
import { TaskMode } from '@/lib/types';
import { sound } from '@/lib/sound';
import { reminderService } from '@/lib/notifications';
import { 
  Camera, 
  Pizza, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Layers, 
  Bell,
  BellRing,
  Briefcase,
  Home
} from 'lucide-react';

interface HeaderProps {
  currentMode: TaskMode;
  onModeChange: (mode: TaskMode) => void;
  viewMode: 'mode' | 'split';
  onViewModeToggle: () => void;
  onResetData: () => void;
  isResetting: boolean;
  equilibriumScore: number;
  isWarning: boolean;
  onTestReminder: () => void;
}

export function Header({
  currentMode,
  onModeChange,
  viewMode,
  onViewModeToggle,
  onResetData,
  isResetting,
  equilibriumScore,
  isWarning,
  onTestReminder,
}: HeaderProps) {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    setNotifPermission(reminderService.getPermissionStatus());
  }, []);

  const handleToggleSound = () => {
    const newState = sound.toggle();
    setSoundEnabled(newState);
  };

  const handleEnableNotifications = async () => {
    const granted = await reminderService.requestPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      sound.playWebThwip();
      reminderService.testNotification();
    }
  };

  const isSpider = currentMode === 'SPIDER';

  return (
    <header className={`sticky top-0 z-40 transition-all duration-500 backdrop-blur-md border-b ${
      isSpider 
        ? 'bg-slate-950/90 border-red-900/40 text-slate-100 shadow-[0_4px_25px_rgba(239,68,68,0.15)]' 
        : 'bg-[#FFFBF5]/90 border-amber-200/60 text-amber-950 shadow-[0_4px_25px_rgba(217,119,6,0.08)]'
    }`}>
      {/* Spider-Sense Tingling Banner Alert if Imbalanced */}
      {isWarning && (
        <div className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white text-xs font-bold py-1.5 px-4 text-center tracking-wider animate-pulse flex items-center justify-center gap-2 border-b border-red-700 shadow-sm">
          <span className="inline-block animate-bounce">⚡</span>
          <span>SPIDER-SENSE ALERT: WORKAHOLIC OVERLOAD DETECTED! (EQUILIBRIUM: {equilibriumScore}%)</span>
          <span className="inline-block animate-bounce">⚡</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-105 ${
              isSpider 
                ? 'bg-gradient-to-br from-red-600 to-rose-900 shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-red-400/40 text-white' 
                : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-300/60 text-amber-950'
            }`}>
              {isSpider ? (
                <svg className="w-6 h-6 fill-current animate-pulse" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3 0 .8-.31 1.52-.82 2.05l1.6 3.2c.14.28.02.62-.26.76-.28.14-.62.02-.76-.26L13.2 10.6C12.83 10.85 12.43 11 12 11s-.83-.15-1.2-.4l-1.56 3.15c-.14.28-.48.4-.76.26-.28-.14-.4-.48-.26-.76l1.6-3.2C9.31 9.52 9 8.8 9 8c0-1.66 1.34-3 3-3zm-4 8c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2zm8 0c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2z"/>
                </svg>
              ) : (
                <Home className="w-5 h-5 text-amber-950" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight">
                  PROJECT <span className={isSpider ? 'text-red-500 font-extrabold' : 'text-amber-600 font-extrabold'}>SPIDER-SENSE</span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isSpider 
                    ? 'bg-red-950/80 text-red-300 border-red-800' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  Work-Life Balance AI
                </span>
              </div>
              <p className={`text-xs ${isSpider ? 'text-slate-400' : 'text-amber-800/80'} italic`}>
                {isSpider 
                  ? 'Spider-Man Mode: Focus on Career, Projects & Deadlines' 
                  : 'Peter Parker Mode: Focus on Life, Errands, Health & Family'}
              </p>
            </div>
          </div>

          {/* Quick controls on mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={handleToggleSound}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 rounded-lg border border-slate-700/40 text-xs"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          </div>
        </div>

        {/* The Mode Switcher: Animated Global Dual Persona Toggle */}
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-2xl border transition-all duration-300 shadow-inner flex items-center gap-1 ${
            isSpider 
              ? 'bg-slate-900/90 border-red-950/80 shadow-black/60' 
              : 'bg-[#F5EDE0] border-amber-200 shadow-amber-900/5'
          }`}>
            {/* Peter Parker Button (Personal / Life) */}
            <button
              onClick={() => {
                sound.playModeSwitch(false);
                onModeChange('PETER');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                !isSpider
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-amber-950 shadow-md shadow-amber-500/20 scale-[1.02] border border-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-amber-900" />
                <Pizza className="w-3 h-3 text-red-500" />
              </div>
              <span>Peter Parker (Personal)</span>
            </button>

            {/* Spider-Man Button (Professional / Work) */}
            <button
              onClick={() => {
                sound.playModeSwitch(true);
                onModeChange('SPIDER');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                isSpider
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 scale-[1.02] border border-red-400/50'
                  : 'text-amber-800/80 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Spider-Man (Work)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping inline-block" />
            </button>
          </div>
        </div>

        {/* Action Controls: Reminders, Multiverse View, Sound, Reset */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          
          {/* Notification / Reminder Button */}
          <button
            onClick={notifPermission === 'granted' ? onTestReminder : handleEnableNotifications}
            title={notifPermission === 'granted' ? 'Notifications active! Click to test reminder.' : 'Click to enable desktop task reminders'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              notifPermission === 'granted'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20'
                : isSpider
                  ? 'bg-slate-900 text-slate-300 border-slate-700 hover:border-red-600 hover:text-red-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
            }`}
          >
            {notifPermission === 'granted' ? (
              <BellRing className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{notifPermission === 'granted' ? 'Reminders On' : 'Enable Reminders'}</span>
          </button>

          {/* Multiverse Split View Toggle */}
          <button
            onClick={onViewModeToggle}
            title={viewMode === 'split' ? 'Switch to Active Mode Focus' : 'Switch to Multiverse Split View'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              viewMode === 'split'
                ? isSpider
                  ? 'bg-red-950/80 text-red-300 border-red-700 shadow-sm shadow-red-900/40'
                  : 'bg-amber-200 text-amber-900 border-amber-400 shadow-sm shadow-amber-400/20'
                : isSpider
                  ? 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/70'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Multiverse</span>
            <span>{viewMode === 'split' ? 'Split View' : 'Single'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Unmute)'}
            className={`p-2 rounded-lg border text-xs transition-colors hidden md:flex items-center justify-center ${
              soundEnabled
                ? isSpider
                  ? 'bg-slate-900 text-red-400 border-red-900/50 hover:bg-slate-800'
                  : 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                : isSpider
                  ? 'bg-slate-950 text-slate-600 border-slate-800'
                  : 'bg-stone-100 text-stone-400 border-stone-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Seed / Reset Demo Data */}
          <button
            onClick={onResetData}
            disabled={isResetting}
            title="Reset to Sample Tasks"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isSpider
                ? 'bg-slate-900/70 text-slate-300 border-slate-800 hover:border-red-800 hover:text-red-300'
                : 'bg-amber-50/80 text-amber-900 border-amber-200 hover:border-amber-400 hover:bg-amber-100/60'
            } disabled:opacity-50`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset</span>
            <span>Tasks</span>
          </button>
        </div>

      </div>
    </header>
  );
}
