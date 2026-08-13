import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../lib/authErrors';

interface SignUpProps {
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
}

export const SignUpScreen: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth();
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldRole, setFieldRole] = useState('Operations Specialist');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, fullName, fieldRole);
      } else {
        await signInWithEmail(email, password);
      }
      setSubmitted(true);
      setTimeout(() => {
        onNavigate('Dashboard', 'slide_down');
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      setSubmitted(true);
      setTimeout(() => {
        onNavigate('Dashboard', 'slide_down');
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInAsGuest();
      onNavigate('Dashboard', 'slide_down');
    } catch (err: unknown) {
      setErrorMsg(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white border border-[#E4DDD0] rounded-2xl p-6 lg:p-8 space-y-6 shadow-xs relative overflow-hidden">
        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#C49A5A] text-[#0D0D0B] flex items-center justify-center font-bold text-xl mx-auto shadow-xs">
            S
          </div>
          <h1 className="text-2xl font-bold text-[#171512]">Sahara Agile Works</h1>
          <p className="text-xs text-[#625C52]">Sign in to your account or register a new user profile</p>
          {USE_EMULATORS && (
            <p className="text-[10px] text-[#8A8378] bg-[#FBF9F4] border border-[#E4DDD0] rounded-lg px-3 py-1.5">
              Local dev mode — use email/password or Continue as Guest.
            </p>
          )}
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#FBF9F4] p-1 rounded-xl border border-[#E4DDD0]">
          <button
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              mode === 'signin' ? 'bg-[#171613] text-[#F7F3EA] shadow-2xs' : 'text-[#625C52] hover:text-[#171512]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
              mode === 'signup' ? 'bg-[#171613] text-[#F7F3EA] shadow-2xs' : 'text-[#625C52] hover:text-[#171512]'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-emerald-600">verified_user</span>
            <h3 className="text-lg font-bold">Authentication Successful!</h3>
            <p className="text-xs text-emerald-700">Redirecting to Dashboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full bg-[#FBF9F4] hover:bg-[#F7F3EA] text-[#171512] border border-[#E4DDD0] py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs"
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
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#E4DDD0]" />
              <span className="text-[10px] uppercase font-bold text-[#8A8378]">or with email</span>
              <div className="flex-1 h-px bg-[#E4DDD0]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label htmlFor="full-name" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Full Name</label>
                  <input
                    id="full-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amara Vance"
                    className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="email-address" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Email Address</label>
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amara.vance@sahara.io"
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-password" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Password</label>
                <input
                  id="user-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#171512] outline-none"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label htmlFor="specialty-role" className="text-xs font-bold text-[#171512] uppercase tracking-wider">Role Specialty</label>
                  <select
                    id="specialty-role"
                    value={fieldRole}
                    onChange={(e) => setFieldRole(e.target.value)}
                    className="w-full bg-[#FBF9F4] border border-[#E4DDD0] focus:border-[#C49A5A] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#171512] outline-none"
                  >
                    <option>Operations Manager</option>
                    <option>Field Specialist</option>
                    <option>Software Engineer</option>
                    <option>Project Lead</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C49A5A] hover:bg-[#A8793A] text-[#0D0D0B] py-3 rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Authenticating...' : mode === 'signup' ? 'Complete Registration' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E4DDD0] flex items-center justify-between text-xs text-[#625C52]">
          <button
            onClick={handleGuestSignIn}
            className="text-[#A8793A] hover:underline font-bold"
          >
            ← Continue as Guest
          </button>

          <button
            onClick={() => onNavigate('Dashboard', 'none')}
            className="text-[#625C52] hover:text-[#171512]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
