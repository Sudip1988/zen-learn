import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { InviteGate } from "./InviteGate";

export function AuthGuard() {
  const { user, inviteStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zen-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zen-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (inviteStatus !== "approved") return <InviteGate />;

  return <Outlet />;
}
