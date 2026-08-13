import React, { useState } from 'react';
import { SiteLocation, UserStory, Task, TimelineMilestone, TeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProjectsScreenProps {
  locations: SiteLocation[];
  stories: UserStory[];
  tasks: Task[];
  timeline?: TimelineMilestone[];
  team?: TeamMember[];
  onAddTask?: (task: Task) => Promise<void> | void;
  onNavigate: (screen: any, transition?: any) => void;
  onSelectTask?: (task: Task) => void;
}

export const ProjectsScreen: React.FC<ProjectsScreenProps> = ({
  locations,
  stories,
  tasks,
  timeline = [],
  team = [],
  onAddTask,
  onNavigate,
  onSelectTask,
}) => {
  const { activeRole } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(locations[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'stories' | 'board' | 'timeline'>('overview');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('medium');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('');
  const [newTaskError, setNewTaskError] = useState<string | null>(null);
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);

  const currentProject = locations.find((l) => l.id === selectedProjectId) || locations[0];

  const projectStories = stories.filter((s) => s.projectId === currentProject?.id || (s as any).projectName === currentProject?.name);
  const projectTasks = tasks.filter(
    (t) => t.projectId === currentProject?.id || t.region === currentProject?.region
  );
  const projectMilestones = timeline.filter(
    (m) => m.title === currentProject?.name || m.region === currentProject?.region
  );

  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const progressPercentage =
    projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : currentProject?.status === 'completed' ? 100 : 40;

  const handleCreateTaskForProject = () => {
    if (!currentProject) return;
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskAssigneeId(team[0]?.id || '');
    setNewTaskError(null);
    setIsTaskModalOpen(true);
  };

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTaskSubmitting) return;
    setNewTaskError(null);

    if (!currentProject) {
      setNewTaskError('No project selected. Please choose a project first.');
      return;
    }
    if (!newTaskTitle.trim()) {
      setNewTaskError('Please enter a task title.');
      return;
    }

    const chosenAssignee = newTaskAssigneeId ? team.find((m) => m.id === newTaskAssigneeId) : undefined;
    const assignee = chosenAssignee
      ? { name: chosenAssignee.name, avatar: chosenAssignee.avatar, role: chosenAssignee.role }
      : {
          name: 'Unassigned',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: 'Unassigned'
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
      tags: ['Project Task'],
      projectId: currentProject.id,
      region: currentProject.region,
      updatedAt: 'Just now',
    };

    setIsTaskSubmitting(true);
    try {
      await onAddTask?.(newTask);
      setIsTaskModalOpen(false);
      setNewTaskTitle('');
    } catch {
      setNewTaskError('Failed to save task. Please check your connection and try again.');
    } finally {
      setIsTaskSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Project Selector */}
      <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C49A5A]/15 text-[#A8793A] border border-[#C49A5A]/30">
              Agile Hierarchy
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#171512] tracking-tight">Projects</h1>
          <p className="text-xs text-[#625C52]">
            Project ➔ User Story ➔ Task hierarchy management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="project-select" className="text-xs font-semibold text-[#171512]">Select Project:</label>
            <select
              id="project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#FBF9F4] border border-[#E4DDD0] text-xs font-semibold text-[#171512] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C49A5A]"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.region})
                </option>
              ))}
            </select>
          </div>

          {activeRole === 'Manager' && (
            <button
              onClick={() => onNavigate('NewProject', 'slide_up')}
              className="px-4 py-2 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>+ New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Hierarchy Banner */}
      <div className="bg-[#C49A5A]/10 border border-[#C49A5A]/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#625C52]">
        <span className="material-symbols-outlined text-[#A8793A] text-lg mt-0.5">account_tree</span>
        <div className="space-y-1">
          <p className="font-bold text-[#171512]">Current Project Context: {currentProject?.name}</p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#625C52]">
            <span className="font-semibold text-[#171512]">Project ({currentProject?.name})</span>
            <span>➔</span>
            <span className="font-semibold text-[#A8793A]">User Stories ({projectStories.length})</span>
            <span>➔</span>
            <span className="font-semibold text-[#171512]">Tasks ({projectTasks.length})</span>
          </div>
        </div>
      </div>

      {/* Project Navigation Tabs */}
      <div className="border-b border-[#E4DDD0] flex items-center gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'overview'
              ? 'border-[#C49A5A] text-[#A8793A] font-bold'
              : 'border-transparent text-[#625C52] hover:text-[#171512]'
          }`}
        >
          <span className="material-symbols-outlined text-base">info</span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('stories')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'stories'
              ? 'border-[#C49A5A] text-[#A8793A] font-bold'
              : 'border-transparent text-[#625C52] hover:text-[#171512]'
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_stories</span>
          <span>User Stories ({projectStories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('board')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'board'
              ? 'border-[#C49A5A] text-[#A8793A] font-bold'
              : 'border-transparent text-[#625C52] hover:text-[#171512]'
          }`}
        >
          <span className="material-symbols-outlined text-base">view_kanban</span>
          <span>Task Board ({projectTasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
            activeTab === 'timeline'
              ? 'border-[#C49A5A] text-[#A8793A] font-bold'
              : 'border-transparent text-[#625C52] hover:text-[#171512]'
          }`}
        >
          <span className="material-symbols-outlined text-base">timeline</span>
          <span>Timeline</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details Card */}
          <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#171512]">Project Details</h3>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  currentProject?.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#C49A5A]/20 text-[#A8793A]'
                }`}
              >
                {currentProject?.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FBF9F4] p-4 rounded-xl border border-[#E4DDD0] text-xs">
              <div>
                <p className="text-[#8A8378] font-medium">Project Lead</p>
                <p className="font-bold text-[#171512]">{currentProject?.lead}</p>
              </div>
              <div>
                <p className="text-[#8A8378] font-medium">Region</p>
                <p className="font-bold text-[#171512]">{currentProject?.region}</p>
              </div>
              <div>
                <p className="text-[#8A8378] font-medium">Team Crew</p>
                <p className="font-bold text-[#171512]">{currentProject?.crewCount} members</p>
              </div>
              <div>
                <p className="text-[#8A8378] font-medium">Total Tasks</p>
                <p className="font-bold text-[#171512]">{projectTasks.length}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#171512]">
                <span>Overall Project Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-[#E4DDD0] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#C49A5A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#E4DDD0]">
              <button
                onClick={handleCreateTaskForProject}
                className="px-4 py-2 bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Task to Project</span>
              </button>

              <button
                onClick={() => onNavigate('ProjectMap', 'none')}
                className="text-xs font-semibold text-[#A8793A] hover:underline flex items-center gap-1"
              >
                <span>Open Dedicated Project Map</span>
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Quick User Story Backlog */}
          <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#171512]">User Stories ({projectStories.length})</h3>
              <button
                onClick={() => setActiveTab('stories')}
                className="text-xs font-semibold text-[#A8793A] hover:underline"
              >
                Manage
              </button>
            </div>

            {projectStories.length === 0 ? (
              <p className="text-xs text-[#8A8378] italic py-4 text-center">No user stories linked yet.</p>
            ) : (
              <div className="space-y-3">
                {projectStories.map((story) => (
                  <div key={story.id} className="p-3 bg-[#FBF9F4] rounded-xl border border-[#E4DDD0] space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[#A8793A] bg-[#C49A5A]/20 px-1.5 py-0.5 rounded border border-[#C49A5A]/30">
                        {story.id}
                      </span>
                      <span className="font-semibold text-[#625C52]">{story.points} Points</span>
                    </div>
                    <p className="font-bold text-xs text-[#171512] line-clamp-1">{story.title}</p>
                    <p className="text-[11px] text-[#625C52] line-clamp-2">{story.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: User Stories */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#171512]">User Stories for {currentProject?.name}</h3>
            {activeRole === 'Manager' && (
              <button
                onClick={() => onNavigate('UserStories', 'none')}
                className="px-3.5 py-2 bg-[#C49A5A] text-[#0D0D0B] rounded-xl text-xs font-bold hover:bg-[#A8793A] transition-colors"
              >
                + New User Story
              </button>
            )}
          </div>

          {projectStories.length === 0 ? (
            <div className="bg-white border border-[#E4DDD0] rounded-2xl p-8 text-center text-xs text-[#625C52]">
              No user stories found for this project.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projectStories.map((story) => {
                const childTasks = tasks.filter((t) => t.storyId === story.id);
                return (
                  <div key={story.id} className="bg-white border border-[#E4DDD0] rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#C49A5A]/20 text-[#A8793A] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C49A5A]/30">
                          {story.id}
                        </span>
                        <h4 className="font-bold text-sm text-[#171512]">{story.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-[#625C52]">{story.points} Points</span>
                    </div>

                    <p className="text-xs text-[#625C52] bg-[#FBF9F4] p-3 rounded-xl border border-[#E4DDD0]">
                      {story.description}
                    </p>

                    <div className="pt-2 border-t border-[#E4DDD0]">
                      <p className="text-xs font-bold text-[#171512] mb-2">
                        Sub-Tasks Linked to Story ({childTasks.length})
                      </p>
                      {childTasks.length === 0 ? (
                        <p className="text-xs text-[#8A8378] italic">No tasks linked.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {childTasks.map((t) => (
                            <div key={t.id} className="bg-[#FBF9F4] p-2.5 rounded-lg border border-[#E4DDD0] text-xs">
                              <span className="font-bold text-[#171512]">{t.code}</span>: {t.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Task Board */}
      {activeTab === 'board' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#171512]">Project Tasks ({projectTasks.length})</h3>
            <button
              onClick={() => onNavigate('TaskBoard', 'none')}
              className="text-xs font-semibold text-[#A8793A] hover:underline"
            >
              Open Full Kanban Board ➔
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  if (onSelectTask) onSelectTask(t);
                  onNavigate('TaskBoardActivity', 'push');
                }}
                className="bg-white border border-[#E4DDD0] rounded-xl p-4 shadow-xs space-y-2 hover:border-[#C49A5A] cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#171512] bg-[#FBF9F4] px-1.5 py-0.5 rounded border border-[#E4DDD0]">
                    {t.code}
                  </span>
                  <span className="font-bold uppercase text-[#A8793A] bg-[#C49A5A]/20 px-2 py-0.5 rounded-full border border-[#C49A5A]/30">
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-[#171512] line-clamp-1">{t.title}</h5>
                <p className="text-[11px] text-[#625C52]">Assigned: {t.assignee.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h3 className="font-bold text-base text-[#171512]">Project Timeline & Milestones</h3>
          {projectMilestones.length === 0 ? (
            <div className="bg-white border border-[#E4DDD0] rounded-2xl p-8 text-center text-xs text-[#625C52]">
              No milestones defined for this project timeline yet.
            </div>
          ) : (
            <div className="space-y-3">
              {projectMilestones.map((m) => (
                <div key={m.id} className="bg-white border border-[#E4DDD0] rounded-xl p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#A8793A]">{m.phase}: {m.title}</span>
                    <span className="font-semibold text-[#625C52]">{m.startDate} – {m.endDate}</span>
                  </div>
                  <div className="w-full bg-[#E4DDD0] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C49A5A] h-full rounded-full" style={{ width: `${m.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {isTaskModalOpen && currentProject && (
        <div className="fixed inset-0 z-50 bg-[#0D0D0B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DDD0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-3">
              <h3 className="text-base font-bold text-[#171512] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#A8793A]">add_task</span>
                Add Task to Project
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-[#8A8378] hover:text-[#171512]"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-[#625C52] bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-3">
              Project: <strong className="text-[#171512]">{currentProject.name}</strong> ({currentProject.region})
            </p>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3">
              {newTaskError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{newTaskError}</span>
                </div>
              )}

              <div>
                <label htmlFor="project-task-title" className="block text-xs font-semibold text-[#171512] mb-1">Task Title *</label>
                <input
                  id="project-task-title"
                  type="text"
                  required
                  autoFocus
                  value={newTaskTitle}
                  onChange={(e) => { setNewTaskTitle(e.target.value); setNewTaskError(null); }}
                  placeholder="e.g. Install flow meter at borehole A"
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-2.5 text-xs text-[#171512]"
                />
              </div>

              <div>
                <label htmlFor="project-task-priority" className="block text-xs font-semibold text-[#171512] mb-1">Priority</label>
                <select
                  id="project-task-priority"
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
                <label htmlFor="project-task-assignee" className="block text-xs font-semibold text-[#171512] mb-1">Assignee</label>
                <select
                  id="project-task-assignee"
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
                  onClick={() => setIsTaskModalOpen(false)}
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
