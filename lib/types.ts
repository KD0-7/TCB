export type TaskMode = 'PETER' | 'SPIDER'; // PETER = Personal/Life, SPIDER = Work/Career
export type TaskStatus = 'PENDING' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  mode: TaskMode;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string | null;
  deadline?: string | null;
  reminderTime?: string | null; // e.g. "2026-10-30T15:00" or time string
  createdAt: string;
  updatedAt?: string;
}

export interface SpiderSenseAnalysis {
  extractedTasks: {
    title: string;
    description?: string;
    mode: TaskMode;
    priority: TaskPriority;
    category?: string;
    deadline?: string;
    reminderTime?: string;
  }[];
  warningTriggered: boolean;
  warningTitle?: string;
  warningMessage?: string;
  workloadStats: {
    workCount: number;
    personalCount: number;
    imbalanceRatio: number; // e.g. 0.85 = 85% work
    equilibriumScore: number; // 0 - 100
    diagnosis: string;
  };
  spiderWisdomQuote: string;
  providerUsed: 'openai' | 'gemini' | 'heuristic-engine';
}

export interface TaskFilterOptions {
  mode?: TaskMode | 'ALL';
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  search?: string;
}
