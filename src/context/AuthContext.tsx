import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, TeamMember } from '../types';
import { findInvitationByEmail, acceptInvitation } from '../services/firestoreService';

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

  // Sync role to Express server via HttpOnly cookie JWT endpoint
  const syncJwtCookie = async (role: 'Manager' | 'Employee', name?: string, email?: string) => {
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          userName: name || userProfile?.displayName || 'Field Operator',
          email: email || userProfile?.email || 'operator@sahara.io',
        }),
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
    isCreatingTeam: boolean = false
  ) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);
      let derivedActiveRole: 'Manager' | 'Employee' = 'Employee';

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        if (
          data.isTeamManager ||
          data.role?.toLowerCase().includes('manager') ||
          data.role?.toLowerCase().includes('director') ||
          data.permissionStatus === 'elevated'
        ) {
          derivedActiveRole = 'Manager';
        } else {
          derivedActiveRole = 'Employee';
        }
        setActiveRole(derivedActiveRole);
      } else {
        // New User Profile Creation logic
        const email = firebaseUser.email || '';
        const matchedInvite = email ? await findInvitationByEmail(email) : null;

        let assignedRole = customRole || 'Field Technician';
        let assignedTeam = teamName || 'Sahara Primary Sector';
        let isManagerRole = isCreatingTeam || customRole === 'Operations Manager';
        let initialPermission: 'pending_review' | 'approved' | 'elevated' = isManagerRole ? 'approved' : 'pending_review';

        if (matchedInvite) {
          // Found invitation! Automatically join team and set role & permissions
          assignedRole = matchedInvite.role;
          assignedTeam = matchedInvite.teamName;
          isManagerRole = matchedInvite.isManagerInvite || matchedInvite.role.toLowerCase().includes('manager');
          initialPermission = 'approved';
          await acceptInvitation(matchedInvite.id);
        } else if (!isCreatingTeam) {
          // Check if user was pre-invited directly into the team roster by email
          try {
            const teamSnap = await getDocs(collection(db, 'team'));
            teamSnap.forEach((d) => {
              const m = d.data() as TeamMember;
              if (m.email && m.email.toLowerCase().trim() === email.toLowerCase().trim()) {
                assignedRole = m.role || assignedRole;
                assignedTeam = m.teamSector || assignedTeam;
                if (m.role?.toLowerCase().includes('manager')) {
                  isManagerRole = true;
                }
                initialPermission = 'approved';
              }
            });
          } catch (e) {
            console.warn('Roster check warning:', e);
          }
        }

        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || `${firebaseUser.uid}@guest.sahara.io`,
          displayName: customName || firebaseUser.displayName || matchedInvite?.fullName || 'Field Operator',
          photoURL:
            firebaseUser.photoURL ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: assignedRole,
          specialty: 'Hydro-Geology & SatCom Systems',
          assignedStation: 'Al-Kufra Site A',
          phone: '+218 (91) 402-8819',
          bio: isManagerRole
            ? 'Operations Manager directing hydrological sensor arrays and team operations.'
            : 'Field technician executing dispatch orders across Sector 4.',
          updatedAt: new Date().toISOString(),
          permissionStatus: initialPermission,
          teamName: assignedTeam,
          isTeamManager: isManagerRole,
        };

        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);

        // Also add user as a member in the team roster doc
        const teamMemberRef = doc(db, 'team', `TM-${firebaseUser.uid.slice(0, 8)}`);
        await setDoc(
          teamMemberRef,
          {
            id: `TM-${firebaseUser.uid.slice(0, 8)}`,
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
            teamSector: assignedTeam,
            permissionStatus: initialPermission,
            requestedRole: assignedRole,
          },
          { merge: true }
        );

        derivedActiveRole = isManagerRole ? 'Manager' : 'Employee';
        setActiveRole(derivedActiveRole);
      }

      await syncJwtCookie(
        derivedActiveRole,
        customName || firebaseUser.displayName || 'Field Operator',
        firebaseUser.email || undefined
      );
    } catch (err) {
      console.error('Error syncing user profile:', err);
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
    isCreatingTeam: boolean = false
  ) => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      await syncUserProfile(res.user, customName, customRole, teamName, isCreatingTeam);
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
    isCreatingTeam?: boolean
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      await syncUserProfile(res.user, name, role, teamName, isCreatingTeam);
    }
  };

  const createNewTeam = async (teamName: string, managerTitle: string = 'Operations Manager') => {
    if (!user || !userProfile) return;
    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        teamName,
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
          teamSector: teamName,
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
