import { DEFAULT_CONFIG } from "../config/defaults";

const PREFS_KEY = "zen_prefs";

export function useConfig() {
  const getConfig = () => {
    try {
      const s = localStorage.getItem(PREFS_KEY);
      return s ? { ...DEFAULT_CONFIG, ...JSON.parse(s) } : { ...DEFAULT_CONFIG };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  };

  const setConfig = (updates) => {
    const current = getConfig();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...updates }));
  };

  return { getConfig, setConfig };
}
