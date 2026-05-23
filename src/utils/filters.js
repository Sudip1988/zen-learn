// ─── HARD BLOCKED categories — checked at every stage ───────────────────────
export const PROHIBITED_CATEGORIES = {
  entertainment: [
    "entertainment", "funny", "comedy", "humor", "laugh", "meme",
    "viral", "reaction", "react to", "roast", "prank", "challenge",
    "dare", "tiktok compilation", "fails", "wins", "funniest moments",
  ],
  cartoons_anime: [
    "cartoon", "anime", "animated series", "manga", "cosplay",
    "otaku", "weeb", "naruto", "one piece", "dragon ball", "pokemon",
    "marvel", "dc comics", "superhero movie", "pixar",
  ],
  lifestyle: [
    "vlog", "day in my life", "what i eat", "morning routine",
    "night routine", "grwm", "get ready with me", "haul", "unboxing",
    "room tour", "house tour", "travel vlog", "vacation", "lifestyle",
    "influencer", "what i bought",
  ],
  sports: [
    "sports highlights", "game highlights", "nba", "nfl", "cricket match",
    "football match", "soccer game", "match highlights", "sports news",
    "player interview", "draft picks", "sports betting", "ipl",
  ],
  news: [
    "breaking news", "news update", "live news", "current events",
    "politics today", "election result", "press conference",
    "news anchor", "fox news", "cnn", "bbc news",
  ],
  music: [
    "music video", "official video", "lyrics video", "mv", "audio only",
    "song", "album drop", "concert", "live performance",
    "music reaction", "official audio",
  ],
  explicit: ["explicit", "adult content", "18+", "nsfw", "mature content", "onlyfans"],
  gaming: [
    "let's play", "playthrough", "gameplay", "game stream", "twitch",
    "esports", "gaming setup", "gaming chair", "fortnite gameplay",
    "minecraft gameplay", "roblox",
  ],
  gossip_drama: [
    "drama", "beef", "cancelled", "exposed", "tea", "storytime drama",
    "celebrity gossip", "shade", "rant", "callout",
  ],
  shorts_clickbait: [
    "#shorts", "tiktok", "you won't believe", "shocking", "must watch",
  ],
};

export const ALL_PROHIBITED_TERMS = Object.values(PROHIBITED_CATEGORIES).flat();

// ─── EDUCATIONAL signal keywords (boost relevancy score) ─────────────────────
export const EDU_SIGNALS = [
  "tutorial", "explained", "explanation", "course", "lecture", "lesson",
  "learn", "learning", "guide", "introduction to", "deep dive",
  "fundamentals", "principles", "theory", "how to", "walkthrough",
  "complete course", "full course", "masterclass", "crash course",
  "beginner guide", "advanced", "workshop", "seminar", "lecture series",
  "textbook", "study", "breakdown", "analysis", "concept", "overview",
  "part 1", "chapter", "module", "unit",
];

export function isProhibited(text) {
  const lower = (text || "").toLowerCase();
  return ALL_PROHIBITED_TERMS.some((term) => lower.includes(term));
}

export function sanitizeResults(items) {
  const input = items || [];
  const result = input.filter((item) => {
    const title = item.snippet?.title || "";
    const desc = item.snippet?.description || "";
    if (isProhibited(title)) {
      console.log(`[Filter] Prohibited title: "${title}"`);
      return false;
    }
    return true;
  });
  if (input.length !== result.length) {
    console.log(`[Filter] sanitizeResults: ${input.length} in → ${result.length} out`);
  }
  return result;
}
