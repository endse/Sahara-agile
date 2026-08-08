import { describe, it, expect } from 'vitest';
import {
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_TEAM,
  INITIAL_TIMELINE,
  INITIAL_LOCATIONS,
  INITIAL_STORIES,
  INITIAL_ATTENDANCE,
  INITIAL_ASYNC_JOBS,
} from '../../src/data';

describe('Data Validation & Integrity', () => {
  describe('INITIAL_TASKS', () => {
    it('contains non-empty list of tasks', () => {
      expect(INITIAL_TASKS.length).toBeGreaterThan(0);
    });

    it('has unique IDs and valid status values for every task', () => {
      const ids = new Set<string>();
      const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
      const validPriorities = ['low', 'medium', 'high', 'urgent'];

      INITIAL_TASKS.forEach((task) => {
        expect(task.id).toBeTruthy();
        expect(ids.has(task.id)).toBe(false);
        ids.add(task.id);

        expect(validStatuses).toContain(task.status);
        expect(validPriorities).toContain(task.priority);
        expect(task.title).toBeTruthy();
        expect(task.assignee?.name).toBeTruthy();
      });
    });
  });

  describe('INITIAL_LOCATIONS (Projects)', () => {
    it('contains valid project locations', () => {
      expect(INITIAL_LOCATIONS.length).toBeGreaterThan(0);
      const validStatuses = ['active', 'warning', 'completed', 'planned'];

      INITIAL_LOCATIONS.forEach((loc) => {
        expect(loc.id).toBeTruthy();
        expect(loc.name).toBeTruthy();
        expect(loc.region).toBeTruthy();
        expect(validStatuses).toContain(loc.status);
        expect(typeof loc.crewCount).toBe('number');
        expect(typeof loc.taskCount).toBe('number');
      });
    });
  });

  describe('INITIAL_STORIES', () => {
    it('contains user stories linked to valid project IDs', () => {
      expect(INITIAL_STORIES.length).toBeGreaterThan(0);
      const locationIds = new Set(INITIAL_LOCATIONS.map((loc) => loc.id));
      const validStatuses = ['backlog', 'in_progress', 'testing', 'completed'];

      INITIAL_STORIES.forEach((story) => {
        expect(story.id).toBeTruthy();
        expect(story.title).toBeTruthy();
        expect(story.projectId).toBeTruthy();
        expect(locationIds.has(story.projectId)).toBe(true);
        expect(validStatuses).toContain(story.status);
        expect(typeof story.points).toBe('number');
        expect(story.points).toBeGreaterThan(0);
      });
    });
  });

  describe('INITIAL_ATTENDANCE', () => {
    it('contains valid clock-in / clock-out attendance records', () => {
      expect(INITIAL_ATTENDANCE.length).toBeGreaterThan(0);
      const validStatuses = ['clocked_in', 'clocked_out'];

      INITIAL_ATTENDANCE.forEach((log) => {
        expect(log.id).toBeTruthy();
        expect(log.userId).toBeTruthy();
        expect(log.userName).toBeTruthy();
        expect(log.clockInTime).toBeTruthy();
        expect(validStatuses).toContain(log.status);

        if (log.status === 'clocked_out') {
          expect(log.clockOutTime).toBeTruthy();
          expect(typeof log.totalHours).toBe('number');
          expect(log.totalHours).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('INITIAL_ASYNC_JOBS', () => {
    it('contains valid background jobs state machine initial records', () => {
      expect(INITIAL_ASYNC_JOBS.length).toBeGreaterThan(0);
      const validStatuses = ['pending', 'processing', 'completed', 'failed'];
      const validTypes = ['sprint_summary', 'attendance_audit', 'employee_worklog', 'task_completion_export'];

      INITIAL_ASYNC_JOBS.forEach((job) => {
        expect(job.id).toBeTruthy();
        expect(job.title).toBeTruthy();
        expect(validTypes).toContain(job.type);
        expect(validStatuses).toContain(job.status);
        expect(job.progress).toBeGreaterThanOrEqual(0);
        expect(job.progress).toBeLessThanOrEqual(100);
        expect(typeof job.retryCount).toBe('number');
      });
    });
  });
});
