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
  DEMO_TASKS,
  DEMO_ACTIVITIES,
  DEMO_TEAM,
  DEMO_TIMELINE,
  DEMO_LOCATIONS,
  DEMO_STORIES,
  DEMO_ATTENDANCE,
  DEMO_ASYNC_JOBS,
  getAllDemoData,
} from '../../src/data';
import { scopeTasksByTeam } from '../../src/lib/teamScopeUtils';

describe('Data Validation & Clean Empty State Integrity', () => {
  describe('INITIAL Default State', () => {
    it('initializes app with clean empty state arrays by default', () => {
      expect(INITIAL_TASKS).toHaveLength(0);
      expect(INITIAL_ACTIVITIES).toHaveLength(0);
      expect(INITIAL_TEAM).toHaveLength(0);
      expect(INITIAL_TIMELINE).toHaveLength(0);
      expect(INITIAL_LOCATIONS).toHaveLength(0);
      expect(INITIAL_STORIES).toHaveLength(0);
      expect(INITIAL_ATTENDANCE).toHaveLength(0);
      expect(INITIAL_ASYNC_JOBS).toHaveLength(0);
    });
  });

  describe('DEMO_TASKS (/demo Data)', () => {
    it('contains non-empty list of demo tasks', () => {
      expect(DEMO_TASKS.length).toBeGreaterThan(0);
    });

    it('has unique IDs and valid status values for every demo task', () => {
      const ids = new Set<string>();
      const validStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
      const validPriorities = ['low', 'medium', 'high', 'urgent'];

      DEMO_TASKS.forEach((task) => {
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

  describe('DEMO_LOCATIONS (Projects)', () => {
    it('contains valid project locations for demo', () => {
      expect(DEMO_LOCATIONS.length).toBeGreaterThan(0);
      const validStatuses = ['active', 'warning', 'completed', 'planned'];

      DEMO_LOCATIONS.forEach((loc) => {
        expect(loc.id).toBeTruthy();
        expect(loc.name).toBeTruthy();
        expect(loc.region).toBeTruthy();
        expect(validStatuses).toContain(loc.status);
        expect(typeof loc.crewCount).toBe('number');
        expect(typeof loc.taskCount).toBe('number');
      });
    });
  });

  describe('DEMO_STORIES', () => {
    it('contains user stories linked to valid project IDs', () => {
      expect(DEMO_STORIES.length).toBeGreaterThan(0);
      const locationIds = new Set(DEMO_LOCATIONS.map((loc) => loc.id));
      const validStatuses = ['backlog', 'in_progress', 'testing', 'completed'];

      DEMO_STORIES.forEach((story) => {
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

  describe('DEMO_ATTENDANCE', () => {
    it('contains valid clock-in / clock-out attendance records', () => {
      expect(DEMO_ATTENDANCE.length).toBeGreaterThan(0);
      const validStatuses = ['clocked_in', 'clocked_out'];

      DEMO_ATTENDANCE.forEach((log) => {
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

  describe('getAllDemoData Helper', () => {
    it('returns structured object containing all team demo datasets', () => {
      const allData = getAllDemoData();
      expect(allData.tasks).toEqual(DEMO_TASKS);
      expect(allData.team).toEqual(DEMO_TEAM);
      expect(allData.locations).toEqual(DEMO_LOCATIONS);
      expect(allData.stories).toEqual(DEMO_STORIES);
      expect(allData.attendance).toEqual(DEMO_ATTENDANCE);
      expect(allData.jobs).toEqual(DEMO_ASYNC_JOBS);
    });
  });

  describe('Team Scoping Utilities', () => {
    const mockProfile: any = { displayName: 'Amara Vance', teamSector: 'Hydro-Geology' };

    it('scopes tasks for employee to assigned Hydro-Geology team sector', () => {
      const scoped = scopeTasksByTeam(DEMO_TASKS, mockProfile, 'Employee');
      expect(scoped.length).toBeGreaterThan(0);
      scoped.forEach((t) => {
        expect(t.teamSector === 'Hydro-Geology' || t.assignee.name.includes('Amara')).toBe(true);
      });
    });

    it('scopes tasks for manager according to selected managed team sector', () => {
      const allTasks = scopeTasksByTeam(DEMO_TASKS, mockProfile, 'Manager', 'All Teams');
      expect(allTasks).toEqual(DEMO_TASKS);

      const hydroTasks = scopeTasksByTeam(DEMO_TASKS, mockProfile, 'Manager', 'Hydro-Geology');
      expect(hydroTasks.length).toBe(2);
    });
  });
});
