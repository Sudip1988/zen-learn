import { GraduationCap } from "lucide-react";

export function EducatorChips({ educators = [] }) {
  if (!educators.length) return null;

  return (
    <div className="px-4 py-3 border-b border-zen-border">
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="w-4 h-4 text-zen-muted" />
        <span className="text-xs text-zen-muted font-medium uppercase tracking-wide">
          Curated from {educators.length} educator{educators.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {educators.map((edu, i) => (
          <span
            key={i}
            className="shrink-0 text-xs bg-zen-surface border border-zen-border text-zen-text-secondary px-3 py-1.5 rounded-full whitespace-nowrap"
          >
            {edu.name}
          </span>
        ))}
      </div>
    </div>
  );
}
