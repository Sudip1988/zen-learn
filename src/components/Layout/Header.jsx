import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function Header({ title, showBack = false, right = null }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-zen-void/95 backdrop-blur-md border-b border-zen-border">
      <div className="flex items-center h-14 px-4 gap-3 max-w-2xl mx-auto">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-xl text-zen-text-secondary hover:text-zen-text hover:bg-zen-surface transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        {title && (
          <h1 className="flex-1 font-semibold text-zen-text truncate">{title}</h1>
        )}
        {right && <div className="ml-auto">{right}</div>}
      </div>
    </header>
  );
}
