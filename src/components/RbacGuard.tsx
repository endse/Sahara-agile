import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ScreenId } from '../types';

interface RbacGuardProps {
  requiredRole?: 'Manager' | 'Employee';
  featureTitle: string;
  featureDescription?: string;
  onNavigate: (screen: ScreenId) => void;
  children: React.ReactNode;
}

export const RbacGuard: React.FC<RbacGuardProps> = ({
  requiredRole = 'Manager',
  featureTitle,
  featureDescription,
  onNavigate,
  children,
}) => {
  const { activeRole, switchActiveRole } = useAuth();

  const isAccessGranted = requiredRole === 'Employee' || activeRole === requiredRole;

  if (isAccessGranted) {
    return <>{children}</>;
  }

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto flex items-center justify-center min-h-[70vh]">
      <div className="bg-[#FDF8F3] border-2 border-amber-500/40 rounded-3xl p-8 lg:p-12 text-center space-y-6 shadow-md relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Security Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-900 border border-amber-500/40 flex items-center justify-center mx-auto text-3xl font-bold shadow-xs">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-200/80 text-amber-950 font-mono font-bold text-[11px] rounded-full uppercase border border-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span>RBAC Restricted Feature</span>
          </div>

          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#2D241E]">
            {featureTitle} Access Restricted
          </h2>

          <p className="text-sm text-[#8B5E3C] leading-relaxed">
            {featureDescription ||
              `Your current active role is set to Employee. Accessing ${featureTitle} requires Operations Manager authorization and managerial privileges.`}
          </p>
        </div>

        {/* Current Active Role Box */}
        <div className="bg-[#F3E9DC] border border-[#E5D5C0] rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-1">
          <div className="flex items-center justify-between text-[#3D3028] font-bold">
            <span>Your Active Session:</span>
            <span className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300">
              Employee (Field Staff)
            </span>
          </div>
          <p className="text-[#8B5E3C] text-[11px]">
            Field staff operators can view assigned tasks, log shift attendance, and collaborate on site maps. Executive project setup and job queue management are reserved for Managers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => switchActiveRole('Manager')}
            className="w-full sm:w-auto px-6 py-3 bg-[#606C38] hover:bg-[#4d572d] text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>Switch to Manager Role (Evaluation Mode)</span>
          </button>

          <button
            onClick={() => onNavigate('Dashboard')}
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-stone-50 text-[#3D3028] border border-[#E5D5C0] font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
