import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, TeamMember } from '../types';

interface AuthContextType {
  user: User | null;
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
    isCreatingTeam?: boolean
  ) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  switchActiveRole: (role: 'Manager' | 'Employee') => Promise<void>;
  createNewTeam: (teamName: string, managerTitle?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'Manager' | 'Employee'>('Employee');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync session to Express server via HttpOnly cookie
  const syncJwtCookie = async (role?: 'Manager' | 'Employee', name?: string, email?: string) => {
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      if (!idToken) return;
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (err) {
      console.warn('Backend JWT cookie sync note:', err);
    }
  };

  const switchActiveRole = async (newRole: 'Manager' | 'Employee') => {
    // RBAC Security Check: Employees without manager privileges cannot switch to Manager mode
    if (newRole === 'Manager' && userProfile) {
      const isManager =
        userProfile.isTeamManager ||
        userProfile.role?.toLowerCase().includes('manager') ||
        userProfile.role?.toLowerCase().includes('director') ||
        userProfile.permissionStatus === 'elevated';

      if (!isManager) {
        alert('⛔ Access Denied: Only designated Team Managers or elevated accounts can enter Manager mode. Please request Manager elevation in Team Sync.');
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
    await syncJwtCookie(newRole);
  };

  const syncUserProfile = async (
    firebaseUser: User,
    customName?: string,
    customRole?: string,
    teamName?: string,
    isCreatingTeam: boolean = false,
    teamId?: string
  ) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);
      let derivedActiveRole: 'Manager' | 'Employee' = 'Employee';

      // Only load existing profile if not creating a team or supplying explicit signup role
      if (docSnap.exists() && !isCreatingTeam && !customRole) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        if (
          data.isTeamManager ||
          data.role?.toLowerCase().includes('manager') ||
          data.role?.toLowerCase().includes('director') ||
          data.role?.toLowerCase().includes('admin') ||
          data.permissionStatus === 'elevated'
        ) {
          derivedActiveRole = 'Manager';
        }
        setActiveRole(derivedActiveRole);
      } else {
        const idToken = await firebaseUser.getIdToken(true);

        const response = await fetch('/api/auth/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            customName,
            role: customRole,
            teamName,
            isCreatingTeam,
            teamId,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          if (errData.fallbackToClient) {
            throw errData;
          }
          throw new Error('Failed to synchronize user profile with secure backend.');
        }

        const data = await response.json();
        const newProfile: UserProfile = data.profile;
        
        setUserProfile(newProfile);

        derivedActiveRole = newProfile.isTeamManager ? 'Manager' : 'Employee';
        setActiveRole(derivedActiveRole);
      }

      await syncJwtCookie(
        derivedActiveRole,
        customName || firebaseUser.displayName || 'Field Operator',
        firebaseUser.email || undefined
      );
    } catch (err: any) {
      console.warn('⚠️ Server-side profile sync failed, executing client-side fallback writes...', err);
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(userRef);
        let derivedActiveRole: 'Manager' | 'Employee' = 'Employee';

        if (docSnap.exists() && !isCreatingTeam && !customRole) {
          const data = docSnap.data() as UserProfile;
          setUserProfile(data);
          if (
            data.isTeamManager ||
            data.role?.toLowerCase().includes('manager') ||
            data.role?.toLowerCase().includes('director') ||
            data.role?.toLowerCase().includes('admin') ||
            data.permissionStatus === 'elevated'
          ) {
            derivedActiveRole = 'Manager';
          }
          setActiveRole(derivedActiveRole);
        } else {
          let assignedRole = customRole || 'Field Technician';
          let assignedTeam = teamName || 'Sahara Primary Sector';
          let isManagerRole = isCreatingTeam || customRole === 'Operations Manager';
          let initialPermission: 'pending_review' | 'approved' | 'elevated' = isManagerRole ? 'approved' : 'pending_review';
          let finalTeamId = teamId || '';

          if (isCreatingTeam) {
            finalTeamId = `TEAM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            assignedRole = 'Manager';
            isManagerRole = true;
            initialPermission = 'approved';
            assignedTeam = teamName || 'New Team';

            // Create team document in teams collection
            await setDoc(doc(db, 'teams', finalTeamId), {
              id: finalTeamId,
              name: assignedTeam,
              managerId: firebaseUser.uid,
              createdAt: new Date().toISOString()
            });
          }

          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || `${firebaseUser.uid}@guest.sahara.io`,
            displayName: customName || firebaseUser.displayName || 'Field Operator',
            photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            role: assignedRole,
            specialty: '',
            assignedStation: '',
            phone: '',
            bio: '',
            updatedAt: new Date().toISOString(),
            permissionStatus: initialPermission,
            teamName: assignedTeam,
            teamId: finalTeamId,
            isTeamManager: isManagerRole,
          };

          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);

          // Create team member document
          const teamMemberId = `TM-${firebaseUser.uid.slice(0, 8)}`;
          await setDoc(doc(db, 'team', teamMemberId), {
            id: teamMemberId,
            name: newProfile.displayName,
            email: newProfile.email,
            role: assignedRole,
            avatar: newProfile.photoURL,
            status: 'active',
            currentTask: isManagerRole ? 'Managing Sector Operations' : 'Awaiting Mission Dispatch',
            location: 'Al-Kufra Site A',
            localTime: 'UTC+2 (Sahara)',
            tasksCount: 0,
            performance: 92,
            teamName: assignedTeam,
            teamId: finalTeamId,
            permissionStatus: initialPermission,
            requestedRole: assignedRole,
          }, { merge: true });

          // Crucial: Create the rule-based member document so firestore.rules canAccessTeam evaluates to true
          await setDoc(doc(db, 'teams', finalTeamId, 'members', firebaseUser.uid), {
            uid: firebaseUser.uid,
            joinedAt: new Date().toISOString()
          }, { merge: true });

          derivedActiveRole = isManagerRole ? 'Manager' : 'Employee';
          setActiveRole(derivedActiveRole);
        }

        await syncJwtCookie(
          derivedActiveRole,
          customName || firebaseUser.displayName || 'Field Operator',
          firebaseUser.email || undefined
        );
      } catch (fallbackErr) {
        console.error('❌ Client-side fallback synchronization failed:', fallbackErr);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (
    customName?: string,
    customRole?: string,
    teamName?: string,
    isCreatingTeam: boolean = false,
    teamId?: string
  ) => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      await syncUserProfile(res.user, customName, customRole, teamName, isCreatingTeam, teamId);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await syncUserProfile(res.user);
    }
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
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      await syncUserProfile(res.user, name, role, teamName, isCreatingTeam, teamId);
    }
  };

  const createNewTeam = async (teamName: string, managerTitle: string = 'Operations Manager') => {
    if (!user || !userProfile) return;
    try {
      const teamId = `TEAM-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const updatedProfile: UserProfile = {
        ...userProfile,
        teamName,
        teamId,
        role: managerTitle,
        isTeamManager: true,
        permissionStatus: 'approved',
        updatedAt: new Date().toISOString(),
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updatedProfile, { merge: true });

      // Update team member record as well
      const teamMemberRef = doc(db, 'team', `TM-${user.uid.slice(0, 8)}`);
      await setDoc(
        teamMemberRef,
        {
          id: `TM-${user.uid.slice(0, 8)}`,
          name: userProfile.displayName,
          email: userProfile.email,
          role: managerTitle,
          avatar: userProfile.photoURL,
          status: 'active',
          currentTask: `Leading Team: ${teamName}`,
          teamName: teamName,
          teamId: teamId,
          permissionStatus: 'approved',
        },
        { merge: true }
      );

      setUserProfile(updatedProfile);
      setActiveRole('Manager');
      await syncJwtCookie('Manager', userProfile.displayName, userProfile.email);
    } catch (err) {
      console.error('Failed to create new team:', err);
      throw err;
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updatedProfile, { merge: true });

      if (user && (updates.displayName || updates.photoURL)) {
        await updateProfile(user, {
          displayName: updates.displayName || user.displayName,
          photoURL: updates.photoURL || user.photoURL,
        });
      }

      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to update user profile in Firestore:', err);
      throw err;
    }
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
