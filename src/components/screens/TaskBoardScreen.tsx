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
    { id: 'backlog', title: 'Backlog', color: 'bg-stone-400' },
    { id: 'todo', title: 'To Do', color: 'bg-[#D4A373]' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-[#606C38]' },
    { id: 'review', title: 'Review', color: 'bg-[#8B5E3C]' },
    { id: 'done', title: 'Done', color: 'bg-[#606C38]' },
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
    // Check if moving outside current target
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
      {/* Top Banner & Quick Controls */}
      <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-6 lg:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
              <span className="material-symbols-outlined text-base">view_kanban</span>
              <span>Agile Kanban Operations</span>
              <span className="bg-[#606C38]/15 text-[#606C38] px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-[#606C38]/20 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">drag_indicator</span>
                Drag & Drop Enabled
              </span>
            </div>
            <h1 className="font-headline text-3xl lg:text-4xl font-light text-[#2D241E] mt-1">
              Task Board - Sahara
            </h1>
            <p className="text-sm text-[#8B5E3C]">
              Drag cards between columns to seamlessly update task progress across field operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Button to open Task Board with Activity Feed */}
            <button
              onClick={() => onNavigate('TaskBoardActivity', 'push')}
              className="px-4 py-2.5 bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#D4A373]">rate_review</span>
              <span>Open Activity Feed</span>
            </button>

            {/* Button to New Task */}
            <button
              onClick={() => onNavigate('NewTask', 'slide_up')}
              className="px-4 py-2.5 bg-[#606C38] hover:bg-[#4d572d] text-white rounded-2xl text-xs font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-base">add_task</span>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E5D5C0]">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#8B5E3C]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks by title, code, or tag..."
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full pl-9 pr-3 py-2 text-xs font-medium text-[#3D3028] outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-[#8B5E3C] shrink-0">Priority:</span>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors shrink-0 ${
                  filterPriority === p
                    ? 'bg-[#D4A373] text-white'
                    : 'bg-[#FDF8F3] text-[#5C4D42] hover:bg-[#E5D5C0]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-6">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isColumnHovered = dragOverColumnId === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-white border rounded-[24px] p-4 space-y-3 min-w-[240px] transition-all duration-200 ${
                isColumnHovered
                  ? 'border-2 border-dashed border-[#606C38] bg-[#FDF8F3] shadow-md ring-4 ring-[#606C38]/10 scale-[1.01]'
                  : 'border-[#F3E9DC] hover:border-[#E5D5C0]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-[#F3E9DC] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <h3 className="font-semibold text-sm text-[#3D3028]">{col.title}</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F3E9DC] text-[#5C4D42]">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('NewTask', 'slide_up')}
                  className="text-[#8B5E3C] hover:text-[#3D3028] p-1 rounded transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>

              {/* Column Dropzone Cards Container */}
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
                      className={`bg-[#FDF8F3] hover:bg-white border rounded-2xl p-4 space-y-3 transition-all cursor-grab active:cursor-grabbing group shadow-2xs relative ${
                        isBeingDragged
                          ? 'opacity-40 scale-95 border-dashed border-[#D4A373] bg-[#F3E9DC]'
                          : deadlineInfo.isNearingDeadline
                          ? 'border-amber-400/90 bg-amber-500/5 hover:border-amber-500'
                          : 'border-[#F3E9DC] hover:border-[#D4A373]'
                      }`}
                    >
                      {/* Drag handle & Task code */}
                      <div className="flex items-center justify-between text-[11px] gap-1">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-stone-400 group-hover:text-[#D4A373] transition-colors">
                            drag_indicator
                          </span>
                          <span className="font-mono font-bold text-[#5C4D42] bg-[#F3E9DC] px-2 py-0.5 rounded-full">
                            {task.code}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Priority Badge */}
                          <span
                            className={`font-bold uppercase text-[9px] px-2 py-0.5 rounded-full ${
                              task.priority === 'urgent'
                                ? 'bg-[#BC4749]/15 text-[#BC4749]'
                                : task.priority === 'high'
                                ? 'bg-[#D4A373]/20 text-[#8B5E3C]'
                                : 'bg-[#FEFAE0] text-[#606C38] border border-[#E9EDC9]'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Yellow Status Indicator for Nearing Deadline */}
                          {deadlineInfo.isNearingDeadline && (
                            <span
                              className={`text-[9px] ${deadlineInfo.badgeClasses} px-2 py-0.5 rounded-full flex items-center gap-1`}
                              title={`Deadline Alert: ${deadlineInfo.statusLabel}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>{deadlineInfo.statusLabel}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-semibold text-xs text-[#3D3028] group-hover:text-[#D4A373] transition-colors leading-snug">
                        {task.title}
                      </h4>

                      {/* Progress indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-[#8B5E3C]">
                          <span>Progress</span>
                          <span className="font-bold text-[#3D3028]">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-[#E5D5C0] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#D4A373] h-full rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Assignee & Status Quick Switch */}
                      <div className="pt-2 border-t border-[#F3E9DC] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full object-cover border-2 border-[#D4A373]"
                          />
                          <span className="text-[10px] text-[#8B5E3C] truncate max-w-[80px]">
                            {task.assignee.name}
                          </span>
                        </div>

                        {/* Dropdown status selector */}
                        {onUpdateTaskStatus && (
                          <select
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdateTaskStatus(task.id, e.target.value as Task['status']);
                            }}
                            className="text-[10px] bg-[#F3E9DC] border border-[#E5D5C0] rounded-full px-2 py-0.5 text-[#3D3028] outline-none cursor-pointer font-medium"
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
                    className={`border-2 border-dashed rounded-2xl p-6 text-center text-xs transition-colors flex flex-col items-center justify-center gap-1 my-auto ${
                      isColumnHovered
                        ? 'border-[#606C38] text-[#606C38] bg-[#606C38]/5 font-bold'
                        : 'border-[#E5D5C0] text-[#8B5E3C]/70'
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

