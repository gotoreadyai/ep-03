import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { TopicProgressSection } from "./TopicProgressSection";

interface Topic {
  id: number;
  title: string;
  position: number;
}

interface Activity {
  id: number;
  title: string;
  type: "material" | "quiz";
  topic_id: number;
}

interface Student {
  id: string;
  full_name: string;
}

interface TopicProgressOverviewProps {
  topics: Topic[];
  students: Student[];
  getTopicActivities: (topicId: number) => Activity[];
  getActivityStats: (activityId: number) => {
    totalStudents: number;
    completedCount: number;
    startedCount: number;
    notStartedCount: number;
    averageScore: number | null;
    completionPercentage: number;
  };
}

export const TopicProgressOverview = ({
  topics,
  students,
  getTopicActivities,
  getActivityStats,
}: TopicProgressOverviewProps) => {
  if (topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Postęp według tematów
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Brak tematów w kursie
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Postęp według tematów
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topics.map((topic, index) => {
          const activities = getTopicActivities(topic.id);
          return (
            <TopicProgressSection
              key={topic.id}
              topic={topic}
              topicNumber={index + 1}
              activities={activities}
              students={students}
              getActivityStats={getActivityStats}
            />
          );
        })}
      </CardContent>
    </Card>
  );
};