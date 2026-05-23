import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { CheckCircle, XCircle, Loader, Clock, ShieldCheck } from "lucide-react";
import { db } from "../api/firebase";
import { useAuth } from "../auth/AuthProvider";
import { useConfig } from "../hooks/useConfig";
import { useApp } from "../context/AppContext";
import { Header } from "../components/Layout/Header";
import { AVAILABLE_MODELS, AVAILABLE_LANGUAGES } from "../config/defaults";
import { clearAllZenCache } from "../utils/cache";
import { isAdmin } from "../config/admins";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-zen-surface border border-zen-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-zen-muted" />}
        <h2 className="text-xs font-mono uppercase tracking-widest text-zen-muted">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Admin: Pending Invitations ───────────────────────────────────────────────
function AdminInvitations() {
  const { addToast } = useApp();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "invitations"), where("status", "==", "pending"));
      const snap = await getDocs(q);
      setInvites(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      addToast("Failed to load invitations", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const approve = async (email) => {
    setApproving(email);
    try {
      await updateDoc(doc(db, "invitations", email), { status: "approved" });
      setInvites((prev) => prev.filter((i) => i.id !== email));
      addToast(`Approved ${email}`, "success");
    } catch (e) {
      addToast("Failed to approve", "error");
    } finally {
      setApproving(null);
    }
  };

  const reject = async (email) => {
    setApproving(email + "_reject");
    try {
      await updateDoc(doc(db, "invitations", email), { status: "rejected" });
      setInvites((prev) => prev.filter((i) => i.id !== email));
      addToast(`Rejected ${email}`, "info");
    } catch (e) {
      addToast("Failed to reject", "error");
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zen-muted py-2">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-xs font-mono">Loading...</span>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <p className="text-xs text-zen-muted font-mono py-2">
        No pending invitations
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-start gap-3 bg-zen-void border border-zen-border rounded-xl p-3"
        >
          <Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zen-text truncate">{invite.displayName || "—"}</p>
            <p className="text-xs text-zen-muted font-mono truncate">{invite.email}</p>
            {invite.intendedUse && (
              <p className="text-xs text-zen-text-secondary mt-1 line-clamp-2 leading-relaxed">
                {invite.intendedUse}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={() => approve(invite.email)}
              disabled={!!approving}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
            >
              {approving === invite.email ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
              Approve
            </button>
            <button
              onClick={() => reject(invite.email)}
              disabled={!!approving}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
            >
              {approving === invite.email + "_reject" ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              Reject
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={load}
        className="text-xs text-zen-muted font-mono hover:text-zen-text-secondary transition-colors"
      >
        ↻ refresh
      </button>
    </div>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────
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

  const admin = isAdmin(user?.email);

  const save = (updates) => {
    setConfig(updates);
    addToast("Saved", "success");
  };

  const handleClearData = () => {
    if (!confirm("Clear all cached catalogues and data? This cannot be undone.")) return;
    clearAllZenCache();
    if (user?.uid) localStorage.removeItem(`zen_catalogues_${user.uid}`);
    addToast("All cached data cleared", "info");
    navigate("/home");
  };

  return (
    <>
      <Header title="Settings" />
      <div className="p-4 space-y-3 max-w-2xl mx-auto">

        {/* Admin — Invitations (only visible to admins) */}
        {admin && (
          <Section title="Pending Invitations" icon={ShieldCheck}>
            <AdminInvitations />
          </Section>
        )}

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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-zen-text">{user.displayName}</p>
                  {admin && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-zen-accent bg-zen-accent/10 border border-zen-accent/20 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" /> admin
                    </span>
                  )}
                </div>
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
