import { useState, useCallback } from "react";
import { useConfig } from "./useConfig";
import { useCatalogue } from "./useCatalogue";
import { discoverEducators, filterVideosByRelevance, suggestSearchQueries } from "../api/claude";
import { resolveChannelId, fetchChannelVideos, enrichVideoDetails, searchVideosGlobal } from "../api/youtube";
import { scoreRelevancy } from "../utils/relevancy";

export const STEPS = [
  { id: "educators", label: "Finding top educators with Claude..." },
  { id: "channels", label: "Resolving YouTube channels..." },
  { id: "videos", label: "Fetching seed videos..." },
  { id: "enriching", label: "Loading video details..." },
  { id: "filtering", label: "AI quality filter running..." },
  { id: "saving", label: "Building your catalogue..." },
];

export function useDiscovery() {
  const { getConfig } = useConfig();
  const { createCatalogue, updateCatalogue } = useCatalogue();
  const [currentStep, setCurrentStep] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState(null);

  const cancel = useCallback(() => {
    setCurrentStep(null);
    setProgress(0);
    setStatusText("");
  }, []);

  const _runPipeline = useCallback(async (skillQuery, config, seedEducators) => {
    // ── STEP 1: Educator discovery ────────────────────────────────────────
    setCurrentStep("educators");
    setProgress(5);
    setStatusText("Asking Claude to find the best educators...");
    const educators = seedEducators ?? await discoverEducators(skillQuery, config);
    setStatusText(`Found ${educators.length} educators.`);

    // ── STEP 2: Resolve channel IDs ───────────────────────────────────────
    setCurrentStep("channels");
    setProgress(15);
    const resolved = [];
    for (let i = 0; i < educators.length; i++) {
      setStatusText(`Resolving channel: ${educators[i].name}...`);
      try {
        const channelId = await resolveChannelId(
          educators[i].name,
          educators[i].channelHandle
        );
        if (channelId) resolved.push({ ...educators[i], channelId });
      } catch {
        // skip unresolvable channels
      }
      setProgress(15 + Math.floor((i / educators.length) * 20));
    }
    setStatusText(`Resolved ${resolved.length} channels.`);

    // ── STEP 3: Fetch seed videos ─────────────────────────────────────────
    setCurrentStep("videos");
    setProgress(35);
    const allRaw = [];
    const BATCH = 5;
    for (let i = 0; i < resolved.length; i += BATCH) {
      const batch = resolved.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map((e) => {
          const query = e.searchQueries?.[0] ?? `${skillQuery} tutorial`;
          return fetchChannelVideos(e.channelId, skillQuery, config, query);
        })
      );
      results.forEach((r) => {
        if (r.status === "fulfilled") r.value.forEach((v) => allRaw.push(v));
      });
      setStatusText(
        `Fetched videos from ${Math.min(i + BATCH, resolved.length)}/${resolved.length} educators...`
      );
      setProgress(35 + Math.floor((i / resolved.length) * 20));
    }

    const unique = [...new Map(allRaw.map((v) => [v.id, v])).values()];
    console.log(`[Discovery] Step 3 — raw: ${allRaw.length}, unique: ${unique.length}`);

    // ── STEP 4: Enrich ───────────────────────────────────────────────────
    setCurrentStep("enriching");
    setProgress(60);
    const ids = unique.map((v) => v.id);
    let detailMap = {};
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = await enrichVideoDetails(ids.slice(i, i + 50));
      detailMap = { ...detailMap, ...chunk };
      setProgress(60 + Math.floor((i / ids.length) * 10));
    }

    const withDetails = unique.map((v) => ({ ...v, ...(detailMap[v.id] || {}) }));
    const enriched = withDetails.filter(
      (v) =>
        !v.durationSeconds ||
        (v.durationSeconds >= config.minVideoDurationSeconds &&
          v.durationSeconds <= config.maxVideoDurationSeconds)
    );
    console.log(
      `[Discovery] Step 4 — enriched: ${withDetails.length}, after duration gate: ${enriched.length}`
    );

    // ── STEP 5: AI filter ────────────────────────────────────────────────
    setCurrentStep("filtering");
    setProgress(75);
    setStatusText("Running AI quality filter...");
    const filtered = await filterVideosByRelevance(enriched, skillQuery, config);
    console.log(`[Discovery] Step 5 — after Claude filter: ${filtered.length}`);

    const keywords = skillQuery.toLowerCase().split(/\s+/);
    const scored = filtered
      .map((v) => ({ ...v, relevancyScore: scoreRelevancy(v, keywords) }))
      .sort((a, b) => b.relevancyScore - a.relevancyScore)
      .slice(0, config.videosPerSkill);
    console.log(`[Discovery] Step 5 — final: ${scored.length}`);

    return { educators: resolved, videos: scored };
  }, []);

  // ─── Main discover flow ───────────────────────────────────────────────────
  const discover = useCallback(async (skillQuery) => {
    const config = getConfig();
    setError(null);

    try {
      const { educators, videos } = await _runPipeline(skillQuery, config, null);

      setCurrentStep("saving");
      setProgress(95);
      setStatusText("Saving catalogue...");
      const catalogue = createCatalogue({ skillName: skillQuery, educators, videos });

      setProgress(100);
      setCurrentStep(null);
      return catalogue;
    } catch (e) {
      setError(e.message);
      setCurrentStep(null);
      throw e;
    }
  }, [getConfig, createCatalogue, _runPipeline]);

  // ─── Re-discover with alternative angles ────────────────────────────────
  const rediscover = useCallback(async (catalogue) => {
    const config = getConfig();
    setError(null);

    try {
      setCurrentStep("educators");
      setProgress(10);
      setStatusText("Generating new search angles with Claude...");

      const altQueries = await suggestSearchQueries(
        catalogue.skillName,
        catalogue.educators || [],
        config
      );
      setStatusText(`${altQueries.length} new angles found. Searching YouTube...`);

      setCurrentStep("videos");
      setProgress(30);
      const allRaw = [];
      const results = await Promise.allSettled(
        altQueries.map((q) => searchVideosGlobal(q, config))
      );
      results.forEach((r) => {
        if (r.status === "fulfilled") r.value.forEach((v) => allRaw.push(v));
      });

      const unique = [...new Map(allRaw.map((v) => [v.id, v])).values()];
      setStatusText(`${unique.length} new candidates. Enriching...`);

      setCurrentStep("enriching");
      setProgress(55);
      const ids = unique.map((v) => v.id);
      let detailMap = {};
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = await enrichVideoDetails(ids.slice(i, i + 50));
        detailMap = { ...detailMap, ...chunk };
      }

      const withDetails = unique.map((v) => ({ ...v, ...(detailMap[v.id] || {}) }));
      const enriched = withDetails.filter(
        (v) =>
          (v.durationSeconds || 0) >= config.minVideoDurationSeconds &&
          (v.durationSeconds || 0) <= config.maxVideoDurationSeconds
      );

      setCurrentStep("filtering");
      setProgress(75);
      const filtered = await filterVideosByRelevance(enriched, catalogue.skillName, config);

      const keywords = catalogue.skillName.toLowerCase().split(/\s+/);
      const scored = filtered.map((v) => ({
        ...v,
        relevancyScore: scoreRelevancy(v, keywords),
      }));

      setCurrentStep("saving");
      setProgress(95);

      const existingIds = new Set(catalogue.videos.map((v) => v.id));
      const newVideos = scored.filter((v) => !existingIds.has(v.id));

      const mergedVideos = [...catalogue.videos, ...newVideos]
        .sort((a, b) => (b.relevancyScore || 0) - (a.relevancyScore || 0))
        .slice(0, config.videosPerSkill);

      updateCatalogue(catalogue.id, { videos: mergedVideos });

      setProgress(100);
      setCurrentStep(null);
      return { newCount: newVideos.length };
    } catch (e) {
      setError(e.message);
      setCurrentStep(null);
      throw e;
    }
  }, [getConfig, updateCatalogue]);

  return { discover, rediscover, cancel, currentStep, progress, statusText, error, STEPS };
}
