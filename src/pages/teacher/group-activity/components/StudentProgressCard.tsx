import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Clock, Award, CheckCircle2, ArrowRight } from "lucide-react";
import { ActivityStatusBadge } from "./ActivityStatusBadge";
import { useNavigate, useParams } from "react-router-dom";

interface StudentProgressCardProps {
  student: {
    id: string;
    full_name: string;
    email: string;
  };
  progress: {
    completedCount: number;
    totalCount: number;
    progressPercentage: number;
    lastActivity: string | null;
    averageScore: number | null;
    totalTimeSpent: number;
  };
}

export const StudentProgressCard = ({ student, progress }: StudentProgressCardProps) => {
  const navigate = useNavigate();
  const { groupId, courseId } = useParams();

  const getStatus = () => {
    if (progress.progressPercentage === 100) return "completed";
    if (progress.progressPercentage > 0) return "in-progress";
    return "not-started";
  };

  const handleViewDetails = () => {
    navigate(`/teacher/groups/${groupId}/courses/${courseId}/students/${student.id}`);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold">{student.full_name}</h4>
              <p className="text-sm text-muted-foreground">{student.email}</p>
            </div>
            <ActivityStatusBadge status={getStatus()} />
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Postęp</span>
              <span className="font-medium">{progress.progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {progress.completedCount}/{progress.totalCount} aktywności
              </span>
            </div>

            {progress.averageScore !== null && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Award className="w-4 h-4" />
                <span>{progress.averageScore.toFixed(0)}% średnia</span>
              </div>
            )}

            {progress.lastActivity && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(progress.lastActivity).toLocaleDateString("pl-PL")}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleViewDetails}
            className="w-full"
          >
            Zobacz szczegółowy postęp
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
};