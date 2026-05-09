import { X, ChevronUp, ChevronDown, Pin, RotateCcw, RefreshCw, Sparkles, Loader } from "lucide-react";

export function RemixPanel({
  catalogue,
  onClose,
  onPin,
  onUnpin,
  onRestore,
  onSetOrder,
  onResetOrder,
  onRediscover,
  isRediscovering,
}) {
  const { videos, pinnedVideoIds = [], removedVideoIds = [], customOrder } = catalogue;

  const pinnedVideos = pinnedVideoIds
    .map((id) => videos.find((v) => v.id === id))
    .filter(Boolean);

  const removedVideos = removedVideoIds
    .map((id) => videos.find((v) => v.id === id))
    .filter(Boolean);

  const movePin = (index, direction) => {
    const newOrder = [...pinnedVideoIds];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    onSetOrder?.(newOrder);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-zen-elevated border-t border-zen-border rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-zen-border shrink-0">
          <div>
            <h2 className="font-semibold text-zen-text text-sm">Curation Mode</h2>
            <p className="text-xs text-zen-muted font-mono mt-0.5 capitalize">{catalogue.skillName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zen-muted hover:text-zen-text hover:bg-zen-border/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Re-discover section */}
        <div className="px-4 py-3 border-b border-zen-border shrink-0">
          <button
            onClick={onRediscover}
            disabled={isRediscovering}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zen-accent/30 bg-zen-accent/5 text-zen-accent hover:bg-zen-accent/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all"
          >
            {isRediscovering ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Finding new videos...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Re-discover with new angles
              </>
            )}
          </button>
          <p className="text-xs text-zen-muted text-center mt-2 font-mono">
            Claude finds different educators and merges new videos into this catalogue
          </p>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-5">
          {/* Pinned section */}
          {pinnedVideos.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <Pin className="w-3.5 h-3.5 text-zen-accent" />
                <h3 className="text-xs font-semibold text-zen-muted uppercase tracking-widest font-mono">
                  Pinned ({pinnedVideos.length})
                </h3>
              </div>
              <div className="space-y-1.5">
                {pinnedVideos.map((video, idx) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-2.5 bg-zen-surface rounded-xl p-2.5"
                  >
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="w-10 h-7 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <p className="flex-1 text-xs text-zen-text line-clamp-1">{video.title}</p>
                    <div className="flex flex-col gap-0 shrink-0">
                      <button
                        onClick={() => movePin(idx, -1)}
                        disabled={idx === 0}
                        className="p-0.5 text-zen-muted hover:text-zen-text disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePin(idx, 1)}
                        disabled={idx === pinnedVideos.length - 1}
                        className="p-0.5 text-zen-muted hover:text-zen-text disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => onUnpin?.(video.id)}
                      className="p-1 text-zen-muted hover:text-red-400 transition-colors"
                      title="Unpin"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Removed section */}
          {removedVideos.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <RotateCcw className="w-3.5 h-3.5 text-zen-muted" />
                <h3 className="text-xs font-semibold text-zen-muted uppercase tracking-widest font-mono">
                  Removed ({removedVideos.length})
                </h3>
              </div>
              <div className="space-y-1.5">
                {removedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-2.5 bg-zen-surface rounded-xl p-2.5 opacity-50"
                  >
                    <p className="flex-1 text-xs text-zen-text line-clamp-1">{video.title}</p>
                    <button
                      onClick={() => onRestore?.(video.id)}
                      className="p-1 text-zen-muted hover:text-emerald-400 transition-colors"
                      title="Restore"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reset order */}
          {customOrder && (
            <button
              onClick={onResetOrder}
              className="flex items-center gap-1.5 text-xs text-zen-muted hover:text-zen-text-secondary transition-colors font-mono"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              reset to default relevancy order
            </button>
          )}

          {pinnedVideos.length === 0 && removedVideos.length === 0 && (
            <p className="text-center text-zen-muted text-xs py-4 font-mono">
              pin or remove videos to manage them here
            </p>
          )}
        </div>

        <div className="px-4 pb-6 pt-3 border-t border-zen-border shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-zen-accent hover:bg-zen-accent-hover text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
