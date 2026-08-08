import { describe, it, expect } from 'vitest';
import { parseTaskDueDate, getTaskDeadlineInfo, getNearingDeadlineTasks } from '../../src/lib/deadlineUtils';
import { Task } from '../../src/types';

describe('deadlineUtils', () => {
  const refDate = new Date('2026-08-10T12:00:00Z');

  describe('parseTaskDueDate', () => {
    it('returns null for empty string or missing input', () => {
      expect(parseTaskDueDate('')).toBeNull();
    });

    it('returns null for invalid date string', () => {
      expect(parseTaskDueDate('invalid-date-string')).toBeNull();
    });

    it('parses valid ISO and standard date strings', () => {
      const result = parseTaskDueDate('2026-08-15');
      expect(result).not.toBeNull();
      expect(result?.getFullYear()).toBe(2026);
      expect(result?.getMonth()).toBe(7); // 0-indexed August
      expect(result?.getDate()).toBe(15);
    });
  });

  describe('getTaskDeadlineInfo', () => {
    it('returns completed status for tasks with status "done"', () => {
      const task: Partial<Task> = {
        id: 'TSK-1',
        title: 'Completed Task',
        status: 'done',
        dueDate: '2026-08-01',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(false);
      expect(info.isOverdue).toBe(false);
      expect(info.statusLabel).toBe('Completed');
    });

    it('handles tasks with no due date', () => {
      const task: Partial<Task> = {
        id: 'TSK-2',
        title: 'Task without due date',
        status: 'in_progress',
        dueDate: '',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(false);
      expect(info.statusLabel).toBe('No Date');
    });

    it('identifies overdue tasks (due date before reference date)', () => {
      const task: Partial<Task> = {
        id: 'TSK-3',
        title: 'Overdue Task',
        status: 'in_progress',
        dueDate: '2026-08-08',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(true);
      expect(info.isOverdue).toBe(true);
      expect(info.daysRemaining).toBe(-2);
      expect(info.statusLabel).toBe('Overdue 2 days');
    });

    it('identifies tasks due today', () => {
      const task: Partial<Task> = {
        id: 'TSK-4',
        title: 'Task Due Today',
        status: 'in_progress',
        dueDate: '2026-08-10',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(true);
      expect(info.isDueToday).toBe(true);
      expect(info.daysRemaining).toBe(0);
      expect(info.statusLabel).toBe('Due Today');
    });

    it('identifies tasks due tomorrow', () => {
      const task: Partial<Task> = {
        id: 'TSK-5',
        title: 'Task Due Tomorrow',
        status: 'todo',
        dueDate: '2026-08-11',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(true);
      expect(info.daysRemaining).toBe(1);
      expect(info.statusLabel).toBe('Due Tomorrow');
    });

    it('identifies tasks due within 7 days', () => {
      const task: Partial<Task> = {
        id: 'TSK-6',
        title: 'Task Due Soon',
        status: 'todo',
        dueDate: '2026-08-15',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(true);
      expect(info.daysRemaining).toBe(5);
      expect(info.statusLabel).toBe('Due in 5 days');
    });

    it('identifies tasks due far in the future (> 7 days)', () => {
      const task: Partial<Task> = {
        id: 'TSK-7',
        title: 'Task Due Far Away',
        status: 'backlog',
        dueDate: '2026-08-25',
      };
      const info = getTaskDeadlineInfo(task, refDate);
      expect(info.isNearingDeadline).toBe(false);
      expect(info.isOverdue).toBe(false);
      expect(info.daysRemaining).toBe(15);
    });
  });

  describe('getNearingDeadlineTasks', () => {
    it('filters and sorts tasks that are nearing deadline by days remaining', () => {
      const tasks: Partial<Task>[] = [
        { id: '1', title: 'Task Far', status: 'todo', dueDate: '2026-08-30' },
        { id: '2', title: 'Task Overdue', status: 'in_progress', dueDate: '2026-08-08' },
        { id: '3', title: 'Task Today', status: 'todo', dueDate: '2026-08-10' },
        { id: '4', title: 'Task Done', status: 'done', dueDate: '2026-08-07' },
      ];

      const results = getNearingDeadlineTasks(tasks, refDate);
      expect(results).toHaveLength(2);
      expect(results[0].task.id).toBe('2'); // Overdue (-2 days) comes first
      expect(results[1].task.id).toBe('3'); // Due today (0 days) comes second
    });
  });
});
