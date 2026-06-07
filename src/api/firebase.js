import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Use the app's own hostname as authDomain in production so Firebase's auth
// handler runs first-party — avoids iOS ITP blocking cross-origin storage.
const authDomain =
  window.location.hostname === "localhost"
    ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
    : window.location.hostname;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

export const db = getFirestore(app);
