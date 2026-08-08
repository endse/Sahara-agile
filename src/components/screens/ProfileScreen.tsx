import React, { useState, useEffect } from 'react';
import { ScreenId, AttendanceLog, Task } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ProfileScreenProps {
  tasks?: Task[];
  attendanceLogs?: AttendanceLog[];
  onOpenMobileMenu: () => void;
  onNavigate: (screen: ScreenId) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
];

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  tasks = [],
  attendanceLogs = [],
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { user, userProfile, updateUserProfileData, signOutUser } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [role, setRole] = useState(userProfile?.role || 'Operations Specialist');
  const [specialty, setSpecialty] = useState(userProfile?.specialty || 'Groundwater & SatCom Systems');
  const [assignedStation, setAssignedStation] = useState(userProfile?.assignedStation || 'Al-Kufra Site A');
  const [phone, setPhone] = useState(userProfile?.phone || '+218 (91) 402-8819');
  const [bio, setBio] = useState(
    userProfile?.bio || 'Lead field operator coordinating hydrological sensor arrays and solar microgrid sync across Sector 4.'
  );
  const [photoURL, setPhotoURL] = useState(
    userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setRole(userProfile.role || 'Operations Specialist');
      setSpecialty(userProfile.specialty || 'Groundwater & SatCom Systems');
      setAssignedStation(userProfile.assignedStation || 'Al-Kufra Site A');
      setPhone(userProfile.phone || '+218 (91) 402-8819');
      setBio(
        userProfile.bio || 'Lead field operator coordinating hydrological sensor arrays and solar microgrid sync across Sector 4.'
      );
      setPhotoURL(userProfile.photoURL || PRESET_AVATARS[0]);
    }
  }, [userProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveNotice(null);
    try {
      await updateUserProfileData({
        displayName,
        role,
        specialty,
        assignedStation,
        phone,
        bio,
        photoURL,
      });
      setSaveNotice('Profile updated successfully across workspace!');
      setTimeout(() => setSaveNotice(null), 4000);
    } catch (err) {
      setSaveNotice('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Find user assigned tasks
  const myTasks = tasks.filter(
    (t) =>
      t.assignee?.name?.toLowerCase() === userProfile?.displayName?.toLowerCase() ||
      t.assignee?.name?.toLowerCase().includes(userProfile?.displayName?.split(' ')[0]?.toLowerCase() || '___')
  );

  // Find active clock status
  const currentAttendance = attendanceLogs.find(
    (a) => a.userId === userProfile?.uid || a.userName?.toLowerCase() === userProfile?.displayName?.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col font-sans">
      <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Toast Notification */}
        {saveNotice && (
          <div className="bg-[#606C38] text-white px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{saveNotice}</span>
            </div>
            <button onClick={() => setSaveNotice(null)} className="text-white/80 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Hero Card */}
        <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <img
              src={photoURL}
              alt={displayName || 'Operator Avatar'}
              className="w-24 h-24 lg:w-28 lg:h-28 rounded-full object-cover border-4 border-[#D4A373] shadow-md"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Active On Field Duty" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="font-headline text-2xl lg:text-3xl font-semibold text-[#2D241E]">
                {displayName || 'Field Operator'}
              </h2>
              <span className="bg-[#D4A373] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {role}
              </span>
            </div>

            <p className="text-xs text-[#8B5E3C] flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#D4A373]">mail</span>
                {userProfile?.email || user?.email || 'Not authenticated'}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#D4A373]">location_on</span>
                {assignedStation}
              </span>
            </p>

            <p className="text-xs text-[#5C4D42] max-w-xl italic">
              "{bio}"
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="bg-[#E5D5C0] px-3 py-1.5 rounded-xl text-[#3D3028] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#8B5E3C]">task_alt</span>
                <span>{myTasks.length} Assigned Tasks</span>
              </div>

              <div className="bg-[#E5D5C0] px-3 py-1.5 rounded-xl text-[#3D3028] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#8B5E3C]">badge</span>
                <span>
                  Status:{' '}
                  <strong className={currentAttendance?.status === 'clocked_in' ? 'text-emerald-700' : 'text-[#8B5E3C]'}>
                    {currentAttendance?.status === 'clocked_in' ? 'Clocked In (Active Shift)' : 'Off Duty'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!user ? (
              <button
                onClick={() => onNavigate('SignUp')}
                className="bg-[#D4A373] hover:bg-[#b88657] text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In / Register</span>
              </button>
            ) : (
              <button
                onClick={signOutUser}
                className="bg-[#BC4749] hover:bg-[#a33b3d] text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Edit Form Card */}
        <form onSubmit={handleSave} className="bg-white border border-[#E5D5C0] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#E5D5C0] pb-4 flex items-center justify-between">
            <div>
              <h3 className="font-headline text-xl font-semibold text-[#2D241E]">Dynamic Profile Credentials</h3>
              <p className="text-xs text-[#8B5E3C]">Changes made here propagate dynamically throughout all workspace views</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          {/* Avatar Preset Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Avatar Selection</label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setPhotoURL(url)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    photoURL === url ? 'border-[#606C38] ring-4 ring-[#606C38]/20 scale-105' : 'border-[#E5D5C0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="pt-1">
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="Or paste custom image URL"
                className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-3 py-2 text-xs text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
              />
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D3028] uppercase">Full Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Dr. Amara Vance"
                className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D3028] uppercase">Primary Role / Title</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
              >
                <option>Lead Hydro-Geologist</option>
                <option>Solar Microgrid Architect</option>
                <option>Robotics Engineer</option>
                <option>Field Operations Specialist</option>
                <option>SatCom Telemetry Lead</option>
                <option>Oasis Dispatcher</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D3028] uppercase">Technical Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Groundwater Sensing & Sensor Mesh"
                className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D3028] uppercase">Assigned Field Station / Site</label>
              <input
                type="text"
                value={assignedStation}
                onChange={(e) => setAssignedStation(e.target.value)}
                placeholder="Al-Kufra Deep Well Site A"
                className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D3028] uppercase">SatCom Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+218 (91) 402-8819"
                className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D3028] uppercase">Email Address (Auth Account)</label>
              <input
                type="email"
                disabled
                value={userProfile?.email || user?.email || 'Guest Mode'}
                className="w-full bg-[#F3E9DC]/60 border border-[#E5D5C0] rounded-xl px-4 py-2.5 text-xs text-[#8B5E3C] font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D3028] uppercase">Operational Bio & Mission Focus</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe field responsibilities and mission focus..."
              className="w-full bg-[#FDF8F3] border border-[#E5D5C0] rounded-2xl p-4 text-xs text-[#3D3028] focus:outline-none focus:border-[#D4A373]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#606C38] hover:bg-[#4d572d] text-white text-xs font-bold px-6 py-3 rounded-2xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Assigned Tasks & Shift Quick Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline text-lg font-semibold text-[#2D241E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">task</span>
                Assigned Operational Tasks ({myTasks.length})
              </h4>
              <button
                onClick={() => onNavigate('TaskBoard')}
                className="text-xs text-[#8B5E3C] hover:underline font-bold"
              >
                View Kanban Board →
              </button>
            </div>

            {myTasks.length === 0 ? (
              <p className="text-xs text-[#8B5E3C] italic">No tasks currently assigned to this profile.</p>
            ) : (
              <div className="space-y-2">
                {myTasks.slice(0, 4).map((t) => (
                  <div key={t.id} className="bg-white p-3 rounded-2xl border border-[#E5D5C0] flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-[#3D3028]">{t.title}</p>
                      <p className="text-[10px] text-[#8B5E3C] font-mono">{t.code} • {t.status.toUpperCase()}</p>
                    </div>
                    <span className="text-[10px] bg-[#E5D5C0] px-2 py-0.5 rounded-full font-bold text-[#3D3028]">
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-headline text-lg font-semibold text-[#2D241E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8B5E3C]">schedule</span>
                Shift Attendance & Duty Ledger
              </h4>
              <button
                onClick={() => onNavigate('AttendanceLog')}
                className="text-xs text-[#8B5E3C] hover:underline font-bold"
              >
                Open Clock-In Console →
              </button>
            </div>

            {currentAttendance ? (
              <div className="bg-white p-4 rounded-2xl border border-[#E5D5C0] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#3D3028]">Shift Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      currentAttendance.status === 'clocked_in'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {currentAttendance.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[#8B5E3C]">
                  Clock In: {new Date(currentAttendance.clockInTime).toLocaleString()}
                </p>
                {currentAttendance.clockOutTime && (
                  <p className="text-[#8B5E3C]">
                    Clock Out: {new Date(currentAttendance.clockOutTime).toLocaleString()}
                  </p>
                )}
                <p className="text-[#3D3028] font-mono font-bold">
                  Total Shift Hours: {currentAttendance.totalHours || 'Active'} hrs
                </p>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl border border-[#E5D5C0] text-center space-y-2">
                <p className="text-xs text-[#8B5E3C]">No active shift logged today.</p>
                <button
                  onClick={() => onNavigate('AttendanceLog')}
                  className="bg-[#606C38] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Clock In Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
