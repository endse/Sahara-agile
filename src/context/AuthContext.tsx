import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  activeRole: 'Manager' | 'Employee';
  loading: boolean;
  signInWithGoogle: (
    customName?: string,
    customRole?: string,
    teamName?: string,
    isCreatingTeam?: boolean
  ) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    pass: string,
    name?: string,
    role?: string,
    teamName?: string,
    isCreatingTeam?: boolean,
    teamId?: string
  ) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  switchActiveRole: (role: 'Manager' | 'Employee') => Promise<void>;
  createNewTeam: (teamName: string, managerTitle?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'Manager' | 'Employee'>('Employee');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user session and profile with backend
  const syncProfileWithBackend = async (
    uid: string,
    email: string,
    customName?: string,
    customRole?: string,
    teamName?: string,
    isCreatingTeam: boolean = false,
    teamId?: string
  ) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/sync-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          email,
          displayName: customName,
          role: customRole,
          teamName,
          isCreatingTeam,
          teamId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setUserProfile(data.profile);
          const role = data.profile.isTeamManager || data.profile.role?.toLowerCase().includes('manager') ? 'Manager' : 'Employee';
          setActiveRole(role);
        }
      }
    } catch (err) {
      console.warn('[auth] Profile sync with backend error:', err);
    }
  };

  const loginWithBackend = async (uid: string, email: string) => {
    try {
      await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email }),
      });
    } catch (err) {
      console.warn('[auth] Login cookie sync note:', err);
    }
  };

  // Restore session from localStorage or /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedUserStr = localStorage.getItem('sahara_user');
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr) as AuthUser;
          setUser(storedUser);
          await syncProfileWithBackend(storedUser.uid, storedUser.email);
        } catch {
          localStorage.removeItem('sahara_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const switchActiveRole = async (newRole: 'Manager' | 'Employee') => {
    if (newRole === 'Manager' && userProfile) {
      const isManager =
        userProfile.isTeamManager ||
        userProfile.role?.toLowerCase().includes('manager') ||
        userProfile.role?.toLowerCase().includes('director') ||
        userProfile.permissionStatus === 'elevated';

      if (!isManager) {
        alert('⛔ Access Denied: Only designated Team Managers or elevated accounts can enter Manager mode.');
        return;
      }
    }

    setActiveRole(newRole);
    if (userProfile) {
      const updated = {
        ...userProfile,
        role: newRole === 'Manager' ? userProfile.role || 'Operations Manager' : 'Field Technician',
      };
      setUserProfile(updated);
    }
  };

  const signInWithGoogle = async (
    customName?: string,
    customRole?: string,
    teamName?: string,
    isCreatingTeam: boolean = false,
    teamId?: string
  ) => {
    const uid = `google-user-${Date.now()}`;
    const email = 'google.operator@sahara.io';
    const authUser: AuthUser = {
      uid,
      email,
      displayName: customName || 'Field Operator',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };
    setUser(authUser);
    localStorage.setItem('sahara_user', JSON.stringify(authUser));
    await loginWithBackend(uid, email);
    await syncProfileWithBackend(uid, email, customName || 'Field Operator', customRole, teamName, isCreatingTeam, teamId);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const uid = `usr-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const authUser: AuthUser = { uid, email };
    setUser(authUser);
    localStorage.setItem('sahara_user', JSON.stringify(authUser));
    await loginWithBackend(uid, email);
    await syncProfileWithBackend(uid, email);
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    role?: string,
    teamName?: string,
    isCreatingTeam?: boolean,
    teamId?: string
  ) => {
    const uid = `usr-${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const authUser: AuthUser = { uid, email, displayName: name };
    setUser(authUser);
    localStorage.setItem('sahara_user', JSON.stringify(authUser));
    await loginWithBackend(uid, email);
    await syncProfileWithBackend(uid, email, name, role, teamName, isCreatingTeam, teamId);
  };

  const createNewTeam = async (teamName: string, managerTitle: string = 'Operations Manager') => {
    if (!user || !userProfile) return;
    const newTeamId = `TEAM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const updatedProfile: UserProfile = {
      ...userProfile,
      teamName,
      teamId: newTeamId,
      role: managerTitle,
      isTeamManager: true,
      permissionStatus: 'approved',
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updatedProfile);
    setActiveRole('Manager');
    await syncProfileWithBackend(user.uid, user.email, userProfile.displayName, managerTitle, teamName, true, newTeamId);
  };

  const signOutUser = async () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('sahara_user');
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST' });
    } catch {}
  };

  const resetPassword = async (email: string) => {
    alert(`Password reset link requested for ${email}. Please check your inbox.`);
  };

  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    const updated = { ...userProfile, ...updates, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    await syncProfileWithBackend(
      user.uid,
      user.email,
      updated.displayName,
      updated.role,
      updated.teamName,
      updated.isTeamManager,
      updated.teamId
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        activeRole,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        resetPassword,
        updateUserProfileData,
        switchActiveRole,
        createNewTeam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
