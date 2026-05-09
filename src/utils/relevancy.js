import { EDU_SIGNALS, isProhibited } from "./filters";

export function scoreRelevancy(video, skillKeywords = []) {
  let score = 0;
  const combined = `${video.title} ${video.description || ""}`.toLowerCase();

  EDU_SIGNALS.forEach((signal) => {
    if (combined.includes(signal)) score += 2;
  });

  skillKeywords.forEach((kw) => {
    if (combined.includes(kw.toLowerCase())) score += 3;
  });

  if (isProhibited(combined)) score -= 100;
  if ((video.durationSeconds || 0) < 180) score -= 20;

  if ((video.viewCount || 0) > 100_000) score += 1;
  if ((video.viewCount || 0) > 1_000_000) score += 2;

  return score;
}
