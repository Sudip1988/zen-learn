import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../api/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(null); // null | "approved" | "pending" | "none"
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState(null);

  useEffect(() => {
    getRedirectResult(auth).catch((e) => {
      // Ignore the "no pending redirect" case — that's normal on every page load
      if (e?.code !== "auth/no-auth-event") {
        setSignInError(e?.message ?? "Sign-in failed. Please try again.");
      }
    });
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
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e) {
      setSignInError(e?.message ?? "Sign-in failed. Please try again.");
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
