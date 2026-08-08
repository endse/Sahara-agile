import React, { useState } from 'react';
import { ScreenId, Task, TeamMember, SiteLocation, TimelineMilestone } from '../../types';

interface GlobalSearchProps {
  tasks: Task[];
  team: TeamMember[];
  locations: SiteLocation[];
  timeline: TimelineMilestone[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
  onSelectTask?: (task: Task) => void;
}

export const GlobalSearchScreen: React.FC<GlobalSearchProps> = ({
  tasks,
  team,
  locations,
  timeline,
  onNavigate,
  onSelectTask
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'team' | 'locations' | 'timeline'>('all');

  const filteredTasks = tasks.filter(
    t => t.title.toLowerCase().includes(query.toLowerCase()) ||
         t.code.toLowerCase().includes(query.toLowerCase()) ||
         t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
         t.region?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTeam = team.filter(
    m => m.name.toLowerCase().includes(query.toLowerCase()) ||
         m.role.toLowerCase().includes(query.toLowerCase()) ||
         m.location?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLocations = locations.filter(
    l => l.name.toLowerCase().includes(query.toLowerCase()) ||
         l.region.toLowerCase().includes(query.toLowerCase()) ||
         l.lead.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTimeline = timeline.filter(
    m => m.title.toLowerCase().includes(query.toLowerCase()) ||
         m.phase.toLowerCase().includes(query.toLowerCase()) ||
         m.lead.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#faf5ee] p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#e0d8cc] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c2652a] text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">search</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl lg:text-3xl font-bold text-[#3a302a]">Global Search - Sahara</h1>
            <p className="text-xs text-[#78706a]">Cross-index tasks, team members, geographical sites, and timelines</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('Dashboard', 'slide_down')}
          className="p-2.5 rounded-xl bg-[#f2ece4] hover:bg-[#e6e0d6] text-[#605850] transition-colors border border-[#e0d8cc] flex items-center gap-2 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#9a9088]">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to search tasks, hydrologic logs, solar arrays, or team members..."
          autoFocus
          className="w-full bg-[#f2ece4] border border-[#d8d0c8] focus:border-[#c2652a] focus:ring-2 focus:ring-[#c2652a]/20 rounded-2xl pl-12 pr-12 py-4 text-base font-medium text-[#3a302a] placeholder-[#9a9088] transition-all outline-none shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9088] hover:text-[#3a302a]"
          >
            <span className="material-symbols-outlined text-xl">cancel</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e0d8cc] pb-3">
        {(['all', 'tasks', 'team', 'locations', 'timeline'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeFilter === filter
                ? 'bg-[#c2652a] text-white shadow-xs'
                : 'bg-[#f2ece4] text-[#605850] hover:bg-[#e6e0d6]'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {/* Tasks Results */}
        {(activeFilter === 'all' || activeFilter === 'tasks') && filteredTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#78706a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c2652a]">view_kanban</span>
              Tasks ({filteredTasks.length})
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    if (onSelectTask) onSelectTask(task);
                    onNavigate('TaskBoardActivity', 'push');
                  }}
                  className="bg-[#f2ece4] hover:bg-[#faf5ee] border border-[#e0d8cc] rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e6e0d6] text-[#3a302a]">
                        {task.code}
                      </span>
                      <span className="text-xs font-bold text-[#3a302a]">{task.title}</span>
                    </div>
                    <p className="text-xs text-[#78706a] line-clamp-1">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#605850] hidden sm:inline">{task.region}</span>
                    <span className="material-symbols-outlined text-lg text-[#c2652a]">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Results */}
        {(activeFilter === 'all' || activeFilter === 'team') && filteredTeam.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#78706a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c2652a]">group</span>
              Team Members ({filteredTeam.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  onClick={() => onNavigate('TeamSync', 'none')}
                  className="bg-[#f2ece4] hover:bg-[#faf5ee] border border-[#e0d8cc] rounded-xl p-3.5 transition-all cursor-pointer flex items-center gap-3"
                >
                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border border-[#c2652a]" />
                  <div>
                    <h4 className="text-sm font-bold text-[#3a302a]">{member.name}</h4>
                    <p className="text-xs text-[#78706a]">{member.role}</p>
                    <span className="text-[10px] text-[#c2652a] font-medium">{member.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations Results */}
        {(activeFilter === 'all' || activeFilter === 'locations') && filteredLocations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#78706a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c2652a]">pin_drop</span>
              Field Hubs & Locations ({filteredLocations.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => onNavigate('ProjectMap', 'none')}
                  className="bg-[#f2ece4] hover:bg-[#faf5ee] border border-[#e0d8cc] rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#3a302a]">{loc.name}</h4>
                    <p className="text-xs text-[#78706a]">{loc.region}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[#e6e0d6] text-[#3a302a]">
                    {loc.temperature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Results */}
        {(activeFilter === 'all' || activeFilter === 'timeline') && filteredTimeline.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#78706a] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#c2652a]">timeline</span>
              Milestone Phases ({filteredTimeline.length})
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {filteredTimeline.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('ProjectTimeline', 'none')}
                  className="bg-[#f2ece4] hover:bg-[#faf5ee] border border-[#e0d8cc] rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#c2652a] uppercase">{item.phase}</span>
                    <h4 className="text-sm font-bold text-[#3a302a]">{item.title}</h4>
                  </div>
                  <span className="text-xs text-[#78706a]">{item.startDate} - {item.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && filteredTeam.length === 0 && filteredLocations.length === 0 && (
          <div className="text-center py-12 bg-[#f2ece4] border border-[#e0d8cc] rounded-2xl p-8 space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#9a9088]">search_off</span>
            <h3 className="font-headline text-xl font-bold text-[#3a302a]">No direct matches found</h3>
            <p className="text-xs text-[#78706a] max-w-md mx-auto">
              Try searching for broad terms like "hydro", "solar", "Vance", "Djanet", or "shield".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
