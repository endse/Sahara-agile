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
import { INITIAL_ATTENDANCE, INITIAL_TASKS, INITIAL_TEAM } from '../../src/data';

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
    const logs = getMonthlyCheckInOutData(2026, 8, 'Amara Vance', INITIAL_ATTENDANCE, INITIAL_TEAM);
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
    const perfData = getMonthlyPerformanceData(2026, 8, 'Amara Vance', INITIAL_TASKS, INITIAL_TEAM);
    expect(perfData).toHaveLength(31);

    perfData.forEach((pd) => {
      expect(pd.performanceScore).toBeGreaterThanOrEqual(0);
      expect(pd.performanceScore).toBeLessThanOrEqual(100);
      expect(pd.qualityRating).toBeGreaterThanOrEqual(0);
      expect(pd.qualityRating).toBeLessThanOrEqual(5.0);
    });
  });

  it('should generate heatmap rows for all team members across 31 days', () => {
    const matrix = getMonthlyHeatmapMatrix(2026, 8, INITIAL_ATTENDANCE, INITIAL_TEAM);
    expect(matrix.length).toBeGreaterThanOrEqual(5);

    matrix.forEach((row) => {
      expect(row.days).toHaveLength(31);
      expect(row.monthlyTotalHours).toBeGreaterThan(0);
      expect(row.monthlyPunctualityPct).toBeGreaterThanOrEqual(0);
      expect(row.monthlyPunctualityPct).toBeLessThanOrEqual(100);
    });
  });

  it('should calculate task burndown trajectory across 31 days', () => {
    const burndown = getMonthlyTaskBurndown(2026, 8, INITIAL_TASKS);
    expect(burndown).toHaveLength(31);
    expect(burndown[0].actualRemaining).toBeGreaterThan(0);
  });

  it('should compute station shift hours distribution', () => {
    const dist = getStationHoursDistribution(INITIAL_ATTENDANCE);
    expect(dist.length).toBeGreaterThan(0);
    const totalPct = dist.reduce((a, b) => a + b.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(99);
    expect(totalPct).toBeLessThanOrEqual(101);
  });

  it('should compute 5-axis radar metrics for team members', () => {
    const radar = getEmployeeRadarMetrics(INITIAL_TEAM, INITIAL_TASKS, INITIAL_ATTENDANCE);
    expect(radar.length).toBeGreaterThanOrEqual(5);
    radar.forEach((m) => {
      expect(m.taskVelocity).toBeGreaterThanOrEqual(0);
      expect(m.punctuality).toBeGreaterThanOrEqual(0);
      expect(m.overallScore).toBeGreaterThanOrEqual(0);
    });
  });

  it('should isolate attendance logs and heatmap rows for specific individual employee', () => {
    const matrix = getMonthlyHeatmapMatrix(2026, 8, INITIAL_ATTENDANCE, INITIAL_TEAM);
    const isolated = matrix.filter((r) => r.employeeName === 'Amara Vance');
    expect(isolated).toHaveLength(1);
    expect(isolated[0].employeeName).toBe('Amara Vance');
    expect(isolated[0].days).toHaveLength(31);
  });

  it('should generate 31 days of combined check-in & check-out records for all 5 team members', () => {
    const teamData = getAllEmployeesMonthlyCheckInOutData(2026, 8, INITIAL_ATTENDANCE, INITIAL_TEAM);
    expect(teamData).toHaveLength(31);
    expect(teamData[0].employeeShifts).toHaveLength(5);
    const monthTotal = teamData.reduce((a, b) => a + b.totalTeamHours, 0);
    expect(monthTotal).toBeGreaterThan(100);
  });
});
