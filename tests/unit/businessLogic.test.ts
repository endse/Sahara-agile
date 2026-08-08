import { describe, it, expect } from 'vitest';
import { UserStory, AsyncJob, Task } from '../../src/types';

// Helper domain functions mirroring app calculations
export function calculateStoryPointsSummary(stories: Partial<UserStory>[]) {
  const totalPoints = stories.reduce((acc, s) => acc + (s.points || 0), 0);
  const completedPoints = stories
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + (s.points || 0), 0);
  const completionPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return { totalPoints, completedPoints, completionPercentage };
}

export function calculateShiftDurationHours(clockInISO: string, clockOutISO: string): number {
  const start = new Date(clockInISO).getTime();
  const end = new Date(clockOutISO).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return 0;

  const diffMs = end - start;
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
}

export function retryAsyncJob(job: AsyncJob): AsyncJob {
  if (job.status !== 'failed' && job.status !== 'completed') {
    return job;
  }
  return {
    ...job,
    status: 'processing',
    progress: 10,
    retryCount: job.retryCount + 1,
    errorReason: undefined,
  };
}

export function filterAndSortTasks<T extends Partial<Task>>(
  tasks: T[],
  searchQuery = '',
  statusFilter = 'all',
  priorityFilter = 'all'
): T[] {
  return tasks.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

describe('Business Logic & Domain Operations', () => {
  describe('calculateStoryPointsSummary', () => {
    it('calculates total points and completion percentage accurately', () => {
      const stories: Partial<UserStory>[] = [
        { id: '1', projectId: 'LOC-1', title: 'S1', points: 5, status: 'completed', assigneeName: 'Amara' },
        { id: '2', projectId: 'LOC-1', title: 'S2', points: 3, status: 'in_progress', assigneeName: 'Tariq' },
        { id: '3', projectId: 'LOC-1', title: 'S3', points: 2, status: 'completed', assigneeName: 'Elena' },
      ];

      const result = calculateStoryPointsSummary(stories);
      expect(result.totalPoints).toBe(10);
      expect(result.completedPoints).toBe(7);
      expect(result.completionPercentage).toBe(70);
    });

    it('returns 0% completion when no stories exist or 0 points completed', () => {
      expect(calculateStoryPointsSummary([]).completionPercentage).toBe(0);

      const stories: Partial<UserStory>[] = [
        { id: '1', projectId: 'LOC-1', title: 'S1', points: 8, status: 'backlog', assigneeName: 'Amara' },
      ];
      expect(calculateStoryPointsSummary(stories).completionPercentage).toBe(0);
    });
  });

  describe('calculateShiftDurationHours', () => {
    it('calculates standard 8-hour shift duration', () => {
      const inTime = '2026-08-08T08:00:00.000Z';
      const outTime = '2026-08-08T16:00:00.000Z';
      expect(calculateShiftDurationHours(inTime, outTime)).toBe(8);
    });

    it('calculates fractional hours accurately', () => {
      const inTime = '2026-08-08T08:00:00.000Z';
      const outTime = '2026-08-08T16:45:00.000Z';
      expect(calculateShiftDurationHours(inTime, outTime)).toBe(8.75);
    });

    it('handles invalid timestamps or out-time before in-time', () => {
      const inTime = '2026-08-08T16:00:00.000Z';
      const outTime = '2026-08-08T08:00:00.000Z';
      expect(calculateShiftDurationHours(inTime, outTime)).toBe(0);
    });
  });

  describe('retryAsyncJob', () => {
    it('increments retryCount and resets progress to 10% when retrying a job', () => {
      const failedJob: AsyncJob = {
        id: 'JOB-99',
        title: 'Export Audit',
        type: 'attendance_audit',
        status: 'failed',
        progress: 45,
        retryCount: 1,
        errorReason: '504 Gateway Timeout',
        createdAt: '2026-08-08T10:00:00Z',
      };

      const retried = retryAsyncJob(failedJob);
      expect(retried.status).toBe('processing');
      expect(retried.progress).toBe(10);
      expect(retried.retryCount).toBe(2);
      expect(retried.errorReason).toBeUndefined();
    });
  });

  describe('filterAndSortTasks', () => {
    const tasks: Partial<Task>[] = [
      { id: '1', code: 'SAH-101', title: 'Pressure transducer calibration', status: 'in_progress', priority: 'urgent', assignee: { name: 'Amara Vance', avatar: '', role: '' } },
      { id: '2', code: 'SAH-102', title: 'Solar array dust cleaning', status: 'done', priority: 'medium', assignee: { name: 'Tariq Al-Mansoor', avatar: '', role: '' } },
      { id: '3', code: 'SAH-103', title: 'Canopy wiper motor repair', status: 'todo', priority: 'high', assignee: { name: 'Elena Rostova', avatar: '', role: '' } },
    ];

    it('filters tasks by search query', () => {
      const results = filterAndSortTasks(tasks, 'transducer');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('filters tasks by status and priority', () => {
      const results = filterAndSortTasks(tasks, '', 'in_progress', 'urgent');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
    });

    it('returns all tasks when filters are set to all and search is empty', () => {
      expect(filterAndSortTasks(tasks)).toHaveLength(3);
    });
  });
});
