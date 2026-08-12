import React, { useState, useEffect } from 'react';
import { ScreenId, Task, TeamMember, SiteLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NewTaskProps {
  team: TeamMember[];
  locations: SiteLocation[];
  onAddTask: (task: Task) => Promise<void> | void;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
}

export const NewTaskScreen: React.FC<NewTaskProps> = ({
  team,
  locations,
  onAddTask,
  onNavigate
}) => {
  const { userProfile } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  const currentUserMember: TeamMember | null = userProfile
    ? {
        id: userProfile.uid,
        name: userProfile.displayName || 'Current User',
        role: userProfile.role || 'Team Member',
        avatar: userProfile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        email: userProfile.email || '',
        status: 'active',
        tasksCount: 0,
        performance: 98,
      }
    : null;

  const combinedTeam = currentUserMember
    ? [currentUserMember, ...team.filter((t) => t.id !== currentUserMember.id)]
    : team;

  const [title, setTitle] = useState('');
  const [code, setCode] = useState(`SAH-${Math.floor(800 + Math.random() * 90)}`);
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [assigneeId, setAssigneeId] = useState(combinedTeam[0]?.id || '');
  const [locationId, setLocationId] = useState(locations[0]?.id || '');
  const [dueDate, setDueDate] = useState('Nov 15, 2026');
  const [tagsInput, setTagsInput] = useState('FullStack, API, Redis');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Please enter a task title.');
      document.getElementById('task-title')?.focus();
      return;
    }

    const chosenAssignee = combinedTeam.find(t => t.id === assigneeId);
    const chosenLocation = locations.find(l => l.id === locationId);

    if (!chosenLocation) {
      setFormError('Please select a valid project for this task.');
      return;
    }

    const assignee = chosenAssignee
      ? { name: chosenAssignee.name, avatar: chosenAssignee.avatar, role: chosenAssignee.role }
      : {
          name: 'Unassigned',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: 'Unassigned'
        };

    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      code,
      title,
      status,
      priority,
      assignee,
      dueDate,
      progress: 0,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      description,
      region: chosenLocation.region,
      location: {
        lat: chosenLocation.coordinates.lat,
        lng: chosenLocation.coordinates.lng,
        label: chosenLocation.name
      },
      projectId: chosenLocation.id,
      updatedAt: 'Just now',
      timeSpent: '0h'
    };

    try {
      await onAddTask(newTask);
      onNavigate('TaskBoard', 'slide_down');
    } catch {
      setFormError('Failed to save task. Please check your connection and try again.');
    }
  };

  if (locations.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C49A5A] text-[#0D0D0B] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-xl">add_task</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#171512]">New Task</h1>
              <p className="text-xs text-[#625C52]">Create a new sprint task and assign team lead</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('TaskBoard', 'slide_down')}
            className="p-2 rounded-xl bg-white hover:bg-[#FBF9F4] text-[#625C52] transition-colors border border-[#E4DDD0] flex items-center gap-2 text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-base">close</span>
            <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>

        {/* Empty State: Tasks need a parent project */}
        <div className="bg-white border border-[#E4DDD0] rounded-2xl p-10 flex flex-col items-center text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#C49A5A]/15 text-[#A8793A] flex items-center justify-center border border-[#C49A5A]/30">
            <span className="material-symbols-outlined text-3xl">account_tree</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-[#171512]">No Projects Available Yet</h2>
            <p className="text-xs text-[#625C52] max-w-sm mx-auto">
              Tasks must be linked to a parent project so they appear in the project hierarchy, map, and timeline. Create a project first to continue.
            </p>
          </div>
          <button
            onClick={() => onNavigate('NewProject', 'slide_up')}
            className="bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Create Project</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C49A5A] text-[#0D0D0B] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-xl">add_task</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#171512]">New Task</h1>
            <p className="text-xs text-[#625C52]">Create a new sprint task and assign team lead</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('TaskBoard', 'slide_down')}
          className="p-2 rounded-xl bg-white hover:bg-[#FBF9F4] text-[#625C52] transition-colors border border-[#E4DDD0] flex items-center gap-2 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-base">close</span>
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs">
        {formError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{formError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="task-title" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Task Title *</label>
            <input
              id="task-title"
              type="text"
              required
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFormError(null); }}
              placeholder="e.g. Implement Redis caching layer for API endpoints"
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-code" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Task Code</label>
            <input
              id="task-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-status" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Initial Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#171512] uppercase tracking-wider">Priority Level</label>
            <div className="flex flex-wrap gap-2">
              {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase transition-colors ${
                    priority === p
                      ? 'bg-[#C49A5A] text-[#0D0D0B] font-bold shadow-xs'
                      : 'bg-[#FBF9F4] text-[#625C52] hover:bg-[#F7F3EA] border border-[#E4DDD0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Assignee</label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            >
              {combinedTeam.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role}
                </option>
              ))}
              {combinedTeam.length === 0 && (
                <option value="">Unassigned</option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-project" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Associated Project</label>
            <select
              id="task-project"
              value={locationId}
              onChange={(e) => { setLocationId(e.target.value); setFormError(null); }}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.region})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-due-date" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Due Date</label>
            <input
              id="task-due-date"
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-tags" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              id="task-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. FullStack, API, DevOps"
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="task-description" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Description & Notes</label>
            <textarea
              id="task-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide task details, scope, and technical requirements..."
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl p-3 text-xs font-medium text-[#171512] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('TaskBoard', 'slide_down')}
            className="px-4 py-2.5 rounded-xl bg-[#FBF9F4] text-[#625C52] text-xs font-semibold hover:bg-[#F7F3EA] border border-[#E4DDD0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Create Task</span>
          </button>
        </div>
      </form>
    </div>
  );
};
