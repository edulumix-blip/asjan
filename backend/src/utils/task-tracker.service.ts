import { Injectable } from '@nestjs/common';

export interface TaskState {
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  durationMs?: number;
  result?: any;
  error?: string;
}

@Injectable()
export class TaskTrackerService {
  private tasks = new Map<string, TaskState>();

  startTask(name: string): void {
    this.tasks.set(name, {
      name,
      status: 'running',
      startTime: new Date(),
    });
  }

  endTask(name: string, result?: any): void {
    const task = this.tasks.get(name);
    if (task) {
      const endTime = new Date();
      const durationMs = task.startTime ? endTime.getTime() - task.startTime.getTime() : 0;
      this.tasks.set(name, {
        ...task,
        status: 'completed',
        endTime,
        durationMs,
        result,
      });
    }
  }

  failTask(name: string, error: Error | string): void {
    const task = this.tasks.get(name);
    if (task) {
      const endTime = new Date();
      const durationMs = task.startTime ? endTime.getTime() - task.startTime.getTime() : 0;
      this.tasks.set(name, {
        ...task,
        status: 'failed',
        endTime,
        durationMs,
        error: typeof error === 'string' ? error : error.message,
      });
    }
  }

  getTasks(): TaskState[] {
    return Array.from(this.tasks.values());
  }

  getTask(name: string): TaskState | undefined {
    return this.tasks.get(name);
  }
}
