import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../api/firebase";

const AuthContext = createContext(null);

function friendlyError(e) {
  if (e?.code === "auth/unauthorized-domain") {
    return `Domain not authorised in Firebase — add "${location.hostname}" to Firebase Console → Authentication → Authorized domains.`;
  }
  if (e?.code === "auth/popup-blocked") {
    return "Sign-in popup was blocked by the browser. Please allow popups for this site and try again.";
  }
  if (e?.code === "auth/popup-closed-by-user") {
    return null; // user dismissed — not an error
  }
  return e?.message ?? "Sign-in failed. Please try again.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setSignInError(null);
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, "invitations", firebaseUser.email));
          if (snap.exists() && snap.data().status === "approved") {
            setInviteStatus("approved");
            await setDoc(
              doc(db, "users", firebaseUser.uid),
              {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                lastLoginAt: serverTimestamp(),
              },
              { merge: true }
            );
          } else {
            setInviteStatus(snap.exists() ? snap.data().status : "none");
          }
        } catch {
          setInviteStatus("none");
        }
      } else {
        setUser(null);
        setInviteStatus(null);
      }
      setLoading(false);
    });
  }, []);

  const signInWithGoogle = async () => {
    setSignInError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      const msg = friendlyError(e);
      if (msg) setSignInError(msg);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, inviteStatus, loading, signInError, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
