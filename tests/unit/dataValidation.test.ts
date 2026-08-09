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
import { scopeTasksByTeam } from '../../src/lib/teamScopeUtils';
import { Task } from '../../src/types';

describe('Data Validation & Clean Empty State Integrity', () => {
  describe('INITIAL Production Default State', () => {
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

  describe('Team Scoping Utilities', () => {
    const mockTasks: Task[] = [
      {
        id: 'T-1',
        code: 'SAH-101',
        title: 'Aquifer Pressure Audit',
        status: 'in_progress',
        priority: 'high',
        teamSector: 'Hydro-Geology',
        assignee: { name: 'Amara Vance', avatar: '', role: 'Lead Hydro-Geologist' },
        dueDate: 'Aug 10, 2026',
        progress: 50,
        tags: ['Hydrology'],
        updatedAt: 'Just now',
      },
      {
        id: 'T-2',
        code: 'SAH-102',
        title: 'Solar Grid Inverter Maintenance',
        status: 'todo',
        priority: 'medium',
        teamSector: 'Grid Architecture',
        assignee: { name: 'Tariq Al-Mansoor', avatar: '', role: 'Grid Architect' },
        dueDate: 'Aug 12, 2026',
        progress: 0,
        tags: ['Energy'],
        updatedAt: 'Just now',
      },
    ];

    const mockProfile: any = { displayName: 'Amara Vance', teamSector: 'Hydro-Geology' };

    it('scopes tasks for employee to assigned Hydro-Geology team sector', () => {
      const scoped = scopeTasksByTeam(mockTasks, mockProfile, 'Employee');
      expect(scoped.length).toBe(1);
      expect(scoped[0].id).toBe('T-1');
    });

    it('scopes tasks for manager according to selected managed team sector', () => {
      const allTasks = scopeTasksByTeam(mockTasks, mockProfile, 'Manager', 'All Teams');
      expect(allTasks).toHaveLength(2);

      const hydroTasks = scopeTasksByTeam(mockTasks, mockProfile, 'Manager', 'Hydro-Geology');
      expect(hydroTasks).toHaveLength(1);
      expect(hydroTasks[0].teamSector).toBe('Hydro-Geology');
    });

    it('returns empty array when tasks list is empty', () => {
      const scoped = scopeTasksByTeam([], mockProfile, 'Employee');
      expect(scoped).toHaveLength(0);
    });
  });
});
