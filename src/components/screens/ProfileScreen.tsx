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
  onNavigate,
}) => {
  const { user, userProfile, updateUserProfileData, signOutUser } = useAuth();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [role, setRole] = useState(userProfile?.role || 'Operations Specialist');
  const [specialty, setSpecialty] = useState(userProfile?.specialty || 'Software & Telemetry');
  const [assignedStation, setAssignedStation] = useState(userProfile?.assignedStation || 'Central Hub');
  const [phone, setPhone] = useState(userProfile?.phone || '+1 (555) 402-8819');
  const [bio, setBio] = useState(
    userProfile?.bio || 'Lead specialist coordinating telemetry arrays and sprint deliverables.'
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
      setSpecialty(userProfile.specialty || 'Software & Telemetry');
      setAssignedStation(userProfile.assignedStation || 'Central Hub');
      setPhone(userProfile.phone || '+1 (555) 402-8819');
      setBio(userProfile.bio || 'Lead specialist coordinating telemetry arrays and sprint deliverables.');
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

  const myTasks = tasks.filter(
    (t) =>
      t.assignee?.name?.toLowerCase() === userProfile?.displayName?.toLowerCase() ||
      t.assignee?.name?.toLowerCase().includes(userProfile?.displayName?.split(' ')[0]?.toLowerCase() || '___')
  );

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col font-sans">
      <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {saveNotice && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{saveNotice}</span>
            </div>
            <button onClick={() => setSaveNotice(null)} className="text-white/80 hover:text-white text-xs underline">
              Dismiss
            </button>
          </div>
        )}

        {/* User Card */}
        <div className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <img
              src={photoURL}
              alt={displayName || 'User Avatar'}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#C49A5A] shadow-xs"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-2xl font-bold text-[#171512]">
                {displayName || 'User Profile'}
              </h2>
              <span className="bg-[#C49A5A]/20 text-[#A8793A] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#C49A5A]/30">
                {role}
              </span>
            </div>

            <p className="text-xs text-[#625C52] flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#8A8378]">mail</span>
                {userProfile?.email || user?.email || 'Not authenticated'}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-[#8A8378]">location_on</span>
                {assignedStation}
              </span>
            </p>

            <p className="text-xs text-[#625C52] max-w-xl">
              "{bio}"
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs">
              <div className="bg-[#FBF9F4] border border-[#E4DDD0] px-3 py-1.5 rounded-xl text-[#171512] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#A8793A]">task_alt</span>
                <span>{myTasks.length} Assigned Tasks</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!user ? (
              <button
                onClick={() => onNavigate('SignUp')}
                className="bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">login</span>
                <span>Sign In</span>
              </button>
            ) : (
              <button
                onClick={signOutUser}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Edit Form Card */}
        <form onSubmit={handleSave} className="bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs">
          <div className="border-b border-[#E4DDD0] pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#171512]">Profile Settings</h3>
              <p className="text-xs text-[#625C52]">Update your account information and preferences</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#171512] uppercase tracking-wider">Avatar Selection</label>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_AVATARS.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setPhotoURL(url)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                    photoURL === url ? 'border-[#C49A5A] ring-2 ring-[#C49A5A]/20 scale-105' : 'border-[#E4DDD0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Full Display Name</label>
              <input
                id="display-name"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Amara Vance"
                className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] focus:outline-none focus:border-[#C49A5A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-role" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Title / Role</label>
              <select
                id="user-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] focus:outline-none focus:border-[#C49A5A]"
              >
                <option>Operations Manager</option>
                <option>Project Lead</option>
                <option>Software Engineer</option>
                <option>Field Operations Specialist</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-specialty" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Specialty</label>
              <input
                id="user-specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Software & Telemetry"
                className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] focus:outline-none focus:border-[#C49A5A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-phone" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Phone</label>
              <input
                id="user-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 402-8819"
                className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] focus:outline-none focus:border-[#C49A5A]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="user-bio" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Bio & Overview</label>
            <textarea
              id="user-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your responsibilities..."
              className="w-full bg-[#FBF9F4] border border-[#E4DDD0] rounded-xl p-3 text-xs text-[#171512] focus:outline-none focus:border-[#C49A5A]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
