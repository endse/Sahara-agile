import React, { useState } from 'react';
import { Task, ScreenId } from '../types';
import { getNearingDeadlineTasks } from '../lib/deadlineUtils';

interface DeadlineAlertSummaryProps {
  tasks: Task[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onSelectTask?: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
}

export const DeadlineAlertSummary: React.FC<DeadlineAlertSummaryProps> = ({
  tasks,
  onNavigate,
  onSelectTask,
  onUpdateTaskStatus,
}) => {
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([]);

  // Calculate tasks nearing deadline
  const allNearingItems = getNearingDeadlineTasks(tasks);
  const activeAlertItems = allNearingItems.filter(
    (item) => !dismissedTaskIds.includes(item.task.id)
  );

  const handleDismiss = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedTaskIds((prev) => [...prev, taskId]);
  };

  const handleQuickDone = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'done');
    }
  };

  if (activeAlertItems.length === 0) {
    return (
      <div className="bg-[#FEFAE0]/80 border border-[#E9EDC9] rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-[#606C38]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#606C38]">check_circle</span>
          <span className="font-semibold">All operational task deadlines are nominal. Zero pending alerts.</span>
        </div>
        {dismissedTaskIds.length > 0 && (
          <button
            onClick={() => setDismissedTaskIds([])}
            className="text-[11px] underline font-medium hover:text-[#4d572d]"
          >
            Reset dismissed alerts ({dismissedTaskIds.length})
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/10 border-2 border-amber-400/60 rounded-3xl p-5 lg:p-6 shadow-sm relative overflow-hidden space-y-4">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-9 h-9 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-xs border border-amber-500/40">
              <span className="material-symbols-outlined text-xl">warning</span>
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-lg font-bold text-[#2D241E]">
                Deadline Alert Summary
              </h3>
              <span className="bg-amber-400 text-stone-950 font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-amber-500 shadow-2xs">
                {activeAlertItems.length} {activeAlertItems.length === 1 ? 'Task' : 'Tasks'} Flagged
              </span>
            </div>
            <p className="text-xs text-[#8B5E3C] mt-0.5">
              Active mission objectives with deadlines within 7 days requiring immediate supervisor attention.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('TaskBoard', 'none')}
            className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs border border-amber-500/50 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">view_kanban</span>
            <span>Manage Board</span>
          </button>
        </div>
      </div>

      {/* Flagged Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 relative z-10">
        {activeAlertItems.map(({ task, info }) => (
          <div
            key={task.id}
            onClick={() => {
              if (onSelectTask) onSelectTask(task);
              onNavigate('TaskBoardActivity', 'push');
            }}
            className="bg-white/90 hover:bg-white border-2 border-amber-400/80 rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 group relative"
          >
            {/* Top row with Task Code & Yellow Status Indicator */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                  {task.code}
                </span>
                <span className="text-[10px] font-semibold text-[#8B5E3C]">
                  {task.region || 'Sector 04'}
                </span>
              </div>

              {/* Yellow Status Indicator Pill */}
              <div className={`px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1.5 ${info.badgeClasses}`}>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>{info.statusLabel}</span>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h4 className="font-bold text-xs text-[#2D241E] group-hover:text-amber-800 transition-colors line-clamp-1">
                {task.title}
              </h4>
              <p className="text-[11px] text-[#8B5E3C] line-clamp-2 mt-0.5 leading-relaxed">
                {task.description || 'Field task in active phase requiring verification before final deadline.'}
              </p>
            </div>

            {/* Footer with Assignee and Actions */}
            <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400"
                />
                <span className="text-[11px] text-stone-700 font-medium truncate max-w-[90px]">
                  {task.assignee.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Mark Completed"
                  onClick={(e) => handleQuickDone(task.id, e)}
                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">check</span>
                  <span>Done</span>
                </button>

                <button
                  type="button"
                  title="Snooze Alert"
                  onClick={(e) => handleDismiss(task.id, e)}
                  className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
