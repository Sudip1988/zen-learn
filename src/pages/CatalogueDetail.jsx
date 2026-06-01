import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { useCatalogue } from "../hooks/useCatalogue";
import { useDiscovery } from "../hooks/useDiscovery";
import { useApp } from "../context/AppContext";
import { VideoFeed } from "../components/Videos/VideoFeed";
import { EducatorChips } from "../components/Discovery/EducatorChips";
import { RemixPanel } from "../components/Catalogue/RemixPanel";
import { EmptyState } from "../components/UI/EmptyState";
import { BookOpen } from "lucide-react";

const SORT_OPTIONS = [
  { id: "relevancy", label: "Relevancy" },
  { id: "newest", label: "Newest" },
  { id: "views", label: "Most Viewed" },
];

export function CatalogueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useApp();
  const {
    getCatalogue,
    updateCatalogue,
    pinVideo,
    unpinVideo,
    removeVideo,
    restoreVideo,
    resetOrder,
    getDisplayVideos,
  } = useCatalogue();
  const { rediscover } = useDiscovery();

  const [sortMode, setSortMode] = useState("relevancy");
  const [searchQuery, setSearchQuery] = useState("");
  const [remixOpen, setRemixOpen] = useState(false);
  const [isRediscovering, setIsRediscovering] = useState(false);

  const catalogue = getCatalogue(id);

  const displayVideos = useMemo(() => {
    if (!catalogue) return [];
    let videos = getDisplayVideos(catalogue, sortMode);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.channelTitle?.toLowerCase().includes(q)
      );
    }
    return videos;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogue, sortMode, searchQuery]);

  if (!catalogue) {
    return (
      <div className="min-h-screen bg-zen-void flex items-center justify-center">
        <EmptyState
          icon={BookOpen}
          title="Catalogue not found"
          description="This catalogue may have been deleted."
          action={
            <button
              onClick={() => navigate("/catalogues")}
              className="bg-zen-accent hover:bg-zen-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Back to catalogues
            </button>
          }
        />
      </div>
    );
  }

  const handlePin = (videoId) => { pinVideo(id, videoId); addToast("Pinned", "success"); };
  const handleUnpin = (videoId) => { unpinVideo(id, videoId); };
  const handleRemove = (videoId) => { removeVideo(id, videoId); addToast("Removed", "info"); };
  const handleRestore = (videoId) => { restoreVideo(id, videoId); addToast("Restored", "success"); };
  const handleSetPinOrder = (newPinnedIds) => { updateCatalogue(id, { pinnedVideoIds: newPinnedIds }); };
  const handleResetOrder = () => { resetOrder(id); };

  const handleRediscover = async () => {
    const freshCat = getCatalogue(id);
    if (!freshCat) return;
    setIsRediscovering(true);
    try {
      const result = await rediscover(freshCat);
      addToast(
        result.newCount > 0
          ? `Added ${result.newCount} new videos`
          : "No new videos found — try a different search",
        result.newCount > 0 ? "success" : "info"
      );
    } catch (err) {
      addToast(`Re-discover failed: ${err.message}`, "error");
    } finally {
      setIsRediscovering(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-zen-void/95 backdrop-blur-md border-b border-zen-border">
        <div className="flex items-center h-12 px-4 gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1 rounded-xl text-zen-muted hover:text-zen-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 font-semibold text-zen-text truncate capitalize text-sm">
            {catalogue.skillName}
          </h1>
          <button
            onClick={() => setRemixOpen(true)}
            className="flex items-center gap-1.5 text-xs text-zen-accent hover:text-zen-accent-hover font-medium transition-colors font-mono"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            curate
          </button>
        </div>
      </div>

      {/* Educators */}
      <EducatorChips educators={catalogue.educators || []} />

      {/* Sort pills */}
      <div className="flex gap-2 px-4 py-3 border-b border-zen-border overflow-x-auto scrollbar-hide">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSortMode(opt.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-mono transition-colors ${
              sortMode === opt.id
                ? "bg-zen-accent text-white"
                : "bg-zen-surface text-zen-muted hover:text-zen-text"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Search within catalogue */}
      <div className="px-4 py-2.5 border-b border-zen-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zen-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`search within ${catalogue.skillName}...`}
            className="w-full bg-zen-surface border border-zen-border rounded-xl pl-8 pr-4 py-2 text-xs text-zen-text placeholder-zen-muted font-mono focus:outline-none focus:border-zen-accent transition-colors"
          />
        </div>
      </div>

      {/* Video count */}
      <div className="px-4 py-2">
        <p className="text-[10px] text-zen-muted font-mono">
          {displayVideos.length} video{displayVideos.length !== 1 ? "s" : ""}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>

      {/* Videos */}
      {displayVideos.length > 0 ? (
        <VideoFeed
          videos={displayVideos}
          catalogueId={id}
          pinnedVideoIds={catalogue?.pinnedVideoIds || []}
          removedVideoIds={catalogue?.removedVideoIds || []}
          onPin={handlePin}
          onUnpin={handleUnpin}
          onRemove={handleRemove}
          onRestore={handleRestore}
        />
      ) : (
        <EmptyState
          icon={Search}
          title={searchQuery ? "No results" : "No videos"}
          description={
            searchQuery
              ? `No videos match "${searchQuery}"`
              : "All videos removed. Open Curation Mode to restore them."
          }
        />
      )}

      {/* Remix / Curation panel */}
      {remixOpen && catalogue && (
        <RemixPanel
          catalogue={catalogue}
          onClose={() => { setRemixOpen(false); refresh(); }}
          onPin={handlePin}
          onUnpin={handleUnpin}
          onRestore={handleRestore}
          onSetOrder={handleSetPinOrder}
          onResetOrder={handleResetOrder}
          onRediscover={handleRediscover}
          isRediscovering={isRediscovering}
        />
      )}
    </>
  );
}
