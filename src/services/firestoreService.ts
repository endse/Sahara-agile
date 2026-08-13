import { Task, TaskAttachment, Activity, TeamMember, TimelineMilestone, SiteLocation, UserStory, AttendanceLog, AsyncJob, TeamInvitation } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

const fetchJson = async (url: string, options?: RequestInit) => {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Request failed (${res.status}): ${errorText}`);
  }
  return res.json();
};

// --- TASKS ---
export const subscribeTasks = (teamId: string, onData: (tasks: Task[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/tasks?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching tasks:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveTask = async (task: Task) => {
  try {
    await fetchJson('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  } catch (err) {
    console.error('[api] Failed to save task:', err);
    throw err;
  }
};

export const updateTaskStatus = async (taskId: string, status: Task['status']) => {
  await fetchJson(`/api/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const updateTaskAttachments = async (taskId: string, attachments: TaskAttachment[]) => {
  await fetchJson('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ id: taskId, attachments }),
  });
};

// --- LOCATIONS (PROJECTS) ---
export const subscribeLocations = (teamId: string, onData: (locations: SiteLocation[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/projects?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching locations:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveLocation = async (location: SiteLocation) => {
  await fetchJson('/api/projects', {
    method: 'POST',
    body: JSON.stringify(location),
  });
};

// --- ACTIVITIES ---
export const subscribeActivities = (teamId: string, onData: (activities: Activity[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/activities?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching activities:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveActivity = async (activity: Activity) => {
  await fetchJson('/api/activities', {
    method: 'POST',
    body: JSON.stringify(activity),
  });
};

// --- TEAM ---
export const subscribeTeam = (teamId: string, onData: (team: TeamMember[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/team?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching team:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveTeamMember = async (member: TeamMember) => {
  await fetchJson('/api/team', {
    method: 'POST',
    body: JSON.stringify(member),
  });
};

// --- TIMELINE ---
export const subscribeTimeline = (teamId: string, onData: (timeline: TimelineMilestone[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/timeline?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching timeline:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveTimelineMilestone = async (item: TimelineMilestone) => {
  await fetchJson('/api/timeline', {
    method: 'POST',
    body: JSON.stringify(item),
  });
};

// --- USER STORIES ---
export const subscribeStories = (teamId: string, onData: (stories: UserStory[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/stories?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching stories:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveStory = async (story: UserStory) => {
  await fetchJson('/api/stories', {
    method: 'POST',
    body: JSON.stringify(story),
  });
};

// --- ATTENDANCE & WORK LOGS ---
export const subscribeAttendance = (teamId: string, onData: (logs: AttendanceLog[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/attendance?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching attendance:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveAttendanceLog = async (log: AttendanceLog) => {
  await fetchJson('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(log),
  });
};

// --- ASYNC JOBS ---
export const subscribeAsyncJobs = (teamId: string, onData: (jobs: AsyncJob[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/async-jobs?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching async jobs:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const saveAsyncJob = async (job: AsyncJob) => {
  await fetchJson('/api/async-jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });
};

// --- TEAM INVITATIONS ---
export const saveInvitation = async (invitation: TeamInvitation) => {
  await fetchJson('/api/invitations', {
    method: 'POST',
    body: JSON.stringify(invitation),
  });
};

export const subscribeInvitations = (teamId: string, onData: (invites: TeamInvitation[]) => void) => {
  const load = async () => {
    try {
      const res = await fetchJson(`/api/invitations?teamId=${encodeURIComponent(teamId)}`);
      if (res.data) onData(res.data);
    } catch (err) {
      console.warn('[api] Error fetching invitations:', err);
    }
  };
  load();
  const intervalId = setInterval(load, 4000);
  return () => clearInterval(intervalId);
};

export const findInvitationByEmail = async (email: string): Promise<TeamInvitation | null> => {
  try {
    const res = await fetchJson('/api/invitations');
    if (res.data) {
      const found = res.data.find(
        (i: TeamInvitation) => i.email.toLowerCase().trim() === email.toLowerCase().trim() && i.status === 'pending'
      );
      return found || null;
    }
    return null;
  } catch (err) {
    console.error('Error finding invitation by email:', err);
    return null;
  }
};

export const acceptInvitation = async (inviteId: string) => {
  await fetchJson('/api/invitations', {
    method: 'POST',
    body: JSON.stringify({ id: inviteId, status: 'accepted' }),
  });
};
