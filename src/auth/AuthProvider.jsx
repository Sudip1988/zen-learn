import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../api/firebase";

const AuthContext = createContext(null);

function friendlyError(e) {
  if (e?.code === "auth/unauthorized-domain") {
    return `This domain is not authorised in Firebase. Add "${location.hostname}" to Firebase Console → Authentication → Authorized domains.`;
  }
  return friendlyError(e);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [inviteStatus, setInviteStatus] = useState(null); // null | "approved" | "pending" | "none"
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState(null);

  useEffect(() => {
    const redirectPending = localStorage.getItem("zen_redirect_pending") === "1";
    localStorage.removeItem("zen_redirect_pending");

    getRedirectResult(auth).catch((e) => {
      // Only suppress auth/no-auth-event when no redirect was attempted.
      // If a redirect WAS pending and we still get this, iOS cleared our auth
      // state mid-redirect — surface it so the user sees something.
      if (e?.code === "auth/no-auth-event" && !redirectPending) return;
      setSignInError(friendlyError(e));
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
    try {
      localStorage.setItem("zen_redirect_pending", "1");
      await signInWithRedirect(auth, provider);
    } catch (e) {
      localStorage.removeItem("zen_redirect_pending");
      setSignInError(friendlyError(e));
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
