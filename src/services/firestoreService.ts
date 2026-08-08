import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, Activity, TeamMember, TimelineMilestone, SiteLocation, UserStory, AttendanceLog, AsyncJob } from '../types';
import {
  INITIAL_TASKS,
  INITIAL_LOCATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_TEAM,
  INITIAL_TIMELINE,
  INITIAL_STORIES,
  INITIAL_ATTENDANCE,
  INITIAL_ASYNC_JOBS,
} from '../data';

// --- TASKS ---
export const subscribeTasks = (onData: (tasks: Task[]) => void) => {
  const colRef = collection(db, 'tasks');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      // Seed default tasks
      for (const t of INITIAL_TASKS) {
        await setDoc(doc(db, 'tasks', t.id), t);
      }
    } else {
      const list: Task[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      onData(list);
    }
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
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const loc of INITIAL_LOCATIONS) {
        await setDoc(doc(db, 'locations', loc.id), loc);
      }
    } else {
      const list: SiteLocation[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as SiteLocation);
      });
      onData(list);
    }
  });
};

export const saveLocation = async (location: SiteLocation) => {
  await setDoc(doc(db, 'locations', location.id), location, { merge: true });
};

// --- ACTIVITIES ---
export const subscribeActivities = (onData: (activities: Activity[]) => void) => {
  const colRef = collection(db, 'activities');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const act of INITIAL_ACTIVITIES) {
        await setDoc(doc(db, 'activities', act.id), act);
      }
    } else {
      const list: Activity[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Activity);
      });
      onData(list);
    }
  });
};

export const saveActivity = async (activity: Activity) => {
  await setDoc(doc(db, 'activities', activity.id), activity, { merge: true });
};

// --- TEAM ---
export const subscribeTeam = (onData: (team: TeamMember[]) => void) => {
  const colRef = collection(db, 'team');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const member of INITIAL_TEAM) {
        await setDoc(doc(db, 'team', member.id), member);
      }
    } else {
      const list: TeamMember[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as TeamMember);
      });
      onData(list);
    }
  });
};

export const saveTeamMember = async (member: TeamMember) => {
  await setDoc(doc(db, 'team', member.id), member, { merge: true });
};

// --- TIMELINE ---
export const subscribeTimeline = (onData: (timeline: TimelineMilestone[]) => void) => {
  const colRef = collection(db, 'timeline');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const item of INITIAL_TIMELINE) {
        await setDoc(doc(db, 'timeline', item.id), item);
      }
    } else {
      const list: TimelineMilestone[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as TimelineMilestone);
      });
      onData(list);
    }
  });
};

export const saveTimelineMilestone = async (item: TimelineMilestone) => {
  await setDoc(doc(db, 'timeline', item.id), item, { merge: true });
};

// --- USER STORIES ---
export const subscribeStories = (onData: (stories: UserStory[]) => void) => {
  const colRef = collection(db, 'stories');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const story of INITIAL_STORIES) {
        await setDoc(doc(db, 'stories', story.id), story);
      }
    } else {
      const list: UserStory[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as UserStory);
      });
      onData(list);
    }
  });
};

export const saveStory = async (story: UserStory) => {
  await setDoc(doc(db, 'stories', story.id), story, { merge: true });
};

// --- ATTENDANCE & WORK LOGS ---
export const subscribeAttendance = (onData: (logs: AttendanceLog[]) => void) => {
  const colRef = collection(db, 'attendance');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const log of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, 'attendance', log.id), log);
      }
    } else {
      const list: AttendanceLog[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AttendanceLog);
      });
      onData(list);
    }
  });
};

export const saveAttendanceLog = async (log: AttendanceLog) => {
  await setDoc(doc(db, 'attendance', log.id), log, { merge: true });
};

// --- ASYNC JOBS ---
export const subscribeAsyncJobs = (onData: (jobs: AsyncJob[]) => void) => {
  const colRef = collection(db, 'async_jobs');
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty) {
      for (const job of INITIAL_ASYNC_JOBS) {
        await setDoc(doc(db, 'async_jobs', job.id), job);
      }
    } else {
      const list: AsyncJob[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AsyncJob);
      });
      onData(list);
    }
  });
};

export const saveAsyncJob = async (job: AsyncJob) => {
  await setDoc(doc(db, 'async_jobs', job.id), job, { merge: true });
};
