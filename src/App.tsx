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
import { UserStoriesScreen } from './components/screens/UserStoriesScreen';
import { AttendanceLogScreen } from './components/screens/AttendanceLogScreen';
import { AsyncReportsScreen } from './components/screens/AsyncReportsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SecurityNotesModal } from './components/SecurityNotesModal';
import { RbacGuard } from './components/RbacGuard';

function AppContent() {
  const { userProfile, activeRole, switchActiveRole } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('Dashboard');
  const [transition, setTransition] = useState<TransitionType>('none');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Application State backed by Firestore
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>(INITIAL_TIMELINE);
  const [locations, setLocations] = useState<SiteLocation[]>(INITIAL_LOCATIONS);
  const [stories, setStories] = useState<import('./types').UserStory[]>(INITIAL_STORIES);
  const [attendanceLogs, setAttendanceLogs] = useState<import('./types').AttendanceLog[]>(INITIAL_ATTENDANCE);
  const [asyncJobs, setAsyncJobs] = useState<import('./types').AsyncJob[]>(INITIAL_ASYNC_JOBS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(INITIAL_TASKS[0]);

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubTasks = subscribeTasks((data) => setTasks(data));
    const unsubLocs = subscribeLocations((data) => setLocations(data));
    const unsubActs = subscribeActivities((data) => setActivities(data));
    const unsubTeam = subscribeTeam((data) => setTeam(data));
    const unsubTimeline = subscribeTimeline((data) => setTimeline(data));
    const unsubStories = subscribeStories((data) => setStories(data));
    const unsubAttendance = subscribeAttendance((data) => setAttendanceLogs(data));
    const unsubJobs = subscribeAsyncJobs((data) => setAsyncJobs(data));

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
  }, []);

  // Sync selected task when tasks change
  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0]);
    } else if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
    }
  }, [tasks]);

  // Navigation handler
  const handleNavigate = (targetScreen: ScreenId, transType: TransitionType = 'none') => {
    setTransition(transType);
    setCurrentScreen(targetScreen);
  };

  const handleAddTask = async (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
    await saveTask(newTask);

    // Log activity
    const newAct: Activity = {
      id: `ACT-${Date.now()}`,
      user: userProfile?.displayName || 'Amara Vance',
      avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      action: 'created mission task',
      target: `${newTask.code} (${newTask.title})`,
      time: 'Just now',
      type: 'status',
      detail: `Assigned to ${newTask.assignee.name} at ${newTask.region}`
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
      temperature: '35°C'
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
      region: projectData.region
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
      detail: `Directed by ${projectData.lead} in ${projectData.region}`
    };
    setActivities(prev => [newAct, ...prev]);
    await saveActivity(newAct);
  };

  const handleAddActivity = async (newAct: Activity) => {
    setActivities(prev => [newAct, ...prev]);
    await saveActivity(newAct);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus, progress: newStatus === 'done' ? 100 : t.progress };
        }
        return t;
      })
    );
    await updateTaskStatus(taskId, newStatus);

    const taskObj = tasks.find(t => t.id === taskId);
    if (taskObj) {
      const newAct: Activity = {
        id: `ACT-${Date.now()}`,
        user: userProfile?.displayName || 'Amara Vance',
        avatar: userProfile?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        action: 'updated status of',
        target: `${taskObj.code} to ${newStatus.replace('_', ' ')}`,
        time: 'Just now',
        type: 'status'
      };
      setActivities(a => [newAct, ...a]);
      await saveActivity(newAct);
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
    Dashboard: 'Sector 04 Live Operational Overview & Metrics',
    GlobalSearch: 'Cross-index query engine for tasks, sites, and team members',
    ProjectTimeline: 'Strategic roadmap and milestone phase progression',
    TaskBoard: 'Agile Kanban task tracking and mission dispatch',
    UserStories: 'Agile Hierarchy: Project ➔ User Story ➔ Tasks',
    AttendanceLog: 'Live shift clock-in/out, hours tracking, and notes',
    AsyncReports: 'Asynchronous background queues & report execution',
    ProjectMap: 'GIS spatial telemetry & site location coordinates',
    Settings: 'Workspace parameters, notifications, and SatCom encryption',
    TeamSync: 'Field team roster, location tracking, and status',
    NewTask: 'Dispatch mission or field research objective',
    NewProject: 'Register new field site or infrastructure project',
    TaskBoardActivity: 'Task inspector with live telemetry activity feed',
    Profile: 'Dynamic operator profile, credentials, and field station assignment',
    SignUp: 'Field operator credential authentication'
  };

  const isFullModalScreen = currentScreen === 'SignUp' || currentScreen === 'GlobalSearch' || currentScreen === 'NewTask' || currentScreen === 'NewProject';

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
            tasks={tasks}
            onSelectTask={setSelectedTask}
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
                  tasks={tasks}
                  activities={activities}
                  team={team}
                  locations={locations}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'GlobalSearch' && (
                <GlobalSearchScreen
                  tasks={tasks}
                  team={team}
                  locations={locations}
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
                  tasks={tasks}
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
                    stories={stories}
                    locations={locations}
                    tasks={tasks}
                    onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                    onNavigate={handleNavigate}
                  />
                </RbacGuard>
              )}

              {currentScreen === 'AttendanceLog' && (
                <AttendanceLogScreen
                  attendanceLogs={attendanceLogs}
                  team={team}
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
                    tasks={tasks}
                    attendanceLogs={attendanceLogs}
                    onOpenMobileMenu={() => setIsMobileNavOpen(true)}
                    onNavigate={handleNavigate}
                  />
                </RbacGuard>
              )}

              {currentScreen === 'ProjectMap' && (
                <ProjectMapScreen
                  locations={locations}
                  tasks={tasks}
                  onNavigate={handleNavigate}
                  onSelectTask={(task) => setSelectedTask(task)}
                />
              )}

              {currentScreen === 'Settings' && (
                <SettingsScreen onNavigate={handleNavigate} />
              )}

              {currentScreen === 'TeamSync' && (
                <TeamSyncScreen team={team} onNavigate={handleNavigate} />
              )}

              {currentScreen === 'NewTask' && (
                <NewTaskScreen
                  team={team}
                  locations={locations}
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
                    team={team}
                    onAddProject={handleAddProject}
                    onNavigate={handleNavigate}
                  />
                </RbacGuard>
              )}

              {currentScreen === 'TaskBoardActivity' && (
                <TaskBoardActivityScreen
                  tasks={tasks}
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

