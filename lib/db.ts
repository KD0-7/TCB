import fs from 'fs';
import path from 'path';
import { Task, TaskMode, TaskStatus, TaskPriority } from './types';

// Initial lore-accurate sample tasks for Project Spider-Sense
const DEFAULT_TASKS: Task[] = [
  {
    id: 'spidey-1',
    title: 'Oscorp Industrial Security Audit Report',
    description: 'Finalize the thermal variance analysis and email Norman Osborn before the 3 PM board review.',
    mode: 'SPIDER',
    status: 'PENDING',
    priority: 'HIGH',
    category: 'Oscorp',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'spidey-2',
    title: 'Refill Web-Shooter fluid cartridges',
    description: 'Synthesize new high-tensile shear-thinning nylon formula in the lab before night patrol.',
    mode: 'SPIDER',
    status: 'PENDING',
    priority: 'HIGH',
    category: 'Vigilante Tech',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'spidey-3',
    title: 'Respond to Tony Stark’s encrypted memo',
    description: 'Review Stark Industries nanotech schematics and reply via Stark Net relay.',
    mode: 'SPIDER',
    status: 'COMPLETED',
    priority: 'MEDIUM',
    category: 'Avengers',
    deadline: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'spidey-4',
    title: 'Monitor NYPD frequency channel 4',
    description: 'Cross-reference dispatch reports near Chinatown for suspicious seismic disturbances.',
    mode: 'SPIDER',
    status: 'PENDING',
    priority: 'MEDIUM',
    category: 'Patrol',
    deadline: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'peter-1',
    title: "Pick up Aunt May's prescription medicine",
    description: 'Stop by Forest Hills Pharmacy on 71st Continental Ave before 6 PM.',
    mode: 'PETER',
    status: 'PENDING',
    priority: 'HIGH',
    category: 'Family & Health',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'peter-2',
    title: 'Submit Daily Bugle front-page photo negatives',
    description: 'Drop off high-angle shots of the bridge to J. Jonah Jameson. Rent is due tomorrow!',
    mode: 'PETER',
    status: 'COMPLETED',
    priority: 'HIGH',
    category: 'Daily Bugle',
    deadline: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'peter-3',
    title: "Retrieve backpack webbed to 34th St alley",
    description: 'Contains science homework, spare clothes, and camera flash battery. Web dissolves in 2 hours!',
    mode: 'PETER',
    status: 'PENDING',
    priority: 'MEDIUM',
    category: 'Personal Life',
    deadline: new Date(Date.now() + 1000 * 60 * 90).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'peter-4',
    title: 'Joe’s Pizza run for Queens apartment',
    description: '29-minute guarantee! Grab pepperoni and garlic knots for relaxing evening with Ned & MJ.',
    mode: 'PETER',
    status: 'PENDING',
    priority: 'LOW',
    category: 'Self-Care',
    deadline: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Persistent File-backed storage for local dev / demo resilience
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
    // fallback to defaults
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

// In-memory cache for fast lookups
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
    // Sort pending first, high priority first, then newest
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
      category: data.category?.trim() || (data.mode === 'SPIDER' ? 'Work / Heroics' : 'Life / Errands'),
      deadline: data.deadline || null,
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
        category: data.category?.trim() || (data.mode === 'SPIDER' ? 'Work / Heroics' : 'Life / Errands'),
        deadline: data.deadline || null,
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
