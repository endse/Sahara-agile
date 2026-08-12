import React, { useState } from 'react';
import { ScreenId, Task } from '../../types';
import { getTaskDeadlineInfo } from '../../lib/deadlineUtils';

interface TaskBoardProps {
  tasks: Task[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
}

export const TaskBoardScreen: React.FC<TaskBoardProps> = ({
  tasks,
  onNavigate,
  onSelectTask,
  onUpdateTaskStatus
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  const columns: { id: Task['status']; title: string; color: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'bg-[#8A8378]' },
    { id: 'todo', title: 'To Do', color: 'bg-[#C49A5A]' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-[#A8793A]' },
    { id: 'review', title: 'Review', color: 'bg-[#D6B77A]' },
    { id: 'done', title: 'Done', color: 'bg-emerald-600' },
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== colId) {
      setDragOverColumnId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumnId === colId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId && onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Controls */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#625C52]">
              <span className="material-symbols-outlined text-base">view_kanban</span>
              <span>Agile Kanban Task Board</span>
              <span className="bg-[#C49A5A]/20 text-[#A8793A] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#C49A5A]/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">drag_indicator</span>
                Drag & Drop Enabled
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#171512] mt-1">
              Task Board
            </h1>
            <p className="text-xs lg:text-sm text-[#625C52]">
              Manage sprint deliverables and track progress across task states.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('TaskBoardActivity', 'push')}
              className="px-4 py-2.5 bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#8A8378]">rate_review</span>
              <span>Task Activity</span>
            </button>

            <button
              onClick={() => onNavigate('NewTask', 'slide_up')}
              className="px-4 py-2.5 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ New Task</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E4DDD0]">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#8A8378]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by title, code, or tag..."
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#171512] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-[#625C52] shrink-0">Priority:</span>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors shrink-0 ${
                  filterPriority === p
                    ? 'bg-[#C49A5A] text-[#0D0D0B] font-bold'
                    : 'bg-[#FBF9F4] text-[#625C52] hover:bg-[#F7F3EA] border border-[#E4DDD0]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board Columns Container */}
      <div className="flex overflow-x-auto gap-4 items-start pb-6 min-w-full custom-scrollbar">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isColumnHovered = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-[#FBF9F4] border rounded-2xl p-4 space-y-3 flex-1 min-w-[260px] max-w-[340px] transition-all duration-200 ${
                isColumnHovered
                  ? 'border-2 border-dashed border-[#C49A5A] bg-[#C49A5A]/10 shadow-md ring-4 ring-[#C49A5A]/10'
                  : 'border-[#E4DDD0] hover:border-[#C49A5A]/50'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="font-bold text-sm text-[#171512]">{col.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#171512] border border-[#E4DDD0]">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('NewTask', 'slide_up')}
                  className="text-[#8A8378] hover:text-[#171512] p-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>

              {/* Column Dropzone Cards */}
              <div className="space-y-3 min-h-[160px] flex flex-col justify-start">
                {colTasks.map((task) => {
                  const isBeingDragged = draggedTaskId === task.id;
                  const deadlineInfo = getTaskDeadlineInfo(task);

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        onSelectTask(task);
                        onNavigate('TaskBoardActivity', 'push');
                      }}
                      className={`bg-white border rounded-xl p-4 space-y-3 transition-all cursor-grab active:cursor-grabbing group shadow-2xs relative ${
                        isBeingDragged
                          ? 'opacity-40 scale-95 border-dashed border-[#C49A5A] bg-[#FBF9F4]'
                          : deadlineInfo.isNearingDeadline
                          ? 'border-[#C49A5A] bg-[#C49A5A]/10 hover:border-[#C49A5A]'
                          : 'border-[#E4DDD0] hover:border-[#C49A5A]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] gap-1">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-[#8A8378] group-hover:text-[#A8793A] transition-colors">
                            drag_indicator
                          </span>
                          <span className="font-mono font-bold text-[#171512] bg-[#FBF9F4] px-2 py-0.5 rounded border border-[#E4DDD0]">
                            {task.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${
                              task.priority === 'urgent'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'high'
                                ? 'bg-[#C49A5A]/20 text-[#A8793A]'
                                : 'bg-[#FBF9F4] text-[#625C52] border border-[#E4DDD0]'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {deadlineInfo.isNearingDeadline && (
                            <span className="text-[9px] bg-[#C49A5A]/20 text-[#A8793A] font-bold px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                              {deadlineInfo.statusLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-semibold text-xs text-[#171512] group-hover:text-[#A8793A] transition-colors leading-snug">
                        {task.title}
                      </h4>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#625C52]">
                          <span>Progress</span>
                          <span className="font-bold text-[#171512]">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-[#E4DDD0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#C49A5A] h-full rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#E4DDD0] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full object-cover border border-[#C49A5A]"
                          />
                          <span className="text-[10px] text-[#625C52] truncate max-w-[80px]">
                            {task.assignee.name}
                          </span>
                        </div>

                        {onUpdateTaskStatus && (
                          <select
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdateTaskStatus(task.id, e.target.value as Task['status']);
                            }}
                            className="text-[10px] bg-[#FBF9F4] border border-[#E4DDD0] rounded-lg px-2 py-0.5 text-[#171512] outline-none cursor-pointer font-semibold"
                          >
                            <option value="backlog">Backlog</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center text-xs transition-colors flex flex-col items-center justify-center gap-1 my-auto ${
                      isColumnHovered
                        ? 'border-[#C49A5A] text-[#A8793A] bg-[#C49A5A]/10 font-bold'
                        : 'border-[#E4DDD0] text-[#8A8378]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">call_received</span>
                    <span>Drop task here</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
