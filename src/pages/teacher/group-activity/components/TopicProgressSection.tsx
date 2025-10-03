import { useState } from "react";
import { ChevronDown, ChevronRight, Users, Award, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopicProgressSectionProps {
  topic: {
    id: number;
    title: string;
  };
  topicNumber: number;
  activities: Array<{
    id: number;
    title: string;
    type: "material" | "quiz";
  }>;
  students: Array<{
    id: string;
    full_name: string;
  }>;
  getActivityStats: (activityId: number) => {
    totalStudents: number;
    completedCount: number;
    startedCount: number;
    notStartedCount: number;
    averageScore: number | null;
    completionPercentage: number;
  };
}

export const TopicProgressSection = ({
  topic,
  topicNumber,
  activities,
  students,
  getActivityStats,
}: TopicProgressSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (activities.length === 0) return null;

  // Oblicz statystyki dla całego tematu
  const topicStats = activities.reduce(
    (acc, activity) => {
      const stats = getActivityStats(activity.id);
      acc.totalCompleted += stats.completedCount;
      acc.totalPossible += stats.totalStudents;
      if (activity.type === "quiz" && stats.averageScore !== null) {
        acc.quizScores.push(stats.averageScore);
      }
      return acc;
    },
    { totalCompleted: 0, totalPossible: 0, quizScores: [] as number[] }
  );

  const topicCompletionPercentage =
    topicStats.totalPossible > 0
      ? (topicStats.totalCompleted / topicStats.totalPossible) * 100
      : 0;

  const topicAverageScore =
    topicStats.quizScores.length > 0
      ? topicStats.quizScores.reduce((a, b) => a + b, 0) / topicStats.quizScores.length
      : null;

  return (
    <div className="border rounded-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="font-semibold">
              Temat {topicNumber}: {topic.title}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>
                {activities.length} {activities.length === 1 ? "aktywność" : "aktywności"}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {topicCompletionPercentage.toFixed(0)}% ukończonych
              </span>
              {topicAverageScore !== null && (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Średnia: {topicAverageScore.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          {activities.map((activity) => {
            const stats = getActivityStats(activity.id);
            const isQuiz = activity.type === "quiz";

            return (
              <div key={activity.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{activity.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {isQuiz ? "Quiz" : "Materiał"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {stats.completedCount}/{stats.totalStudents} ukończyło
                      </span>
                      {stats.startedCount > stats.completedCount && (
                        <span>
                          {stats.startedCount - stats.completedCount} w trakcie
                        </span>
                      )}
                      {stats.notStartedCount > 0 && (
                        <span>
                          {stats.notStartedCount} nie rozpoczęło
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {stats.completionPercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">ukończenia</div>
                    </div>
                    {isQuiz && stats.averageScore !== null && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">
                          {stats.averageScore.toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">średnia</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${stats.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};