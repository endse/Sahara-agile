import React, { useState, useEffect } from 'react';
import { ScreenId, TransitionType, TeamMember } from '../../types';

interface NewProjectScreenProps {
  team: TeamMember[];
  onAddProject: (projectData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    region: string;
    lead: string;
    status: 'planned' | 'active' | 'completed';
  }) => void;
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const NewProjectScreen: React.FC<NewProjectScreenProps> = ({
  team,
  onAddProject,
  onNavigate,
}) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  }, []);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [region, setRegion] = useState('Sector 1 - Core Platform');
  const [lead, setLead] = useState(team[0]?.name || 'Amara Vance');
  const [status, setStatus] = useState<'planned' | 'active' | 'completed'>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    onAddProject({
      name: name.trim(),
      description: description.trim(),
      startDate: formatDateStr(startDate) || startDate,
      endDate: formatDateStr(endDate) || endDate,
      region,
      lead,
      status,
    });

    onNavigate('Projects', 'none');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E4DDD0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C49A5A] text-[#0D0D0B] flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-xl">add_location_alt</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#171512]">New Project</h1>
            <p className="text-xs text-[#625C52]">Register a new project workspace and assign leads</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('Projects', 'none')}
          className="p-2 rounded-xl bg-white hover:bg-[#FBF9F4] text-[#625C52] transition-colors border border-[#E4DDD0] flex items-center gap-2 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-base">close</span>
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="project-name" className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              Project Name *
            </label>
            <input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Real-Time Telemetry & API Websocket Stream"
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-start-date" className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              Start Date *
            </label>
            <input
              id="project-start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-end-date" className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              End Date *
            </label>
            <input
              id="project-end-date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-region" className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              Region / Sector
            </label>
            <select
              id="project-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            >
              <option value="Sector 1 - Core Platform">Sector 1 - Core Platform</option>
              <option value="Sector 2 - ML Pipeline">Sector 2 - ML Pipeline</option>
              <option value="Sector 3 - Kubernetes Cluster">Sector 3 - Kubernetes Cluster</option>
              <option value="Sector 4 - Cybersecurity">Sector 4 - Cybersecurity</option>
              <option value="Sector 5 - Frontend UI/UX">Sector 5 - Frontend UI/UX</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-lead" className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              Project Lead
            </label>
            <select
              id="project-lead"
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-4 py-2.5 text-xs font-medium text-[#171512] outline-none transition-colors"
            >
              {team.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              Initial Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(['planned', 'active', 'completed'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    status === st
                      ? 'bg-[#C49A5A] text-[#0D0D0B] shadow-xs'
                      : 'bg-[#FBF9F4] text-[#625C52] hover:bg-[#F7F3EA] border border-[#E4DDD0]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label htmlFor="project-overview" className="text-xs font-bold text-[#171512] uppercase tracking-wider">
              Project Overview & Objectives
            </label>
            <textarea
              id="project-overview"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project operational scope, deliverables, and timelines..."
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl p-3 text-xs font-medium text-[#171512] outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('Projects', 'none')}
            className="px-4 py-2.5 rounded-xl bg-[#FBF9F4] text-[#625C52] text-xs font-semibold hover:bg-[#F7F3EA] border border-[#E4DDD0] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">check</span>
            <span>Save Project</span>
          </button>
        </div>
      </form>
    </div>
  );
};
