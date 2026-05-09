import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { ToastContainer } from "../UI/Toast";

export function AppShell() {
  return (
    <div className="min-h-screen bg-zen-void text-zen-text">
      <main className="pb-20 max-w-2xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}
