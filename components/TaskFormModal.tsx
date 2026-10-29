'use client';

import React, { useState, useEffect } from 'react';
import { Task, TaskMode, TaskPriority } from '@/lib/types';
import { sound } from '@/lib/sound';
import { X, Plus, Save, Clock, Tag, Briefcase, Heart, Bell } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  initialMode: TaskMode;
  editingTask: Task | null;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
}

export function TaskFormModal({
  isOpen,
  initialMode,
  editingTask,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<TaskMode>(initialMode);
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
      setMode(editingTask.mode);
      setPriority(editingTask.priority);
      setCategory(editingTask.category || '');
      setDeadline(editingTask.deadline || '');
      setReminderTime(editingTask.reminderTime || '');
    } else {
      setTitle('');
      setDescription('');
      setMode(initialMode);
      setPriority('MEDIUM');
      setCategory(initialMode === 'SPIDER' ? 'Work / Projects' : 'Life / Errands');
      setDeadline('');
      setReminderTime('');
    }
  }, [editingTask, initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    sound.playWebThwip();

    try {
      await onSubmit({
        id: editingTask?.id,
        title: title.trim(),
        description: description.trim() || null,
        mode,
        priority,
        category: category.trim() || null,
        deadline: deadline.trim() || null,
        reminderTime: reminderTime.trim() || null,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSpider = mode === 'SPIDER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-md rounded-3xl border p-6 transition-all duration-300 shadow-2xl relative ${
        isSpider
          ? 'bg-slate-950 border-red-900/60 text-slate-100 shadow-[0_0_40px_rgba(239,68,68,0.2)]'
          : 'bg-[#FFFDF9] border-amber-300 text-amber-950 shadow-[0_0_40px_rgba(217,119,6,0.15)]'
      }`}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full opacity-60 hover:opacity-100 hover:bg-slate-800/40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isSpider ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            {editingTask ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">
              {editingTask ? 'Edit Task' : 'Upload New Task'}
            </h3>
            <p className="text-xs opacity-70">
              {isSpider ? 'Professional Work & Career Goals' : 'Personal Life, Health & Family Errands'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Dual Mode Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Select Operating Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('PETER')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                  mode === 'PETER'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md shadow-amber-400/20'
                    : 'bg-transparent border-slate-700/50 opacity-60 hover:opacity-100'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-amber-900" />
                <span>Peter Parker (Personal)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('SPIDER')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all ${
                  mode === 'SPIDER'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                    : 'bg-transparent border-slate-700/50 opacity-60 hover:opacity-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-red-200" />
                <span>Spider-Man (Work)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isSpider ? 'e.g. Finalize Q4 strategic client presentation deck' : 'e.g. Pick up groceries & call doctor for appointment'}
              className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                isSpider
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-red-500 focus:ring-red-500/20'
                  : 'bg-white border-amber-200 text-amber-950 focus:border-amber-500 focus:ring-amber-500/20'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Context, sub-tasks, links, or specific checklist..."
              className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all resize-none ${
                isSpider
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-red-500 focus:ring-red-500/20'
                  : 'bg-white border-amber-200 text-amber-950 focus:border-amber-500 focus:ring-amber-500/20'
              }`}
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:outline-none ${
                  isSpider ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-amber-950'
                }`}
              >
                <option value="HIGH">🔴 High Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="LOW">🔵 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder={isSpider ? 'Work / Strategy' : 'Life / Errands'}
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                  isSpider ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-amber-950'
                }`}
              />
            </div>
          </div>

          {/* Deadline & Reminder Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Target Deadline
              </label>
              <input
                type="text"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="e.g. Today 3 PM, Friday"
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                  isSpider ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-amber-950'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80 flex items-center gap-1 text-amber-500">
                <Bell className="w-3 h-3" /> Reminder Time
              </label>
              <input
                type="text"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                placeholder="e.g. 2:30 PM (30 min before)"
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                  isSpider ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200 text-amber-950'
                }`}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800/40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                isSpider
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-700/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-amber-500/20'
              } disabled:opacity-50`}
            >
              {editingTask ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{editingTask ? 'Save Changes' : 'Upload to Board'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
