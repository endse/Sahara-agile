import { describe, it, expect } from 'vitest';
import {
  calculateProductivityMetrics,
  calculateSprintVelocityMetrics,
  generateMidnightProductivityReport,
} from '../../src/services/productivityReportService';
import { AttendanceLog, UserStory, Task } from '../../src/types';

describe('Productivity & Velocity Report Generator', () => {
  describe('calculateProductivityMetrics', () => {
    it('calculates total hours, unique employees, and shift metrics', () => {
      const logs: Partial<AttendanceLog>[] = [
        { id: '1', userId: 'U1', userName: 'Amara', status: 'clocked_out', totalHours: 8.5, approvalStatus: 'approved' },
        { id: '2', userId: 'U2', userName: 'Tariq', status: 'clocked_out', totalHours: 9.0, approvalStatus: 'approved' },
        { id: '3', userId: 'U1', userName: 'Amara', status: 'clocked_in' },
      ];

      const metrics = calculateProductivityMetrics(logs);
      expect(metrics.totalHoursLogged).toBe(17.5);
      expect(metrics.activeEmployeesCount).toBe(2);
      expect(metrics.completedShiftsCount).toBe(2);
      expect(metrics.averageShiftHours).toBe(8.75);
      expect(metrics.approvedShiftsCount).toBe(2);
    });
  });

  describe('calculateSprintVelocityMetrics', () => {
    it('calculates completed story points and velocity percentage', () => {
      const stories: Partial<UserStory>[] = [
        { id: 'S1', points: 5, status: 'completed' },
        { id: 'S2', points: 3, status: 'in_progress' },
        { id: 'S3', points: 2, status: 'completed' },
      ];

      const tasks: Partial<Task>[] = [
        { id: 'T1', status: 'done' },
        { id: 'T2', status: 'in_progress' },
        { id: 'T3', status: 'todo' },
      ];

      const metrics = calculateSprintVelocityMetrics(stories, tasks);
      expect(metrics.totalStoryPoints).toBe(10);
      expect(metrics.completedStoryPoints).toBe(7);
      expect(metrics.velocityPercentage).toBe(70);
      expect(metrics.completedTasksCount).toBe(1);
      expect(metrics.inProgressTasksCount).toBe(1);
    });
  });

  describe('generateMidnightProductivityReport', () => {
    it('generates email report formatted for project manager', () => {
      const report = generateMidnightProductivityReport();
      expect(report.id.startsWith('RPT-')).toBe(true);
      expect(report.recipientEmail).toBe('amara.vance@sahara.io');
      expect(report.emailSubject).toContain('[Sahara Agile] Midnight Productivity & Sprint Velocity Report');
      expect(report.emailBodyMarkdown).toContain('Employee Work Hours & Attendance Summary');
      expect(report.deliveryStatus).toBe('delivered');
    });
  });
});
