import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SignUpProps {
  onNavigate: (screen: ScreenId, transition?: 'none' | 'push' | 'push_back' | 'slide_up' | 'slide_down') => void;
}

export const SignUpScreen: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } = useAuth();
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldRole, setFieldRole] = useState('Hydro-Geologist');
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
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
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
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication failed.');
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
    } catch (err: any) {
      setErrorMsg(err?.message || 'Guest login failed.');
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
          <p className="text-xs text-[#8B5E3C]">Authenticate field credentials or register new operator identity</p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-[#FDF8F3] p-1 rounded-full border border-[#E5D5C0]">
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-colors ${
              mode === 'signup' ? 'bg-[#D4A373] text-white shadow-xs' : 'text-[#5C4D42] hover:text-[#2D241E]'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-colors ${
              mode === 'signin' ? 'bg-[#D4A373] text-white shadow-xs' : 'text-[#5C4D42] hover:text-[#2D241E]'
            }`}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-[#BC4749]/10 border border-[#BC4749]/30 text-[#BC4749] rounded-2xl text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Feedback */}
        {submitted ? (
          <div className="p-6 bg-[#FEFAE0] border border-[#E9EDC9] text-[#606C38] rounded-2xl text-center space-y-2">
            <span className="material-symbols-outlined text-4xl text-[#606C38]">verified_user</span>
            <h3 className="font-headline text-xl font-semibold">Authentication Successful!</h3>
            <p className="text-xs text-[#606C38]">Redirecting to Live Operations Dashboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick OAuth Button */}
            <button
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D3028] uppercase">SatCom Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="a.vance@sahara-agile.org"
                  className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D3028] uppercase">Access Key / Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-4 py-3 text-xs font-semibold text-[#3D3028] outline-none"
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D3028] uppercase">Field Specialty</label>
                  <select
                    value={fieldRole}
                    onChange={(e) => setFieldRole(e.target.value)}
                    className="w-full bg-[#FDF8F3] border border-[#E5D5C0] focus:border-[#D4A373] rounded-full px-3 py-2.5 text-xs font-medium text-[#3D3028] outline-none"
                  >
                    <option>Hydro-Geologist</option>
                    <option>Grid Architect</option>
                    <option>Robotics Engineer</option>
                    <option>Ecologist</option>
                    <option>SatCom Specialist</option>
                  </select>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#606C38] hover:bg-[#4d572d] text-white py-3.5 rounded-full text-xs font-medium shadow-sm transition-colors"
                >
                  {isSubmitting ? 'Authenticating...' : mode === 'signup' ? 'Complete Operator Registration' : 'Authenticate Credentials'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#E5D5C0] flex items-center justify-between text-xs text-[#8B5E3C]">
          <button
            onClick={handleGuestSignIn}
            className="text-[#D4A373] hover:underline font-semibold"
          >
            ← Continue as Guest Lead
          </button>

          <span>Sahara Encrypted</span>
        </div>
      </div>
    </div>
  );
};

