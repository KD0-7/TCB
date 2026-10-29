import fs from 'fs';
import path from 'path';
import { Task, TaskMode, TaskStatus, TaskPriority } from './types';

// Realistic everyday productivity tasks for real people (Spider-Man themed duality)
const DEFAULT_TASKS: Task[] = [
  // Spider-Man Mode: Professional / Career / Deep Work
  {
    id: 'work-1',
    title: 'Finalize Q4 strategic presentation deck',
    description: 'Complete slide review, incorporate marketing KPIs, and send to the management team before 3 PM.',
    mode: 'SPIDER',
    status: 'PENDING',
    priority: 'HIGH',
    category: 'Work / Strategy',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    reminderTime: new Date(Date.now() + 1000 * 60 * 60 * 2.5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'work-2',
    title: 'Code review & approve staging pull requests',
    description: 'Verify unit test coverage and approve backend payment integration changes on GitHub.',
    mode: 'SPIDER',
    status: 'PENDING',
    priority: 'HIGH',
    category: 'Work / Engineering',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    reminderTime: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'work-3',
    title: 'Team sprint retrospective & planning notes',
    description: 'Summarize sprint velocity metrics and outline blockers for tomorrow morning standup.',
    mode: 'SPIDER',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    category: 'Work / Meetings',
    deadline: null,
    reminderTime: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'work-4',
    title: 'Send quarterly expense reports to accounting',
    description: 'Attach receipts for software subscriptions and client travel reimbursements.',
    mode: 'SPIDER',
    status: 'PENDING',
    priority: 'MEDIUM',
    category: 'Work / Finance',
    deadline: null,
    reminderTime: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },

  // Peter Parker Mode: Personal Life / Family / Self-Care / Errands
  {
    id: 'life-1',
    title: 'Pick up weekly groceries & healthy meal prep',
    description: 'Fresh vegetables, fruits, protein, and olive oil from the local market on the drive home.',
    mode: 'PETER',
    status: 'PENDING',
    priority: 'HIGH',
    category: 'Life / Groceries',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
    reminderTime: new Date(Date.now() + 1000 * 60 * 60 * 4.5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'life-2',
    title: 'Schedule annual dental & vision checkup',
    description: 'Call the clinic receptionist and book an appointment for next Tuesday afternoon.',
    mode: 'PETER',
    status: 'COMPLETED',
    priority: 'HIGH',
    category: 'Life / Health',
    deadline: null,
    reminderTime: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'life-3',
    title: 'Call parents & catch up with family',
    description: 'Spend 20 uninterrupted minutes checking in with family over weekend plans.',
    mode: 'PETER',
    status: 'PENDING',
    priority: 'MEDIUM',
    category: 'Life / Family',
    deadline: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
    reminderTime: new Date(Date.now() + 1000 * 60 * 110).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'life-4',
    title: 'Evening 45-minute gym workout & stretch',
    description: 'Full-body functional training session followed by foam rolling to decompress from screen time.',
    mode: 'PETER',
    status: 'PENDING',
    priority: 'LOW',
    category: 'Life / Fitness',
    deadline: null,
    reminderTime: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

const DATA_FILE = path.join(process.cwd(), '.spidersense-tasks.json');

function readTasksFromDisk(): Task[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_TASKS;
}

function writeTasksToDisk(tasks: Task[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    console.warn('Unable to persist tasks to disk:', error);
  }
}

// In-memory cache for fast operations
let inMemoryTasks: Task[] = readTasksFromDisk();

export const taskDb = {
  getAll: async (filter?: { mode?: TaskMode | 'ALL'; status?: TaskStatus | 'ALL' }): Promise<Task[]> => {
    let result = [...inMemoryTasks];
    if (filter?.mode && filter.mode !== 'ALL') {
      result = result.filter(t => t.mode === filter.mode);
    }
    if (filter?.status && filter.status !== 'ALL') {
      result = result.filter(t => t.status === filter.status);
    }
    
    // Sort pending first, then high priority, then deadline/createdAt
    const priorityWeight: Record<TaskPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    result.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'PENDING' ? -1 : 1;
      }
      const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (pDiff !== 0) return pDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  },

  getById: async (id: string): Promise<Task | null> => {
    const task = inMemoryTasks.find(t => t.id === id);
    return task || null;
  },

  create: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Task> => {
    const newTask: Task = {
      id: data.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      mode: data.mode,
      status: data.status || 'PENDING',
      priority: data.priority || 'MEDIUM',
      category: data.category?.trim() || (data.mode === 'SPIDER' ? 'Work & Career' : 'Life & Errands'),
      deadline: data.deadline || null,
      reminderTime: data.reminderTime || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryTasks.unshift(newTask);
    writeTasksToDisk(inMemoryTasks);
    return newTask;
  },

  createMany: async (tasksData: (Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string })[]): Promise<Task[]> => {
    const createdList: Task[] = [];
    for (const data of tasksData) {
      const newTask: Task = {
        id: data.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        mode: data.mode,
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        category: data.category?.trim() || (data.mode === 'SPIDER' ? 'Work & Career' : 'Life & Errands'),
        deadline: data.deadline || null,
        reminderTime: data.reminderTime || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      createdList.push(newTask);
      inMemoryTasks.unshift(newTask);
    }
    writeTasksToDisk(inMemoryTasks);
    return createdList;
  },

  update: async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> => {
    const index = inMemoryTasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const existing = inMemoryTasks[index];
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    inMemoryTasks[index] = updated;
    writeTasksToDisk(inMemoryTasks);
    return updated;
  },

  delete: async (id: string): Promise<boolean> => {
    const initialLength = inMemoryTasks.length;
    inMemoryTasks = inMemoryTasks.filter(t => t.id !== id);
    if (inMemoryTasks.length !== initialLength) {
      writeTasksToDisk(inMemoryTasks);
      return true;
    }
    return false;
  },

  resetToDefault: async (): Promise<Task[]> => {
    inMemoryTasks = [...DEFAULT_TASKS];
    writeTasksToDisk(inMemoryTasks);
    return inMemoryTasks;
  },

  clearAll: async (): Promise<void> => {
    inMemoryTasks = [];
    writeTasksToDisk(inMemoryTasks);
  }
};
