import { describe, it, expect } from 'vitest';
import {
  getDaysInMonth,
  formatDecimalToTime,
  getMonthlyCheckInOutData,
  getAllEmployeesMonthlyCheckInOutData,
  getMonthlyPerformanceData,
  getMonthlyHeatmapMatrix,
  getMonthlyTaskBurndown,
  getStationHoursDistribution,
  getEmployeeRadarMetrics,
} from '../../src/services/monthlyAnalyticsService';
import { Task, TeamMember, AttendanceLog } from '../../src/types';

const TEST_TEAM: TeamMember[] = [
  { id: 'TM-1', name: 'Amara Vance', role: 'Lead Hydro-Geologist', avatar: '', email: 'a.vance@sahara.io', status: 'active', currentTask: 'Aquifer Audit', location: 'Al-Kufra Wells', localTime: 'UTC+2', tasksCount: 4, performance: 95, teamId: 'TEAM-1', teamName: 'Hydro-Geology' },
  { id: 'TM-2', name: 'Tariq Al-Mansoor', role: 'Grid Architect', avatar: '', email: 't.almansoor@sahara.io', status: 'active', currentTask: 'Solar Array 3', location: 'Djanet Solar Farm', localTime: 'UTC+1', tasksCount: 3, performance: 92, teamId: 'TEAM-2', teamName: 'Grid Architecture' },
  { id: 'TM-3', name: 'Elena Rostova', role: 'Robotics Specialist', avatar: '', email: 'e.rostova@sahara.io', status: 'active', currentTask: 'Sand Shield Wipers', location: 'Tibesti Base', localTime: 'UTC+2', tasksCount: 5, performance: 89, teamId: 'TEAM-3', teamName: 'Field Robotics' },
  { id: 'TM-4', name: 'Kofi Mensah', role: 'Ecologist', avatar: '', email: 'k.mensah@sahara.io', status: 'active', currentTask: 'Flora Census', location: 'Siwa Field Hub', localTime: 'UTC+2', tasksCount: 2, performance: 98, teamId: 'TEAM-4', teamName: 'Ecology & Environment' },
  { id: 'TM-5', name: 'Maya Lin', role: 'SatCom Specialist', avatar: '', email: 'm.lin@sahara.io', status: 'active', currentTask: 'Dish Alignment', location: 'Ghadames Relay', localTime: 'UTC+1', tasksCount: 4, performance: 94, teamId: 'TEAM-5', teamName: 'SatCom Telecom' },
];

const TEST_TASKS: Task[] = [
  { id: 'TASK-1', code: 'SAH-101', title: 'Aquifer Flow Audit', status: 'in_progress', priority: 'high', teamId: 'TEAM-1', assignee: { name: 'Amara Vance', avatar: '', role: 'Hydro-Geologist' }, dueDate: 'Aug 10, 2026', progress: 60, tags: ['Hydrology'], updatedAt: 'Just now' },
  { id: 'TASK-2', code: 'SAH-102', title: 'Solar Array Optimization', status: 'done', priority: 'urgent', teamId: 'TEAM-2', assignee: { name: 'Tariq Al-Mansoor', avatar: '', role: 'Grid Architect' }, dueDate: 'Aug 09, 2026', progress: 100, tags: ['Energy'], updatedAt: 'Just now' },
];

const TEST_ATTENDANCE: AttendanceLog[] = [
  { id: 'ATT-1', userId: 'USR-01', userName: 'Amara Vance', clockInTime: '2026-08-01T08:00:00.000Z', clockOutTime: '2026-08-01T16:30:00.000Z', totalHours: 8.5, status: 'clocked_out', date: '2026-08-01', locationName: 'Al-Kufra Hydro Site', approvalStatus: 'approved' },
  { id: 'ATT-2', userId: 'USR-02', userName: 'Tariq Al-Mansoor', clockInTime: '2026-08-01T08:15:00.000Z', clockOutTime: '2026-08-01T16:45:00.000Z', totalHours: 8.5, status: 'clocked_out', date: '2026-08-01', locationName: 'Djanet Microgrid', approvalStatus: 'approved' },
];

describe('monthlyAnalyticsService Unit Tests', () => {
  it('should correctly calculate number of days in a month', () => {
    expect(getDaysInMonth(2026, 8)).toBe(31); // August
    expect(getDaysInMonth(2026, 9)).toBe(30); // September
    expect(getDaysInMonth(2026, 2)).toBe(28); // February non-leap
    expect(getDaysInMonth(2028, 2)).toBe(29); // February leap
  });

  it('should accurately convert decimal hours to AM/PM string', () => {
    expect(formatDecimalToTime(8.25)).toBe('8:15 AM');
    expect(formatDecimalToTime(12.0)).toBe('12:00 PM');
    expect(formatDecimalToTime(17.5)).toBe('5:30 PM');
    expect(formatDecimalToTime(0)).toBe('—');
  });

  it('should generate complete 31 days of Check-In & Check-Out records for August 2026', () => {
    const logs = getMonthlyCheckInOutData(2026, 8, 'Amara Vance', TEST_ATTENDANCE, TEST_TEAM);
    expect(logs).toHaveLength(31);
    expect(logs[0].day).toBe(1);
    expect(logs[30].day).toBe(31);

    logs.forEach((log) => {
      expect(log.date).toMatch(/^2026-08-\d{2}$/);
      expect(log.totalHours).toBeGreaterThanOrEqual(0);
      expect(log.overtimeHours).toBeGreaterThanOrEqual(0);
    });
  });

  it('should generate 31 days of Performance scores and task metrics', () => {
    const perfData = getMonthlyPerformanceData(2026, 8, 'Amara Vance', TEST_TASKS, TEST_TEAM);
    expect(perfData).toHaveLength(31);

    perfData.forEach((pd) => {
      expect(pd.performanceScore).toBeGreaterThanOrEqual(0);
      expect(pd.performanceScore).toBeLessThanOrEqual(100);
      expect(pd.qualityRating).toBeGreaterThanOrEqual(0);
      expect(pd.qualityRating).toBeLessThanOrEqual(5.0);
    });
  });

  it('should generate heatmap rows for all team members across 31 days', () => {
    const matrix = getMonthlyHeatmapMatrix(2026, 8, TEST_ATTENDANCE, TEST_TEAM);
    expect(matrix.length).toBeGreaterThanOrEqual(5);

    matrix.forEach((row) => {
      expect(row.days).toHaveLength(31);
      expect(row.monthlyTotalHours).toBeGreaterThanOrEqual(0);
      expect(row.monthlyPunctualityPct).toBeGreaterThanOrEqual(0);
      expect(row.monthlyPunctualityPct).toBeLessThanOrEqual(100);
    });
  });

  it('should calculate task burndown trajectory across 31 days', () => {
    const burndown = getMonthlyTaskBurndown(2026, 8, TEST_TASKS);
    expect(burndown).toHaveLength(31);
    expect(burndown[0].actualRemaining).toBeGreaterThanOrEqual(0);
  });

  it('should compute station shift hours distribution', () => {
    const dist = getStationHoursDistribution(TEST_ATTENDANCE);
    expect(dist.length).toBeGreaterThan(0);
    const totalPct = dist.reduce((a, b) => a + b.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(99);
    expect(totalPct).toBeLessThanOrEqual(101);
  });

  it('should compute 5-axis radar metrics for team members', () => {
    const radar = getEmployeeRadarMetrics(TEST_TEAM, TEST_TASKS, TEST_ATTENDANCE);
    expect(radar.length).toBeGreaterThanOrEqual(5);
    radar.forEach((m) => {
      expect(m.taskVelocity).toBeGreaterThanOrEqual(0);
      expect(m.punctuality).toBeGreaterThanOrEqual(0);
      expect(m.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  it('should isolate attendance logs and heatmap rows for specific individual employee', () => {
    const matrix = getMonthlyHeatmapMatrix(2026, 8, TEST_ATTENDANCE, TEST_TEAM);
    const isolated = matrix.filter((r) => r.employeeName === 'Amara Vance');
    expect(isolated).toHaveLength(1);
    expect(isolated[0].employeeName).toBe('Amara Vance');
    expect(isolated[0].days).toHaveLength(31);
  });

  it('should generate 31 days of combined check-in & check-out records for all 5 team members', () => {
    const teamData = getAllEmployeesMonthlyCheckInOutData(2026, 8, TEST_ATTENDANCE, TEST_TEAM);
    expect(teamData).toHaveLength(31);
    expect(teamData[0].employeeShifts).toHaveLength(5);
    const monthTotal = teamData.reduce((a, b) => a + b.totalTeamHours, 0);
    expect(monthTotal).toBeGreaterThan(0);
  });
});
