import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { ActivityDetailRow } from "./ActivityDetailRow";

interface Activity {
  id: number;
  topic_id: number;
  type: "material" | "quiz";
  title: string;
  position: number;
  passing_score?: number;
  max_attempts?: number;
  progress: {
    completed_at: string | null;
    score: number | null;
    attempts: number;
    time_spent: number;
    started_at: string;
  } | null;
}

interface Topic {
  id: number;
  title: string;
  position: number;
  activities: Activity[];
}

interface TopicActivityListProps {
  topics: Topic[];
  onViewQuizDetails?: (activityId: number) => void;
}

export const TopicActivityList = ({
  topics,
  onViewQuizDetails,
}: TopicActivityListProps) => {
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(
    new Set(topics.map((t) => t.id))
  );

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const getTopicStats = (topic: Topic) => {
    const total = topic.activities.length;
    const completed = topic.activities.filter(
      (a) => a.progress?.completed_at !== null
    ).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, percentage };
  };

  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Brak tematów w kursie</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic, index) => {
        const isExpanded = expandedTopics.has(topic.id);
        const stats = getTopicStats(topic);

        return (
          <div key={topic.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleTopic(topic.id)}
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
                    Temat {index + 1}: {topic.title}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>
                      {topic.activities.length}{" "}
                      {topic.activities.length === 1
                        ? "aktywność"
                        : "aktywności"}
                    </span>
                    <span>
                      Ukończono: {stats.completed}/{stats.total}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 w-24">
                  <div className="text-xs text-muted-foreground mb-1 text-right">
                    {stats.percentage.toFixed(0)}%
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="p-4 pt-0 space-y-2 bg-muted/20">
                {topic.activities.length > 0 ? (
                  topic.activities.map((activity) => (
                    <ActivityDetailRow
                      key={activity.id}
                      activity={activity}
                      progress={activity.progress}
                      onViewDetails={
                        activity.type === "quiz" && activity.progress
                          ? () => onViewQuizDetails?.(activity.id)
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    Brak aktywności w tym temacie
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};