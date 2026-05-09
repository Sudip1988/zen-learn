import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useConfig } from "../hooks/useConfig";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Layout/Header";
import { AVAILABLE_MODELS, AVAILABLE_LANGUAGES } from "../config/defaults";
import { clearAllZenCache } from "../utils/cache";

function Section({ title, children }) {
  return (
    <div className="bg-zen-surface border border-zen-border rounded-2xl p-5 space-y-4">
      <h2 className="text-xs font-mono uppercase tracking-widest text-zen-muted">{title}</h2>
      {children}
    </div>
  );
}

export function Settings() {
  const { user, logout } = useAuth();
  const { getConfig, setConfig } = useConfig();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const cfg = getConfig();
  const [claudeModel, setClaudeModel] = useState(cfg.claudeModel);
  const [educatorCount, setEducatorCount] = useState(cfg.educatorCount);
  const [videosPerSkill, setVideosPerSkill] = useState(cfg.videosPerSkill);
  const [minDuration, setMinDuration] = useState(cfg.minVideoDurationSeconds);
  const [language, setLanguage] = useState(cfg.language);

  const save = (updates) => {
    setConfig(updates);
    addToast("Saved", "success");
  };

  const handleClearData = () => {
    if (!confirm("Clear all cached catalogues and data? This cannot be undone.")) return;
    clearAllZenCache();
    localStorage.removeItem("zen_catalogues");
    addToast("All cached data cleared", "info");
    navigate("/home");
  };

  return (
    <>
      <Header title="Settings" />
      <div className="p-4 space-y-3 max-w-2xl mx-auto">

        {/* AI Model */}
        <Section title="AI Model">
          <div>
            <label className="block text-xs font-mono text-zen-muted uppercase tracking-widest mb-2">
              Claude Model
            </label>
            <select
              value={claudeModel}
              onChange={(e) => { setClaudeModel(e.target.value); save({ claudeModel: e.target.value }); }}
              className="w-full bg-zen-void border border-zen-border rounded-xl px-4 py-3 text-zen-text focus:outline-none focus:border-zen-accent focus:shadow-glow-accent transition-all text-sm"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* Discovery Settings */}
        <Section title="Discovery">
          <div>
            <label className="block text-xs font-mono text-zen-muted uppercase tracking-widest mb-2">
              Educators per skill: <span className="text-zen-accent">{educatorCount}</span>
            </label>
            <input
              type="range" min={5} max={100} step={5} value={educatorCount}
              onChange={(e) => { const v = +e.target.value; setEducatorCount(v); save({ educatorCount: v }); }}
              className="w-full accent-zen-accent"
            />
            <div className="flex justify-between text-[10px] text-zen-muted font-mono mt-1">
              <span>5 (fast)</span><span>100 (thorough)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zen-muted uppercase tracking-widest mb-2">
              Max videos per catalogue: <span className="text-zen-accent">{videosPerSkill}</span>
            </label>
            <input
              type="range" min={20} max={200} step={10} value={videosPerSkill}
              onChange={(e) => { const v = +e.target.value; setVideosPerSkill(v); save({ videosPerSkill: v }); }}
              className="w-full accent-zen-accent"
            />
            <div className="flex justify-between text-[10px] text-zen-muted font-mono mt-1">
              <span>20</span><span>200</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zen-muted uppercase tracking-widest mb-2">
              Minimum video length
            </label>
            <select
              value={minDuration}
              onChange={(e) => { const v = +e.target.value; setMinDuration(v); save({ minVideoDurationSeconds: v }); }}
              className="w-full bg-zen-void border border-zen-border rounded-xl px-4 py-3 text-zen-text focus:outline-none focus:border-zen-accent transition-colors text-sm"
            >
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1200}>20 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zen-muted uppercase tracking-widest mb-2">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => { setLanguage(e.target.value); save({ language: e.target.value }); }}
              className="w-full bg-zen-void border border-zen-border rounded-xl px-4 py-3 text-zen-text focus:outline-none focus:border-zen-accent transition-colors text-sm"
            >
              {AVAILABLE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* Account */}
        <Section title="Account">
          {user && (
            <div className="flex items-center gap-3 pb-3 border-b border-zen-border">
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full ring-1 ring-zen-border" />
              )}
              <div>
                <p className="text-sm font-medium text-zen-text">{user.displayName}</p>
                <p className="text-xs text-zen-muted font-mono">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full py-2.5 border border-zen-border rounded-xl text-zen-text-secondary hover:text-red-400 hover:border-red-500/30 text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
          <button
            onClick={handleClearData}
            className="w-full py-2.5 border border-red-500/10 rounded-xl text-red-500/50 hover:text-red-400 hover:border-red-500/30 text-sm font-medium transition-colors"
          >
            Clear All Cached Data
          </button>
        </Section>

        <p className="text-center text-[10px] text-zen-muted font-mono pb-4">
          zen learn v{import.meta.env.VITE_APP_VERSION || "2.1.0"}
        </p>
      </div>
    </>
  );
}
