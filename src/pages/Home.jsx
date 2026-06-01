import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Settings, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { useCatalogue } from "../hooks/useCatalogue";
import { CatalogueCard } from "../components/Catalogue/CatalogueCard";
import { timeOfDayGreeting } from "../utils/format";

export function Home() {
  const { user, logout } = useAuth();
  const { catalogues, deleteCatalogue } = useCatalogue();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate("/discover", { state: { skillQuery: trimmed } });
  };

  const handleDelete = (id) => {
    deleteCatalogue(id);
  };

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const recent = catalogues.slice(0, 4);

  return (
    <div className="min-h-screen bg-zen-void text-zen-text">
      {/* Top bar with avatar */}
      <div className="flex items-center justify-end px-4 pt-5 max-w-xl mx-auto">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-zen-surface transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full ring-1 ring-zen-border" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-zen-accent/20 flex items-center justify-center text-zen-accent text-xs font-semibold">
                {firstName[0]}
              </div>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-zen-elevated border border-zen-border rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-zen-border">
                <p className="text-xs font-medium text-zen-text truncate">{user?.displayName}</p>
                <p className="text-[10px] text-zen-muted font-mono truncate">{user?.email}</p>
              </div>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-zen-text-secondary hover:text-zen-text hover:bg-zen-surface transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-6 pb-6 max-w-xl mx-auto">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-zen-muted text-xs font-mono uppercase tracking-widest mb-1">
            {timeOfDayGreeting()}
          </p>
          <h1 className="text-3xl font-bold text-zen-text tracking-tight">
            {firstName}
          </h1>
        </div>

        {/* Terminal-style search */}
        <div className="mb-10">
          <p className="text-zen-text-secondary text-sm mb-4 font-mono">
            // what do you want to master?
          </p>
          <form onSubmit={handleSearch}>
            <div className={`relative flex items-center bg-zen-surface rounded-xl border transition-all duration-200 ${
              focused
                ? "border-zen-accent shadow-glow-accent"
                : "border-zen-border hover:border-zen-border/80"
            }`}>
              <span className="pl-4 text-zen-accent font-mono text-sm select-none shrink-0">›</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="machine learning, stoic philosophy, options trading..."
                className="flex-1 bg-transparent px-3 py-4 text-zen-text placeholder-zen-muted font-mono text-sm focus:outline-none"
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="mr-3 shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-zen-accent hover:bg-zen-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Recent catalogues */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-zen-muted font-mono uppercase tracking-widest">Recent</p>
              <Link to="/catalogues" className="text-xs text-zen-accent hover:text-zen-accent-hover font-mono transition-colors">
                all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recent.map((cat) => (
                <CatalogueCard key={cat.id} catalogue={cat} onDelete={handleDelete} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {catalogues.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-8 h-8 text-zen-accent/40 mx-auto mb-3" />
            <p className="text-zen-muted text-sm font-mono">
              your first catalogue is one search away
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
