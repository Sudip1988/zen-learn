import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Clock, Lock, LogOut } from "lucide-react";

export function InviteGate() {
  const { user, inviteStatus, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-6 text-zen-text">
      <div className="max-w-md w-full bg-zen-surface border border-zen-border rounded-2xl p-8 text-center">
        {inviteStatus === "pending" ? (
          <>
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Request Under Review</h1>
            <p className="text-zen-text-secondary mb-6">
              We received your application. We'll notify you at{" "}
              <span className="text-zen-text font-medium">{user?.email}</span> when approved.
            </p>
            <p className="text-sm text-zen-muted">
              This usually takes 1–2 business days.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-zen-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-zen-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Invite Only</h1>
            <p className="text-zen-text-secondary mb-6">
              Zen Learn is currently invite-only. Request access and we'll review
              your application.
            </p>
            <Link
              to="/request-invite"
              className="inline-block bg-zen-accent hover:bg-zen-accent-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Request Access
            </Link>
          </>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 mx-auto mt-6 text-zen-muted hover:text-zen-text text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
