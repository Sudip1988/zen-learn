import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../api/firebase";
import { useAuth } from "../auth/AuthProvider";
import { DEFAULT_CONFIG } from "../config/defaults";

const ConfigContext = createContext(null);

const FIRESTORE_PATH = (uid) => ["users", uid, "private", "config"];
const LS_KEY = "zen_config";

export function ConfigProvider({ children }) {
  const { user, inviteStatus } = useAuth();
  const [config, setConfigState] = useState(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);

  // Load config from Firestore when user is approved
  useEffect(() => {
    if (!user || inviteStatus !== "approved") {
      setConfigLoading(false);
      return;
    }

    let cancelled = false;
    setConfigLoading(true);

    (async () => {
      try {
        const ref = doc(db, ...FIRESTORE_PATH(user.uid));
        const snap = await getDoc(ref);

        if (cancelled) return;

        if (snap.exists()) {
          // Firestore is source of truth
          setConfigState({ ...DEFAULT_CONFIG, ...snap.data() });
        } else {
          // Try to migrate from localStorage
          const lsRaw = localStorage.getItem(LS_KEY);
          if (lsRaw) {
            try {
              const lsConfig = JSON.parse(lsRaw);
              const merged = { ...DEFAULT_CONFIG, ...lsConfig };
              await setDoc(ref, merged, { merge: true });
              setConfigState(merged);
              localStorage.removeItem(LS_KEY);
            } catch {
              setConfigState(DEFAULT_CONFIG);
            }
          } else {
            setConfigState(DEFAULT_CONFIG);
          }
        }
      } catch {
        // Fallback to localStorage if Firestore fails
        const lsRaw = localStorage.getItem(LS_KEY);
        if (lsRaw && !cancelled) {
          try {
            setConfigState({ ...DEFAULT_CONFIG, ...JSON.parse(lsRaw) });
          } catch {
            /* ignore */
          }
        }
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, inviteStatus]);

  const setConfig = useCallback(
    async (updates) => {
      const next = { ...config, ...updates };
      setConfigState(next);

      if (user) {
        try {
          const ref = doc(db, ...FIRESTORE_PATH(user.uid));
          await setDoc(ref, next, { merge: true });
        } catch {
          // Fallback: at least keep in memory
        }
      }
    },
    [config, user]
  );

  const isConfigured = config.anthropicApiKey?.trim() && config.youtubeApiKey?.trim();

  return (
    <ConfigContext.Provider value={{ config, setConfig, isConfigured: !!isConfigured, configLoading }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfigContext = () => useContext(ConfigContext);
