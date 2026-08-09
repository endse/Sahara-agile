import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
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
  onSelectTask,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'tasks' | 'team' | 'locations' | 'timeline'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Pin scroll position strictly to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
    // Auto focus search input
    const timer = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Listen for Escape key to close Global Search with clean slide_down transition
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNavigate('Dashboard', 'slide_down');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate]);

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.code.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
      t.region?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTeam = team.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.role.toLowerCase().includes(query.toLowerCase()) ||
      m.location?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.region.toLowerCase().includes(query.toLowerCase()) ||
      l.lead.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTimeline = timeline.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.phase.toLowerCase().includes(query.toLowerCase()) ||
      m.lead.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults =
    filteredTasks.length + filteredTeam.length + filteredLocations.length + filteredTimeline.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#FDF8F3] p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 self-start w-full"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5D5C0] pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8B5E3C] text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-2xl">search</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl lg:text-3xl font-light text-[#2D241E] tracking-tight">
                Global Search Engine
              </h1>
              <span className="bg-[#8B5E3C]/10 text-[#8B5E3C] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#8B5E3C]/20 hidden sm:inline-block">
                ⌘K / Esc
              </span>
            </div>
            <p className="text-xs text-[#8B5E3C]">
              Cross-index tasks, team roster, site locations, and milestone phases
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('Dashboard', 'slide_down')}
          className="px-3.5 py-2 rounded-2xl bg-[#F3E9DC] hover:bg-[#E5D5C0] text-[#5C4D42] transition-all border border-[#E5D5C0] flex items-center gap-1.5 text-xs font-bold shadow-2xs hover:scale-105 active:scale-95"
          title="Close Search (Esc)"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Input Search Box */}
      <div className="relative shadow-sm rounded-2xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#8B5E3C]">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by code (SAH-801), task title, team member, or sector..."
          className="w-full bg-[#F3E9DC] border border-[#E5D5C0] focus:border-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]/20 rounded-2xl pl-12 pr-12 py-4 text-base font-medium text-[#3D3028] placeholder-[#8B5E3C]/60 transition-all outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B5E3C] hover:text-[#3D3028] transition-colors"
            title="Clear input"
          >
            <span className="material-symbols-outlined text-xl">cancel</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D5C0] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'tasks', 'team', 'locations', 'timeline'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                activeFilter === filter
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] shadow-xs'
                  : 'bg-[#F3E9DC] text-[#5C4D42] border-[#E5D5C0] hover:bg-[#E5D5C0]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-[#8B5E3C]">
          {totalResults} {totalResults === 1 ? 'Result' : 'Results'} Found
        </span>
      </div>

      {/* Search Results Display */}
      <div className="space-y-6">
        {/* Tasks Section */}
        {(activeFilter === 'all' || activeFilter === 'tasks') && filteredTasks.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#8B5E3C]">view_kanban</span>
              <span>Tasks ({filteredTasks.length})</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    if (onSelectTask) onSelectTask(task);
                    onNavigate('TaskBoardActivity', 'push');
                  }}
                  className="bg-[#F3E9DC] hover:bg-white border border-[#E5D5C0] rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs hover:shadow-sm hover:border-[#8B5E3C]/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#8B5E3C] text-white">
                        {task.code}
                      </span>
                      <span className="text-sm font-bold text-[#3D3028]">{task.title}</span>
                    </div>
                    <p className="text-xs text-[#5C4D42] line-clamp-1">{task.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-[#8B5E3C] font-semibold hidden sm:inline">{task.region}</span>
                    <span className="material-symbols-outlined text-lg text-[#8B5E3C]">chevron_right</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Members Section */}
        {(activeFilter === 'all' || activeFilter === 'team') && filteredTeam.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#8B5E3C]">group</span>
              <span>Team Members ({filteredTeam.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  onClick={() => onNavigate('TeamSync', 'none')}
                  className="bg-[#F3E9DC] hover:bg-white border border-[#E5D5C0] rounded-2xl p-4 transition-all cursor-pointer flex items-center gap-3 shadow-2xs hover:shadow-sm"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#D4A373] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[#3D3028] truncate">{member.name}</h4>
                    <p className="text-xs text-[#8B5E3C] truncate">{member.role}</p>
                    <span className="text-[10px] text-emerald-800 font-bold truncate block">{member.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Field Hubs Section */}
        {(activeFilter === 'all' || activeFilter === 'locations') && filteredLocations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#8B5E3C]">pin_drop</span>
              <span>Field Hubs & GIS Locations ({filteredLocations.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => onNavigate('ProjectMap', 'none')}
                  className="bg-[#F3E9DC] hover:bg-white border border-[#E5D5C0] rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:shadow-sm"
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#3D3028]">{loc.name}</h4>
                    <p className="text-xs text-[#8B5E3C]">{loc.region}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-900 border border-amber-500/30">
                    {loc.temperature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestone Timeline Section */}
        {(activeFilter === 'all' || activeFilter === 'timeline') && filteredTimeline.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#8B5E3C] uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#8B5E3C]">timeline</span>
              <span>Milestone Phases ({filteredTimeline.length})</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {filteredTimeline.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('ProjectTimeline', 'none')}
                  className="bg-[#F3E9DC] hover:bg-white border border-[#E5D5C0] rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between shadow-2xs hover:shadow-sm"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider">{item.phase}</span>
                    <h4 className="text-sm font-bold text-[#3D3028]">{item.title}</h4>
                  </div>
                  <span className="text-xs text-[#8B5E3C] font-semibold">{item.startDate} - {item.endDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty Search State */}
        {totalResults === 0 && (
          <div className="text-center py-12 bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-8 space-y-3 shadow-xs">
            <span className="material-symbols-outlined text-4xl text-[#8B5E3C]/60">search_off</span>
            <h3 className="font-headline text-xl font-bold text-[#3D3028]">No direct matches found</h3>
            <p className="text-xs text-[#8B5E3C] max-w-md mx-auto">
              Try searching for terms like "hydro", "solar", "Amara", "Djanet", or "SAH-801".
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
