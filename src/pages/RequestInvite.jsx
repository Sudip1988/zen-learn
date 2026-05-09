import { useState } from "react";
import { Link } from "react-router-dom";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../api/firebase";
import { useAuth } from "../auth/AuthProvider";
import { GoogleSignIn } from "../auth/GoogleSignIn";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";

export function RequestInvite() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [learnGoal, setLearnGoal] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | already_pending | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    try {
      const ref = doc(db, "invitations", email);
      const existing = await getDoc(ref);
      if (existing.exists()) {
        setStatus("already_pending");
        return;
      }

      await setDoc(ref, {
        status: "pending",
        requestedAt: serverTimestamp(),
        displayName: name,
        email,
        intendedUse: learnGoal,
      });
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-zen-text mb-3">Request Submitted!</h1>
        <p className="text-zen-text-secondary max-w-xs">
          We'll notify you at <span className="text-zen-text font-medium">{email}</span> when
          your application is approved.
        </p>
        <Link to="/" className="mt-8 text-zen-accent hover:underline text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  if (status === "already_pending") {
    return (
      <div className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-zen-text mb-3">Already Pending</h1>
        <p className="text-zen-text-secondary max-w-xs">
          Your request for <span className="text-zen-text font-medium">{email}</span> is already
          under review. We'll email you when it's approved.
        </p>
        <Link to="/" className="mt-8 text-zen-accent hover:underline text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text">
      <div className="max-w-md mx-auto p-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-zen-muted hover:text-zen-text text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-2">Request Access</h1>
        <p className="text-zen-text-secondary mb-8">
          Zen Learn is invite-only. Tell us a bit about yourself and what you want to
          learn.
        </p>

        {!user ? (
          <div className="bg-zen-surface border border-zen-border rounded-2xl p-6 text-center">
            <p className="text-zen-text-secondary mb-4 text-sm">
              Sign in with Google first so we can track your request.
            </p>
            <GoogleSignIn className="mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zen-text-secondary mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-zen-surface border border-zen-border rounded-xl px-4 py-3 text-zen-text placeholder-zen-muted focus:outline-none focus:border-zen-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zen-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly={!!user?.email}
                className="w-full bg-zen-surface border border-zen-border rounded-xl px-4 py-3 text-zen-text placeholder-zen-muted focus:outline-none focus:border-zen-accent transition-colors opacity-70 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zen-text-secondary mb-1.5">
                What do you want to learn?
              </label>
              <textarea
                value={learnGoal}
                onChange={(e) => setLearnGoal(e.target.value)}
                placeholder="e.g. I want to learn machine learning fundamentals and eventually build my own models..."
                rows={4}
                className="w-full bg-zen-surface border border-zen-border rounded-xl px-4 py-3 text-zen-text placeholder-zen-muted focus:outline-none focus:border-zen-accent transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || !email}
              className="w-full bg-zen-accent hover:bg-zen-accent-hover disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {status === "submitting" ? "Submitting..." : "Request Access"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
