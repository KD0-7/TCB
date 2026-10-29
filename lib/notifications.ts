// Notification and Reminder Helper for Project Spider-Sense

import { Task } from './types';
import { sound } from './sound';

class ReminderService {
  private hasPermission: boolean = false;
  private notifiedTaskIds: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch {
      return false;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Trigger task reminder
  public notifyTask(task: Task, onInAppAlert?: (task: Task) => void) {
    sound.playSpiderSenseTingle();

    const title = task.mode === 'SPIDER' 
      ? `🕷️ Spider-Sense Work Reminder: ${task.title}`
      : `📸 Personal Life Reminder: ${task.title}`;

    const body = task.description 
      ? task.description 
      : `Priority: ${task.priority} • Category: ${task.category || 'General'}`;

    if (this.hasPermission && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: task.id,
        });
      } catch {
        // Fallback to in-app
      }
    }

    if (onInAppAlert) {
      onInAppAlert(task);
    }
  }

  // Test notification
  public testNotification(onInAppAlert?: (task: Task) => void) {
    const mockTask: Task = {
      id: 'test-reminder',
      title: 'Take a 10-minute stretch & hydrate!',
      description: 'Spider-Sense balance reminder: You have been focused on work tasks for 2 hours.',
      mode: 'PETER',
      status: 'PENDING',
      priority: 'HIGH',
      category: 'Self-Care & Health',
      createdAt: new Date().toISOString(),
    };
    this.notifyTask(mockTask, onInAppAlert);
  }
}

export const reminderService = new ReminderService();
