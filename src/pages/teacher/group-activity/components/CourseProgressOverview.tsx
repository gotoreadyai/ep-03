import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridBox } from "@/components/shared";
import { TrendingUp, CheckCircle2, Clock, Award } from "lucide-react";

interface CourseProgressOverviewProps {
  stats: {
    averageProgress: number;
    completedStudents: number;
    inProgressStudents: number;
    notStartedStudents: number;
    averageScore: number | null;
  };
  studentsCount: number;
}

export const CourseProgressOverview = ({ stats, studentsCount }: CourseProgressOverviewProps) => {
  return (
    <GridBox variant="2-2-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Średni postęp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageProgress.toFixed(1)}%</div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${stats.averageProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Ukończyli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.completedStudents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            z {studentsCount} uczniów
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            W trakcie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {stats.inProgressStudents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            aktywnych uczniów
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="w-4 h-4" />
            Średnia ocen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averageScore !== null ? `${stats.averageScore.toFixed(1)}%` : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            z quizów
          </p>
        </CardContent>
      </Card>
    </GridBox>
  );
};