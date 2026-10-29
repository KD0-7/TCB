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
  reminderTime?: string | null;
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
    imbalanceRatio: number;
    equilibriumScore: number;
    diagnosis: string;
  };
  spiderWisdomQuote: string;
  providerUsed: 'openai' | 'gemini' | 'ollama-local' | 'heuristic-engine';
  multimodal: {
    imageProcessed: boolean;
    detectedType?: 'handwritten-notes' | 'whiteboard' | 'sticky-note' | 'screenshot' | 'text-only';
  };
  agentExecution: {
    agentName: string;
    toolsCalled: string[];
    contextRetrievedCount: number;
  };
}

export interface TaskFilterOptions {
  mode?: TaskMode | 'ALL';
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  search?: string;
}
