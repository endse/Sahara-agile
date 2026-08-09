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
import { Task, Activity, TeamMember, TimelineMilestone, SiteLocation, UserStory, AttendanceLog, AsyncJob } from '../types';
import {
  DEMO_TASKS,
  DEMO_LOCATIONS,
  DEMO_ACTIVITIES,
  DEMO_TEAM,
  DEMO_TIMELINE,
  DEMO_STORIES,
  DEMO_ATTENDANCE,
  DEMO_ASYNC_JOBS,
} from '../data';

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

// ========================================================
// DEMO SEEDING, STAMPING & CLEARING FUNCTIONS FOR /demo
// ========================================================

export const stampDemoDataToFirestore = async () => {
  try {
    // 1. Purge all existing data first
    await clearFirestoreData();

    const timestamp = new Date().toISOString();
    let totalStamped = 0;

    for (const t of DEMO_TASKS) {
      await setDoc(doc(db, 'tasks', t.id), { ...t, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const loc of DEMO_LOCATIONS) {
      await setDoc(doc(db, 'locations', loc.id), { ...loc, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const act of DEMO_ACTIVITIES) {
      await setDoc(doc(db, 'activities', act.id), { ...act, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const member of DEMO_TEAM) {
      await setDoc(doc(db, 'team', member.id), { ...member, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const item of DEMO_TIMELINE) {
      await setDoc(doc(db, 'timeline', item.id), { ...item, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const story of DEMO_STORIES) {
      await setDoc(doc(db, 'stories', story.id), { ...story, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const log of DEMO_ATTENDANCE) {
      await setDoc(doc(db, 'attendance', log.id), { ...log, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }
    for (const job of DEMO_ASYNC_JOBS) {
      await setDoc(doc(db, 'async_jobs', job.id), { ...job, isStampedDemo: true, stampedAt: timestamp, stampedBy: 'Sahara Admin' });
      totalStamped++;
    }

    return { success: true, count: totalStamped, timestamp };
  } catch (err) {
    console.error('Error stamping demo data into Firestore:', err);
    return { success: false, error: err };
  }
};

export const seedDemoDataToFirestore = stampDemoDataToFirestore;

export const clearFirestoreData = async () => {
  try {
    const collections = ['tasks', 'locations', 'activities', 'team', 'timeline', 'stories', 'attendance', 'async_jobs', 'users'];
    for (const colName of collections) {
      try {
        const snap = await getDocs(collection(db, colName));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, colName, docSnap.id));
        }
      } catch (colErr) {
        console.warn(`Collection ${colName} clear warning:`, colErr);
      }
    }
    return { success: true };
  } catch (err) {
    console.error('Error clearing Firestore data:', err);
    return { success: false, error: err };
  }
};
