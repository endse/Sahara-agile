import React, { useState } from 'react';
import { UserStory, SiteLocation, Task } from '../../types';
import { saveStory, saveTask } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface UserStoriesScreenProps {
  stories: UserStory[];
  locations: SiteLocation[];
  tasks: Task[];
  onOpenMobileMenu: () => void;
  onNavigate: (screen: any) => void;
}

export const UserStoriesScreen: React.FC<UserStoriesScreenProps> = ({
  stories,
  locations,
  tasks,
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { userProfile } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    projectId: locations[0]?.id || 'LOC-1',
    title: '',
    description: '',
    points: 5,
    assigneeName: 'Amara Vance',
    criteriaText: '',
  });

  const filteredStories = selectedProjectId === 'all'
    ? stories
    : stories.filter((s) => s.projectId === selectedProjectId);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStory.title.trim()) return;

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
      teamId: userProfile?.teamId || '',
    };

    await saveStory(created);
    setIsModalOpen(false);
    setNewStory({
      projectId: locations[0]?.id || 'LOC-1',
      title: '',
      description: '',
      points: 5,
      assigneeName: 'Amara Vance',
      criteriaText: '',
    });
  };

  const handleStatusChange = async (story: UserStory, newStatus: UserStory['status']) => {
    const updated: UserStory = {
      ...story,
      status: newStatus,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    await saveStory(updated);
  };

  const handleAddTaskToStory = async (story: UserStory) => {
    const taskTitle = prompt(`Enter new Task title for story: "${story.title}"`);
    if (!taskTitle) return;

    const newTask: Task = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      code: `SAH-${Math.floor(100 + Math.random() * 900)}`,
      title: taskTitle,
      status: 'todo',
      priority: 'medium',
      assignee: {
        name: story.assigneeName || 'Unassigned',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Field Operator',
      },
      dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      progress: 0,
      tags: ['Story Task'],
      storyId: story.id,
      projectId: story.projectId,
      updatedAt: new Date().toISOString(),
      teamId: userProfile?.teamId || '',
    };

    await saveTask(newTask);
    alert(`Task "${taskTitle}" linked to Story ${story.id} created!`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FDF8F3] overflow-y-auto">
      <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Project Selector & Filter Header */}
        <div className="bg-[#F3E9DC] p-4 rounded-2xl border border-[#E5D5C0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#8B5E3C]">account_tree</span>
            <div>
              <h2 className="text-sm font-bold text-[#3D3028]">Filter Hierarchy by Project</h2>
              <p className="text-xs text-[#8B5E3C]">Map requirements from top-level projects down to tasks</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="project-filter-select" className="text-xs font-semibold text-[#5C4D42]">Project:</label>
              <select
                id="project-filter-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-[#FDF8F3] border border-[#E5D5C0] text-xs font-medium text-[#3D3028] px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
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
              className="bg-[#606C38] hover:bg-[#4d572d] text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>New User Story</span>
            </button>
          </div>
        </div>

        {/* Hierarchy Explanation Banner */}
        <div className="bg-[#D4A373]/10 border border-[#D4A373]/30 rounded-2xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#D4A373] mt-0.5">info</span>
          <div className="text-xs text-[#5C4D42] space-y-1">
            <p className="font-bold text-[#3D3028]">Agile Work Structure:</p>
            <p>
              1. <strong>Project (Site Location):</strong> High-level field mission (e.g. Al-Kufra Deep Well Site A)
            </p>
            <p>
              2. <strong>User Story:</strong> Functional goal describing business or operator value.
            </p>
            <p>
              3. <strong>Tasks:</strong> Granular work items assigned to team members to complete the story.
            </p>
          </div>
        </div>

        {/* Stories List Grid */}
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
                className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#D4A373] transition-all"
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E5D5C0] pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#8B5E3C] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {story.id}
                      </span>
                      <span className="text-xs font-semibold text-[#8B5E3C] bg-[#F3E9DC] px-2.5 py-0.5 rounded-full border border-[#E5D5C0]">
                        Project: {projName}
                      </span>
                      <span className="bg-[#2A9D8F]/10 text-[#2A9D8F] text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {story.points} Story Points
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#3D3028]">{story.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={story.status}
                      onChange={(e) => handleStatusChange(story, e.target.value as any)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                        story.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : story.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : story.status === 'testing'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
                      }`}
                    >
                      <option value="backlog">Backlog</option>
                      <option value="in_progress">In Progress</option>
                      <option value="testing">Testing</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => handleAddTaskToStory(story)}
                      className="bg-[#606C38] hover:bg-[#4d572d] text-white text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1 transition-colors"
                      title="Add child task to this story"
                    >
                      <span className="material-symbols-outlined text-sm">add_task</span>
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* Body & Acceptance Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">User Requirement</p>
                    <p className="text-xs text-[#5C4D42] leading-relaxed bg-[#F3E9DC]/40 p-3 rounded-xl border border-[#E5D5C0]/60">
                      {story.description}
                    </p>
                    <div className="text-[11px] text-[#8B5E3C] pt-1">
                      Assignee: <strong>{story.assigneeName || 'Unassigned'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider">Acceptance Criteria</p>
                    <ul className="space-y-1.5">
                      {story.acceptanceCriteria?.map((crit, idx) => (
                        <li key={idx} className="text-xs text-[#3D3028] flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                          <span>{crit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Child Tasks Section */}
                <div className="bg-[#F3E9DC]/60 rounded-xl p-3 border border-[#E5D5C0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3D3028] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#8B5E3C]">task</span>
                      Sub-Tasks linked to story ({childTasks.length})
                    </span>
                    <span className="text-[10px] text-[#8B5E3C]">
                      {childTasks.filter((t) => t.status === 'done').length} / {childTasks.length} Completed
                    </span>
                  </div>

                  {childTasks.length === 0 ? (
                    <p className="text-xs text-[#8B5E3C] italic py-1">No tasks linked yet. Click "Add Task" to create one.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {childTasks.map((t) => (
                        <div
                          key={t.id}
                          className="bg-white p-2.5 rounded-lg border border-[#E5D5C0] text-xs space-y-1 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#8B5E3C]">{t.code}</span>
                            <span className="text-[10px] uppercase font-semibold text-[#D4A373]">{t.status.replace('_', ' ')}</span>
                          </div>
                          <p className="font-medium text-[#3D3028] line-clamp-1">{t.title}</p>
                          <p className="text-[10px] text-gray-500">Assigned: {t.assignee.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for creating a new User Story */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-[#E5D5C0] pb-3">
              <h3 className="text-lg font-bold text-[#3D3028] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">auto_stories</span>
                Create User Story
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#5C4D42] hover:text-[#3D3028]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-3">
              <div>
                <label htmlFor="story-parent-project" className="block text-xs font-semibold text-[#5C4D42] mb-1">Parent Project</label>
                <select
                  id="story-parent-project"
                  value={newStory.projectId}
                  onChange={(e) => setNewStory({ ...newStory, projectId: e.target.value })}
                  className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 text-xs text-[#3D3028]"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="story-title-input" className="block text-xs font-semibold text-[#5C4D42] mb-1">User Story Title</label>
                <input
                  id="story-title-input"
                  type="text"
                  required
                  placeholder="e.g. Automated Pressure Sensor Calibration"
                  value={newStory.title}
                  onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                  className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 text-xs text-[#3D3028]"
                />
              </div>

              <div>
                <label htmlFor="story-desc-input" className="block text-xs font-semibold text-[#5C4D42] mb-1">Description (User Perspective)</label>
                <textarea
                  id="story-desc-input"
                  rows={2}
                  placeholder="As a [role], I want [goal] so that [benefit]..."
                  value={newStory.description}
                  onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                  className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 text-xs text-[#3D3028]"
                />
              </div>

              <div>
                <label htmlFor="story-criteria-input" className="block text-xs font-semibold text-[#5C4D42] mb-1">
                  Acceptance Criteria (1 per line)
                </label>
                <textarea
                  id="story-criteria-input"
                  rows={3}
                  placeholder="e.g. Calibrate sensor at 200m depth&#10;Transmit packets via SatCom relay"
                  value={newStory.criteriaText}
                  onChange={(e) => setNewStory({ ...newStory, criteriaText: e.target.value })}
                  className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 text-xs text-[#3D3028]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="story-points-input" className="block text-xs font-semibold text-[#5C4D42] mb-1">Story Points</label>
                  <input
                    id="story-points-input"
                    type="number"
                    min={1}
                    max={21}
                    value={newStory.points}
                    onChange={(e) => setNewStory({ ...newStory, points: Number(e.target.value) })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 text-xs text-[#3D3028]"
                  />
                </div>
                <div>
                  <label htmlFor="story-assignee-input" className="block text-xs font-semibold text-[#5C4D42] mb-1">Assignee Lead</label>
                  <input
                    id="story-assignee-input"
                    type="text"
                    value={newStory.assigneeName}
                    onChange={(e) => setNewStory({ ...newStory, assigneeName: e.target.value })}
                    className="w-full bg-white border border-[#E5D5C0] rounded-xl p-2.5 text-xs text-[#3D3028]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#5C4D42] hover:bg-[#E5D5C0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#606C38] hover:bg-[#4d572d] text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Save User Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
