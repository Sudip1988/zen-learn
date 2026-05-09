import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useDiscovery, STEPS } from "../hooks/useDiscovery";
import { DiscoveryProgress } from "../components/Discovery/DiscoveryProgress";

export function Discovery() {
  const navigate = useNavigate();
  const location = useLocation();
  const skillQuery = location.state?.skillQuery;
  const { discover, cancel, currentStep, progress, statusText, error } = useDiscovery();
  const started = useRef(false);

  useEffect(() => {
    if (!skillQuery) {
      navigate("/home", { replace: true });
      return;
    }
    if (started.current) return;
    started.current = true;

    discover(skillQuery)
      .then((catalogue) => {
        navigate(`/catalogue/${catalogue.id}`, { replace: true });
      })
      .catch(() => {
        // error state handled below
      });
  }, [skillQuery]);

  const handleCancel = () => {
    cancel();
    navigate("/home", { replace: true });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zen-void flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-zen-text mb-3">Discovery Failed</h2>
        <p className="text-zen-text-secondary text-sm mb-2 max-w-xs">{error}</p>
        <p className="text-zen-muted text-xs mb-8 max-w-xs">
          Check your API keys in Settings and your internet connection.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/settings")}
            className="px-5 py-2.5 border border-zen-border rounded-xl text-zen-text-secondary hover:text-zen-text text-sm transition-colors"
          >
            Settings
          </button>
          <button
            onClick={() => navigate("/home", { replace: true })}
            className="px-5 py-2.5 bg-zen-accent hover:bg-zen-accent-hover text-white font-semibold rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <DiscoveryProgress
      currentStep={currentStep}
      progress={progress}
      statusText={statusText}
      steps={STEPS}
      onCancel={handleCancel}
    />
  );
}
