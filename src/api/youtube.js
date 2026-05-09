import { sanitizeResults } from "../utils/filters";
import { getAuthToken } from "./auth";

// ─── Proxy GET to /api/youtube ────────────────────────────────────────────────
async function ytFetch(resource, params) {
  const token = await getAuthToken();
  const qs = new URLSearchParams({ _r: resource, ...params });

  const res = await fetch(`/api/youtube?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(
      data.error?.message ?? data.error ?? `YouTube proxy error ${res.status}`
    );
  }
  return data;
}

// ─── Resolve YouTube channel ID from educator name or handle ─────────────────
export async function resolveChannelId(educatorName, channelHandle) {
  const cacheKey = `yt_ch_${educatorName.toLowerCase().replace(/\W+/g, "_")}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  // Handle-first resolution (faster, fewer quota units)
  if (channelHandle) {
    const handle = channelHandle.startsWith("@") ? channelHandle : `@${channelHandle}`;
    try {
      const data = await ytFetch("channels", { part: "id", forHandle: handle });
      if (data.items?.length) {
        const channelId = data.items[0].id;
        localStorage.setItem(cacheKey, channelId);
        return channelId;
      }
    } catch {
      // fall through to name search
    }
  }

  // Fallback: name search
  const data = await ytFetch("search", {
    part: "snippet",
    type: "channel",
    q: educatorName,
    maxResults: "1",
  });

  if (!data.items?.length) return null;
  const channelId = data.items[0].snippet.channelId;
  localStorage.setItem(cacheKey, channelId);
  return channelId;
}

// ─── Fetch top videos from one channel for a skill query ──────────────────────
export async function fetchChannelVideos(channelId, skillQuery, config, searchQuery) {
  const q = searchQuery || `${skillQuery} tutorial explained lecture course`;

  const data = await ytFetch("search", {
    part: "snippet",
    channelId,
    q,
    type: "video",
    safeSearch: config.safeSearchLevel || "strict",
    relevanceLanguage: config.language || "en",
    maxResults: "12",
    order: "relevance",
  });

  return sanitizeResults(data.items || []).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail: item.snippet.thumbnails.medium?.url,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
  }));
}

// ─── Global search — no channel restriction (used for re-discovery) ──────────
export async function searchVideosGlobal(searchQuery, config) {
  const data = await ytFetch("search", {
    part: "snippet",
    q: searchQuery,
    type: "video",
    safeSearch: config.safeSearchLevel || "strict",
    relevanceLanguage: config.language || "en",
    maxResults: "12",
    order: "relevance",
  });

  return sanitizeResults(data.items || []).map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    thumbnail: item.snippet.thumbnails.medium?.url,
    publishedAt: item.snippet.publishedAt,
    description: item.snippet.description,
  }));
}

// ─── Enrich videos with duration + statistics ─────────────────────────────────
export async function enrichVideoDetails(videoIds) {
  if (!videoIds.length) return {};

  const data = await ytFetch("videos", {
    part: "contentDetails,statistics",
    id: videoIds.join(","),
  });

  const map = {};
  (data.items || []).forEach((item) => {
    map[item.id] = {
      durationSeconds: parseISO8601(item.contentDetails.duration),
      viewCount: parseInt(item.statistics.viewCount || "0"),
      likeCount: parseInt(item.statistics.likeCount || "0"),
    };
  });
  return map;
}

function parseISO8601(iso) {
  const m = (iso || "").match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return +(m[1] || 0) * 3600 + +(m[2] || 0) * 60 + +(m[3] || 0);
}
