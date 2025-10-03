// src/pages/teacher/activities/components/ActivityMaterialView.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { MaterialContentRenderer } from "./MaterialContentRenderer";
import { ActivityInfoPanel } from "./ActivityInfoPanel";

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
            <MaterialContentRenderer
              content={activity.content}
              showMetadata={false}
              height="600px"
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Brak treści materiału</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel boczny dla materiału */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informacje</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityInfoPanel
            duration_min={activity.duration_min}
            position={activity.position}
            created_at={activity.created_at}
            updated_at={activity.updated_at}
          />
        </CardContent>
      </Card>
    </div>
  );
};