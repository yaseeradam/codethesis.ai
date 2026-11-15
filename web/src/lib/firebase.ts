import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  Auth,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyC2zu15-aTCs4p144t1rRUyV9CdqY4wFmk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'codethesis-ba905.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'codethesis-ba905',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'codethesis-ba905.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '459096797780',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:459096797780:web:b008fd2e16e0c9b7cc73c1',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-N23VFWNP9N',
};

// Initialize Firebase App safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface GoogleAuthResult {
  success: boolean;
  user?: {
    email: string;
    fullName: string;
    photoURL?: string;
    uid: string;
  };
  error?: string;
}

/**
 * Triggers Firebase Google Sign-In Popup.
 * Authenticates with real Google accounts via Firebase.
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Authentication is only available in the browser.' };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser: FirebaseUser = result.user;

    if (!fbUser.email) {
      return { success: false, error: 'No email address was provided by Google account.' };
    }

    return {
      success: true,
      user: {
        email: fbUser.email,
        fullName: fbUser.displayName || fbUser.email.split('@')[0],
        photoURL: fbUser.photoURL || undefined,
        uid: fbUser.uid,
      },
    };
  } catch (err: any) {
    const errorCode = err?.code || 'auth/unknown';
    const errorMsg = err?.message || 'Google Sign-In failed.';
    console.error(`Firebase Google Sign-In Error [${errorCode}]:`, errorMsg);

    if (errorCode === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Google sign-in popup was closed before completion.' };
    }
    if (errorCode === 'auth/popup-blocked') {
      return { success: false, error: 'Popup blocked by your browser. Please enable popups for this site and try again.' };
    }
    if (errorCode === 'auth/cancelled-popup-request') {
      return { success: false, error: 'A sign-in request is already in progress.' };
    }
    if (errorCode === 'auth/unauthorized-domain') {
      return { success: false, error: 'Domain unauthorized in Firebase. Add localhost to Firebase Console -> Authentication -> Settings -> Authorized Domains.' };
    }
    if (errorCode === 'auth/operation-not-allowed') {
      return { success: false, error: 'Google Sign-In is disabled in Firebase Console -> Authentication -> Sign-in method.' };
    }

    return {
      success: false,
      error: `Google Sign-In failed: ${errorMsg}`,
    };
  }
}

export { app, auth, googleProvider, firebaseSignOut };
