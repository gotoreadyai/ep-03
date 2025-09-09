import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Clock,
  Hash,
  Calendar,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ActivityMaterialViewProps {
  activity: {
    id: string;
    title: string;
    content?: string;
    duration_min?: number;
    position: number;
    created_at: string;
    updated_at?: string;
  };
}

export const ActivityMaterialView = ({ activity }: ActivityMaterialViewProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      {/* Treść materiału */}
      <Card>
        <CardHeader>
          <CardTitle>Treść materiału</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.content ? (
            <div className="prose max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
              >
                {activity.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Brak treści materiału</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel boczny dla materiału */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                Czas trwania
              </div>
              <p className="font-medium">{activity.duration_min || "-"} minut</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Hash className="w-4 h-4" />
                Pozycja w temacie
              </div>
              <p className="font-medium">{activity.position}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                Data utworzenia
              </div>
              <p className="font-medium">
                {new Date(activity.created_at).toLocaleDateString("pl-PL")}
              </p>
            </div>
            {activity.updated_at && (
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  Ostatnia aktualizacja
                </div>
                <p className="font-medium">
                  {new Date(activity.updated_at).toLocaleDateString("pl-PL")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};