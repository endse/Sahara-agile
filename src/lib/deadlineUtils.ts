import { Task } from '../types';

export interface DeadlineInfo {
  isNearingDeadline: boolean;
  isOverdue: boolean;
  isDueToday: boolean;
  daysRemaining: number;
  statusLabel: string;
  badgeClasses: string;
  borderClasses: string;
}

export function parseTaskDueDate(dueDateStr: string): Date | null {
  if (!dueDateStr) return null;
  const parsed = new Date(dueDateStr);
  if (isNaN(parsed.getTime())) return null;
  return parsed;
}

export function getTaskDeadlineInfo(
  task: Partial<Task>,
  referenceDate: Date = new Date()
): DeadlineInfo {
  // Completed tasks are not nearing deadline
  if (task.status === 'done') {
    return {
      isNearingDeadline: false,
      isOverdue: false,
      isDueToday: false,
      daysRemaining: 999,
      statusLabel: 'Completed',
      badgeClasses: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
      borderClasses: '',
    };
  }

  const due = parseTaskDueDate(task.dueDate);
  if (!due) {
    return {
      isNearingDeadline: false,
      isOverdue: false,
      isDueToday: false,
      daysRemaining: 999,
      statusLabel: task.dueDate || 'No Date',
      badgeClasses: 'bg-stone-100 text-stone-700 font-normal',
      borderClasses: '',
    };
  }

  // Normalize dates to midnight for calendar day difference
  const refZero = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  const dueZero = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffMs = dueZero.getTime() - refZero.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      isNearingDeadline: true,
      isOverdue: true,
      isDueToday: false,
      daysRemaining: diffDays,
      statusLabel: overdueDays === 1 ? 'Overdue 1 day' : `Overdue ${overdueDays} days`,
      badgeClasses: 'bg-amber-400 text-stone-900 border border-amber-500 font-bold shadow-xs',
      borderClasses: 'border-amber-500/80 bg-amber-500/10',
    };
  }

  if (diffDays === 0) {
    return {
      isNearingDeadline: true,
      isOverdue: false,
      isDueToday: true,
      daysRemaining: 0,
      statusLabel: 'Due Today',
      badgeClasses: 'bg-yellow-400 text-stone-950 border border-yellow-500 font-bold shadow-xs',
      borderClasses: 'border-yellow-500/80 bg-yellow-500/10',
    };
  }

  if (diffDays === 1) {
    return {
      isNearingDeadline: true,
      isOverdue: false,
      isDueToday: false,
      daysRemaining: 1,
      statusLabel: 'Due Tomorrow',
      badgeClasses: 'bg-amber-300 text-stone-950 border border-amber-400 font-bold shadow-xs',
      borderClasses: 'border-amber-400/80 bg-amber-400/10',
    };
  }

  if (diffDays <= 7) {
    return {
      isNearingDeadline: true,
      isOverdue: false,
      isDueToday: false,
      daysRemaining: diffDays,
      statusLabel: `Due in ${diffDays} days`,
      badgeClasses: 'bg-amber-300/90 text-stone-900 border border-amber-400 font-semibold shadow-xs',
      borderClasses: 'border-amber-400/60 bg-amber-300/5',
    };
  }

  return {
    isNearingDeadline: false,
    isOverdue: false,
    isDueToday: false,
    daysRemaining: diffDays,
    statusLabel: `Due ${task.dueDate}`,
    badgeClasses: 'bg-[#F3E9DC] text-[#5C4D42]',
    borderClasses: '',
  };
}

export function getNearingDeadlineTasks<T extends Partial<Task>>(
  tasks: T[],
  referenceDate: Date = new Date()
): { task: T; info: DeadlineInfo }[] {
  return tasks
    .map((task) => ({ task, info: getTaskDeadlineInfo(task, referenceDate) }))
    .filter((item) => item.info.isNearingDeadline)
    .sort((a, b) => a.info.daysRemaining - b.info.daysRemaining);
}
