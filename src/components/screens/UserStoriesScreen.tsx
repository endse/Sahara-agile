import React, { useState } from 'react';
import { UserStory, SiteLocation, Task, TeamMember } from '../../types';
import { saveStory } from '../../services/firestoreService';

interface UserStoriesScreenProps {
  stories: UserStory[];
  locations: SiteLocation[];
  tasks: Task[];
  team?: TeamMember[];
  onAddStory?: (story: UserStory) => Promise<void> | void;
  onAddTask?: (task: Task) => Promise<void> | void;
  onOpenMobileMenu: () => void;
  onNavigate: (screen: any) => void;
}

export const UserStoriesScreen: React.FC<UserStoriesScreenProps> = ({
  stories,
  locations,
  tasks,
  team = [],
  onAddStory,
  onAddTask,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [newStory, setNewStory] = useState({
    projectId: locations[0]?.id || 'LOC-1',
    title: '',
    description: '',
    points: 5,
    assigneeName: 'Amara Vance',
    criteriaText: '',
  });

  const [taskModalStory, setTaskModalStory] = useState<UserStory | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskError, setNewTaskError] = useState<string | null>(null);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  const filteredStories =
    selectedProjectId === 'all'
      ? stories
      : stories.filter((s) => s.projectId === selectedProjectId);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoryError(null);
    if (!newStory.title.trim()) {
      setStoryError('Please enter a story title.');
      document.getElementById('story-title-input')?.focus();
      return;
    }

    const proj = locations.find((l) => l.id === newStory.projectId);
    const created: UserStory = {
      id: `US-${Date.now().toString().slice(-4)}`,
      projectId: newStory.projectId,
      projectName: proj?.name || 'General Project',
      title: newStory.title,
      description: newStory.description,
      acceptanceCriteria: newStory.criteriaText
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
      points: Number(newStory.points) || 3,
      status: 'in_progress',
      assigneeName: newStory.assigneeName,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    try {
      await onAddStory?.(created);
      setIsModalOpen(false);
      setStoryError(null);
      setNewStory({
        projectId: locations[0]?.id || 'LOC-1',
        title: '',
        description: '',
        points: 5,
        assigneeName: 'Amara Vance',
        criteriaText: '',
      });
    } catch {
      setStoryError('Failed to save user story. Please check your connection and try again.');
    }
  };

  const handleStatusChange = async (story: UserStory, newStatus: UserStory['status']) => {
    const updated: UserStory = {
      ...story,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    try {
      await saveStory(updated);
    } catch (err) {
      console.error('[UserStoriesScreen] Failed to update story status:', err);
      // Could show a toast or error here
    }
  };

  const handleAddTaskToStory = (story: UserStory) => {
    setTaskModalStory(story);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskAssigneeId(team.find((m) => m.name === story.assigneeName)?.id || team[0]?.id || '');
    setNewTaskError(null);
  };

  const handleAddTaskToStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTaskSubmitting) return;
    setNewTaskError(null);
    if (!taskModalStory) return;
    if (!newTaskTitle.trim()) {
      setNewTaskError('Please enter a task title.');
      return;
    }

    const chosenAssignee = newTaskAssigneeId ? team.find((m) => m.id === newTaskAssigneeId) : undefined;
    const assignee = chosenAssignee
      ? { name: chosenAssignee.name, avatar: chosenAssignee.avatar, role: chosenAssignee.role }
      : {
          name: taskModalStory.assigneeName || 'Unassigned',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: 'Team Member',
        };

    const newTask: Task = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      code: `SAH-${Math.floor(100 + Math.random() * 900)}`,
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority,
      assignee,
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      progress: 0,
      tags: ['Story Task'],
      storyId: taskModalStory.id,
      projectId: taskModalStory.projectId,
      updatedAt: 'Just now',
    };

    setIsTaskSubmitting(true);
    try {
      await onAddTask?.(newTask);
      setTaskModalStory(null);
      setNewTaskTitle('');
    } catch {
      setNewTaskError('Failed to save task. Please check your connection and try again.');
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header & Filter Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#E4DDD0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C49A5A]/15 text-[#A8793A] flex items-center justify-center border border-[#C49A5A]/30">
            <span className="material-symbols-outlined text-xl">auto_stories</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#171512]">User Stories & Backlog</h2>
            <p className="text-xs text-[#625C52]">Filter user requirements by parent project and manage acceptance criteria</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="project-filter-select" className="text-xs font-semibold text-[#171512]">Filter Project:</label>
            <select
              id="project-filter-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#FBF9F4] border border-[#E4DDD0] text-xs font-semibold text-[#171512] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C49A5A]"
            >
              <option value="all">All Projects ({locations.length})</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.region})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>+ New User Story</span>
          </button>
        </div>
      </div>

      {/* Agile Hierarchy Banner */}
      <div className="bg-[#FBF9F4] border border-[#E4DDD0] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#625C52]">
        <span className="material-symbols-outlined text-[#A8793A] text-base mt-0.5">info</span>
        <div>
          <span className="font-bold text-[#171512]">Agile Hierarchy: </span>
          <span>Projects contain User Stories, which break down into actionable Tasks.</span>
        </div>
      </div>

      {/* Stories List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredStories.map((story) => {
          const childTasks = tasks.filter((t) => t.storyId === story.id);
          const projName =
            story.projectName ||
            locations.find((l) => l.id === story.projectId)?.name ||
            'Unassigned Project';

          return (
            <div
              key={story.id}
              className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4 hover:border-[#C49A5A] transition-all"
            >
              {/* Story Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E4DDD0] pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#C49A5A]/20 text-[#A8793A] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C49A5A]/30">
                      {story.id}
                    </span>
                    <span className="text-xs font-semibold text-[#625C52] bg-[#FBF9F4] px-2.5 py-0.5 rounded-full border border-[#E4DDD0]">
                      Project: {projName}
                    </span>
                    <span className="bg-[#171613] text-[#F7F3EA] text-[10px] font-bold px-2 py-0.5 rounded">
                      {story.points} Story Points
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#171512]">{story.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={story.status}
                    onChange={(e) => handleStatusChange(story, e.target.value as any)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      story.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : story.status === 'in_progress'
                        ? 'bg-[#C49A5A]/20 text-[#A8793A] border-[#C49A5A]/30'
                        : story.status === 'testing'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-[#FBF9F4] text-[#625C52] border-[#E4DDD0]'
                    }`}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => handleAddTaskToStory(story)}
                    className="bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-colors"
                    title="Add child task to this story"
                  >
                    <span className="material-symbols-outlined text-sm text-[#A8793A]">add_task</span>
                    <span>Add Task</span>
                  </button>
                </div>
              </div>

              {/* Requirement & Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-[#8A8378] uppercase tracking-wider">User Requirement</p>
                  <p className="text-xs text-[#171512] leading-relaxed bg-[#FBF9F4] p-3 rounded-xl border border-[#E4DDD0]">
                    {story.description}
                  </p>
                  <div className="text-[11px] text-[#625C52] pt-1">
                    Lead: <strong className="text-[#171512]">{story.assigneeName || 'Unassigned'}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-[#8A8378] uppercase tracking-wider">Acceptance Criteria</p>
                  <ul className="space-y-1.5">
                    {story.acceptanceCriteria?.map((crit, idx) => (
                      <li key={idx} className="text-xs text-[#171512] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#A8793A] text-base">check_circle</span>
                        <span>{crit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sub-Tasks Section */}
              <div className="bg-[#FBF9F4] rounded-xl p-3.5 border border-[#E4DDD0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171512] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#8A8378]">task</span>
                    Sub-Tasks Linked to Story ({childTasks.length})
                  </span>
                  <span className="text-[10px] font-semibold text-[#625C52]">
                    {childTasks.filter((t) => t.status === 'done').length} / {childTasks.length} Completed
                  </span>
                </div>

                {childTasks.length === 0 ? (
                  <p className="text-xs text-[#8A8378] italic py-1">No tasks linked yet. Click "Add Task" to create one.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {childTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white p-2.5 rounded-lg border border-[#E4DDD0] text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#171512]">{t.code}</span>
                          <span className="text-[10px] uppercase font-semibold text-[#A8793A]">{t.status.replace('_', ' ')}</span>
                        </div>
                        <p className="font-semibold text-[#171512] line-clamp-1">{t.title}</p>
                        <p className="text-[10px] text-[#625C52]">Assignee: {t.assignee.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create User Story Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DDD0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-3">
              <h3 className="text-base font-bold text-[#171512] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A8793A]">auto_stories</span>
                Create User Story
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A8378] hover:text-[#171512]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3">
              {storyError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{storyError}</span>
                </div>
              )}

              <div>
                <label htmlFor="story-parent-project" className="block text-xs font-semibold text-[#171512] mb-1">Parent Project</label>
                <select
                  id="story-parent-project"
                  value={newStory.projectId}
                  onChange={(e) => setNewStory({ ...newStory, projectId: e.target.value })}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="story-title-input" className="block text-xs font-semibold text-[#171512] mb-1">Story Title</label>
                <input
                  id="story-title-input"
                  type="text"
                  required
                  placeholder="e.g. Real-time telemetry dashboard stream"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                />
              </div>

              <div>
                <label htmlFor="story-desc-input" className="block text-xs font-semibold text-[#171512] mb-1">Description</label>
                <textarea
                  id="story-desc-input"
                  rows={2}
                  placeholder="As a [role], I want [goal] so that [benefit]..."
                  value={newStory.description}
                  onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                />
              </div>

              <div>
                <label htmlFor="story-criteria-input" className="block text-xs font-semibold text-[#171512] mb-1">
                  Acceptance Criteria (1 per line)
                </label>
                <textarea
                  id="story-criteria-input"
                  rows={3}
                  placeholder={'e.g. Stream pressure data every 15 mins\nTrigger alarm on low threshold'}
                  value={newStory.criteriaText}
                  onChange={(e) => setNewStory({ ...newStory, criteriaText: e.target.value })}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="story-points-input" className="block text-xs font-semibold text-[#171512] mb-1">Story Points</label>
                  <input
                    id="story-points-input"
                    type="number"
                    min={1}
                    max={21}
                    value={newStory.points}
                    onChange={(e) => setNewStory({ ...newStory, points: Number(e.target.value) })}
                    className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                  />
                </div>
                <div>
                  <label htmlFor="story-assignee-input" className="block text-xs font-semibold text-[#171512] mb-1">Assignee Lead</label>
                  <input
                    id="story-assignee-input"
                    type="text"
                    value={newStory.assigneeName}
                    onChange={(e) => setNewStory({ ...newStory, assigneeName: e.target.value })}
                    placeholder="e.g. Amara Vance"
                    className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DDD0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#625C52] hover:bg-[#FBF9F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Save User Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task to Story Modal */}
      {taskModalStory && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DDD0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-3">
              <h3 className="text-base font-bold text-[#171512] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A8793A]">add_task</span>
                Add Task to Story
              </h3>
              <button
                onClick={() => setTaskModalStory(null)}
                className="text-[#8A8378] hover:text-[#171512]"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-[#625C52] bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-3">
              Story: <strong className="text-[#171512]">{taskModalStory.id} - {taskModalStory.title}</strong>
            </p>

            <form onSubmit={handleAddTaskToStorySubmit} className="space-y-3">
              {newTaskError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{newTaskError}</span>
                </div>
              )}

              <div>
                <label htmlFor="story-task-title" className="block text-xs font-semibold text-[#171512] mb-1">Task Title *</label>
                <input
                  id="story-task-title"
                  type="text"
                  required
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => { setNewTaskTitle(e.target.value); setNewTaskError(null); }}
                  placeholder="e.g. Build acceptance test suite"
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                />
              </div>

              <div>
                <label htmlFor="story-task-priority" className="block text-xs font-semibold text-[#171512] mb-1">Priority</label>
                <select
                  id="story-task-priority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as Task['priority'])}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label htmlFor="story-task-assignee" className="block text-xs font-semibold text-[#171512] mb-1">Assignee</label>
                <select
                  id="story-task-assignee"
                  value={newTaskAssigneeId}
                  onChange={(e) => { setNewTaskAssigneeId(e.target.value); setNewTaskError(null); }}
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                >
                  <option value="">Unassigned</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DDD0]">
                <button
                  type="button"
                  onClick={() => setTaskModalStory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#625C52] hover:bg-[#FBF9F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTaskSubmitting}
                  className="bg-[#C49A5A] hover:bg-[#A8793A] disabled:opacity-60 disabled:cursor-not-allowed text-[#0D0D0B] px-4 py-2 rounded-xl text-xs font-bold"
                >
                  {isTaskSubmitting ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
