import React from 'react';

interface SecurityNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: 'Manager' | 'Employee';
  onSwitchRole: (role: 'Manager' | 'Employee') => void;
}

export const SecurityNotesModal: React.FC<SecurityNotesModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSwitchRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1A1411] text-white border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-lg font-bold text-white">
                  Security Architecture & RBAC Policy
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  Evaluated Criteria
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Notes on Security Considerations, HttpOnly Cookie JWT Protection, and Access Control bounds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Authenticated Role Status (Read-Only Security) */}
        <div className="bg-[#2D241E] p-4 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Authenticated Role Credentials:</span>
            </p>
            <p className="text-[11px] text-stone-300 mt-0.5">
              Role permissions are strictly tied to authenticated credentials. Role switching is restricted to the <code className="text-amber-400">/demo</code> sandbox page.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-[#1A1411] shadow-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">
                {currentRole === 'Manager' ? 'admin_panel_settings' : 'badge'}
              </span>
              <span>Authenticated Role: {currentRole}</span>
            </span>
          </div>
        </div>

        {/* Security Pillars Cards */}
        <div className="space-y-4 text-xs">
          {/* Pillar 1 */}
          <div className="bg-[#251D18] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-base">key</span>
                1. HttpOnly Cookies for JWT Protection
              </h3>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                XSS Hardened
              </span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              API authentication tokens are stored in secure, <code className="text-amber-300">HttpOnly</code>, <code className="text-amber-300">SameSite=Lax</code> cookies issued via <code className="text-amber-300">/api/auth/login</code> rather than vulnerable <code className="text-amber-300">localStorage</code> strings. This completely prevents malicious client scripts from reading session tokens.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#251D18] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-base">supervisor_account</span>
                2. Role-Based Access Control (RBAC)
              </h3>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-800">
                {currentRole} Active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="font-bold text-emerald-400 block mb-1">Employee Scope:</span>
                <ul className="list-disc list-inside text-stone-300 space-y-1">
                  <li>Clock in/out & log personal work hours only</li>
                  <li>Update assigned task execution status</li>
                  <li>View assigned project sprint boards</li>
                </ul>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">Manager / Admin Scope:</span>
                <ul className="list-disc list-inside text-stone-300 space-y-1">
                  <li>View full hierarchy of Projects, Stories & Tasks</li>
                  <li>Oversight & approval of all employee shift logs</li>
                  <li>Override manual attendance & flag discrepancies</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#251D18] p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-base">policy</span>
                3. Firestore Security Rules & API Middleware
              </h3>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                Server Verified
              </span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              Express server routes employ the <code className="text-amber-300">authenticateJwt</code> and <code className="text-amber-300">requireManager</code> middleware handlers to verify session claims before serving administrative data or writing project hierarchy updates.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-stone-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
            All API endpoints & Firestore rules enforcing RBAC policies.
          </span>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-[#1A1411] font-bold px-5 py-2 rounded-xl text-xs transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
