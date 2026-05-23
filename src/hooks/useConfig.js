import { useAuth } from "../auth/AuthProvider";
import { DEFAULT_CONFIG } from "../config/defaults";

const prefsKey = (uid) => `zen_prefs_${uid}`;

export function useConfig() {
  const { user } = useAuth();
  const uid = user?.uid;

  const getConfig = () => {
    if (!uid) return { ...DEFAULT_CONFIG };
    try {
      const s = localStorage.getItem(prefsKey(uid));
      return s ? { ...DEFAULT_CONFIG, ...JSON.parse(s) } : { ...DEFAULT_CONFIG };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  };

  const setConfig = (updates) => {
    if (!uid) return;
    const current = getConfig();
    localStorage.setItem(prefsKey(uid), JSON.stringify({ ...current, ...updates }));
  };

  return { getConfig, setConfig };
}
