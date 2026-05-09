import { VideoCard } from "./VideoCard";
import { VideoCardSkeleton } from "../UI/Skeleton";

export function VideoFeed({
  videos,
  catalogueId,
  pinnedVideoIds = [],
  removedVideoIds = [],
  onPin,
  onUnpin,
  onRemove,
  onRestore,
  showRemoved = false,
  loading = false,
  showActions = true,
}) {
  if (loading) {
    return (
      <div className="divide-y divide-zen-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const displayVideos = showRemoved
    ? videos
    : videos.filter((v) => !removedVideoIds.includes(v.id));

  return (
    <div className="divide-y divide-zen-border">
      {displayVideos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          catalogueId={catalogueId}
          isPinned={pinnedVideoIds.includes(video.id)}
          isRemoved={removedVideoIds.includes(video.id)}
          onPin={onPin}
          onUnpin={onUnpin}
          onRemove={onRemove}
          onRestore={onRestore}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
