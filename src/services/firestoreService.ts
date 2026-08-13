import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, TaskAttachment, Activity, TeamMember, TimelineMilestone, SiteLocation, UserStory, AttendanceLog, AsyncJob, TeamInvitation } from '../types';

// --- TASKS ---
export const subscribeTasks = (teamId: string, onData: (tasks: Task[]) => void) => {
  const q = query(collection(db, 'tasks'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
    const list: Task[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Task);
    });
    onData(list);
  });
};

export const saveTask = async (task: Task) => {
  try {
    await setDoc(doc(db, 'tasks', task.id), task, { merge: true });
  } catch (err) {
    console.error('[firestore] Failed to save task:', err);
    throw err;
  }
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  await updateDoc(doc(db, 'tasks', taskId), { status });
};

export const updateTaskAttachments = async (taskId: string, attachments: TaskAttachment[]) => {
  await updateDoc(doc(db, 'tasks', taskId), { attachments });
};

// --- LOCATIONS (PROJECTS) ---
export const subscribeLocations = (teamId: string, onData: (locations: SiteLocation[]) => void) => {
  const q = query(collection(db, 'locations'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
export const subscribeActivities = (teamId: string, onData: (activities: Activity[]) => void) => {
  const q = query(collection(db, 'activities'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
export const subscribeTeam = (teamId: string, onData: (team: TeamMember[]) => void) => {
  const q = query(collection(db, 'team'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
export const subscribeTimeline = (teamId: string, onData: (timeline: TimelineMilestone[]) => void) => {
  const q = query(collection(db, 'timeline'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
export const subscribeStories = (teamId: string, onData: (stories: UserStory[]) => void) => {
  const q = query(collection(db, 'stories'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
export const subscribeAttendance = (teamId: string, onData: (logs: AttendanceLog[]) => void) => {
  const q = query(collection(db, 'attendance'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
export const subscribeAsyncJobs = (teamId: string, onData: (jobs: AsyncJob[]) => void) => {
  const q = query(collection(db, 'async_jobs'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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

export const subscribeInvitations = (teamId: string, onData: (invites: TeamInvitation[]) => void) => {
  const q = query(collection(db, 'invitations'), where('teamId', '==', teamId));
  return onSnapshot(q, (snapshot) => {
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
