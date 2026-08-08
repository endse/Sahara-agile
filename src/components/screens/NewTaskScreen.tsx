import React, { useState } from 'react';
import { ScreenId, Task, TeamMember, SiteLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface NewTaskProps {
  team: TeamMember[];
  locations: SiteLocation[];
  onAddTask: (task: Task) => void;
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
}

export const NewTaskScreen: React.FC<NewTaskProps> = ({
  team,
  locations,
  onAddTask,
  onNavigate
}) => {
  const { userProfile } = useAuth();

  // Combine team with current user profile if logged in
  const currentUserMember: TeamMember | null = userProfile
    ? {
        id: userProfile.uid,
        name: userProfile.displayName || 'Current Operator',
        role: userProfile.role || 'Field Operator',
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
  const [tagsInput, setTagsInput] = useState('Hydrology, Sensor');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenAssignee = combinedTeam.find(t => t.id === assigneeId) || combinedTeam[0];
    const chosenLocation = locations.find(l => l.id === locationId) || locations[0];

    const newTask: Task = {
      id: `TASK-${Date.now()}`,
      code,
      title,
      status,
      priority,
      assignee: {
        name: chosenAssignee.name,
        avatar: chosenAssignee.avatar,
        role: chosenAssignee.role
      },
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
      updatedAt: 'Just now',
      timeSpent: '0h'
    };

    onAddTask(newTask);
    onNavigate('TaskBoard', 'slide_down');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5D5C0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D4A373] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">add_task</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl lg:text-3xl font-light text-[#2D241E]">New Task - Sahara</h1>
            <p className="text-xs text-[#8B5E3C]">Dispatch field task or research mission to regional station</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('TaskBoard', 'slide_down')}
          className="p-2.5 rounded-2xl bg-[#FDF8F3] hover:bg-white text-[#5C4D42] transition-colors border border-[#E5D5C0] flex items-center gap-2 text-xs font-medium"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Task Title */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Mission Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Subsurface Aquifer Pressure Log Audit"
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-sm font-semibold text-[#3D3028] outline-none"
            />
          </div>

          {/* Task Code */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Task Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-mono font-bold text-[#3D3028] outline-none"
            />
          </div>

          {/* Initial Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
            </select>
          </div>

          {/* Priority Pills */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Priority Level</label>
            <div className="flex flex-wrap gap-2">
              {(['urgent', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase transition-colors ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-[#BC4749] text-white shadow-xs'
                        : p === 'high'
                        ? 'bg-[#D4A373] text-white shadow-xs'
                        : 'bg-[#606C38] text-white shadow-xs'
                      : 'bg-[#FDF8F3] text-[#5C4D42] hover:bg-[#E5D5C0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Field Lead / Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none"
            >
              {combinedTeam.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.role}
                </option>
              ))}
            </select>
          </div>

          {/* Geotagged Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Geotag Field Hub</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.region})
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Target Due Date</label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Solar, Infrastructure, Survey"
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Mission Briefing & Notes</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide operational guidelines, safety thresholds, and required sensor parameters..."
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-2xl p-4 text-xs font-medium text-[#3D3028] outline-none"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#E5D5C0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('TaskBoard', 'slide_down')}
            className="px-5 py-2.5 rounded-2xl bg-[#FDF8F3] text-[#5C4D42] text-xs font-medium border border-[#E5D5C0] hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Dispatch Mission</span>
          </button>
        </div>
      </form>
    </div>
  );
};
