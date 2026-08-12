import { USE_EMULATORS } from './firebase';

export function getAuthErrorMessage(err: unknown): string {
  const error = err as { code?: string; message?: string };
  const code = error?.code || '';

  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email. Try Create Account or Continue as Guest.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try Sign In instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Allow popups and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and that the dev server is running.';
    case 'auth/operation-not-supported-in-this-environment':
      return USE_EMULATORS
        ? 'Google sign-in is limited in local dev mode. Use email/password or Continue as Guest.'
        : 'This sign-in method is not supported in your current environment.';
    default:
      return error?.message || 'Authentication failed. Please check your credentials.';
  }
}
