export function VideoPlayer({ videoId, title }) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    fs: "1",
    autoplay: "1",
    playsinline: "1",
    cc_load_policy: "0",
  });

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
        loading="lazy"
      />
    </div>
  );
}
