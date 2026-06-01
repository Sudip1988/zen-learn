import { useNavigate } from "react-router-dom";
import { Plus, BookOpen } from "lucide-react";
import { useCatalogue } from "../hooks/useCatalogue";
import { CatalogueGrid } from "../components/Catalogue/CatalogueGrid";
import { EmptyState } from "../components/UI/EmptyState";
import { Header } from "../components/Layout/Header";

export function Catalogues() {
  const navigate = useNavigate();
  const { catalogues, deleteCatalogue } = useCatalogue();

  const handleDelete = (id) => {
    if (!confirm("Delete this catalogue? This cannot be undone.")) return;
    deleteCatalogue(id);
  };

  return (
    <>
      <Header title="My Catalogues" />
      <div className="relative">
        {catalogues.length > 0 ? (
          <CatalogueGrid catalogues={catalogues} onDelete={handleDelete} />
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No catalogues yet"
            description="Go to Home, search for a skill, and Claude will build your first curated catalogue."
            action={
              <button
                onClick={() => navigate("/home")}
                className="bg-zen-accent hover:bg-zen-accent-hover text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Discover a skill
              </button>
            }
          />
        )}

        {/* FAB */}
        <button
          onClick={() => navigate("/home")}
          className="fixed bottom-24 right-4 bg-zen-accent hover:bg-zen-accent-hover text-white p-4 rounded-2xl shadow-lg shadow-zen-accent/20 transition-colors z-20"
          title="New skill"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}
