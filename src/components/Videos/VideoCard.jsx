import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pin, PinOff, Trash2, RotateCcw } from "lucide-react";
import { formatDuration, formatViews } from "../../utils/format";

export function VideoCard({
  video,
  catalogueId,
  isPinned = false,
  isRemoved = false,
  onPin,
  onUnpin,
  onRemove,
  onRestore,
  showActions = true,
}) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    if (isRemoved) return;
    navigate(`/watch/${video.id}`, { state: { catalogueId } });
  };

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl transition-colors ${
        isRemoved
          ? "opacity-50"
          : "hover:bg-zen-surface cursor-pointer active:bg-zen-surface"
      }`}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-36 h-[81px] rounded-lg overflow-hidden bg-zen-surface">
        {!imgError && video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zen-muted text-xs">
            No preview
          </div>
        )}
        {video.durationSeconds > 0 && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1 py-0.5 rounded">
            {formatDuration(video.durationSeconds)}
          </span>
        )}
        {isPinned && (
          <span className="absolute top-1 left-1 bg-zen-accent/90 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
            Pinned
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <p className="text-sm font-medium text-zen-text line-clamp-2 leading-snug">
          {video.title}
        </p>
        <div className="mt-1 space-y-0.5">
          <p className="text-xs text-zen-text-secondary truncate">{video.channelTitle}</p>
          {video.viewCount > 0 && (
            <p className="text-xs text-zen-muted">{formatViews(video.viewCount)}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div
          className="shrink-0 flex flex-col gap-1.5 justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isRemoved ? (
            <button
              onClick={() => onRestore?.(video.id)}
              className="p-1.5 rounded-lg text-zen-muted hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => (isPinned ? onUnpin?.(video.id) : onPin?.(video.id))}
                className={`p-1.5 rounded-lg transition-colors ${
                  isPinned
                    ? "text-zen-accent hover:text-zen-accent-hover hover:bg-zen-accent/10"
                    : "text-zen-muted hover:text-zen-accent hover:bg-zen-accent/10"
                }`}
                title={isPinned ? "Unpin" : "Pin"}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onRemove?.(video.id)}
                className="p-1.5 rounded-lg text-zen-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
