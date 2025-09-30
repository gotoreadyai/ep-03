// src/pages/teacher/activities/components/MaterialContentRenderer.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui";
import { Clock, Hash, Calendar } from "lucide-react";

interface MaterialContentRendererProps {
  content: string;
  metadata?: {
    duration_min?: number;
    position?: number;
    created_at?: string;
    updated_at?: string;
  };
  showMetadata?: boolean;
  height?: string;
}

export const MaterialContentRenderer = ({ 
  content, 
  metadata,
  showMetadata = true,
  height = "500px"
}: MaterialContentRendererProps) => {
  return (
    <div className="space-y-4">
      {/* Metadane - opcjonalne */}
      {showMetadata && metadata && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          {metadata.duration_min && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Czas trwania
              </div>
              <p className="font-medium">{metadata.duration_min} minut</p>
            </div>
          )}
          {metadata.position !== undefined && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Hash className="w-4 h-4" />
                Pozycja
              </div>
              <p className="font-medium">{metadata.position}</p>
            </div>
          )}
          {metadata.created_at && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                Utworzono
              </div>
              <p className="font-medium">
                {new Date(metadata.created_at).toLocaleDateString("pl-PL")}
              </p>
            </div>
          )}
          {metadata.updated_at && (
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                Ostatnia aktualizacja
              </div>
              <p className="font-medium">
                {new Date(metadata.updated_at).toLocaleDateString("pl-PL")}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Treść */}
      <ScrollArea className="rounded-lg border p-4" style={{ height }}>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
};