import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  Award,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ActivityDetailRowProps {
  activity: {
    id: number;
    type: "material" | "quiz";
    title: string;
    passing_score?: number;
    max_attempts?: number;
  };
  progress: {
    completed_at: string | null;
    score: number | null;
    attempts: number;
    time_spent: number;
    started_at: string;
  } | null;
  onViewDetails?: () => void;
}

export const ActivityDetailRow = ({
  activity,
  progress,
  onViewDetails,
}: ActivityDetailRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!progress) {
    return (
      <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-3">
          <Circle className="w-4 h-4 text-muted-foreground" />
          {activity.type === "quiz" ? (
            <FileText className="w-4 h-4 text-muted-foreground" />
          ) : (
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          )}
          <h4 className="font-medium flex-1">{activity.title}</h4>
          <Badge variant="outline" className="text-xs">
            {activity.type === "quiz" ? "Quiz" : "Materiał"}
          </Badge>
          <Badge variant="secondary">Brak danych</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg hover:bg-muted/30 transition-colors">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center gap-3 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}

        {progress.completed_at ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
        )}

        {activity.type === "quiz" ? (
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <BarChart3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}

        <h4 className="font-medium flex-1 min-w-0">{activity.title}</h4>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className="text-xs">
            {activity.type === "quiz" ? "Quiz" : "Materiał"}
          </Badge>
          {progress.completed_at ? (
            <Badge className="bg-green-600 hover:bg-green-700">Ukończono</Badge>
          ) : (
            <Badge className="bg-blue-600 hover:bg-blue-700">W trakcie</Badge>
          )}
          {progress.score !== null && (
            <Badge
              variant={
                progress.score >= (activity.passing_score || 70) ? "default" : "destructive"
              }
              className={
                progress.score >= (activity.passing_score || 70)
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
            >
              {progress.score.toFixed(0)}%
            </Badge>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground text-xs mb-1">Liczba prób</div>
              <div className="font-medium">{progress.attempts}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs mb-1">Czas</div>
              <div className="font-medium">{formatTime(progress.time_spent)}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs mb-1">Rozpoczęto</div>
              <div className="font-medium">
                {new Date(progress.started_at).toLocaleDateString("pl-PL")}
              </div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs mb-1">
                {progress.completed_at ? "Ukończono" : "Status"}
              </div>
              <div className="font-medium">
                {progress.completed_at
                  ? new Date(progress.completed_at).toLocaleDateString("pl-PL")
                  : "Nieukończone"}
              </div>
            </div>
          </div>

          {activity.type === "quiz" && onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <BarChart3 className="w-3 h-3 mr-2" />
              Zobacz szczegóły próby
            </Button>
          )}
        </div>
      )}
    </div>
  );
};