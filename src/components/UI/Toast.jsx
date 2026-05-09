import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useApp } from "../../context/AppContext";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: "border-emerald-500 bg-emerald-500/10 text-emerald-300",
  error: "border-red-500 bg-red-500/10 text-red-300",
  info: "border-zen-accent bg-zen-accent/10 text-zen-accent",
};

function ToastItem({ toast }) {
  const { removeToast } = useApp();
  const Icon = icons[toast.type] || Info;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-xl max-w-sm w-full ${colors[toast.type] || colors.info}`}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { state } = useApp();

  if (!state.toasts.length) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center px-4 w-full max-w-sm">
      {state.toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
