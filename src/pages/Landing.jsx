import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { GoogleSignIn } from "../auth/GoogleSignIn";
import { Sparkles } from "lucide-react";

export function Landing() {
  const { user, inviteStatus, loading, signInError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && inviteStatus === "approved") {
      navigate("/home", { replace: true });
    }
  }, [user, inviteStatus, loading, navigate]);

  return (
    <div className="min-h-screen bg-zen-void flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <div className="relative mb-8">
          <div className="w-16 h-16 bg-zen-accent/10 border border-zen-accent/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-zen-accent" />
          </div>
          {/* Subtle glow */}
          <div className="absolute inset-0 rounded-2xl bg-zen-accent/5 blur-xl scale-150 -z-10" />
        </div>

        <h1 className="text-4xl font-bold text-zen-text mb-2 tracking-tight">
          Zen Learn
        </h1>
        <p className="text-base text-zen-text-secondary mb-3">
          YouTube, but only what matters.
        </p>
        <p className="text-sm text-zen-muted mb-10 max-w-xs leading-relaxed">
          AI-curated educational catalogues. No recommendations. No rabbit holes. Just learning.
        </p>

        <div className="flex flex-col items-center gap-4 w-full max-w-[280px]">
          <GoogleSignIn />
          {signInError && (
            <p className="text-xs text-red-400 font-mono text-center leading-relaxed">
              {signInError}
            </p>
          )}
          <Link
            to="/request-invite"
            className="text-sm text-zen-muted hover:text-zen-text-secondary transition-colors font-mono"
          >
            request an invitation →
          </Link>
        </div>
      </div>

      <footer className="p-6 text-center text-[10px] text-zen-muted font-mono tracking-wide">
        invite-only beta · no ads · no algorithm
      </footer>
    </div>
  );
}
