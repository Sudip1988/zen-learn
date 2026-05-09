import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, CheckCircle, XCircle, Loader,
  ChevronDown, ChevronUp, Sparkles, Youtube, ArrowRight, Check,
} from "lucide-react";
import { useConfig } from "../hooks/useConfig";

function AccordionTip({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zen-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zen-surface/50 transition-colors"
      >
        <span className="text-sm text-zen-text-secondary font-medium">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zen-muted shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zen-muted shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-zen-border bg-zen-surface/30 text-sm text-zen-muted space-y-2 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

function KeyField({ value, onChange, placeholder = "sk-ant-..." }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full bg-zen-void border border-zen-border focus:border-zen-accent focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] rounded-xl px-4 py-3.5 pr-10 text-zen-text placeholder-zen-muted font-mono text-sm transition-all outline-none"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zen-muted hover:text-zen-text transition-colors"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function TestButton({ onTest, status, disabled }) {
  return (
    <button
      type="button"
      onClick={onTest}
      disabled={disabled || status === "testing"}
      className="flex items-center gap-2 px-4 py-2.5 border border-zen-border rounded-xl text-sm text-zen-text-secondary hover:text-zen-text hover:border-zen-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {status === "testing" ? (
        <Loader className="w-4 h-4 animate-spin" />
      ) : status === "ok" ? (
        <CheckCircle className="w-4 h-4 text-emerald-400" />
      ) : status === "fail" ? (
        <XCircle className="w-4 h-4 text-red-400" />
      ) : null}
      {status === "ok" ? "Valid" : status === "fail" ? "Invalid" : "Test key"}
    </button>
  );
}

const STEPS = [
  { id: "anthropic", icon: Sparkles, label: "Anthropic API Key" },
  { id: "youtube", icon: Youtube, label: "YouTube API Key" },
];

export function Setup() {
  const { setConfig } = useConfig();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [anthropicKey, setAnthropicKey] = useState("");
  const [youtubeKey, setYoutubeKey] = useState("");
  const [anthropicStatus, setAnthropicStatus] = useState(null);
  const [youtubeStatus, setYoutubeStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const testAnthropic = async () => {
    setAnthropicStatus("testing");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 10,
          messages: [{ role: "user", content: "Hi" }],
        }),
      });
      setAnthropicStatus(res.ok ? "ok" : "fail");
    } catch {
      setAnthropicStatus("fail");
    }
  };

  const testYouTube = async () => {
    setYoutubeStatus("testing");
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=id&maxResults=1&q=test&key=${youtubeKey}`
      );
      const data = await res.json();
      setYoutubeStatus(data.error ? "fail" : "ok");
    } catch {
      setYoutubeStatus("fail");
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await setConfig({ anthropicApiKey: anthropicKey, youtubeApiKey: youtubeKey });
      navigate("/home", { replace: true });
    } catch {
      setSaving(false);
    }
  };

  const canAdvanceStep0 = anthropicKey.trim().length > 10 && anthropicStatus === "ok";
  const canFinish = youtubeKey.trim().length > 10 && youtubeStatus === "ok";

  return (
    <div className="min-h-screen bg-zen-void flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zen-accent/10 border border-zen-accent/20 mb-4">
          <Sparkles className="w-7 h-7 text-zen-accent" />
        </div>
        <h1 className="text-2xl font-bold text-zen-text tracking-tight">Welcome to Zen Learn</h1>
        <p className="text-zen-muted text-sm mt-2 max-w-xs mx-auto">
          Your API keys are stored securely in your private account — never on our servers.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === step
                  ? "bg-zen-accent/20 text-zen-accent border border-zen-accent/30"
                  : i < step
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-zen-surface text-zen-muted border border-zen-border"
              }`}
            >
              {i < step ? (
                <Check className="w-3 h-3" />
              ) : (
                <s.icon className="w-3 h-3" />
              )}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px ${i < step ? "bg-emerald-500/30" : "bg-zen-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-zen-surface border border-zen-border rounded-2xl p-6 space-y-5">
        {step === 0 && (
          <>
            <div>
              <h2 className="text-base font-semibold text-zen-text mb-1">Anthropic API Key</h2>
              <p className="text-xs text-zen-muted">
                Used to find the best educators and filter video quality with Claude AI.
              </p>
            </div>

            <AccordionTip title="How to get your Anthropic API key →">
              <ol className="list-decimal list-inside space-y-1.5 text-zen-text-secondary">
                <li>Go to <span className="text-zen-accent font-mono">console.anthropic.com</span></li>
                <li>Sign in or create a free account</li>
                <li>Click <strong className="text-zen-text">API Keys</strong> in the left sidebar</li>
                <li>Click <strong className="text-zen-text">Create Key</strong></li>
                <li>Copy the key (starts with <span className="font-mono">sk-ant-</span>)</li>
              </ol>
              <p className="text-zen-muted mt-2">
                Free tier includes $5 credit — enough for hundreds of catalogue discoveries.
              </p>
            </AccordionTip>

            <KeyField
              value={anthropicKey}
              onChange={(v) => { setAnthropicKey(v); setAnthropicStatus(null); }}
              placeholder="sk-ant-api03-..."
            />

            <div className="flex items-center justify-between">
              <TestButton
                onTest={testAnthropic}
                status={anthropicStatus}
                disabled={anthropicKey.trim().length < 10}
              />
              {anthropicStatus === "fail" && (
                <p className="text-xs text-red-400">Key is invalid or has no credits</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={!canAdvanceStep0}
              className="w-full flex items-center justify-center gap-2 bg-zen-accent hover:bg-zen-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h2 className="text-base font-semibold text-zen-text mb-1">YouTube Data API Key</h2>
              <p className="text-xs text-zen-muted">
                Used to search YouTube and fetch video details directly from Google.
              </p>
            </div>

            <AccordionTip title="How to get your YouTube API key →">
              <ol className="list-decimal list-inside space-y-1.5 text-zen-text-secondary">
                <li>Go to <span className="text-zen-accent font-mono">console.cloud.google.com</span></li>
                <li>Create a new project (or select existing)</li>
                <li>Go to <strong className="text-zen-text">APIs & Services → Library</strong></li>
                <li>Search for <strong className="text-zen-text">YouTube Data API v3</strong> and enable it</li>
                <li>Go to <strong className="text-zen-text">Credentials → Create Credentials → API Key</strong></li>
                <li>Under <strong className="text-zen-text">API restrictions</strong>, restrict to YouTube Data API v3</li>
                <li>
                  Under <strong className="text-zen-text">Website restrictions</strong>, add your domain
                  (and <span className="font-mono">localhost:5173</span> for local dev)
                </li>
              </ol>
              <p className="text-zen-muted mt-2">
                Free quota: 10,000 units/day. Each discovery uses ~200 units.
              </p>
            </AccordionTip>

            <AccordionTip title="Getting a 403 Forbidden error?">
              <p className="text-zen-text-secondary">
                Your API key has HTTP referrer restrictions. Add these allowed referrers in Google Cloud Console:
              </p>
              <ul className="mt-2 space-y-1 font-mono text-xs text-zen-accent">
                <li>localhost/*</li>
                <li>localhost:5173/*</li>
                <li>your-deployed-domain.vercel.app/*</li>
              </ul>
            </AccordionTip>

            <KeyField
              value={youtubeKey}
              onChange={(v) => { setYoutubeKey(v); setYoutubeStatus(null); }}
              placeholder="AIzaSy..."
            />

            <div className="flex items-center justify-between">
              <TestButton
                onTest={testYouTube}
                status={youtubeStatus}
                disabled={youtubeKey.trim().length < 10}
              />
              {youtubeStatus === "fail" && (
                <p className="text-xs text-red-400">Key is invalid or restricted</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex-none px-4 py-3.5 border border-zen-border rounded-xl text-zen-text-secondary hover:text-zen-text hover:border-zen-accent/50 text-sm font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={!canFinish || saving}
                className="flex-1 flex items-center justify-center gap-2 bg-zen-accent hover:bg-zen-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {saving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Start Learning
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-zen-muted mt-6 text-center max-w-xs">
        Keys are encrypted and stored in your private Firebase account. You can update them anytime in Settings.
      </p>
    </div>
  );
}
