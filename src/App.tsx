import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenId, TransitionType, Task, Activity, TeamMember, TimelineMilestone, SiteLocation, AppNotification, UserStory } from './types';
import {
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_TEAM,
  INITIAL_TIMELINE,
  INITIAL_LOCATIONS,
  INITIAL_STORIES,
  INITIAL_ATTENDANCE,
  INITIAL_ASYNC_JOBS,
} from './data';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeTasks,
  saveTask,
  updateTaskStatus,
  subscribeLocations,
  saveLocation,
  subscribeActivities,
  saveActivity,
  subscribeTeam,
  saveTeamMember,
  subscribeTimeline,
  saveTimelineMilestone,
  subscribeStories,
  saveStory,
  subscribeAttendance,
  subscribeAsyncJobs,
} from './services/firestoreService';
import { SidebarNavigation } from './components/SidebarNavigation';
import { TopHeader } from './components/TopHeader';

import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProjectsScreen } from './components/screens/ProjectsScreen';
import { GlobalSearchScreen } from './components/screens/GlobalSearchScreen';
import { ProjectTimelineScreen } from './components/screens/ProjectTimelineScreen';
import { TaskBoardScreen } from './components/screens/TaskBoardScreen';
import { ProjectMapScreen } from './components/screens/ProjectMapScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { TeamSyncScreen } from './components/screens/TeamSyncScreen';
import { NewTaskScreen } from './components/screens/NewTaskScreen';
import { NewProjectScreen } from './components/screens/NewProjectScreen';
import { TaskBoardActivityScreen } from './components/screens/TaskBoardActivityScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { UserStoriesScreen } from './components/screens/UserStoriesScreen';
import { AttendanceLogScreen } from './components/screens/AttendanceLogScreen';
import { AsyncReportsScreen } from './components/screens/AsyncReportsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { PerformanceAnalyticsScreen } from './components/screens/PerformanceAnalyticsScreen';
import { SecurityNotesModal } from './components/SecurityNotesModal';
import { RbacGuard } from './components/RbacGuard';
import {
  scopeTasksByTeam,
  scopeTeamBySector,
  scopeLocationsByTeam,
  scopeStoriesByTeam,
  scopeAttendanceByTeam,
  scopeActivitiesByTeam,
  scopeTimelineByTeam,
  scopeAsyncJobsByTeam,
} from './lib/teamScopeUtils';

function AppContent() {
  const { userProfile, activeRole, switchActiveRole } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('Dashboard');
  const [transition, setTransition] = useState<TransitionType>('none');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Walkthrough Modal State
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [walkthroughRole, setWalkthroughRole] = useState<'Manager' | 'Employee'>(activeRole);

  // Keep walkthrough role synced with activeRole
  useEffect(() => {
    setWalkthroughRole(activeRole);
  }, [activeRole]);

  // Handle URL Path & Hash Navigation for /demo
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/demo' || hash === '#demo' || hash === '#/demo') {
        setCurrentScreen('Demo');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Application State backed by Firestore
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>(INITIAL_TIMELINE);
  const [locations, setLocations] = useState<SiteLocation[]>(INITIAL_LOCATIONS);
  const [stories, setStories] = useState<UserStory[]>(INITIAL_STORIES);
  const [attendanceLogs, setAttendanceLogs] = useState<import('./types').AttendanceLog[]>(INITIAL_ATTENDANCE);
  const [asyncJobs, setAsyncJobs] = useState<import('./types').AsyncJob[]>(INITIAL_ASYNC_JOBS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!userProfile) return;
    const teamId = userProfile.teamId || userProfile.uid;

    const unsubTasks = subscribeTasks(teamId, (data) => setTasks(data));
    const unsubLocs = subscribeLocations(teamId, (data) => setLocations(data));
    const unsubActs = subscribeActivities(teamId, (data) => setActivities(data));
    const unsubTeam = subscribeTeam(teamId, (data) => setTeam(data));
    const unsubTimeline = subscribeTimeline(teamId, (data) => setTimeline(data));
    const unsubStories = subscribeStories(teamId, (data) => setStories(data));
    const unsubAttendance = subscribeAttendance(teamId, (data) => setAttendanceLogs(data));
    const unsubJobs = subscribeAsyncJobs(teamId, (data) => setAsyncJobs(data));

    return () => {
      unsubTasks();
      unsubLocs();
      unsubActs();
      unsubTeam();
      unsubTimeline();
      unsubStories();
      unsubAttendance();
      unsubJobs();
    };
  }, [userProfile?.teamId]);

  // Production Manager Scope State
  const [managedSector, setManagedSector] = useState<string>('All Teams');

  // Scope Data for Production Application Views
  const scopedTasks = scopeTasksByTeam(tasks, userProfile, activeRole);
  const scopedTeam = scopeTeamBySector(team, userProfile, activeRole);
  const scopedLocations = scopeLocationsByTeam(locations, userProfile, activeRole);
  const scopedStories = scopeStoriesByTeam(stories, userProfile, activeRole);
  const scopedAttendance = scopeAttendanceByTeam(attendanceLogs, userProfile, activeRole);
  const scopedActivities = scopeActivitiesByTeam(activities, userProfile, activeRole);
  const scopedTimeline = scopeTimelineByTeam(timeline, userProfile, activeRole);
  const scopedAsyncJobs = scopeAsyncJobsByTeam(asyncJobs, userProfile, activeRole);

  // Sync selected task when tasks change
  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0]);
    } else if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }
  }, [tasks]);

  // Navigation handler with top-scroll reset
  const handleNavigate = (targetScreen: ScreenId, transType: TransitionType = 'none') => {
    setTransition(transType);
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  };

  // Global Cmd+K / Ctrl+K keyboard shortcut handler for GlobalSearch
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (currentScreen === 'GlobalSearch') {
          handleNavigate('Dashboard', 'slide_down');
        } else {
          handleNavigate('GlobalSearch', 'slide_down');
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentScreen]);

  // Notification system: records a recent activity event for the header bell
  const handleNotify = (notification: AppNotification) => {
    setNotifications(prev => [notification, ...prev].slice(0, 15));
  };

  const handleAddTask = async (newTask: Task) => {
    const taskWithTeam = { ...newTask, teamId: userProfile?.teamId || userProfile?.uid || '' };
    setTasks(prev => [taskWithTeam, ...prev]);
    try {
      await saveTask(taskWithTeam);
    } catch (err) {
      setTasks(prev => prev.filter(t => t.id !== taskWithTeam.id));
      throw err;
    }

    // Log activity (non-blocking — task is already saved)
    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Amara Vance',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'created mission task',
      target: `${newTask.code} (${newTask.title})`,
      time: 'Just now',
      type: 'status',
      detail: `Assigned to ${newTask.assignee.name} at ${newTask.region ?? 'Unassigned region'}`,
      teamId: userProfile?.teamId || userProfile?.uid || ''
    };
    setActivities(prev => [newAct, ...prev]);
    try {
      await saveActivity(newAct);
    } catch (err) {
      console.warn('[firestore] Activity log save failed (task was saved):', err);
    }

    // Notification system event
    handleNotify({
      id: `NOTIF-${Date.now()}`,
      title: 'New task created',
      message: `${newTask.code} - ${newTask.title}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'task_created',
      targetScreen: 'TaskBoard',
      targetId: newTask.id,
    });
    if (newTask.assignee.name && newTask.assignee.name !== 'Unassigned') {
      handleNotify({
        id: `NOTIF-${Date.now() + 1}`,
        title: 'Task assigned',
        message: `${newTask.title} was assigned to ${newTask.assignee.name}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'task_assigned',
        targetScreen: 'TaskBoard',
        targetId: newTask.id,
      });
    }
  };

  const handleAddProject = async (projectData: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    region: string;
    lead: string;
    status: 'planned' | 'active' | 'completed';
  }) => {
    // Create new site location for Project Map
    const newLoc: SiteLocation = {
      id: `LOC-${Date.now()}`,
      name: projectData.name,
      region: projectData.region,
      coordinates: {
        x: Math.floor(Math.random() * 55) + 20,
        y: Math.floor(Math.random() * 50) + 20,
        lat: 23.50 + (Math.random() - 0.5) * 3,
        lng: 12.50 + (Math.random() - 0.5) * 3,
      },
      status: projectData.status === 'completed' ? 'completed' : projectData.status === 'active' ? 'active' : 'planned',
      taskCount: 0,
      crewCount: 4,
      lead: projectData.lead,
      temperature: '35°C',
      teamId: userProfile?.teamId || userProfile?.uid || ''
    };
    
    // Create new milestone for timeline
    const newMilestone: TimelineMilestone = {
      id: `PH-${Date.now()}`,
      phase: `Phase ${timeline.length + 1}`,
      title: projectData.name,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      status: projectData.status === 'completed' ? 'completed' : projectData.status === 'active' ? 'in_progress' : 'upcoming',
      progress: projectData.status === 'completed' ? 100 : projectData.status === 'active' ? 10 : 0,
      lead: projectData.lead,
      region: projectData.region,
      teamId: userProfile?.teamId || userProfile?.uid || ''
    };

    // Log activity
    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Amara Vance',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'initialized new project',
      target: projectData.name,
      time: 'Just now',
      type: 'location',
      detail: `Directed by ${projectData.lead} in ${projectData.region}`,
      teamId: userProfile?.teamId || userProfile?.uid || ''
    };

    // Optimistic UI updates
    setLocations(prev => [newLoc, ...prev]);
    setTimeline(prev => [newMilestone, ...prev]);
    setActivities(prev => [newAct, ...prev]);

    try {
      await saveLocation(newLoc);
      await saveTimelineMilestone(newMilestone);
      await saveActivity(newAct);

      // Notification system event
      handleNotify({
        id: `NOTIF-${Date.now()}`,
        title: 'New project initialized',
        message: `${projectData.name} registered in ${projectData.region}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'project_created',
        targetScreen: 'Projects',
        targetId: newLoc.id,
      });
    } catch (err: any) {
      console.error('[firestore] Failed to create project:', err);
      // Rollback optimistic updates
      setLocations(prev => prev.filter(l => l.id !== newLoc.id));
      setTimeline(prev => prev.filter(t => t.id !== newMilestone.id));
      setActivities(prev => prev.filter(a => a.id !== newAct.id));
      handleNotify({
        id: `NOTIF-ERR-${Date.now()}`,
        title: 'Project Creation Failed',
        message: 'Insufficient permissions or network error. Reverting changes.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'status_changed',
        targetScreen: 'Projects',
        targetId: newLoc.id,
      });
    }
  };

  const handleAddStory = async (newStory: UserStory) => {
    const storyWithTeam = { ...newStory, teamId: userProfile?.teamId || userProfile?.uid || '' };
    setStories(prev => [storyWithTeam, ...prev]);

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Amara Vance',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'created user story',
      target: `${newStory.id} (${newStory.title})`,
      time: 'Just now',
      type: 'status',
      detail: `${newStory.points} story points for ${newStory.projectName}`,
      teamId: userProfile?.teamId || userProfile?.uid || ''
    };
    setActivities(prev => [newAct, ...prev]);

    try {
      await saveStory(storyWithTeam);
      await saveActivity(newAct);

      handleNotify({
        id: `NOTIF-${Date.now()}`,
        title: 'User story created',
        message: `${newStory.id} - ${newStory.title}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'story_created',
        targetScreen: 'UserStories',
        targetId: newStory.id,
      });
    } catch (err) {
      console.error('[firestore] Failed to create story:', err);
      setStories(prev => prev.filter(s => s.id !== storyWithTeam.id));
      setActivities(prev => prev.filter(a => a.id !== newAct.id));
      handleNotify({
        id: `NOTIF-ERR-${Date.now()}`,
        title: 'Story Creation Failed',
        message: 'Insufficient permissions. Reverting changes.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'status_changed',
        targetScreen: 'UserStories',
        targetId: newStory.id,
      });
    }
  };

  const handleAddActivity = async (newAct: Activity) => {
    setActivities(prev => [newAct, ...prev]);
    try {
      await saveActivity(newAct);
    } catch (err) {
      console.error('Failed to save activity:', err);
      setActivities(prev => prev.filter(a => a.id !== newAct.id));
    }
  };

  const handleAddTeamMember = async (newMember: TeamMember) => {
    setTeam(prev => [newMember, ...prev]);

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Operations Manager',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'registered team member',
      target: `${newMember.name} (${newMember.role})`,
      time: 'Just now',
      type: 'assignment',
      detail: `Assigned to ${newMember.location || 'Sahara Agile Workspace'}`,
      teamId: userProfile?.teamId || userProfile?.uid || '',
    };
    setActivities(prev => [newAct, ...prev]);

    try {
      await saveTeamMember(newMember);
      await saveActivity(newAct);
    } catch (err) {
      console.error('Failed to save team member:', err);
      setTeam(prev => prev.filter(m => m.id !== newMember.id));
      setActivities(prev => prev.filter(a => a.id !== newAct.id));
    }
  };

  const handleUpdateTeamMember = async (updatedMember: TeamMember) => {
    const originalTeam = [...team];
    setTeam(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Operations Manager',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'updated permission & role review',
      target: `${updatedMember.name} (${updatedMember.role})`,
      time: 'Just now',
      type: 'status',
      detail: `Status: ${updatedMember.permissionStatus || 'Approved'} - Team: ${updatedMember.teamName || 'General'}`,
      teamId: userProfile?.teamId || userProfile?.uid || '',
    };
    setActivities(prev => [newAct, ...prev]);

    try {
      await saveTeamMember(updatedMember);
      await saveActivity(newAct);
    } catch (err) {
      console.error('Failed to update team member:', err);
      setTeam(originalTeam);
      setActivities(prev => prev.filter(a => a.id !== newAct.id));
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const originalTasks = [...tasks];
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus, progress: newStatus === 'done' ? 100 : t.progress };
        }
        return t;
      })
    );

    const taskObj = tasks.find(t => t.id === taskId);
    let newAct: Activity | null = null;
    if (taskObj) {
      newAct = {
        id: `ACT-${Date.now()}`,
        user: userProfile?.displayName || 'Amara Vance',
        avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        action: 'updated status of',
        target: `${taskObj.code} to ${newStatus.replace('_', ' ')}`,
        time: 'Just now',
        type: 'status',
        teamId: userProfile?.teamId || userProfile?.uid || ''
      };
      setActivities(a => [newAct!, ...a]);
    }

    try {
      await updateTaskStatus(taskId, newStatus);
      if (newAct) {
        await saveActivity(newAct);
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
      setTasks(originalTasks);
      if (newAct) {
        setActivities(prev => prev.filter(a => a.id !== newAct!.id));
      }
    }
  };

  // Motion variants for transition types
  const getVariants = () => {
    switch (transition) {
      case 'slide_up':
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
        };
      case 'slide_down':
        return {
          initial: { y: '-100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
        };
      case 'push':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-20%', opacity: 0 },
        };
      case 'push_back':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '100%', opacity: 0 },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 0.95 },
          animate: { opacity: 1 },
          exit: { opacity: 0.95 },
        };
    }
  };

  const screenSubtitles: Record<ScreenId, string> = {
    Dashboard: 'Overview of your projects and team progress.',
    Projects: 'Project ➔ User Story ➔ Task hierarchy management.',
    GlobalSearch: 'Cross-workspace search for tasks, projects, and team members.',
    ProjectTimeline: 'Strategic roadmap and milestone phase progression.',
    TaskBoard: 'Agile Kanban task tracking and status management.',
    UserStories: 'Agile Hierarchy: Project ➔ User Story ➔ Tasks.',
    AttendanceLog: 'Team shift attendance and working hours log.',
    AsyncReports: 'Asynchronous background queues & report execution.',
    ProjectMap: 'Project site location map and status.',
    Settings: 'Workspace preferences and account configuration.',
    TeamSync: 'Team roster, member roles, and active status.',
    NewTask: 'Create new sprint task.',
    NewProject: 'Register new project workspace.',
    TaskBoardActivity: 'Task inspector and activity feed.',
    Profile: 'User profile and credentials.',
    SignUp: 'User authentication and access.',
    PerformanceAnalytics: 'Performance graphs, check-in charts & velocity analytics.',
    Landing: 'Welcome to Sahara Agile Works',
  };

  const isFullModalScreen = currentScreen === 'Landing' || currentScreen === 'SignUp' || currentScreen === 'GlobalSearch' || currentScreen === 'NewTask' || currentScreen === 'NewProject';

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#171512] flex flex-col lg:flex-row antialiased selection:bg-[#C49A5A] selection:text-[#0D0D0B]">
      {/* Sidebar Navigation */}
      {!isFullModalScreen && (
        <SidebarNavigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        {!isFullModalScreen && (
          <TopHeader
            title={`${currentScreen.replace(/([A-Z])/g, ' $1').trim()} - Sahara`}
            subtitle={screenSubtitles[currentScreen]}
            onNavigate={handleNavigate}
            onOpenMobileMenu={() => setIsMobileNavOpen(true)}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
            tasks={scopedTasks}
            onSelectTask={setSelectedTask}
            managedSector={managedSector}
            onSelectManagedSector={setManagedSector}
            notifications={notifications}
          />
        )}

        {/* Security Considerations & RBAC Policy Modal */}
        <SecurityNotesModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          currentRole={activeRole}
          onSwitchRole={switchActiveRole}
        />

        {/* Animated Screen Outlet */}
        <main className="flex-1 relative overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              variants={getVariants()}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {currentScreen === 'Dashboard' && (
                <DashboardScreen
                  tasks={scopedTasks}
                  activities={activities}
                  team={scopedTeam}
                  locations={scopedLocations}
                  stories={scopedStories}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'Projects' && (
                <ProjectsScreen
                  locations={scopedLocations}
                  stories={scopedStories}
                  tasks={scopedTasks}
                  timeline={timeline}
                  team={scopedTeam}
                  onAddTask={handleAddTask}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'GlobalSearch' && (
                <GlobalSearchScreen
                  tasks={scopedTasks}
                  team={scopedTeam}
                  locations={scopedLocations}
                  timeline={timeline}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'ProjectTimeline' && (
                <ProjectTimelineScreen
                  timeline={timeline}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'TaskBoard' && (
                <TaskBoardScreen
                  tasks={scopedTasks}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              )}

              {currentScreen === 'UserStories' && (
                <RbacGuard
                  requiredRole="Manager"
                  featureTitle="User Stories & Epic Hierarchy"
                  featureDescription="Managing agile user stories, epic backlog prioritization, and feature mapping requires Operations Manager privileges."
                  onNavigate={handleNavigate}
                >
                  <UserStoriesScreen
                    stories={scopedStories}
                    locations={scopedLocations}
                    tasks={scopedTasks}
                    team={scopedTeam}
                    onAddStory={handleAddStory}
                    onAddTask={handleAddTask}
                    onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                    onNavigate={handleNavigate}
                  />
                </RbacGuard>
              )}

              {currentScreen === 'AttendanceLog' && (
                <AttendanceLogScreen
                  attendanceLogs={scopedAttendance}
                  team={scopedTeam}
                  onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'PerformanceAnalytics' && (
                <PerformanceAnalyticsScreen
                  tasks={scopedTasks}
                  attendanceLogs={scopedAttendance}
                  team={scopedTeam}
                  onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'AsyncReports' && (
                <RbacGuard
                  requiredRole="Manager"
                  featureTitle="Async Jobs & Enterprise Reports"
                  featureDescription="Executing heavy asynchronous database queue jobs and generating executive reports is restricted to Manager credentials."
                  onNavigate={handleNavigate}
                >
                  <AsyncReportsScreen
                    asyncJobs={asyncJobs}
                    tasks={scopedTasks}
                    attendanceLogs={scopedAttendance}
                    onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                    onNavigate={handleNavigate}
                  />
                </RbacGuard>
              )}

              {currentScreen === 'ProjectMap' && (
                <ProjectMapScreen
                  locations={scopedLocations}
                  tasks={scopedTasks}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'Settings' && (
                <SettingsScreen onNavigate={handleNavigate} />
              )}

              {currentScreen === 'TeamSync' && (
                <TeamSyncScreen
                  team={scopedTeam}
                  onNavigate={handleNavigate}
                  onAddTeamMember={handleAddTeamMember}
                  onUpdateTeamMember={handleUpdateTeamMember}
                  activeRole={activeRole}
                />
              )}

              {currentScreen === 'NewTask' && (
                <NewTaskScreen
                  team={scopedTeam}
                  locations={scopedLocations}
                  onAddTask={handleAddTask}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'NewProject' && (
                <NewProjectScreen
                  team={scopedTeam}
                  onAddProject={handleAddProject}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'TaskBoardActivity' && (
                <TaskBoardActivityScreen
                  tasks={scopedTasks}
                  activities={activities}
                  selectedTask={selectedTask}
                  onNavigate={handleNavigate}
                  onAddActivity={handleAddActivity}
                />
              )}

              {currentScreen === 'SignUp' && (
                <SignUpScreen onNavigate={handleNavigate} />
              )}

              {currentScreen === 'Profile' && (
                <ProfileScreen
                  tasks={tasks}
                  attendanceLogs={attendanceLogs}
                  onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                  onNavigate={handleNavigate}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

