import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, BookOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function CatalogueCard({ catalogue, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const thumb = catalogue.videos?.find((v) => v.thumbnail)?.thumbnail || null;
  const videoCount = catalogue.videos?.length || 0;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group border border-zen-border hover:border-zen-accent/40 transition-all duration-200 aspect-[4/3]"
      onClick={() => navigate(`/catalogue/${catalogue.id}`)}
    >
      {/* Full-card thumbnail bg */}
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-zen-surface flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-zen-muted" />
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="font-semibold text-white text-sm leading-tight capitalize line-clamp-2 mb-1">
          {catalogue.skillName}
        </h3>
        <p className="text-white/50 text-xs font-mono">
          {videoCount} videos
        </p>
      </div>

      {/* Overflow menu */}
      <div
        className="absolute top-2 right-2 z-10"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 rounded-lg bg-black/40 text-white/60 hover:text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-8 bg-zen-elevated border border-zen-border rounded-xl shadow-xl z-20 min-w-[120px] overflow-hidden">
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete?.(catalogue.id);
              }}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
