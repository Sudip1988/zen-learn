export function getCache(key, ttlMs) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { value, ts } = JSON.parse(raw);
    if (Date.now() - ts > ttlMs) {
      localStorage.removeItem(key);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function setCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }));
  } catch {
    // localStorage full — silently fail
  }
}

export function clearCache(key) {
  localStorage.removeItem(key);
}

export function clearAllZenCache() {
  const keys = Object.keys(localStorage).filter(
    (k) =>
      k.startsWith("zen_") ||
      k.startsWith("educators_") ||
      k.startsWith("yt_ch_")
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
