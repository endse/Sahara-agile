import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenId, TransitionType, Task, Activity, TeamMember, TimelineMilestone, SiteLocation } from './types';
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
  subscribeAttendance,
  subscribeAsyncJobs,
} from './services/firestoreService';
import { SidebarNavigation } from './components/SidebarNavigation';
import { TopHeader } from './components/TopHeader';

import { DashboardScreen } from './components/screens/DashboardScreen';
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
import { LandingScreen } from './components/screens/LandingScreen';
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
  const { user, userProfile, activeRole, switchActiveRole } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(user ? 'Dashboard' : 'Landing');
  const [transition, setTransition] = useState<TransitionType>('none');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Auto-redirect based on auth state:
  // - Logged-in users away from Landing/SignUp to Dashboard
  // - Logged-out users away from internal screens to Landing
  useEffect(() => {
    if (user && (currentScreen === 'Landing' || currentScreen === 'SignUp')) {
      setCurrentScreen('Dashboard');
    } else if (!user && currentScreen !== 'Landing' && currentScreen !== 'SignUp') {
      setCurrentScreen('Landing');
    }
  }, [user, currentScreen]);

  // Application State backed by Firestore
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>(INITIAL_TIMELINE);
  const [locations, setLocations] = useState<SiteLocation[]>(INITIAL_LOCATIONS);
  const [stories, setStories] = useState<import('./types').UserStory[]>(INITIAL_STORIES);
  const [attendanceLogs, setAttendanceLogs] = useState<import('./types').AttendanceLog[]>(INITIAL_ATTENDANCE);
  const [asyncJobs, setAsyncJobs] = useState<import('./types').AsyncJob[]>(INITIAL_ASYNC_JOBS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(tasks[0] || null);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!userProfile?.teamId) {
      // Clear data when logged out or pending team assignment
      setTasks([]);
      setLocations([]);
      setActivities([]);
      setTeam([]);
      setTimeline([]);
      setStories([]);
      setAttendanceLogs([]);
      setAsyncJobs([]);
      return;
    }

    const teamId = userProfile.teamId;

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

  const handleAddTask = async (newTask: Task) => {
    const enhancedTask: Task = {
        ...newTask,
        teamId: userProfile?.teamId || '',
      };
    setTasks(prev => [enhancedTask, ...prev]);
    await saveTask(enhancedTask);

    // Log activity
    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Amara Vance',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'created mission task',
      target: `${newTask.code} (${newTask.title})`,
      time: 'Just now',
      type: 'status',
      detail: `Assigned to ${newTask.assignee.name} at ${newTask.region}`,
      teamId: userProfile?.teamId || '',
    };
    setActivities(prev => [newAct, ...prev]);
    await saveActivity(newAct);
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
      temperature: '',
      teamId: userProfile?.teamId || '',
    };
    setLocations(prev => [newLoc, ...prev]);
    await saveLocation(newLoc);

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
      teamId: userProfile?.teamId || '',
    };
    setTimeline(prev => [newMilestone, ...prev]);
    await saveTimelineMilestone(newMilestone);

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
      teamId: userProfile?.teamId || '',
    };
    setActivities(prev => [newAct, ...prev]);
    await saveActivity(newAct);
  };

  const handleUpdateTimelineMilestone = async (item: TimelineMilestone) => {
    setTimeline(prev => prev.map(m => m.id === item.id ? item : m));
    await saveTimelineMilestone(item);
  };

  const handleAddActivity = async (newAct: Activity) => {
    const enhancedAct: Activity = { ...newAct, teamId: userProfile?.teamId || '' };
    setActivities(prev => [enhancedAct, ...prev]);
    await saveActivity(enhancedAct);
  };

  const handleAddTeamMember = async (newMember: TeamMember) => {
    const enhancedMember: TeamMember = { ...newMember, teamId: userProfile?.teamId || '' };
    setTeam(prev => [enhancedMember, ...prev]);
    await saveTeamMember(enhancedMember);

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Operations Manager',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'registered team member',
      target: `${newMember.name} (${newMember.role})`,
      time: 'Just now',
      type: 'assignment',
      detail: `Assigned to ${newMember.location || 'Al-Kufra Site A'} - Team: ${newMember.teamName || 'Sahara Team'}`,
      teamId: userProfile?.teamId || '',
    };
    setActivities(prev => [newAct, ...prev]);
    await saveActivity(newAct);
  };

  const handleUpdateTeamMember = async (updatedMember: TeamMember) => {
    setTeam(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    await saveTeamMember(updatedMember);

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Operations Manager',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'updated permission & role review',
      target: `${updatedMember.name} (${updatedMember.role})`,
      time: 'Just now',
      type: 'status',
      detail: `Status: ${updatedMember.permissionStatus || 'Approved'} - Team: ${updatedMember.teamName || 'General'}`,
      teamId: userProfile?.teamId || '',
    };
    setActivities(prev => [newAct, ...prev]);
    await saveActivity(newAct);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    if (!taskObj) return;

    if (activeRole === 'Employee') {
      // Employee request status update -> Sets approvalStatus to 'pending_approval' and logs approval request
      const updatedTask: Task = {
        ...taskObj,
        approvalStatus: 'pending_approval',
        pendingStatus: newStatus,
        statusRequestedBy: userProfile?.displayName || 'Field Operator',
        statusRequestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      await saveTask(updatedTask);

      const newAct: Activity = {
        id: `ACT-${Date.now()}`,
        user: userProfile?.displayName || 'Field Operator',
        avatar:
          userProfile?.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        action: 'requested task status approval',
        target: `${taskObj.code} (${taskObj.title})`,
        time: 'Just now',
        type: 'approval_request',
        detail: `Requested status change to "${newStatus.toUpperCase()}". Awaiting Manager Approval.`,
        taskId: taskObj.id,
        requiresManagerApproval: true,
        approvalStatus: 'pending',
        pendingStatus: newStatus,
        teamId: userProfile?.teamId || '',
      };

      setActivities((prev) => [newAct, ...prev]);
      await saveActivity(newAct);
    } else {
      // Manager directly updates status
      const updatedTask: Task = {
        ...taskObj,
        status: newStatus,
        approvalStatus: 'approved',
        pendingStatus: undefined,
        progress: newStatus === 'done' ? 100 : taskObj.progress,
        updatedAt: new Date().toISOString(),
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      await saveTask(updatedTask);

      const newAct: Activity = {
        id: `ACT-${Date.now()}`,
        user: userProfile?.displayName || 'Operations Manager',
        avatar:
          userProfile?.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        action: 'updated task status',
        target: `${taskObj.code} (${taskObj.title})`,
        time: 'Just now',
        type: 'status',
        detail: `Moved from ${taskObj.status.toUpperCase()} to ${newStatus.toUpperCase()}`,
        taskId: taskObj.id,
        teamId: userProfile?.teamId || '',
      };

      setActivities((prev) => [newAct, ...prev]);
      await saveActivity(newAct);
    }
  };

  const handleApproveTaskStatus = async (taskId: string) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    if (!taskObj) return;

    const approvedStatus = taskObj.pendingStatus || taskObj.status;
    const updatedTask: Task = {
      ...taskObj,
      status: approvedStatus,
      approvalStatus: 'approved',
      pendingStatus: undefined,
      progress: approvedStatus === 'done' ? 100 : taskObj.progress,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    await saveTask(updatedTask);

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Operations Manager',
      avatar:
        userProfile?.photoURL ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'approved task status change',
      target: `${taskObj.code} (${taskObj.title})`,
      time: 'Just now',
      type: 'status',
      detail: `Approved status change to "${approvedStatus.toUpperCase()}" requested by ${
        taskObj.statusRequestedBy || 'Employee'
      }`,
      taskId: taskObj.id,
      teamId: userProfile?.teamId || '',
    };

    setActivities((prev) => [newAct, ...prev]);
    await saveActivity(newAct);
  };

  const handleRejectTaskStatus = async (taskId: string) => {
    const taskObj = tasks.find((t) => t.id === taskId);
    if (!taskObj) return;

    const updatedTask: Task = {
      ...taskObj,
      approvalStatus: 'rejected',
      pendingStatus: undefined,
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    await saveTask(updatedTask);

    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Operations Manager',
      avatar:
        userProfile?.photoURL ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'rejected task status change',
      target: `${taskObj.code} (${taskObj.title})`,
      time: 'Just now',
      type: 'status',
      detail: `Declined status change request for task "${taskObj.title}"`,
      taskId: taskObj.id,
      teamId: userProfile?.teamId || '',
    };

    setActivities((prev) => [newAct, ...prev]);
    await saveActivity(newAct);
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
    Landing: 'Simple Workspace & Operations Platform',
    Dashboard: 'Live Operational Overview & Metrics',
    GlobalSearch: 'Search tasks, sites, and team members',
    ProjectTimeline: 'Project milestones and phases',
    TaskBoard: 'Track and manage team tasks',
    UserStories: 'Manage high-level project goals',
    AttendanceLog: 'Time tracking and shift logs',
    AsyncReports: 'Generate and view reports',
    ProjectMap: 'Geographic view of sites',
    Settings: 'Workspace settings and notifications',
    TeamSync: 'Manage team members and roles',
    NewTask: 'Create a new task',
    NewProject: 'Start a new project',
    TaskBoardActivity: 'Task details and activity feed',
    Profile: 'Manage your profile and credentials',
    SignUp: 'Sign in or create an account',
    PerformanceAnalytics: 'View performance and attendance charts',
  };

  const isFullModalScreen = currentScreen === 'Landing' || currentScreen === 'SignUp' || currentScreen === 'GlobalSearch' || currentScreen === 'NewTask' || currentScreen === 'NewProject';

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#3D3028] flex flex-col lg:flex-row antialiased selection:bg-[#D4A373] selection:text-white">
      {/* Sidebar Navigation */}
      {!isFullModalScreen && (
        <SidebarNavigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
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
            tasks={scopedTasks}
            allTasks={tasks}
            onSelectTask={setSelectedTask}
            onApproveTaskStatus={handleApproveTaskStatus}
            onRejectTaskStatus={handleRejectTaskStatus}
          />
        )}

        {/* Security Considerations & RBAC Policy Modal */}
        <SecurityNotesModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          currentRole={activeRole}
          onSwitchRole={() => switchActiveRole(activeRole === 'Manager' ? 'Employee' : 'Manager')}
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
              {currentScreen === 'Landing' && (
                <LandingScreen onNavigate={handleNavigate} />
              )}

              {currentScreen === 'Dashboard' && (
                <DashboardScreen
                  tasks={scopedTasks}
                  activities={scopedActivities}
                  team={scopedTeam}
                  locations={scopedLocations}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'GlobalSearch' && (
                <GlobalSearchScreen
                  tasks={scopedTasks}
                  team={scopedTeam}
                  locations={scopedLocations}
                  timeline={scopedTimeline}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'ProjectTimeline' && (
                <ProjectTimelineScreen
                  timeline={scopedTimeline}
                  tasks={scopedTasks}
                  team={scopedTeam}
                  locations={scopedLocations}
                  activeRole={activeRole}
                  onNavigate={handleNavigate}
                  onUpdateTimelineMilestone={handleUpdateTimelineMilestone}
                />
              )}

              {currentScreen === 'TaskBoard' && (
                <TaskBoardScreen
                  tasks={scopedTasks}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onApproveTaskStatus={handleApproveTaskStatus}
                  onRejectTaskStatus={handleRejectTaskStatus}
                  activeRole={activeRole}
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
                    asyncJobs={scopedAsyncJobs}
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
                  userProfile={userProfile}
                  isTeamManager={userProfile?.isTeamManager}
                  onRoleToggle={userProfile?.isTeamManager ? () => switchActiveRole(activeRole === 'Manager' ? 'Employee' : 'Manager') : undefined}
                />
              )}

              {currentScreen === 'NewTask' && (
                <NewTaskScreen
                  team={scopedTeam}
                  locations={scopedLocations}
                  milestones={scopedTimeline}
                  onAddTask={handleAddTask}
                  onNavigate={handleNavigate}
                />
              )}

              {currentScreen === 'NewProject' && (
                <RbacGuard
                  requiredRole="Manager"
                  featureTitle="New Infrastructure Project Initialization"
                  featureDescription="Registering new field stations, allocating sector budgets, and initializing infrastructure projects requires Operations Manager permissions."
                  onNavigate={handleNavigate}
                >
                  <NewProjectScreen
                    team={scopedTeam}
                    onAddProject={handleAddProject}
                    onNavigate={handleNavigate}
                  />
                </RbacGuard>
              )}

              {currentScreen === 'TaskBoardActivity' && (
                <TaskBoardActivityScreen
                  tasks={scopedTasks}
                  activities={activities}
                  selectedTask={selectedTask}
                  onNavigate={handleNavigate}
                  onAddActivity={handleAddActivity}
                  onApproveTaskStatus={handleApproveTaskStatus}
                  onRejectTaskStatus={handleRejectTaskStatus}
                  activeRole={activeRole}
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

