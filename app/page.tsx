'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskMode, TaskPriority, TaskStatus, SpiderSenseAnalysis } from '@/lib/types';
import { Header } from '@/components/Header';
import { WebOfLifeChart } from '@/components/WebOfLifeChart';
import { SpiderSenseBrainDump } from '@/components/SpiderSenseBrainDump';
import { SpiderSenseWarningModal } from '@/components/SpiderSenseWarningModal';
import { TaskCard } from '@/components/TaskCard';
import { TaskFormModal } from '@/components/TaskFormModal';
import { TaskFilterBar } from '@/components/TaskFilterBar';
import { ProductivityStats } from '@/components/ProductivityStats';
import { HackathonDemoHelper } from '@/components/HackathonDemoHelper';
import { ReminderAlertToast } from '@/components/ReminderAlertToast';
import { reminderService } from '@/lib/notifications';
import { sound } from '@/lib/sound';
import { 
  Briefcase, 
  Heart, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Coffee,
  Bell,
  Home
} from 'lucide-react';

export default function SpiderSenseApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentMode, setCurrentMode] = useState<TaskMode>('SPIDER');
  const [viewMode, setViewMode] = useState<'mode' | 'split'>('mode');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [warningAnalysis, setWarningAnalysis] = useState<SpiderSenseAnalysis | null>(null);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  
  // Active reminder alert state
  const [activeReminderTask, setActiveReminderTask] = useState<Task | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Periodic reminder checking
  useEffect(() => {
    const timer = setInterval(() => {
      // Find high priority tasks with deadlines or reminders
      const pendingWithReminders = tasks.filter(t => t.status === 'PENDING' && t.reminderTime);
      if (pendingWithReminders.length > 0 && Math.random() < 0.25) {
        // Sample periodic reminder check
        const sample = pendingWithReminders[Math.floor(Math.random() * pendingWithReminders.length)];
        reminderService.notifyTask(sample, (t) => setActiveReminderTask(t));
      }
    }, 45000);

    return () => clearInterval(timer);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle task status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus: TaskStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks();
    }
  };

  // Toggle task persona mode (shift from Peter to Spider or vice versa)
  const handleToggleTaskMode = async (id: string, currentTaskMode: string) => {
    const newMode: TaskMode = currentTaskMode === 'SPIDER' ? 'PETER' : 'SPIDER';

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, mode: newMode } : t));

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode }),
      });
    } catch (err) {
      console.error('Failed to update task mode:', err);
      fetchTasks();
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    sound.playWebThwip();
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks();
    }
  };

  // Create or Update task
  const handleSaveTask = async (taskData: any) => {
    try {
      if (taskData.id) {
        // Update
        const res = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (data.success && data.task) {
          setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
        }
      } else {
        // Create
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (data.success && data.task) {
          setTasks(prev => [data.task, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  // Reset to default sample tasks
  const handleResetData = async () => {
    setIsResetting(true);
    sound.playWebThwip();
    try {
      const res = await fetch('/api/tasks/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Error resetting data:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle tasks added from Brain-Dump
  const handleTasksAddedFromAI = (newTasks: Task[]) => {
    setTasks(prev => [...newTasks, ...prev]);
  };

  // Handle Spider-Sense warning trigger
  const handleWarningTriggered = (analysis: SpiderSenseAnalysis) => {
    setWarningAnalysis(analysis);
    setIsWarningModalOpen(true);
  };

  // Quick Action: Add self-care task from warning
  const handleAddSelfCareFromWarning = async () => {
    const quickTask = {
      title: "30-minute mental health walk & healthy meal",
      description: "Scheduled to restore focus, lower stress, and prevent work burnout.",
      mode: 'PETER' as TaskMode,
      priority: 'HIGH' as TaskPriority,
      category: 'Life / Self-Care',
      status: 'PENDING' as TaskStatus,
      reminderTime: "In 15 minutes",
    };
    await handleSaveTask(quickTask);
    setCurrentMode('PETER');
  };

  // Test Reminder Action
  const handleTriggerTestReminder = (specificTask?: Task) => {
    const taskToRemind = specificTask || tasks.find(t => t.status === 'PENDING') || {
      id: 'sample-reminder',
      title: 'Review team pull requests & stretch',
      description: 'Scheduled Spider-Sense task reminder.',
      mode: 'SPIDER' as TaskMode,
      status: 'PENDING' as TaskStatus,
      priority: 'HIGH' as TaskPriority,
      category: 'Work / Engineering',
      createdAt: new Date().toISOString(),
      deadline: 'Today 3 PM',
    };

    reminderService.notifyTask(taskToRemind, (t) => setActiveReminderTask(t));
  };

  // Trigger Overload Scenario from Demo Helper
  const handleTriggerOverload = async () => {
    sound.playSpiderSenseTingle();
    const overloadTasks = [
      {
        title: 'Emergency Client Q4 Roadmap Presentation',
        description: 'Urgent slide deck revisions for executive steering committee',
        mode: 'SPIDER' as TaskMode,
        priority: 'HIGH' as TaskPriority,
        category: 'Work / Presentations',
        status: 'PENDING' as TaskStatus,
        deadline: '3:00 PM',
      },
      {
        title: 'Resolve production database timeout incident',
        description: 'P0 critical reliability issue across API clusters',
        mode: 'SPIDER' as TaskMode,
        priority: 'HIGH' as TaskPriority,
        category: 'Work / Engineering',
        status: 'PENDING' as TaskStatus,
        deadline: 'ASAP',
      },
      {
        title: 'Deploy microservices security hotfix',
        description: 'Zero downtime rolling update',
        mode: 'SPIDER' as TaskMode,
        priority: 'HIGH' as TaskPriority,
        category: 'Work / Engineering',
        status: 'PENDING' as TaskStatus,
      },
      {
        title: 'Draft annual departmental performance evaluations',
        description: 'Review submissions for 12 team members',
        mode: 'SPIDER' as TaskMode,
        priority: 'MEDIUM' as TaskPriority,
        category: 'Work / Management',
        status: 'PENDING' as TaskStatus,
      },
    ];

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: overloadTasks }),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [...data.tasks, ...prev]);
        
        // Trigger simulated Spider-Sense warning
        setWarningAnalysis({
          extractedTasks: overloadTasks,
          warningTriggered: true,
          warningTitle: '⚡ SPIDER-SENSE ALERT: WORKAHOLIC OVERLOAD DETECTED!',
          warningMessage: 'Whoa there! Your Spider-Sense is tingling with alarm. You have loaded up 8 intense work deadlines with zero personal downtime scheduled. Remember: "With great responsibility comes great responsibility to yourself." Step away from your desk, hydrate, and schedule time to recharge!',
          workloadStats: {
            workCount: 8,
            personalCount: 2,
            imbalanceRatio: 0.80,
            equilibriumScore: 40,
            diagnosis: 'Critical Burnout Risk',
          },
          spiderWisdomQuote: 'With great responsibility comes great responsibility... to yourself.',
          providerUsed: 'heuristic-engine',
        });
        setIsWarningModalOpen(true);
      }
    } catch (err) {
      console.error('Error triggering overload:', err);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Mode filter (only if not in split view)
      if (viewMode === 'mode' && task.mode !== currentMode) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && task.status !== statusFilter) {
        return false;
      }
      // Priority filter
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = (task.description || '').toLowerCase().includes(query);
        const matchesCat = (task.category || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      return true;
    });
  }, [tasks, currentMode, viewMode, statusFilter, priorityFilter, searchQuery]);

  // Multiverse Split Tasks
  const peterTasksSplit = useMemo(() => {
    return tasks.filter(t => t.mode === 'PETER' && (statusFilter === 'ALL' || t.status === statusFilter) && (priorityFilter === 'ALL' || t.priority === priorityFilter));
  }, [tasks, statusFilter, priorityFilter]);

  const spiderTasksSplit = useMemo(() => {
    return tasks.filter(t => t.mode === 'SPIDER' && (statusFilter === 'ALL' || t.status === statusFilter) && (priorityFilter === 'ALL' || t.priority === priorityFilter));
  }, [tasks, statusFilter, priorityFilter]);

  // Overall metrics
  const spiderPending = tasks.filter(t => t.mode === 'SPIDER' && t.status === 'PENDING').length;
  const peterPending = tasks.filter(t => t.mode === 'PETER' && t.status === 'PENDING').length;
  const totalPending = spiderPending + peterPending;
  const workRatio = totalPending > 0 ? Math.round((spiderPending / totalPending) * 100) : 50;
  const equilibriumScore = Math.max(0, Math.min(100, Math.round(100 - Math.abs(workRatio - 50) * 2)));
  const isWarning = totalPending >= 3 && (workRatio >= 70 || workRatio <= 25);

  const isSpider = currentMode === 'SPIDER';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isSpider
        ? 'bg-[#090D16] text-slate-100 spider-web-bg'
        : 'bg-[#FDFBF7] text-stone-900 peter-paper-bg'
    }`}>
      
      {/* Global Mode Switcher Header */}
      <Header
        currentMode={currentMode}
        onModeChange={mode => {
          setCurrentMode(mode);
          if (viewMode === 'split') setViewMode('mode');
        }}
        viewMode={viewMode}
        onViewModeToggle={() => setViewMode(prev => prev === 'split' ? 'mode' : 'split')}
        onResetData={handleResetData}
        isResetting={isResetting}
        equilibriumScore={equilibriumScore}
        isWarning={isWarning}
        onTestReminder={() => handleTriggerTestReminder()}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Dynamic Mode Hero Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 border transition-all duration-500 relative overflow-hidden ${
          isSpider
            ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border-red-900/60 shadow-[0_10px_40px_rgba(239,68,68,0.12)]'
            : 'bg-gradient-to-r from-amber-100/90 via-[#FFF8EC] to-[#FAF2E3] border-amber-300/80 shadow-[0_10px_40px_rgba(217,119,6,0.08)]'
        }`}>
          {/* Subtle Watermark */}
          <div className="absolute right-4 -bottom-6 text-7xl sm:text-8xl opacity-10 select-none pointer-events-none">
            {isSpider ? '🕷️' : '🏠'}
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                isSpider 
                  ? 'bg-red-600 text-white border-red-400/50' 
                  : 'bg-amber-400 text-amber-950 border-amber-500/50'
              }`}>
                {isSpider ? 'Spider-Man Work Mode' : 'Peter Parker Life Mode'}
              </span>
              <span className="text-xs opacity-60">•</span>
              <span className="text-xs font-semibold opacity-75">
                {isSpider ? 'Professional Focus & Deadlines' : 'Personal Well-being, Errands & Family'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-2">
              {isSpider ? (
                <>High-Focus <span className="text-red-500">Career & Work Mode</span></>
              ) : (
                <>Personal <span className="text-amber-600">Life & Wellness Mode</span></>
              )}
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isSpider ? 'text-slate-300' : 'text-amber-950/80'}`}>
              {isSpider ? (
                'Manage your career deliverables, client projects, code reviews, and high-priority deadlines. Your built-in Spider-Sense actively monitors your workload to protect against burnout.'
              ) : (
                'Organize grocery runs, doctor appointments, family check-ins, home chores, and personal fitness. Keep your human side nourished and energized.'
              )}
            </p>

            {/* Quick Switch */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  sound.playModeSwitch(!isSpider);
                  setCurrentMode(isSpider ? 'PETER' : 'SPIDER');
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all shadow-sm ${
                  isSpider
                    ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-amber-500/40'
                    : 'bg-white hover:bg-amber-50 text-red-600 border-red-400/40'
                }`}
              >
                <span>Switch to {isSpider ? 'Peter Parker (Life)' : 'Spider-Man (Work)'}</span>
                <span>→</span>
              </button>

              <span className="text-[11px] opacity-70 italic">
                {isSpider ? 'Need to unplug? Shift to personal mode in 1 click.' : 'Ready to execute work? Switch to work focus mode.'}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard: Web of Life Balance Chart */}
        <WebOfLifeChart tasks={tasks} currentMode={currentMode} />

        {/* Visual Indicators of Daily Productivity */}
        <ProductivityStats tasks={tasks} currentMode={currentMode} />

        {/* The Core GenAI Feature: Spider-Sense Brain-Dump */}
        <SpiderSenseBrainDump
          currentMode={currentMode}
          onTasksAdded={handleTasksAddedFromAI}
          onWarningTriggered={handleWarningTriggered}
        />

        {/* Task Filter & Search Bar */}
        <TaskFilterBar
          currentMode={currentMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onOpenCreateModal={() => {
            setEditingTask(null);
            setIsCreateModalOpen(true);
          }}
          taskCounts={{
            total: tasks.filter(t => viewMode === 'split' ? true : t.mode === currentMode).length,
            pending: tasks.filter(t => (viewMode === 'split' ? true : t.mode === currentMode) && t.status === 'PENDING').length,
            completed: tasks.filter(t => (viewMode === 'split' ? true : t.mode === currentMode) && t.status === 'COMPLETED').length,
          }}
        />

        {/* Task Boards: Single Mode vs Multiverse Split View */}
        {viewMode === 'split' ? (
          /* Multiverse Dual-Stream Side-by-Side View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Peter Parker Column (Personal Life) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-950 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-600" />
                  <span>Peter Parker (Life, Health & Errands)</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {peterTasksSplit.length} Tasks
                </span>
              </div>

              <div className="space-y-3">
                {peterTasksSplit.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-amber-200 rounded-2xl text-amber-800/60 text-xs">
                    No personal errands found. Add grocery shopping, exercise, or rest!
                  </div>
                ) : (
                  peterTasksSplit.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={t => {
                        setEditingTask(t);
                        setIsCreateModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                      onToggleMode={handleToggleTaskMode}
                      onTriggerReminder={handleTriggerTestReminder}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Spider-Man Column (Work / Career) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-red-950/60 border border-red-800 text-red-200 font-bold text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-red-400" />
                  <span>Spider-Man (Work & Professional Projects)</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-900 text-red-300">
                  {spiderTasksSplit.length} Tasks
                </span>
              </div>

              <div className="space-y-3">
                {spiderTasksSplit.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-red-900/40 rounded-2xl text-slate-500 text-xs">
                    No active work tasks. You are all caught up!
                  </div>
                ) : (
                  spiderTasksSplit.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={t => {
                        setEditingTask(t);
                        setIsCreateModalOpen(true);
                      }}
                      onDelete={handleDeleteTask}
                      onToggleMode={handleToggleTaskMode}
                      onTriggerReminder={handleTriggerTestReminder}
                    />
                  ))
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Focused Single Mode View */
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                {isSpider ? <Briefcase className="w-4 h-4 text-red-500" /> : <Heart className="w-4 h-4 text-amber-600" />}
                <span>{isSpider ? 'Career & Work Deliverables' : 'Personal Life & Errands'}</span>
                <span className="text-xs opacity-60">({filteredTasks.length})</span>
              </h3>

              <button
                onClick={() => {
                  setEditingTask(null);
                  setIsCreateModalOpen(true);
                }}
                className={`text-xs font-bold flex items-center gap-1 ${
                  isSpider ? 'text-red-400 hover:text-red-300' : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Task</span>
              </button>
            </div>

            {filteredTasks.length === 0 ? (
              <div className={`text-center py-12 rounded-3xl border-2 border-dashed p-6 transition-all ${
                isSpider ? 'border-red-900/40 text-slate-500' : 'border-amber-200 text-amber-900/60'
              }`}>
                <div className="text-3xl mb-2">{isSpider ? '💼' : '🏡'}</div>
                <h4 className="font-bold text-sm">No tasks in this mode</h4>
                <p className="text-xs mt-1 max-w-sm mx-auto opacity-75">
                  {isSpider 
                    ? 'No pending work deliverables! You can relax or upload new projects using the Brain-Dump tool.'
                    : 'Personal to-dos are all clear! Add grocery runs, gym sessions, or family time.'}
                </p>
                <button
                  onClick={() => {
                    setEditingTask(null);
                    setIsCreateModalOpen(true);
                  }}
                  className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold ${
                    isSpider ? 'bg-red-600 text-white' : 'bg-amber-500 text-amber-950'
                  }`}
                >
                  Upload Task Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onEdit={t => {
                      setEditingTask(t);
                      setIsCreateModalOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onToggleMode={handleToggleTaskMode}
                    onTriggerReminder={handleTriggerTestReminder}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Task Creation & Edit Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        initialMode={currentMode}
        editingTask={editingTask}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />

      {/* Spider-Sense AI Workload Warning Modal */}
      <SpiderSenseWarningModal
        isOpen={isWarningModalOpen}
        analysis={warningAnalysis}
        onClose={() => setIsWarningModalOpen(false)}
        onAddSelfCareTask={handleAddSelfCareFromWarning}
      />

      {/* Reminder Alert Popup Toast */}
      <ReminderAlertToast
        task={activeReminderTask}
        onClose={() => setActiveReminderTask(null)}
        onCompleteTask={id => handleToggleStatus(id, 'PENDING')}
      />

      {/* Presentation Helper floating tool */}
      <HackathonDemoHelper
        onLoadImbalanceChaos={handleTriggerOverload}
        onResetTasks={handleResetData}
        onTestReminder={() => handleTriggerTestReminder()}
      />

      {/* Footer */}
      <footer className={`mt-16 border-t py-8 text-center text-xs transition-colors ${
        isSpider ? 'border-slate-800 text-slate-500' : 'border-amber-200 text-amber-900/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>🕷️</span>
            <span className="font-black text-slate-300">Project Spider-Sense</span>
            <span>•</span>
            <span>Work-Life Balance for Everyday People</span>
          </div>

          <div>
            <span>&ldquo;With great responsibility comes great responsibility... to yourself.&rdquo;</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold">Next.js • Tailwind • GenAI • Reminders</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
