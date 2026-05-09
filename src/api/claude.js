import { slugify } from "../utils/slugify";
import { getCache, setCache } from "../utils/cache";
import { getAuthToken } from "./auth";

const EDUCATOR_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Proxy call to /api/claude ────────────────────────────────────────────────
async function callClaude(prompt, model, maxTokens, action = null) {
  const token = await getAuthToken();

  const res = await fetch("/api/claude", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
      _action: action,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Server error ${res.status}`);
  }

  const data = await res.json();
  return data.text;
}

// ─── Step 1: Discover top N educators for a skill ────────────────────────────
export async function discoverEducators(skillQuery, config) {
  const { claudeModel, educatorCount } = config;
  const cacheKey = `educators_v3_${slugify(skillQuery)}`;
  const cached = getCache(cacheKey, EDUCATOR_TTL);
  if (cached) return cached;

  const prompt = `You are a strict educational content curator for a focused learning platform.

Task: Identify the top ${educatorCount} YouTube educators/channels for the skill: "${skillQuery}"

INCLUSION criteria (all must be true):
✅ Content is purely educational — lectures, tutorials, courses, explainers
✅ Educator is credible: professor, researcher, industry expert, or reputable institution
✅ Channel produces substantial content (most videos > 8 minutes)
✅ Channel is active (published content in the last 24 months)

EXCLUSION criteria (exclude if ANY is true):
❌ Entertainment, comedy, reaction, or clickbait content
❌ Cartoons, anime, animated entertainment series
❌ Lifestyle vlogs, day-in-my-life, morning routines, hauls
❌ Sports commentary, game highlights, fantasy sports
❌ News broadcasts, political opinion shows, current events commentary
❌ Music videos, concerts, live performance streams
❌ Gaming streams, let's plays, esports commentary
❌ Celebrity gossip, drama channels, influencer content
❌ Explicit or adult content

For each educator, also provide:
- "channelHandle": their YouTube handle (e.g. "@3blue1brown") if known, otherwise null
- "searchQueries": 2-3 specific search phrases to find their best videos for "${skillQuery}"

Return ONLY valid JSON array (no markdown fences, no preamble):
[
  {
    "name": "Exact YouTube channel or educator name",
    "channelHandle": "@handle or null",
    "focus": "Specific topics they cover for this skill",
    "credentialSignal": "Why they are credible",
    "searchQueries": ["educator name concept1 tutorial", "educator name concept2 explained"]
  }
]`;

  const response = await callClaude(prompt, claudeModel, 6000, "discoverEducators");
  const educators = JSON.parse(response.replace(/```json|```/g, "").trim());
  setCache(cacheKey, educators);
  return educators;
}

// ─── Step 2: Claude validates final video list ────────────────────────────────
export async function filterVideosByRelevance(videos, skillQuery, config) {
  if (videos.length < 20) return videos;

  const { claudeModel } = config;

  const videoList = videos
    .slice(0, 150)
    .map((v, i) => `${i}: "${v.title}" — ${v.channelTitle}`)
    .join("\n");

  const prompt = `You are curating a distraction-free learning catalogue for: "${skillQuery}"

Below are YouTube video titles. Keep ONLY videos that are:
✅ Directly and substantively educational about "${skillQuery}" or a closely related prerequisite concept
✅ Standalone watchable content (not a 30-second trailer or teaser)
✅ From a genuine educational channel (university, domain expert, structured course)

Reject:
❌ Entertainment, reaction, vlog, news, sports, music, anime, gaming, lifestyle, gossip
❌ Promotional trailers, course previews under 3 minutes
❌ Content only tangentially related to "${skillQuery}"

Videos:
${videoList}

Return ONLY a JSON array of valid 0-based indices. Example: [0, 2, 5, 11]`;

  const response = await callClaude(prompt, claudeModel, 1000);
  const approved = new Set(JSON.parse(response.replace(/```json|```/g, "").trim()));
  return videos.filter((_, i) => i >= 150 || approved.has(i));
}

// ─── Suggest alternative search queries for re-discovery ─────────────────────
export async function suggestSearchQueries(skillQuery, existingEducators, config) {
  const { claudeModel } = config;
  const knownNames = existingEducators.slice(0, 10).map((e) => e.name).join(", ");

  const prompt = `A user is learning "${skillQuery}" and already has content from: ${knownNames}.

Suggest 5 alternative YouTube search queries to find DIFFERENT educators and videos on "${skillQuery}". Focus on:
- Different sub-topics or angles (e.g. "practical", "advanced", "mathematics behind")
- Different educator types (university courses, independent researchers, industry practitioners)
- Avoid queries that would return the already-known educators above

Return ONLY a JSON array of query strings. Example: ["advanced ${skillQuery} techniques", "${skillQuery} from first principles"]`;

  const response = await callClaude(prompt, claudeModel, 500);
  return JSON.parse(response.replace(/```json|```/g, "").trim());
}
