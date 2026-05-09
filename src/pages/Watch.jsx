import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ArrowLeft, Clock, Eye } from "lucide-react";
import { useCatalogue } from "../hooks/useCatalogue";
import { VideoPlayer } from "../components/Videos/VideoPlayer";
import { formatDuration, formatViews, formatDate } from "../utils/format";

function VideoChip({ video, catalogueId, isActive }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/watch/${video.id}`, { state: { catalogueId } })}
      className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
        isActive
          ? "border-zen-accent bg-zen-accent/10 text-zen-accent"
          : "border-zen-border bg-zen-surface text-zen-text-secondary hover:border-zen-accent/50 hover:text-zen-text"
      }`}
    >
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt=""
          className="w-12 h-8 rounded-lg object-cover shrink-0"
        />
      )}
      <div className="text-left min-w-0 max-w-[140px]">
        <p className="text-xs font-medium line-clamp-2 leading-tight">{video.title}</p>
        {video.durationSeconds > 0 && (
          <p className="text-[10px] font-mono mt-0.5 opacity-60">{formatDuration(video.durationSeconds)}</p>
        )}
      </div>
    </button>
  );
}

export function Watch() {
  const { videoId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const catalogueId = location.state?.catalogueId;
  const { getCatalogue } = useCatalogue();
  const [descOpen, setDescOpen] = useState(false);

  const catalogue = catalogueId ? getCatalogue(catalogueId) : null;
  const video = catalogue?.videos.find((v) => v.id === videoId) || null;

  const relatedVideos = catalogue
    ? catalogue.videos
        .filter(
          (v) =>
            v.id !== videoId &&
            v.channelTitle === video?.channelTitle &&
            !catalogue.removedVideoIds?.includes(v.id)
        )
        .slice(0, 8)
    : [];

  return (
    <div className="min-h-screen bg-zen-void text-zen-text">
      {/* Back header */}
      <div className="sticky top-0 z-30 bg-zen-void/95 backdrop-blur-md border-b border-zen-border">
        <div className="flex items-center h-12 px-4 gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1 rounded-xl text-zen-muted hover:text-zen-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {catalogue && (
            <p className="flex-1 text-xs font-mono text-zen-muted truncate">
              {catalogue.skillName}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Player */}
        <VideoPlayer videoId={videoId} title={video?.title || "Video"} />

        <div className="px-4 py-4">
          {/* Video info */}
          <h1 className="text-base font-semibold text-zen-text leading-snug mb-3">
            {video?.title || "Untitled Video"}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zen-muted font-mono mb-3">
            {video?.channelTitle && (
              <span className="text-zen-text-secondary">{video.channelTitle}</span>
            )}
            {video?.durationSeconds > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(video.durationSeconds)}
              </span>
            )}
            {video?.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViews(video.viewCount)}
              </span>
            )}
            {video?.publishedAt && (
              <span>{formatDate(video.publishedAt)}</span>
            )}
          </div>

          {/* Description accordion */}
          {video?.description && (
            <div className="border border-zen-border rounded-xl overflow-hidden mb-5">
              <button
                onClick={() => setDescOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-zen-surface/50 transition-colors"
              >
                <span className="text-xs text-zen-muted font-mono">description</span>
                {descOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zen-muted" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zen-muted" />
                )}
              </button>
              {descOpen && (
                <div className="px-4 pb-4 border-t border-zen-border">
                  <p className="mt-3 text-sm text-zen-text-secondary leading-relaxed whitespace-pre-line">
                    {video.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Related videos — horizontal scroll chip strip */}
          {relatedVideos.length > 0 && (
            <div>
              <p className="text-[10px] text-zen-muted font-mono uppercase tracking-widest mb-3">
                More from {video?.channelTitle}
              </p>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                {relatedVideos.map((v) => (
                  <VideoChip
                    key={v.id}
                    video={v}
                    catalogueId={catalogueId}
                    isActive={false}
                  />
                ))}
              </div>
              <p className="text-[10px] text-zen-muted font-mono mt-3 text-center opacity-50">
                only from your catalogue · no youtube suggestions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
