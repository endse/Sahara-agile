import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  activeRole: 'Manager' | 'Employee';
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string, role?: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  switchActiveRole: (role: 'Manager' | 'Employee') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'Manager' | 'Employee'>('Manager');
  const [loading, setLoading] = useState<boolean>(true);

  // Sync role to Express server via HttpOnly cookie JWT endpoint
  const syncJwtCookie = async (role: 'Manager' | 'Employee', name?: string) => {
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          userName: name || userProfile?.displayName || 'Amara Vance',
          email: userProfile?.email || 'amara.vance@sahara.io',
        }),
      });
    } catch (err) {
      console.warn('Backend JWT cookie sync note:', err);
    }
  };

  const switchActiveRole = async (newRole: 'Manager' | 'Employee') => {
    setActiveRole(newRole);
    if (userProfile) {
      const updated = {
        ...userProfile,
        role: newRole === 'Manager' ? 'Operations Manager' : 'Field Technician',
      };
      setUserProfile(updated);
    }
    await syncJwtCookie(newRole);
  };

  const syncUserProfile = async (firebaseUser: User, customName?: string, customRole?: string) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        if (data.role?.toLowerCase().includes('manager') || data.role?.toLowerCase().includes('director')) {
          setActiveRole('Manager');
        }
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || `${firebaseUser.uid}@guest.sahara.io`,
          displayName: customName || firebaseUser.displayName || 'Software Engineer',
          photoURL: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: customRole || 'Software Manager',
          specialty: 'Full-Stack & Cloud Architecture',
          assignedStation: 'US-East Cloud Cluster',
          phone: '+1 (415) 890-2026',
          bio: 'Lead software engineer coordinating API microservices, Redis queues, and Kubernetes deployment pipelines.',
          updatedAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
      await syncJwtCookie(activeRole, customName || firebaseUser.displayName || 'Field Operator');
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

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      await syncUserProfile(res.user);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await syncUserProfile(res.user);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string, role?: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      await syncUserProfile(res.user, name, role);
    }
  };

  const signInAsGuest = async () => {
    const res = await signInAnonymously(auth);
    if (res.user) {
      await syncUserProfile(res.user, 'Guest Software Engineer', 'Cloud Developer');
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
        signInAsGuest,
        signOutUser,
        updateUserProfileData,
        switchActiveRole,
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
