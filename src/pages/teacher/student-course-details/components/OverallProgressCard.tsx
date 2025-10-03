import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridBox } from "@/components/shared";
import {
  CheckCircle2,
  Award,
  Clock,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";

interface OverallProgressCardProps {
  stats: {
    totalActivities: number;
    completedActivities: number;
    progressPercentage: number;
    averageScore: number | null;
    totalTimeSpent: number;
    lastActivity: string | null;
    totalQuizzes: number;
    completedQuizzes: number;
  };
}

export const OverallProgressCard = ({ stats }: OverallProgressCardProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  return (
    <GridBox variant="2-2-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ukończone aktywności
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completedActivities}/{stats.totalActivities}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.progressPercentage.toFixed(0)}% kursu
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4" />
            Zaliczone quizy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.completedQuizzes}/{stats.totalQuizzes}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalQuizzes > 0
              ? `${((stats.completedQuizzes / stats.totalQuizzes) * 100).toFixed(0)}% quizów`
              : "Brak quizów"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="w-4 h-4" />
            Średnia z quizów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore !== null
              ? `${stats.averageScore.toFixed(1)}%`
              : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.averageScore !== null
              ? stats.averageScore >= 70
                ? "Wynik pozytywny"
                : "Wymaga poprawy"
              : "Brak wyników"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Czas nauki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(stats.totalTimeSpent)}
          </div>
          {stats.lastActivity && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              Ostatnio: {new Date(stats.lastActivity).toLocaleDateString("pl-PL")}
            </div>
          )}
        </CardContent>
      </Card>
    </GridBox>
  );
};