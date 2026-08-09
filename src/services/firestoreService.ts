import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, Activity, TeamMember, TimelineMilestone, SiteLocation, UserStory, AttendanceLog, AsyncJob, TeamInvitation } from '../types';

// --- TASKS ---
export const subscribeTasks = (onData: (tasks: Task[]) => void) => {
  const colRef = collection(db, 'tasks');
  return onSnapshot(colRef, (snapshot) => {
    const list: Task[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Task);
    });
    onData(list);
  });
};

export const saveTask = async (task: Task) => {
  await setDoc(doc(db, 'tasks', task.id), task, { merge: true });
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  await updateDoc(doc(db, 'tasks', taskId), { status });
};

// --- LOCATIONS (PROJECTS) ---
export const subscribeLocations = (onData: (locations: SiteLocation[]) => void) => {
  const colRef = collection(db, 'locations');
  return onSnapshot(colRef, (snapshot) => {
    const list: SiteLocation[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as SiteLocation);
    });
    onData(list);
  });
};

export const saveLocation = async (location: SiteLocation) => {
  await setDoc(doc(db, 'locations', location.id), location, { merge: true });
};

// --- ACTIVITIES ---
export const subscribeActivities = (onData: (activities: Activity[]) => void) => {
  const colRef = collection(db, 'activities');
  return onSnapshot(colRef, (snapshot) => {
    const list: Activity[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Activity);
    });
    onData(list);
  });
};

export const saveActivity = async (activity: Activity) => {
  await setDoc(doc(db, 'activities', activity.id), activity, { merge: true });
};

// --- TEAM ---
export const subscribeTeam = (onData: (team: TeamMember[]) => void) => {
  const colRef = collection(db, 'team');
  return onSnapshot(colRef, (snapshot) => {
    const list: TeamMember[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as TeamMember);
    });
    onData(list);
  });
};

export const saveTeamMember = async (member: TeamMember) => {
  await setDoc(doc(db, 'team', member.id), member, { merge: true });
};

// --- TIMELINE ---
export const subscribeTimeline = (onData: (timeline: TimelineMilestone[]) => void) => {
  const colRef = collection(db, 'timeline');
  return onSnapshot(colRef, (snapshot) => {
    const list: TimelineMilestone[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as TimelineMilestone);
    });
    onData(list);
  });
};

export const saveTimelineMilestone = async (item: TimelineMilestone) => {
  await setDoc(doc(db, 'timeline', item.id), item, { merge: true });
};

// --- USER STORIES ---
export const subscribeStories = (onData: (stories: UserStory[]) => void) => {
  const colRef = collection(db, 'stories');
  return onSnapshot(colRef, (snapshot) => {
    const list: UserStory[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as UserStory);
    });
    onData(list);
  });
};

export const saveStory = async (story: UserStory) => {
  await setDoc(doc(db, 'stories', story.id), story, { merge: true });
};

// --- ATTENDANCE & WORK LOGS ---
export const subscribeAttendance = (onData: (logs: AttendanceLog[]) => void) => {
  const colRef = collection(db, 'attendance');
  return onSnapshot(colRef, (snapshot) => {
    const list: AttendanceLog[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AttendanceLog);
    });
    onData(list);
  });
};

export const saveAttendanceLog = async (log: AttendanceLog) => {
  await setDoc(doc(db, 'attendance', log.id), log, { merge: true });
};

// --- ASYNC JOBS ---
export const subscribeAsyncJobs = (onData: (jobs: AsyncJob[]) => void) => {
  const colRef = collection(db, 'async_jobs');
  return onSnapshot(colRef, (snapshot) => {
    const list: AsyncJob[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AsyncJob);
    });
    onData(list);
  });
};

export const saveAsyncJob = async (job: AsyncJob) => {
  await setDoc(doc(db, 'async_jobs', job.id), job, { merge: true });
};

// --- TEAM INVITATIONS ---
export const saveInvitation = async (invitation: TeamInvitation) => {
  await setDoc(doc(db, 'invitations', invitation.id), invitation, { merge: true });
};

export const subscribeInvitations = (onData: (invites: TeamInvitation[]) => void) => {
  const colRef = collection(db, 'invitations');
  return onSnapshot(colRef, (snapshot) => {
    const list: TeamInvitation[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as TeamInvitation);
    });
    onData(list);
  });
};

export const findInvitationByEmail = async (email: string): Promise<TeamInvitation | null> => {
  try {
    const snap = await getDocs(collection(db, 'invitations'));
    let found: TeamInvitation | null = null;
    snap.forEach((docSnap) => {
      const data = docSnap.data() as TeamInvitation;
      if (data.email.toLowerCase().trim() === email.toLowerCase().trim() && data.status === 'pending') {
        found = { id: docSnap.id, ...data };
      }
    });
    return found;
  } catch (err) {
    console.error('Error finding invitation by email:', err);
    return null;
  }
};

export const acceptInvitation = async (inviteId: string) => {
  await updateDoc(doc(db, 'invitations', inviteId), { status: 'accepted' });
};
