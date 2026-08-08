import React, { useState } from 'react';
import { ScreenId, Task, Activity } from '../../types';
import { getTaskDeadlineInfo } from '../../lib/deadlineUtils';

interface TaskBoardActivityProps {
  tasks: Task[];
  activities: Activity[];
  selectedTask?: Task | null;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onAddActivity: (act: Activity) => void;
}

export const TaskBoardActivityScreen: React.FC<TaskBoardActivityProps> = ({
  tasks,
  activities,
  selectedTask: initialSelectedTask,
  onNavigate,
  onAddActivity
}) => {
  const [selectedTask, setSelectedTask] = useState<Task>(initialSelectedTask || tasks[0]);
  const [newComment, setNewComment] = useState('');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: 'Amara Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'posted comment on',
      target: selectedTask ? `${selectedTask.code} (${selectedTask.title})` : 'Sahara Board',
      time: 'Just now',
      type: 'comment',
      detail: `"${newComment.trim()}"`
    };

    onAddActivity(newAct);
    setNewComment('');
  };

  const selectedTaskInfo = selectedTask ? getTaskDeadlineInfo(selectedTask) : null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c2652a]">
            <span className="material-symbols-outlined text-base">rate_review</span>
            Task Inspector & Live Telemetry Feed
          </div>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold text-[#3a302a] mt-1">
            Task Board with Activity Feed - Sahara
          </h1>
          <p className="text-sm text-[#605850]">
            Detailed mission logs, real-time comment threads, and telemetry file attachments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('TaskBoard', 'push_back')}
            className="px-4 py-2.5 bg-[#faf5ee] hover:bg-[#ffffff] text-[#3a302a] border border-[#e0d8cc] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Board Grid</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Task Selector & Detail (Left) + Activity Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Task Inspector & Card Selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Task Highlight Inspector */}
          {selectedTask && (
            <div className="bg-[#f2ece4] border border-[#c2652a] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e0d8cc] pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-[#c2652a] text-white px-2.5 py-1 rounded-md">
                    {selectedTask.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      selectedTask.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : selectedTask.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedTask.priority}
                  </span>

                  {/* Yellow Status Indicator */}
                  {selectedTaskInfo?.isNearingDeadline && (
                    <span className={`text-xs ${selectedTaskInfo.badgeClasses} px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs`}>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      <span>⚠️ {selectedTaskInfo.statusLabel}</span>
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#78706a] font-medium">{selectedTask.region}</span>
              </div>

              <div className="space-y-2">
                <h2 className="font-headline text-2xl font-bold text-[#3a302a]">{selectedTask.title}</h2>
                <p className="text-xs text-[#605850] leading-relaxed">{selectedTask.description}</p>
              </div>

              {/* Progress & Assignee Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf5ee] p-4 rounded-2xl border border-[#e6e0d6]">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78706a]">Assigned Field Lead</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedTask.assignee.avatar}
                      alt={selectedTask.assignee.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#c2652a]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#3a302a]">{selectedTask.assignee.name}</p>
                      <p className="text-[10px] text-[#78706a]">{selectedTask.assignee.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#78706a]">Mission Due Date</span>
                  <p className="text-xs font-bold text-[#3a302a] mt-1">{selectedTask.dueDate}</p>
                  <p className="text-[10px] text-[#c2652a] font-semibold">{selectedTask.timeSpent} logged</p>
                </div>
              </div>

              {/* Task Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#78706a] mr-1">Tags:</span>
                {selectedTask.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#faf5ee] border border-[#d8d0c8] text-[#3a302a]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Task Switcher List */}
          <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 space-y-3">
            <h3 className="font-headline text-lg font-bold text-[#3a302a]">Select Task to Inspect Feed</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedTask?.id === task.id
                      ? 'bg-[#faf5ee] border-[#c2652a] font-bold shadow-2xs'
                      : 'bg-[#faf5ee]/60 border-[#e6e0d6] hover:bg-[#faf5ee]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#e6e0d6] text-[#3a302a]">
                      {task.code}
                    </span>
                    <span className="text-xs text-[#3a302a]">{task.title}</span>
                  </div>
                  <span className="material-symbols-outlined text-base text-[#c2652a]">chevron_right</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Activity Stream & Comment Drawer */}
        <div className="lg:col-span-5 bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e0d8cc] pb-3">
              <h3 className="font-headline text-xl font-bold text-[#3a302a]">Live Activity Feed</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                SatCom Active
              </span>
            </div>

            {/* Comment Post Form */}
            <form onSubmit={handlePostComment} className="space-y-2">
              <textarea
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Log field update or comment..."
                className="w-full bg-[#faf5ee] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl p-3 text-xs font-medium text-[#3a302a] outline-none"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const mockFileAct: Activity = {
                      id: `ACT-FILE-${Date.now()}`,
                      user: 'Amara Vance',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      action: 'uploaded satellite geotag log to',
                      target: selectedTask?.code || 'Task Board',
                      time: 'Just now',
                      type: 'file',
                      detail: 'Hydro_Sensor_Geotag_20261024.csv (8.4 MB)'
                    };
                    onAddActivity(mockFileAct);
                  }}
                  className="text-xs font-semibold text-[#c2652a] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">attach_file</span>
                  <span>Attach Telemetry Log</span>
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#c2652a] hover:bg-[#a8541f] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Post</span>
                </button>
              </div>
            </form>

            {/* Activities List */}
            <div className="space-y-4 pt-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
              {activities.map((act) => (
                <div key={act.id} className="p-3.5 bg-[#faf5ee] rounded-2xl border border-[#e6e0d6] space-y-2">
                  <div className="flex items-start gap-2.5">
                    <img src={act.avatar} alt={act.user} className="w-7 h-7 rounded-full object-cover border border-[#c2652a] shrink-0" />
                    <div className="text-xs space-y-0.5">
                      <p className="text-[#3a302a]">
                        <strong className="font-bold">{act.user}</strong> {act.action}{' '}
                        <span className="font-semibold text-[#c2652a]">{act.target}</span>
                      </p>
                      <span className="text-[10px] text-[#9a9088]">{act.time}</span>
                    </div>
                  </div>
                  {act.detail && (
                    <div className="p-2 bg-[#f2ece4] rounded-xl text-[11px] text-[#605850] italic border border-[#e0d8cc]">
                      {act.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
