import { useOne, useList } from "@refinedev/core";
import { useMemo } from "react";

interface ActivityProgress {
  user_id: string;
  activity_id: number;
  completed_at: string | null;
  score: number | null;
  time_spent: number;
  started_at: string;
  attempts: number;
  last_attempt: any; // JSONB
}

interface Activity {
  id: number;
  topic_id: number;
  type: "material" | "quiz";
  title: string;
  position: number;
  is_published: boolean;
  content?: string;
  duration_min?: number;
  passing_score?: number;
  time_limit?: number;
  max_attempts?: number;
}

interface Topic {
  id: number;
  course_id: number;
  title: string;
  position: number;
  is_published: boolean;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  academic_year: string;
}

interface Course {
  id: number;
  title: string;
  icon_emoji?: string;
}

interface ActivityWithProgress extends Activity {
  progress: ActivityProgress | null;
}

interface TopicWithActivities extends Topic {
  activities: ActivityWithProgress[];
}

export const useStudentCourseDetails = (
  groupId: string,
  courseId: string,
  studentId: string
) => {
  // Fetch student data with explicit type
  const { data: studentData, isLoading: studentLoading } = useOne<Student>({
    resource: "users",
    id: studentId,
  });

  // Fetch group data with explicit type
  const { data: groupData, isLoading: groupLoading } = useOne<Group>({
    resource: "groups",
    id: groupId,
  });

  // Fetch course data with explicit type
  const { data: courseData, isLoading: courseLoading } = useOne<Course>({
    resource: "courses",
    id: courseId,
  });

  // Fetch topics
  const { data: topicsData, isLoading: topicsLoading } = useList<Topic>({
    resource: "topics",
    filters: [{ field: "course_id", operator: "eq", value: parseInt(courseId) }],
    pagination: { mode: "off" },
    sorters: [{ field: "position", order: "asc" }],
  });

  // Fetch activities
  const topicIds = topicsData?.data?.map((t) => t.id) || [];
  const { data: activitiesData, isLoading: activitiesLoading } = useList<Activity>({
    resource: "activities",
    filters:
      topicIds.length > 0
        ? [{ field: "topic_id", operator: "in", value: topicIds }]
        : [],
    pagination: { mode: "off" },
    sorters: [{ field: "position", order: "asc" }],
    queryOptions: { enabled: topicIds.length > 0 },
  });

  // Fetch student's progress for all activities
  const activityIds = activitiesData?.data?.map((a) => a.id) || [];
  const { data: progressData, isLoading: progressLoading } = useList<ActivityProgress>({
    resource: "activity_progress",
    filters:
      activityIds.length > 0
        ? [
            { field: "activity_id", operator: "in", value: activityIds },
            { field: "user_id", operator: "eq", value: studentId },
          ]
        : [],
    pagination: { mode: "off" },
    queryOptions: { enabled: activityIds.length > 0 },
  });

  const isLoading =
    studentLoading ||
    groupLoading ||
    courseLoading ||
    topicsLoading ||
    activitiesLoading ||
    progressLoading;

  const student = studentData?.data;
  const group = groupData?.data;
  const course = courseData?.data;
  const topics = topicsData?.data || [];
  const activities = activitiesData?.data || [];
  const progressRecords = progressData?.data || [];

  // Create progress map for quick lookup
  const progressMap = useMemo(() => {
    const map = new Map<number, ActivityProgress>();
    progressRecords.forEach((progress) => {
      map.set(progress.activity_id, progress);
    });
    return map;
  }, [progressRecords]);

  // Combine activities with their progress
  const activitiesWithProgress: ActivityWithProgress[] = useMemo(() => {
    return activities.map((activity) => ({
      ...activity,
      progress: progressMap.get(activity.id) || null,
    }));
  }, [activities, progressMap]);

  // Group activities by topic
  const topicsWithActivities: TopicWithActivities[] = useMemo(() => {
    return topics.map((topic) => ({
      ...topic,
      activities: activitiesWithProgress.filter((a) => a.topic_id === topic.id),
    }));
  }, [topics, activitiesWithProgress]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalActivities = activities.length;
    const completedActivities = progressRecords.filter(
      (p) => p.completed_at !== null
    ).length;

    const quizProgress = progressRecords.filter((p) => {
      const activity = activities.find((a) => a.id === p.activity_id);
      return activity?.type === "quiz" && p.score !== null;
    });

    const averageScore =
      quizProgress.length > 0
        ? quizProgress.reduce((sum, p) => sum + (p.score || 0), 0) / quizProgress.length
        : null;

    const totalTimeSpent = progressRecords.reduce(
      (sum, p) => sum + (p.time_spent || 0),
      0
    );

    const lastActivity = progressRecords
      .filter((p) => p.completed_at !== null)
      .sort(
        (a, b) =>
          new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
      )[0];

    const progressPercentage =
      totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

    return {
      totalActivities,
      completedActivities,
      progressPercentage,
      averageScore,
      totalTimeSpent,
      lastActivity: lastActivity?.completed_at || null,
      totalQuizzes: activities.filter((a) => a.type === "quiz").length,
      completedQuizzes: quizProgress.length,
    };
  }, [activities, progressRecords]);

  return {
    student,
    group,
    course,
    topicsWithActivities,
    overallStats,
    isLoading,
  };
};