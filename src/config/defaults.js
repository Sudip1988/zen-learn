export const DEFAULT_CONFIG = {
  claudeModel: "claude-sonnet-4-20250514",
  educatorCount: 30,
  videosPerSkill: 200,
  minVideoDurationSeconds: 180,
  maxVideoDurationSeconds: 14400,
  language: "en",
  safeSearchLevel: "strict",
};

export const AVAILABLE_MODELS = [
  {
    id: "claude-opus-4-20250514",
    label: "Claude Opus 4 — Most capable, slower",
  },
  {
    id: "claude-sonnet-4-20250514",
    label: "Claude Sonnet 4 — Recommended",
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5 — Fastest, lowest cost",
  },
];

export const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese" },
];
