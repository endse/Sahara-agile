import React, { useState } from 'react';
import { ScreenId, TeamMember, TeamInvitation } from '../../types';
import { saveInvitation } from '../../services/firestoreService';

interface TeamSyncProps {
  team: TeamMember[];
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up') => void;
  onAddTeamMember?: (newMember: TeamMember) => Promise<void>;
  onUpdateTeamMember?: (updatedMember: TeamMember) => Promise<void>;
  activeRole?: 'Manager' | 'Employee';
  userProfile: any; // We'll just use any here or import UserProfile
}

export const TeamSyncScreen: React.FC<TeamSyncProps> = ({
  team,
  onNavigate,
  onAddTeamMember,
  onUpdateTeamMember,
  activeRole = 'Manager',
  userProfile,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchMember, setSearchMember] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(team[0] || null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [createdInviteInfo, setCreatedInviteInfo] = useState<{
    name: string;
    email: string;
    role: string;
    link: string;
    isManager: boolean;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberLocation, setNewMemberLocation] = useState('');
  const [newMemberInitialStatus, setNewMemberInitialStatus] = useState<'active' | 'in_field' | 'busy' | 'offline'>('active');
  const [newMemberPermissionStatus, setNewMemberPermissionStatus] = useState<'pending_review' | 'approved'>('approved');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const filteredTeam = team.filter((member) => {
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesQuery =
      member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      member.role.toLowerCase().includes(searchMember.toLowerCase()) ||
      member.location?.toLowerCase().includes(searchMember.toLowerCase()) ||
      member.teamName?.toLowerCase().includes(searchMember.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const pendingReviewsCount = team.filter((m) => m.permissionStatus === 'pending_review').length;

  const handleCreateMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('⚠️ Please provide member name and valid email address.');
      return;
    }

    const isManagerRole =
      newMemberRole.toLowerCase().includes('manager') ||
      newMemberRole.toLowerCase().includes('director') ||
      newMemberRole.toLowerCase().includes('lead');

    const created: TeamMember = {
      id: `TM-${Date.now()}`,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      avatar: `https://images.unsplash.com/photo-${1530000000000 + Math.floor(Math.random() * 100000000)}?auto=format&fit=crop&w=200&q=80`,
      status: newMemberInitialStatus,
      currentTask: 'Awaiting initial mission dispatch',
      location: newMemberLocation,
      localTime: 'UTC+2 (Sahara)',
      tasksCount: 0,
      performance: 95,
      teamName: userProfile?.teamName || 'Sahara Team',
      teamId: userProfile?.teamId || '',
      permissionStatus: newMemberPermissionStatus,
      requestedRole: newMemberRole,
      reviewedBy: activeRole === 'Manager' ? 'Operations Manager' : undefined,
      reviewedAt: new Date().toISOString(),
    };

    if (onAddTeamMember) {
      await onAddTeamMember(created);
    }

    // Save invitation doc in Firestore
    const inviteId = `INV-${Date.now()}`;
    const inviteCode = Math.random().toString(36).substring(2, 9).toUpperCase();
    const invitation: TeamInvitation = {
      id: inviteId,
      email: newMemberEmail.trim(),
      fullName: newMemberName.trim(),
      role: newMemberRole,
      isManagerInvite: isManagerRole,
      teamName: userProfile?.teamName || 'Sahara Team',
      teamId: userProfile?.teamId || '',
      invitedBy: 'Operations Manager',
      invitedByEmail: 'manager@sahara-agile.org',
      createdAt: new Date().toISOString(),
      status: 'pending',
      inviteCode,
    };

    await saveInvitation(invitation);

    const inviteLink = `${window.location.origin}/?inviteEmail=${encodeURIComponent(newMemberEmail.trim())}`;

    setIsAddModalOpen(false);
    setSelectedMember(created);
    setCreatedInviteInfo({
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      link: inviteLink,
      isManager: isManagerRole,
    });

    setNewMemberName('');
    setNewMemberEmail('');
    showToast(`✉️ Invitation sent to ${newMemberEmail.trim()}! Registered in Firestore.`);
  };

  const handleAcceptPermissionReview = async (member: TeamMember, newRole?: string) => {
    const updated: TeamMember = {
      ...member,
      permissionStatus: 'approved',
      role: newRole || member.requestedRole || member.role,
      reviewedBy: 'Operations Manager',
      reviewedAt: new Date().toISOString(),
    };

    if (onUpdateTeamMember) {
      await onUpdateTeamMember(updated);
    }

    if (selectedMember?.id === member.id) {
      setSelectedMember(updated);
    }

    showToast(`✅ Accepted & Approved permission review for ${member.name} (${updated.role})!`);
  };

  const handleElevateToManager = async (member: TeamMember) => {
    const updated: TeamMember = {
      ...member,
      role: 'Operations Manager',
      permissionStatus: 'elevated',
      reviewedBy: 'Operations Manager',
      reviewedAt: new Date().toISOString(),
    };

    if (onUpdateTeamMember) {
      await onUpdateTeamMember(updated);
    }

    if (selectedMember?.id === member.id) {
      setSelectedMember(updated);
    }

    showToast(`👑 Elevating ${member.name} to Operations Manager privileges in Firestore!`);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1411] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 text-xs font-semibold flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined text-amber-400 text-lg">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#c2652a]">
            <span className="material-symbols-outlined text-base">groups</span>
            Field Ops Coordination & RBAC Hub
          </div>
          <h1 className="font-headline text-3xl lg:text-4xl font-bold text-[#3a302a] mt-1">
            Team Sync & Manager Approvals
          </h1>
          <p className="text-sm text-[#605850]">
            Manage field team members, inspect station locations, and review account permissions for sector leads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {activeRole === 'Manager' && (
            <>
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="px-4 py-2.5 bg-[#FAF5EE] hover:bg-white text-[#3a302a] border border-[#d8d0c8] rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all relative"
              >
                <span className="material-symbols-outlined text-base text-[#c2652a]">how_to_reg</span>
                <span>Account Permission Reviews</span>
                {pendingReviewsCount > 0 && (
                  <span className="bg-[#c2652a] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {pendingReviewsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-[#c2652a] hover:bg-[#a8541f] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                <span>Add Team Member</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate('NewTask', 'slide_up')}
            className="px-4 py-2.5 bg-[#3a302a] hover:bg-[#26201b] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">add_task</span>
            <span>Assign Field Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f2ece4] p-4 rounded-2xl border border-[#e0d8cc]">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[#9a9088]">
            search
          </span>
          <input
            type="text"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder="Search by name, role, station..."
            className="w-full bg-[#faf5ee] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#3a302a] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-[#78706a] shrink-0">Status:</span>
          {['all', 'in_field', 'active', 'busy'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                filterStatus === st
                  ? 'bg-[#c2652a] text-white'
                  : 'bg-[#faf5ee] text-[#605850] hover:bg-[#e6e0d6]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Roster & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Roster Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78706a]">
              Active Field Personnel ({filteredTeam.length})
            </span>
            {activeRole === 'Manager' && (
              <span className="text-xs text-[#c2652a] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Manager Control Enabled
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTeam.map((member) => {
              const isSelected = selectedMember?.id === member.id;
              const isPending = member.permissionStatus === 'pending_review';

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className={`bg-[#f2ece4] hover:bg-[#faf5ee] border transition-all rounded-2xl p-5 cursor-pointer space-y-4 relative overflow-hidden ${
                    isSelected
                      ? 'border-[#c2652a] ring-2 ring-[#c2652a]/20 bg-[#faf5ee] shadow-md'
                      : 'border-[#e0d8cc] hover:shadow-sm'
                  }`}
                >
                  {/* Pending Badge Banner */}
                  {isPending && (
                    <div className="bg-amber-500 text-stone-900 text-[10px] font-black uppercase px-3 py-0.5 tracking-wider text-center font-mono">
                      ⚠️ Account Permission Review Pending
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#c2652a]"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                            member.status === 'in_field'
                              ? 'bg-amber-500'
                              : member.status === 'active'
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#3a302a] flex items-center gap-1.5">
                          {member.name}
                          {member.role.toLowerCase().includes('manager') && (
                            <span className="material-symbols-outlined text-amber-600 text-sm" title="Manager Privilege">
                              workspace_premium
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-[#78706a]">{member.role}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        member.status === 'in_field'
                          ? 'bg-amber-100 text-amber-800'
                          : member.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {member.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#605850] border-t border-[#e0d8cc] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#78706a]">Station:</span>
                      <span className="font-semibold text-[#3a302a]">{member.location || 'Site A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#78706a]">Team:</span>
                      <span className="font-bold text-[#c2652a]">{member.teamName || 'Sahara Team'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#78706a]">Account Status:</span>
                      <span className={`font-bold ${
                        member.permissionStatus === 'pending_review'
                          ? 'text-amber-600'
                          : member.permissionStatus === 'elevated'
                          ? 'text-purple-700'
                          : 'text-emerald-700'
                      }`}>
                        {member.permissionStatus === 'pending_review' ? 'Review Needed' : member.permissionStatus === 'elevated' ? 'Elevated Manager' : 'Approved Active'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Member Inspector & Manager Controls */}
        <div className="bg-[#f2ece4] border border-[#e0d8cc] rounded-3xl p-6 shadow-sm space-y-6">
          {selectedMember ? (
            <>
              <div className="text-center space-y-3 border-b border-[#e0d8cc] pb-6">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-[#c2652a] shadow-sm"
                />
                <div>
                  <h3 className="font-headline text-2xl font-bold text-[#3a302a]">{selectedMember.name}</h3>
                  <p className="text-xs text-[#78706a]">{selectedMember.role}</p>
                  <p className="text-xs font-semibold text-[#c2652a] mt-1">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#605850]">
                <div className="p-3 bg-[#faf5ee] rounded-xl border border-[#e6e0d6] space-y-1">
                  <span className="text-[10px] font-bold text-[#78706a] uppercase">Stationed Location & Team</span>
                  <p className="text-sm font-bold text-[#3a302a]">{selectedMember.location} — {selectedMember.teamName}</p>
                </div>

                <div className="p-3 bg-[#faf5ee] rounded-xl border border-[#e6e0d6] space-y-1">
                  <span className="text-[10px] font-bold text-[#78706a] uppercase">Account Review & Permission Level</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#3a302a]">
                      {selectedMember.permissionStatus === 'pending_review'
                        ? '⏳ Pending Review'
                        : selectedMember.permissionStatus === 'elevated'
                        ? '👑 Elevated Manager'
                        : '✅ Verified Member'}
                    </p>
                    {selectedMember.reviewedBy && (
                      <span className="text-[10px] text-[#78706a] italic">By {selectedMember.reviewedBy}</span>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#faf5ee] rounded-xl border border-[#e6e0d6] space-y-1">
                  <span className="text-[10px] font-bold text-[#78706a] uppercase">Efficiency & Reliability Index</span>
                  <p className="text-sm font-bold text-emerald-700">{selectedMember.performance}% Reliability Index</p>
                </div>
              </div>

              {/* Manager Direct Action Buttons */}
              {activeRole === 'Manager' && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-amber-900 uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Manager Permission Actions
                  </div>

                  {selectedMember.permissionStatus === 'pending_review' ? (
                    <button
                      onClick={() => handleAcceptPermissionReview(selectedMember)}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Accept Permission & Approve Account</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAcceptPermissionReview(selectedMember)}
                      className="w-full bg-[#FAF5EE] hover:bg-white text-[#3a302a] border border-[#d8d0c8] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                      <span>Re-Approve Account Permissions</span>
                    </button>
                  )}

                  {!selectedMember.role.toLowerCase().includes('manager') && (
                    <button
                      onClick={() => handleElevateToManager(selectedMember)}
                      className="w-full bg-[#3a302a] hover:bg-[#26201b] text-amber-400 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border border-amber-500/30"
                    >
                      <span className="material-symbols-outlined text-base text-amber-400">shield_person</span>
                      <span>Promote to Operations Manager</span>
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-[#e0d8cc] space-y-3">
                <button
                  onClick={() => onNavigate('TaskBoard', 'none')}
                  className="w-full bg-[#c2652a] hover:bg-[#a8541f] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">view_kanban</span>
                  <span>Inspect Tasks Assigned</span>
                </button>
                <button
                  onClick={() => onNavigate('NewTask', 'slide_up')}
                  className="w-full bg-[#faf5ee] hover:bg-[#ffffff] text-[#3a302a] border border-[#e0d8cc] py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                  <span>Assign New Task to {selectedMember.name.split(' ')[0]}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-[#78706a]">Select a team member to view full field record.</div>
          )}
        </div>
      </div>

      {/* MODAL: ADD TEAM MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FAF5EE] border border-[#e0d8cc] rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#e0d8cc] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#c2652a]/20 text-[#c2652a] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#3a302a]">Add Field Team Member</h3>
                  <p className="text-xs text-[#78706a]">Register team personnel directly to Firestore database</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-all p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3a302a] mb-1">Full Name</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Dr. Tariq Mansoor"
                  className="w-full bg-[#f2ece4] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl px-3.5 py-2.5 text-xs text-[#3a302a] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3a302a] mb-1">Email Address</label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="e.g. tariq.mansoor@sahara.io"
                  className="w-full bg-[#f2ece4] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl px-3.5 py-2.5 text-xs text-[#3a302a] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3a302a] mb-1">Field Role</label>
                  <input
                    type="text"
                    required
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="e.g. Field Technician"
                    className="w-full bg-[#f2ece4] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl px-3 py-2.5 text-xs text-[#3a302a] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#3a302a] mb-1">Assigned Station</label>
                  <input
                    type="text"
                    value={newMemberLocation}
                    onChange={(e) => setNewMemberLocation(e.target.value)}
                    placeholder="e.g. Al-Kufra Site A"
                    className="w-full bg-[#f2ece4] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl px-3 py-2.5 text-xs text-[#3a302a] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3a302a] mb-1">Permission Approval</label>
                  <select
                    value={newMemberPermissionStatus}
                    onChange={(e) => setNewMemberPermissionStatus(e.target.value as any)}
                    className="w-full bg-[#f2ece4] border border-[#d8d0c8] focus:border-[#c2652a] rounded-xl px-3 py-2.5 text-xs text-[#3a302a] outline-none font-medium"
                  >
                    <option value="approved">Approve Immediately</option>
                    <option value="pending_review">Set to Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e0d8cc] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-[#f2ece4] hover:bg-[#e6e0d6] text-[#3a302a] rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#c2652a] hover:bg-[#a8541f] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save Member to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANAGER ACCOUNT PERMISSION REVIEWS */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FAF5EE] border border-[#e0d8cc] rounded-3xl max-w-2xl w-full p-6 lg:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#e0d8cc] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">how_to_reg</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold text-[#3a302a]">
                    Manager Account & Permission Reviews
                  </h3>
                  <p className="text-xs text-[#78706a]">
                    Review registration credentials and grant role elevations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 transition-all p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* List of Team Members for Review */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
              {team.map((m) => {
                const isPending = m.permissionStatus === 'pending_review';

                return (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isPending
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-[#f2ece4] border-[#e0d8cc]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#c2652a]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#3a302a]">{m.name}</h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                              isPending
                                ? 'bg-amber-500 text-stone-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isPending ? 'Pending Review' : 'Approved'}
                          </span>
                        </div>
                        <p className="text-xs text-[#78706a]">
                          {m.role} • {m.teamName || 'Sahara Team'}
                        </p>
                        <p className="text-[11px] font-mono text-[#c2652a]">{m.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          handleAcceptPermissionReview(m);
                          setIsReviewModalOpen(false);
                        }}
                        className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Accept Permission</span>
                      </button>

                      {!m.role.toLowerCase().includes('manager') && (
                        <button
                          onClick={() => {
                            handleElevateToManager(m);
                            setIsReviewModalOpen(false);
                          }}
                          className="px-3 py-2 bg-[#3a302a] hover:bg-[#26201b] text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">shield_person</span>
                          <span>Make Manager</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#e0d8cc] flex items-center justify-between">
              <span className="text-xs text-[#78706a]">
                All permission reviews write directly to Firestore security records.
              </span>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-5 py-2.5 bg-[#3a302a] text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITATION LINK & EMAIL DISPATCH CREATED */}
      {createdInviteInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#FAF5EE] border border-[#e0d8cc] rounded-3xl max-w-lg w-full p-6 lg:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#606C38] text-white flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl">mark_email_read</span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-[#3a302a]">
                Invitation Sent & Registered!
              </h3>
              <p className="text-xs text-[#78706a]">
                An invitation record has been logged in Firestore for{' '}
                <span className="font-bold text-[#3a302a]">{createdInviteInfo.name}</span>.
              </p>
            </div>

            <div className="p-4 bg-[#FEFAE0] border border-[#E9EDC9] rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#606C38] font-bold uppercase tracking-wider">Recipient Email:</span>
                <span className="font-mono text-[#3a302a] font-semibold">{createdInviteInfo.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#606C38] font-bold uppercase tracking-wider">Assigned Role:</span>
                <span className="font-bold text-[#606C38]">{createdInviteInfo.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#606C38] font-bold uppercase tracking-wider">Access Rights:</span>
                <span className="font-bold text-[#3a302a]">
                  {createdInviteInfo.isManager ? '👑 Manager Privileges' : '👷 Employee Roster'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3a302a] uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#D4A373]">link</span>
                <span>Shareable Registration URL</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdInviteInfo.link}
                  className="flex-1 bg-[#f2ece4] border border-[#d8d0c8] rounded-xl px-3 py-2 text-xs font-mono text-[#3a302a] select-all outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdInviteInfo.link);
                    showToast('📋 Invitation link copied to clipboard!');
                  }}
                  className="px-3.5 py-2 bg-[#606C38] hover:bg-[#4d572d] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">content_copy</span>
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-[10px] text-[#78706a]">
                When {createdInviteInfo.name} signs up using {createdInviteInfo.email} (or via Google with this email),
                they will be automatically assigned to your team with {createdInviteInfo.role} privileges.
              </p>
            </div>

            <button
              onClick={() => setCreatedInviteInfo(null)}
              className="w-full py-3 bg-[#3a302a] hover:bg-[#26201b] text-white rounded-xl text-xs font-bold shadow-md"
            >
              Close & Return to Team Roster
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
