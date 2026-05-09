import { CheckCircle, Circle, XCircle } from "lucide-react";

function ThreeDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-zen-accent animate-dot-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function DiscoveryProgress({ currentStep, progress, statusText, steps, onCancel }) {
  return (
    <div className="min-h-screen bg-zen-void flex flex-col">
      {/* Thin top progress bar */}
      <div className="h-0.5 bg-zen-surface w-full shrink-0">
        <div
          className="h-full progress-shimmer rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Status with animated dots */}
        <div className="flex items-center gap-3 mb-2">
          {currentStep && <ThreeDots />}
          <p className="text-lg font-semibold text-zen-text">
            {currentStep
              ? steps.find((s) => s.id === currentStep)?.label || "Working..."
              : "Done"}
          </p>
        </div>

        {statusText && (
          <p className="text-sm text-zen-text-secondary text-center mb-10 max-w-sm font-mono">
            {statusText}
          </p>
        )}

        {/* Step list — minimal */}
        <div className="space-y-2.5 w-full max-w-xs mb-12">
          {steps.map((step) => {
            const stepIndex = steps.findIndex((s) => s.id === step.id);
            const currentIndex = steps.findIndex((s) => s.id === currentStep);
            const isDone = currentIndex > stepIndex || progress === 100;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex items-center gap-3">
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-zen-accent shrink-0" />
                ) : isActive ? (
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-zen-accent animate-pulse" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-zen-border shrink-0" />
                )}
                <span
                  className={`text-sm font-mono transition-colors ${
                    isDone
                      ? "text-zen-text-secondary"
                      : isActive
                      ? "text-zen-accent"
                      : "text-zen-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={onCancel}
          className="text-zen-muted hover:text-zen-text-secondary text-xs font-mono transition-colors flex items-center gap-1.5"
        >
          <XCircle className="w-3.5 h-3.5" />
          cancel
        </button>
      </div>
    </div>
  );
}
