import { useOne, useList } from "@refinedev/core";
import { useMemo } from "react";

interface ActivityProgress {
  user_id: string;
  activity_id: number;
  completed_at: string | null;
  score: number | null;
  time_spent: number;
  started_at: string;
}

interface StudentProgress {
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  lastActivity: string | null;
  averageScore: number | null;
  totalTimeSpent: number;
}

interface ActivityStats {
  totalStudents: number;
  completedCount: number;
  startedCount: number;
  notStartedCount: number;
  averageScore: number | null;
  completionPercentage: number;
}

export const useGroupCourseActivity = (groupId: string, courseId: string) => {
  const { data: groupData, isLoading: groupLoading } = useOne({
    resource: "groups",
    id: groupId,
  });

  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: courseId,
  });

  const { data: membersData, isLoading: membersLoading } = useList({
    resource: "group_members",
    filters: [{ field: "group_id", operator: "eq", value: parseInt(groupId) }],
    pagination: { mode: "off" },
    meta: { select: "*, users(id, full_name, email)" },
  });

  const { data: topicsData, isLoading: topicsLoading } = useList({
    resource: "topics",
    filters: [{ field: "course_id", operator: "eq", value: parseInt(courseId) }],
    pagination: { mode: "off" },
    sorters: [{ field: "position", order: "asc" }],
  });

  const topicIds = topicsData?.data?.map((t) => t.id) || [];
  const { data: activitiesData, isLoading: activitiesLoading } = useList({
    resource: "activities",
    filters: topicIds.length > 0 ? [
      { field: "topic_id", operator: "in", value: topicIds }
    ] : [],
    pagination: { mode: "off" },
    sorters: [{ field: "position", order: "asc" }],
    queryOptions: { enabled: topicIds.length > 0 },
  });

  const activityIds = activitiesData?.data?.map((a) => a.id) || [];
  const studentIds = membersData?.data?.map((m) => m.user_id) || [];

  const { data: progressData, isLoading: progressLoading } = useList<ActivityProgress>({
    resource: "activity_progress",
    filters: activityIds.length > 0 && studentIds.length > 0 ? [
      { field: "activity_id", operator: "in", value: activityIds },
      { field: "user_id", operator: "in", value: studentIds }
    ] : [],
    pagination: { mode: "off" },
    queryOptions: { enabled: activityIds.length > 0 && studentIds.length > 0 },
  });

  const isLoading =
    groupLoading ||
    courseLoading ||
    membersLoading ||
    topicsLoading ||
    activitiesLoading ||
    progressLoading;

  const students = membersData?.data?.map((m) => m.users).filter(Boolean) || [];
  const topics = topicsData?.data || [];
  const activities = activitiesData?.data || [];
  const progressRecords = progressData?.data || [];

  const getStudentProgress = (userId: string): StudentProgress => {
    const userProgress = progressRecords.filter((p) => p.user_id === userId);

    const completedCount = userProgress.filter((p) => p.completed_at !== null).length;
    const totalCount = activities.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    const completedRecords = userProgress
      .filter((p) => p.completed_at !== null)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    const lastActivity = completedRecords.length > 0 ? completedRecords[0].completed_at : null;

    const scoresWithValues = userProgress.filter((p) => p.score !== null && p.score > 0);
    const averageScore =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, p) => sum + p.score!, 0) / scoresWithValues.length
        : null;

    const totalTimeSpent = userProgress.reduce((sum, p) => sum + (p.time_spent || 0), 0);

    return {
      completedCount,
      totalCount,
      progressPercentage,
      lastActivity,
      averageScore,
      totalTimeSpent,
    };
  };

  const courseStats = useMemo(() => {
    if (students.length === 0) {
      return {
        averageProgress: 0,
        completedStudents: 0,
        inProgressStudents: 0,
        notStartedStudents: 0,
        averageScore: null,
      };
    }

    let totalProgress = 0;
    let completedStudents = 0;
    let inProgressStudents = 0;
    let notStartedStudents = 0;
    const allScores: number[] = [];

    students.forEach((student) => {
      const progress = getStudentProgress(student.id);
      totalProgress += progress.progressPercentage;

      if (progress.progressPercentage === 100) completedStudents++;
      else if (progress.progressPercentage > 0) inProgressStudents++;
      else notStartedStudents++;

      if (progress.averageScore !== null) allScores.push(progress.averageScore);
    });

    return {
      averageProgress: totalProgress / students.length,
      completedStudents,
      inProgressStudents,
      notStartedStudents,
      averageScore: allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null,
    };
  }, [students, progressRecords, activities]);

  const getTopicActivities = (topicId: number) => {
    return activities.filter((a) => a.topic_id === topicId);
  };

  const getActivityStats = (activityId: number): ActivityStats => {
    const activityProgress = progressRecords.filter((p) => p.activity_id === activityId);
    const totalStudents = students.length;
    const completedCount = activityProgress.filter((p) => p.completed_at !== null).length;
    const startedCount = activityProgress.length;
    const notStartedCount = totalStudents - startedCount;

    const scoresWithValues = activityProgress.filter((p) => p.score !== null && p.score > 0);
    const averageScore =
      scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, p) => sum + p.score!, 0) / scoresWithValues.length
        : null;

    return {
      totalStudents,
      completedCount,
      startedCount,
      notStartedCount,
      averageScore,
      completionPercentage: totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0,
    };
  };

  return {
    group: groupData?.data,
    course: courseData?.data,
    students,
    topics,
    activities,
    completions: progressRecords,
    quizAttempts: [],
    courseStats,
    isLoading,
    getStudentProgress,
    getTopicActivities,
    getActivityStats,
  };
};