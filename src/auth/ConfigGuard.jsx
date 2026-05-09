import { Navigate, Outlet } from "react-router-dom";
import { useConfig } from "../hooks/useConfig";

export function ConfigGuard() {
  const { isConfigured, configLoading } = useConfig();

  if (configLoading) {
    return (
      <div className="min-h-screen bg-zen-void flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zen-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isConfigured) return <Navigate to="/setup" replace />;

  return <Outlet />;
}
