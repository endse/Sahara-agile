import React, { useState } from 'react';
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [region, setRegion] = useState('Sector 4 - East Oasis');
  const [lead, setLead] = useState(team[0]?.name || 'Amara Vance');
  const [status, setStatus] = useState<'planned' | 'active' | 'completed'>('active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Format dates nicely if using YYYY-MM-DD
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

    // Redirect to Project Map screen as requested
    onNavigate('ProjectMap', 'none');
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5D5C0] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#606C38] text-white flex items-center justify-center shadow-xs">
            <span className="material-symbols-outlined text-2xl">add_location_alt</span>
          </div>
          <div>
            <h1 className="font-headline text-2xl lg:text-3xl font-light text-[#2D241E]">New Project - Sahara</h1>
            <p className="text-xs text-[#8B5E3C]">Register a new field operation site or infrastructure project</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('ProjectMap', 'none')}
          className="p-2.5 rounded-2xl bg-[#FDF8F3] hover:bg-white text-[#5C4D42] transition-colors border border-[#E5D5C0] flex items-center gap-2 text-xs font-medium"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          <span className="hidden sm:inline">Cancel</span>
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#F3E9DC] rounded-[32px] p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subsurface Aquifer Expansion & Solar Desalination Array"
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-5 py-3 text-sm font-semibold text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              End Date *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            />
          </div>

          {/* Region / Sector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Geographic Region / Sector
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            >
              <option value="Sector 1 - Highland">Sector 1 - Highland (Tibesti Base)</option>
              <option value="Sector 2 - Central Basin">Sector 2 - Central Basin (Djanet)</option>
              <option value="Sector 3 - West Relay">Sector 3 - West Relay (Ghadames)</option>
              <option value="Sector 4 - East Oasis">Sector 4 - East Oasis (Al-Kufra)</option>
              <option value="Sector 5 - North Border">Sector 5 - North Border (Siwa)</option>
              <option value="Sector 6 - Southern Plateau">Sector 6 - Southern Plateau</option>
            </select>
          </div>

          {/* Director / Lead */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Project Director
            </label>
            <select
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-2.5 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            >
              {team.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          {/* Initial Status */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Initial Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(['planned', 'active', 'completed'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-colors ${
                    status === st
                      ? st === 'active'
                        ? 'bg-[#606C38] text-white shadow-xs'
                        : st === 'planned'
                        ? 'bg-[#D4A373] text-white shadow-xs'
                        : 'bg-[#8B5E3C] text-white shadow-xs'
                      : 'bg-[#FDF8F3] text-[#5C4D42] hover:bg-[#E5D5C0]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase tracking-wider">
              Project Overview & Objectives
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project operational scope, deployment timelines, required field infrastructure, and hydro-geological objectives..."
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-2xl p-4 text-xs font-medium text-[#3D3028] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-[#E5D5C0] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onNavigate('ProjectMap', 'none')}
            className="px-5 py-2.5 rounded-2xl bg-[#FDF8F3] text-[#5C4D42] text-xs font-medium border border-[#E5D5C0] hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">check</span>
            <span>Save Project</span>
          </button>
        </div>
      </form>
    </div>
  );
};
