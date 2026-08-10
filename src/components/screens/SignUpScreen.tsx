import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SignUpProps {
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
}

const getFriendlyAuthErrorMessage = (err: any): string => {
  if (!err) return 'An error occurred during authentication.';
  const code = err?.code || '';
  const msg = err?.message || '';

  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Please switch to "Sign In" or use another email.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please enter at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in popup was closed before completing.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Google sign-in popup was blocked by browser. Please enable popups and try again.';
  }
  if (typeof msg === 'string' && msg.includes('auth/')) {
    return msg.replace(/^Firebase:\*?\s*/i, '').replace(/\(auth\/[^)]+\)\.?/g, '').trim();
  }
  return msg || 'Authentication failed. Please check your details and try again.';
};

export const SignUpScreen: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [signupType, setSignupType] = useState<'employee' | 'manager_create_team'>('manager_create_team');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldRole, setFieldRole] = useState('');
  const [teamName, setTeamName] = useState('');

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const [hasInviteNotice, setHasInviteNotice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qMode = params.get('mode');
    const qType = params.get('type');
    const inviteEmail = params.get('inviteEmail');
    const invitedTeam = params.get('team');

    if (qMode === 'signin') {
      setMode('signin');
    } else if (qMode === 'signup') {
      setMode('signup');
    }

    if (qType === 'employee') {
      setSignupType('employee');
    } else if (qType === 'manager_create_team') {
      setSignupType('manager_create_team');
    }

    if (inviteEmail) {
      setEmail(inviteEmail);
      setMode('signup');
      setSignupType('employee');
      setHasInviteNotice(true);
    }
    if (invitedTeam) {
      setTeamName(invitedTeam);
    }
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResetSuccessMsg('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive password reset instructions.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(email.trim());
      setResetSuccessMsg(`Password reset instructions sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        if (signupType === 'manager_create_team') {
          if (!teamName.trim()) {
            throw new Error('Please enter a valid Team Name for your organization.');
          }
          await signUpWithEmail(
            email.trim(),
            password,
            fullName.trim(),
            'Operations Manager',
            teamName.trim(),
            true
          );
        } else {
          await signUpWithEmail(
            email.trim(),
            password,
            fullName.trim(),
            fieldRole.trim() || 'Field Technician',
            teamName.trim() || 'Sahara Primary Team',
            false
          );
        }
      } else {
        if (!email.trim() || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (!password) {
          throw new Error('Please enter your password.');
        }
        await signInWithEmail(email.trim(), password);
      }
      setSubmitted(true);
      setTimeout(() => {
        onNavigate('Dashboard', 'slide_down');
      }, 800);
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (mode === 'signup' && signupType === 'manager_create_team') {
        if (!teamName.trim()) {
          throw new Error('Please enter a valid Team Name before registering with Google.');
        }
        await signInWithGoogle(
          fullName.trim() || undefined,
          'Operations Manager',
          teamName.trim(),
          true
        );
      } else if (mode === 'signup') {
        await signInWithGoogle(
          fullName.trim() || undefined,
          fieldRole.trim() || 'Field Technician',
          teamName.trim() || undefined,
          false
        );
      } else {
        await signInWithGoogle();
      }
      setSubmitted(true);
      setTimeout(() => {
        onNavigate('Dashboard', 'slide_down');
      }, 800);
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F3] p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white border border-[#F3E9DC] rounded-[32px] p-6 lg:p-10 space-y-6 shadow-md relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#D4A373]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#606C38] text-white flex items-center justify-center font-headline text-2xl font-light mx-auto shadow-sm">
            S
          </div>
          <h1 className="font-headline text-3xl font-light text-[#2D241E]">Sahara Agile Workspace</h1>
          <p className="text-xs text-[#8B5E3C]">Authenticate field credentials or register operator identity</p>
        </div>

        {/* Invitation Link Detected Notice */}
        {hasInviteNotice && (
          <div className="p-3.5 bg-[#FEFAE0] border border-[#E9EDC9] rounded-2xl flex items-start gap-3 text-xs text-[#606C38]">
            <span className="material-symbols-outlined text-lg text-[#606C38] shrink-0">mark_email_read</span>
            <div>
              <span className="font-bold block">Manager Invitation Link Detected!</span>
              <p className="text-[11px] opacity-90 mt-0.5">
                Signing up with <span className="font-mono font-bold text-[#3D3028]">{email}</span> will automatically verify your invitation and link you to your assigned team in Firestore.
              </p>
            </div>
          </div>
        )}

        {/* Primary Mode Switcher (Create Team vs Join Team vs Sign In) */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#FDF8F3] p-1.5 rounded-2xl border border-[#E5D5C0]">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignupType('manager_create_team');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mode === 'signup' && signupType === 'manager_create_team'
                ? 'bg-[#606C38] text-white shadow-xs'
                : 'text-[#5C4D42] hover:text-[#2D241E] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            <span className="truncate">Create Team</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignupType('employee');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mode === 'signup' && signupType === 'employee'
                ? 'bg-[#D4A373] text-white shadow-xs'
                : 'text-[#5C4D42] hover:text-[#2D241E] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span className="truncate">Join Team</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mode === 'signin'
                ? 'bg-[#2D241E] text-white shadow-xs'
                : 'text-[#5C4D42] hover:text-[#2D241E] hover:bg-white/50'
            }`}
          >
            <span className="material-symbols-outlined text-sm">login</span>
            <span className="truncate">Sign In</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#BC4749]/10 border border-[#BC4749]/30 text-[#BC4749] rounded-2xl text-xs text-center font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {resetSuccessMsg && (
          <div className="p-3.5 bg-[#FEFAE0] border border-[#E9EDC9] text-[#606C38] rounded-2xl text-xs text-center font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">mark_email_read</span>
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {/* Form Feedback or Active Auth Form */}
        {submitted ? (
          <div className="p-6 bg-[#FEFAE0] border border-[#E9EDC9] text-[#606C38] rounded-2xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#606C38]">verified_user</span>
            <h3 className="font-headline text-xl font-semibold">Authentication Successful!</h3>
            <p className="text-xs text-[#606C38]">
              {signupType === 'manager_create_team'
                ? 'Team created! Setting up Manager Dashboard...'
                : 'Registered as Employee! Redirecting to Workspace...'}
            </p>
          </div>
        ) : isResetMode ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-[#FEFAE0] border border-[#E9EDC9] rounded-2xl text-xs text-[#606C38] space-y-1">
              <span className="font-bold block flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock_reset</span>
                Reset Your Password
              </span>
              <p className="text-[11px] opacity-90">
                Enter your registered Sahara account email address below. We will send you a password reset link.
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D3028] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@sahara-agile.org"
                  className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-3.5 rounded-full text-xs font-medium shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Sending Instructions...' : 'Send Password Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setErrorMsg('');
                    setResetSuccessMsg('');
                  }}
                  className="w-full py-2 text-xs font-semibold text-[#8B5E3C] hover:text-[#3D3028] transition-colors"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full bg-[#FDF8F3] hover:bg-white text-[#3D3028] border border-[#E5D5C0] py-3 rounded-full text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#E5D5C0]" />
              <span className="text-[10px] uppercase font-bold text-[#8B5E3C]">or email credentials</span>
              <div className="flex-1 h-px bg-[#E5D5C0]" />
            </div>

            {/* Active Mode Banner */}
            {mode === 'signup' && (
              <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
                signupType === 'manager_create_team'
                  ? 'bg-[#FEFAE0] border-[#E9EDC9] text-[#606C38]'
                  : 'bg-[#FDF8F3] border-[#E5D5C0] text-[#8B5E3C]'
              }`}>
                <span className="material-symbols-outlined text-xl shrink-0">
                  {signupType === 'manager_create_team' ? 'groups' : 'person_add'}
                </span>
                <div>
                  <span className="font-bold block">
                    {signupType === 'manager_create_team'
                      ? 'Creating a New Team (Manager Role)'
                      : 'Joining an Existing Team'}
                  </span>
                  <span className="text-[11px] opacity-90">
                    {signupType === 'manager_create_team'
                      ? 'You will be registered as Team Manager with full administrative and approval rights.'
                      : 'Join your organization as an employee. Enter your assigned team name if known.'}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D3028] uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Amara Vance"
                    className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                  />
                </div>
              )}

              {mode === 'signup' && signupType === 'manager_create_team' && (
                <div className="space-y-1.5 bg-[#FEFAE0] border border-[#E9EDC9] p-3 rounded-2xl">
                  <label className="text-xs font-bold text-[#606C38] uppercase flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    <span>New Team / Organization Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. Sahara Solar & Water Team 4"
                    className="w-full bg-white border border-[#E5D5C0] focus:border-[#606C38] rounded-full px-4 py-2.5 text-xs font-semibold text-[#3D3028] outline-none"
                  />
                  <p className="text-[10px] text-[#606C38]">
                    Creating a team makes you the designated Team Manager with full administrative & task approval rights.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D3028] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@sahara-agile.org"
                  className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#3D3028] uppercase">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setErrorMsg('');
                        setResetSuccessMsg('');
                      }}
                      className="text-[11px] font-semibold text-[#D4A373] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full pl-4 pr-10 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B5E3C] hover:text-[#3D3028] flex items-center justify-center p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-[10px] text-[#8B5E3C] pl-2">
                    Must be at least 6 characters.
                  </p>
                )}
              </div>

              {mode === 'signup' && signupType === 'employee' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D3028] uppercase">Field Specialty</label>
                  <input
                    type="text"
                    required
                    value={fieldRole}
                    onChange={(e) => setFieldRole(e.target.value)}
                    placeholder="e.g. Field Technician"
                    className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-3.5 rounded-full text-xs font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                  <span>
                    {isSubmitting
                      ? 'Authenticating...'
                      : mode === 'signup'
                      ? signupType === 'manager_create_team'
                        ? 'Create Team & Register as Manager'
                        : 'Complete Employee Registration'
                      : 'Authenticate Credentials'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E5D5C0] flex items-center justify-between text-xs text-[#8B5E3C]">
          <button
            type="button"
            onClick={() => onNavigate('Landing', 'push_back')}
            className="text-[#D4A373] hover:underline font-semibold"
          >
            ← Back to Overview
          </button>

          <span>Sahara Encrypted</span>
        </div>
      </div>
    </div>
  );
};
