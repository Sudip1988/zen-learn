const STORE_KEY = "zen_catalogues";

export function useCatalogue() {
  const getAll = () => {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const save = (list) =>
    localStorage.setItem(STORE_KEY, JSON.stringify(list));

  const createCatalogue = ({ skillName, educators, videos }) => {
    const cat = {
      id: `cat_${Date.now()}`,
      skillName,
      skillSlug: skillName.toLowerCase().replace(/\W+/g, "_"),
      educators,
      videos,
      pinnedVideoIds: [],
      removedVideoIds: [],
      customOrder: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    save([cat, ...getAll()]);
    return cat;
  };

  const getCatalogue = (id) => getAll().find((c) => c.id === id) || null;

  const deleteCatalogue = (id) => save(getAll().filter((c) => c.id !== id));

  const updateCatalogue = (id, updates) =>
    save(
      getAll().map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
      )
    );

  const pinVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      pinnedVideoIds: [...new Set([videoId, ...cat.pinnedVideoIds])],
    });
  };

  const unpinVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      pinnedVideoIds: cat.pinnedVideoIds.filter((id) => id !== videoId),
    });
  };

  const removeVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      removedVideoIds: [...new Set([videoId, ...cat.removedVideoIds])],
    });
  };

  const restoreVideo = (catId, videoId) => {
    const cat = getCatalogue(catId);
    if (!cat) return;
    updateCatalogue(catId, {
      removedVideoIds: cat.removedVideoIds.filter((id) => id !== videoId),
    });
  };

  const setCustomOrder = (catId, orderedIds) =>
    updateCatalogue(catId, { customOrder: orderedIds });

  const resetOrder = (catId) =>
    updateCatalogue(catId, { customOrder: null });

  const getDisplayVideos = (cat, sortMode = "relevancy") => {
    const { videos, pinnedVideoIds, removedVideoIds, customOrder } = cat;
    const active = videos.filter((v) => !removedVideoIds.includes(v.id));

    const pinned = pinnedVideoIds
      .map((id) => active.find((v) => v.id === id))
      .filter(Boolean);

    const rest = active.filter((v) => !pinnedVideoIds.includes(v.id));

    let orderedRest;
    if (customOrder) {
      const map = new Map(rest.map((v) => [v.id, v]));
      orderedRest = customOrder.map((id) => map.get(id)).filter(Boolean);
    } else if (sortMode === "newest") {
      orderedRest = [...rest].sort(
        (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
      );
    } else if (sortMode === "views") {
      orderedRest = [...rest].sort(
        (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
      );
    } else {
      orderedRest = [...rest].sort(
        (a, b) => (b.relevancyScore || 0) - (a.relevancyScore || 0)
      );
    }

    return [...pinned, ...orderedRest];
  };

  return {
    getAll,
    createCatalogue,
    getCatalogue,
    updateCatalogue,
    deleteCatalogue,
    pinVideo,
    unpinVideo,
    removeVideo,
    restoreVideo,
    setCustomOrder,
    resetOrder,
    getDisplayVideos,
  };
}
