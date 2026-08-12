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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
          <span className="font-semibold">All task deadlines are on schedule. Zero deadline alerts.</span>
        </div>
        {dismissedTaskIds.length > 0 && (
          <button
            onClick={() => setDismissedTaskIds([])}
            className="text-[11px] underline font-medium hover:text-emerald-900"
          >
            Reset dismissed alerts ({dismissedTaskIds.length})
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#C49A5A]/10 border border-[#C49A5A]/30 rounded-2xl p-5 lg:p-6 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C49A5A]/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C49A5A] text-[#0D0D0B] flex items-center justify-center font-bold shadow-xs">
            <span className="material-symbols-outlined text-lg">warning</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#171512]">
                Deadline Notification Alerts
              </h3>
              <span className="bg-[#C49A5A]/20 text-[#A8793A] font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-[#C49A5A]/30">
                {activeAlertItems.length} {activeAlertItems.length === 1 ? 'Task' : 'Tasks'}
              </span>
            </div>
            <p className="text-xs text-[#625C52] mt-0.5">
              Tasks with deadlines within 7 days requiring attention.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('TaskBoard', 'none')}
          className="px-3 py-1.5 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-sm">view_kanban</span>
          <span>View Task Board</span>
        </button>
      </div>

      {/* Flagged Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {activeAlertItems.map(({ task, info }) => (
          <div
            key={task.id}
            onClick={() => {
              if (onSelectTask) onSelectTask(task);
              onNavigate('TaskBoardActivity', 'push');
            }}
            className="bg-white hover:bg-[#FBF9F4] border border-[#C49A5A]/40 rounded-xl p-4 transition-all shadow-xs cursor-pointer flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FBF9F4] text-[#171512] border border-[#E4DDD0]">
                {task.code}
              </span>

              <div className="px-2 py-0.5 rounded-full text-[10px] bg-[#C49A5A]/20 text-[#A8793A] font-bold flex items-center gap-1 border border-[#C49A5A]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C49A5A] animate-pulse" />
                <span>{info.statusLabel}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-[#171512] group-hover:text-[#A8793A] transition-colors line-clamp-1">
                {task.title}
              </h4>
              <p className="text-[11px] text-[#625C52] line-clamp-2 mt-0.5">
                {task.description || 'Task nearing deadline.'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#E4DDD0] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover border border-[#C49A5A]"
                />
                <span className="text-[11px] text-[#171512] font-medium truncate max-w-[90px]">
                  {task.assignee.name}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  title="Mark Completed"
                  onClick={(e) => handleQuickDone(task.id, e)}
                  className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">check</span>
                  <span>Done</span>
                </button>

                <button
                  type="button"
                  title="Dismiss Alert"
                  onClick={(e) => handleDismiss(task.id, e)}
                  className="p-1 text-[#8A8378] hover:text-[#171512] hover:bg-[#FBF9F4] rounded-lg transition-colors"
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
