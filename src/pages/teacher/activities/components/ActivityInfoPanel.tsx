// src/pages/teacher/activities/components/ActivityInfoPanel.tsx
import { Clock, Hash, Calendar } from "lucide-react";

interface ActivityInfoPanelProps {
  duration_min?: number;
  position: number;
  created_at: string;
  updated_at?: string;
}

export const ActivityInfoPanel = ({
  duration_min,
  position,
  created_at,
  updated_at,
}: ActivityInfoPanelProps) => {
  return (
    <div className="space-y-4">
      {duration_min && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Czas trwania</span>
          </div>
          <p className="text-base font-medium pl-6">{duration_min} minut</p>
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="w-4 h-4" />
          <span>Pozycja w temacie</span>
        </div>
        <p className="text-base font-medium pl-6">{position}</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Data utworzenia</span>
        </div>
        <p className="text-base font-medium pl-6">
          {new Date(created_at).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {updated_at && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Ostatnia aktualizacja</span>
          </div>
          <p className="text-base font-medium pl-6">
            {new Date(updated_at).toLocaleDateString("pl-PL", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
};