import React, { useState, useRef, useEffect } from 'react';
import { ScreenId, Task, Activity, TaskAttachment } from '../../types';
import { getTaskDeadlineInfo } from '../../lib/deadlineUtils';
import { TaskAttachmentsManager } from '../TaskAttachmentsManager';
import { useAuth } from '../../context/AuthContext';
import { uploadTaskAttachment } from '../../services/storageService';

interface TaskBoardActivityProps {
  tasks: Task[];
  activities: Activity[];
  selectedTask?: Task | null;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onAddActivity: (act: Activity) => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: Task['status']) => void;
  onUpdateTaskAttachments?: (taskId: string, attachments: TaskAttachment[]) => void;
  onApproveTaskStatus?: (taskId: string) => void;
  onRejectTaskStatus?: (taskId: string) => void;
  activeRole?: 'Manager' | 'Employee';
}

export const TaskBoardActivityScreen: React.FC<TaskBoardActivityProps> = ({
  tasks,
  activities,
  selectedTask: initialSelectedTask,
  onNavigate,
  onAddActivity,
  onUpdateTaskStatus,
  onUpdateTaskAttachments,
  onApproveTaskStatus,
  onRejectTaskStatus,
  activeRole = 'Manager'
}) => {
  const { userProfile } = useAuth();
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task>(initialSelectedTask || tasks[0]);
  const [newComment, setNewComment] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);

  useEffect(() => {
    if (initialSelectedTask) {
      setSelectedTask(initialSelectedTask);
    } else if (tasks.length > 0 && (!selectedTask || !tasks.some(t => t.id === selectedTask.id))) {
      setSelectedTask(tasks[0]);
    }
  }, [initialSelectedTask, tasks]);

  const userName = userProfile?.displayName || 'Field Operator';
  const userAvatar = userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userName,
      avatar: userAvatar,
      action: 'posted comment on',
      target: selectedTask ? `${selectedTask.code} (${selectedTask.title})` : 'Sahara Board',
      time: 'Just now',
      type: 'comment',
      detail: `"${newComment.trim()}"`
    };

    onAddActivity(newAct);
    setNewComment('');
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, status: newStatus };
    setSelectedTask(updated);

    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(selectedTask.id, newStatus);
    }

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userName,
      avatar: userAvatar,
      action: 'updated status of',
      target: `${selectedTask.code} to ${newStatus.replace('_', ' ')}`,
      time: 'Just now',
      type: 'status'
    };
    onAddActivity(newAct);
  };

  const handleCommentFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedTask) return;
    setIsAttaching(true);
    try {
      const file = files[0];
      const newAtt = await uploadTaskAttachment(selectedTask.id, file, userName);
      const existing = selectedTask.attachments || [];
      const updatedAtts = [...existing, newAtt];

      setSelectedTask((prev) => ({ ...prev, attachments: updatedAtts }));
      if (onUpdateTaskAttachments) {
        onUpdateTaskAttachments(selectedTask.id, updatedAtts);
      }

      const mockFileAct: Activity = {
        id: `ACT-FILE-${Date.now()}`,
        user: userName,
        avatar: userAvatar,
        action: 'uploaded telemetry file attachment to',
        target: `${selectedTask.code} (${selectedTask.title})`,
        time: 'Just now',
        type: 'file',
        detail: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      };
      onAddActivity(mockFileAct);
    } catch (err) {
      console.error('Error uploading telemetry log:', err);
    } finally {
      setIsAttaching(false);
      if (commentFileInputRef.current) {
        commentFileInputRef.current.value = '';
      }
    }
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
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs font-bold text-[#78706a]">Update Status:</span>
                  {(['todo', 'in_progress', 'review', 'done'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all ${
                        selectedTask.status === st
                          ? 'bg-[#c2652a] text-white shadow-2xs scale-[1.02]'
                          : 'bg-[#faf5ee] border border-[#d8d0c8] text-[#3a302a] hover:bg-[#ffffff]'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pending Approval Manager Banner */}
              {selectedTask.approvalStatus === 'pending_approval' && (
                <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl space-y-2.5 text-xs text-amber-950">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-amber-900">
                      <span className="material-symbols-outlined text-base text-amber-700">rate_review</span>
                      <span>Task Status Change Requested</span>
                    </span>
                    <span className="bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                      ➔ {selectedTask.pendingStatus?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    Requested by <strong>{selectedTask.statusRequestedBy || 'Employee'}</strong> on {selectedTask.statusRequestedAt ? new Date(selectedTask.statusRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}.
                  </p>

                  {activeRole === 'Manager' && (onApproveTaskStatus || onRejectTaskStatus) && (
                    <div className="flex items-center gap-2 pt-1">
                      {onApproveTaskStatus && (
                        <button
                          onClick={() => onApproveTaskStatus(selectedTask.id)}
                          className="px-4 py-2 bg-[#606C38] hover:bg-[#4d572d] text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                          <span>Approve Requested Status</span>
                        </button>
                      )}
                      {onRejectTaskStatus && (
                        <button
                          onClick={() => onRejectTaskStatus(selectedTask.id)}
                          className="px-3.5 py-2 bg-[#BC4749]/15 hover:bg-[#BC4749]/25 text-[#BC4749] font-bold rounded-xl text-xs flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                          <span>Reject Request</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

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

              {/* Task Telemetry Attachments */}
              <div className="border-t border-[#e0d8cc] pt-4">
                <TaskAttachmentsManager
                  taskId={selectedTask.id}
                  attachments={selectedTask.attachments || []}
                  onAttachmentsChange={(newAtts) => {
                    setSelectedTask((prev) => ({ ...prev, attachments: newAtts }));
                    if (onUpdateTaskAttachments) {
                      onUpdateTaskAttachments(selectedTask.id, newAtts);
                    }
                  }}
                />
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
              <input
                ref={commentFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleCommentFileUpload(e.target.files)}
              />
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
                  onClick={() => commentFileInputRef.current?.click()}
                  disabled={isAttaching}
                  className="text-xs font-semibold text-[#c2652a] hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">attach_file</span>
                  <span>{isAttaching ? 'Uploading Log...' : 'Attach Telemetry Log'}</span>
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
