import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigRaw from '../../firebase-applet-config.json';

const firebaseConfig = {
  ...firebaseConfigRaw,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_API_KEY || firebaseConfigRaw.apiKey,
};

// When running locally, use the Firebase Emulator Suite as the provisioned database.
// Set VITE_USE_EMULATORS=true (done automatically by server.ts / build:local) so that
// all reads/writes target the emulators instead of the cloud project.
export const USE_EMULATORS = import.meta.env.VITE_USE_EMULATORS === 'true';

// Emulators run under demo-sahara and only expose the default Firestore database.
const effectiveConfig = USE_EMULATORS
  ? { ...firebaseConfig, projectId: 'demo-sahara' }
  : firebaseConfig;

const app = getApps().length === 0 ? initializeApp(effectiveConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db =
  USE_EMULATORS || !firebaseConfig.firestoreDatabaseId
    ? getFirestore(app)
    : getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const storage = getStorage(app);

if (USE_EMULATORS) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export default app;
