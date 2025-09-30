// src/pages/admin/ai-tools/MaterialSelector.tsx
import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { 
  Input, 
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Search, EyeOff, Eye, FileText } from "lucide-react";
import { MaterialContentRenderer } from "@/pages/teacher/activities/components/MaterialContentRenderer";

type Material = {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  position: number;
  is_published: boolean;
  duration_min?: number;
  created_at: string;
};

type MaterialSelectorProps = {
  topicId: number | null;
  selectedMaterialId?: number | null;
  onSelectMaterial: (materialId: number) => void;
  showPreview?: boolean;
  showMaterialCount?: boolean;
  highlightColor?: "blue" | "cyan";
  className?: string;
};

export function MaterialSelector({
  topicId,
  selectedMaterialId,
  onSelectMaterial,
  showPreview = false,
  showMaterialCount = false,
  highlightColor = "blue",
  className = "",
}: MaterialSelectorProps) {
  const [query, setQuery] = useState("");
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    material: Material | null;
  }>({
    open: false,
    material: null,
  });

  // Pobierz materiały
  const { data: materialsData, isLoading: materialsLoading } = useList<Material>({
    resource: "activities",
    filters: topicId
      ? [
          { field: "topic_id", operator: "eq", value: topicId },
          { field: "type", operator: "eq", value: "material" },
        ]
      : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 1000 },
    meta: { 
      select: showPreview 
        ? "id,topic_id,title,position,is_published,content,duration_min,created_at"
        : "id,topic_id,title,position,is_published"
    },
    queryOptions: { enabled: !!topicId },
  });

  // Filtrowanie
  const filteredMaterials = useMemo(() => {
    const list = (materialsData?.data || []) as Material[];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (m) => 
        String(m.title).toLowerCase().includes(q) || 
        String(m.position).includes(q)
    );
  }, [materialsData?.data, query]);

  const handlePreview = (material: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showPreview) return;
    setPreviewModal({
      open: true,
      material,
    });
  };

  const colors = {
    blue: {
      selected: "bg-blue-50/60 ring-1 ring-blue-200",
      radio: "bg-blue-500 border-blue-500",
    },
    cyan: {
      selected: "bg-cyan-50/60 ring-1 ring-cyan-200",
      radio: "bg-cyan-500 border-cyan-500",
    },
  };

  const colorScheme = colors[highlightColor];

  return (
    <>
      <div className={`rounded-lg border ${className}`}>
        {/* Search header */}
        <div className="flex items-center gap-2 p-2 border-b bg-muted/40">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtruj materiały…"
            className="h-8"
          />
        </div>

        {/* Materials list */}
        <div className="divide-y">
          {materialsLoading && (
            <div className="p-3 text-xs text-muted-foreground">
              Ładowanie materiałów…
            </div>
          )}
          
          {!materialsLoading && filteredMaterials.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">
              {query ? "Brak wyników dla filtru." : "Brak materiałów w tym temacie."}
            </div>
          )}
          
          {filteredMaterials.map((material) => {
            const selected = selectedMaterialId === material.id;

            return (
              <button
                key={material.id}
                type="button"
                onClick={() => onSelectMaterial(material.id)}
                className={[
                  "w-full text-left p-3 hover:bg-muted/50 transition",
                  selected ? colorScheme.selected : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-semibold">
                        {material.position}
                      </span>
                      <span className="truncate">{material.title}</span>
                      {!material.is_published && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          <EyeOff className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>

                    {/* Preview button (tylko gdy showPreview = true) */}
                    {showPreview && (
                      <button
                        onClick={(e) => handlePreview(material, e)}
                        className="mt-1 ml-7 text-xs text-primary/70 hover:text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Zobacz treść
                      </button>
                    )}

                    {/* Material count (opcjonalnie - dla EM wizard) */}
                    {showMaterialCount && material.duration_min && (
                      <div className="mt-1 ml-7 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3 inline mr-1" />
                        {material.duration_min} min
                      </div>
                    )}
                  </div>

                  {/* Radio button indicator */}
                  <div
                    className={[
                      "shrink-0 w-3 h-3 rounded-full border mt-1",
                      selected ? colorScheme.radio : "bg-white",
                    ].join(" ")}
                    aria-hidden
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-2 border-t text-[11px] text-muted-foreground">
          Kliknij materiał{showPreview ? " lub zobacz treść" : ""}, aby go wybrać.
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <Dialog
          open={previewModal.open}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewModal({ open: false, material: null });
            }
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {previewModal.material?.title}
              </DialogTitle>
              <DialogDescription>
                Podgląd materiału • {previewModal.material?.duration_min || 20} min
              </DialogDescription>
            </DialogHeader>

            {previewModal.material && (
              <MaterialContentRenderer
                content={previewModal.material.content}
                metadata={{
                  duration_min: previewModal.material.duration_min,
                  position: previewModal.material.position,
                  created_at: previewModal.material.created_at,
                }}
                showMetadata={true}
                height="500px"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}