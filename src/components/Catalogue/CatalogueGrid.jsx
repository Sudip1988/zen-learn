import { CatalogueCard } from "./CatalogueCard";
import { CatalogueCardSkeleton } from "../UI/Skeleton";

export function CatalogueGrid({ catalogues, onDelete, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <CatalogueCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
      {catalogues.map((cat) => (
        <CatalogueCard key={cat.id} catalogue={cat} onDelete={onDelete} />
      ))}
    </div>
  );
}
