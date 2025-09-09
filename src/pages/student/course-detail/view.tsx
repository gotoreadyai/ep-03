/* path: src/pages/student/components/StudentCourseDetail.tsx */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Check, Clock, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/utility";
import { useRPC } from "../hooks/useRPC";
import { useSupabaseQuery } from "../hooks/useSupabaseQuery";
import { AnimatedProgress, AnimatedCard, AnimatedCounter, motion } from "../motion";

/* ==================== Typy ==================== */
interface CourseStructureItem {
  topic_id: number;
  topic_title: string;
  topic_position: number;
  activity_id: number | null;
  activity_title: string | null;
  activity_type: "material" | "quiz" | null;
  activity_position: number | null;
  is_completed: boolean;
  score: number | null;
}
interface Topic {
  id: number;
  title: string;
  position: number;
  activities: any[];
}
interface Course {
  id: number;
  title: string;
  description: string;
  icon_emoji: string;
}

/* ==================== Skeletony ==================== */
const HeaderSkeleton: React.FC = () => (
  <div className="rounded-2xl border bg-card p-5 md:p-6 shadow-soft animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-muted/60" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-1/2 rounded bg-muted/60" />
        <div className="h-4 w-3/4 rounded bg-muted/60" />
      </div>
      <div className="h-9 w-36 rounded-lg bg-muted/60" />
    </div>
    <div className="mt-5">
      <div className="h-2 w-full rounded-full bg-muted/60" />
      <div className="mt-2 flex items-center justify-between">
        <div className="h-3 w-16 rounded bg-muted/60" />
        <div className="h-3 w-10 rounded bg-muted/60" />
      </div>
    </div>
  </div>
);

const TopicSkeleton: React.FC = () => (
  <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-soft animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="h-10 w-10 rounded-full bg-muted/60" />
      <div className="h-4 w-2/5 rounded bg-muted/60" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl border bg-muted/40" />
      ))}
    </div>
  </div>
);

/* ==================== Komponent ==================== */
export const CourseDetailView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: courseStructure, isLoading } = useRPC<CourseStructureItem[]>(
    "get_course_structure",
    { p_course_id: parseInt(courseId!) },
    { enabled: !!courseId }
  );

  const { data: courseData } = useSupabaseQuery<Course>("courses", {
    filters: [{ field: "id", operator: "eq", value: parseInt(courseId!) }],
    enabled: !!courseId,
  });

  const topicsWithActivities = React.useMemo(() => {
    if (!courseStructure) return [];

    const grouped = courseStructure.reduce((acc, item) => {
      const topicKey = `${item.topic_id}-${item.topic_title}`;
      if (!acc[topicKey]) {
        acc[topicKey] = {
          id: item.topic_id,
          title: item.topic_title,
          position: item.topic_position,
          activities: [],
        };
      }

      if (item.activity_id) {
        acc[topicKey].activities.push({
          id: item.activity_id,
          title: item.activity_title!,
          type: item.activity_type!,
          position: item.activity_position!,
          completed: item.is_completed,
          score: item.score,
        });
      }

      return acc;
    }, {} as any);

    const topics = Object.values(grouped).sort(
      (a: any, b: any) => a.position - b.position
    ) as Topic[];

    // Znajdź globalnie pierwszy nieukończony materiał
    let globalFirstIncompleteFound = false;

    return topics.map((topic: any, index: number) => {
      const isCompleted =
        topic.activities.length > 0 &&
        topic.activities.every((activity: any) => activity.completed);

      const isUnlocked =
        index === 0 ||
        (topics[index - 1].activities.length > 0 &&
          topics[index - 1].activities.every((a: any) => a.completed));

      // posortuj aktywności po pozycji
      topic.activities.sort((a: any, b: any) => a.position - b.position);

      // Oznacz które aktywności są odblokowane
      topic.activities = topic.activities.map((activity: any) => {
        let activityUnlocked = false;

        if (activity.completed) {
          // Ukończone zawsze odblokowane
          activityUnlocked = true;
        } else if (isUnlocked && !globalFirstIncompleteFound) {
          // Pierwszy nieukończony globalnie
          activityUnlocked = true;
          globalFirstIncompleteFound = true;
        }

        return {
          ...activity,
          isUnlocked: activityUnlocked,
        };
      });

      return {
        ...topic,
        isCompleted,
        isUnlocked,
      };
    });
  }, [courseStructure]);

  const stats = React.useMemo(() => {
    const allActivities = topicsWithActivities.flatMap((t: any) => t.activities);
    const completed = allActivities.filter((a: any) => a.completed).length;
    const total = allActivities.length;
    return {
      totalActivities: total,
      completedActivities: completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [topicsWithActivities]);

  const course = courseData?.[0];

  // wyznacz "kontynuuj" - znajdź pierwszy odblokowany nieukończony
  const nextActivity = React.useMemo(() => {
    for (const topic of topicsWithActivities) {
      const a = topic.activities.find((x: any) => !x.completed && x.isUnlocked);
      if (a) {
        return {
          topicId: topic.id,
          activity: a,
          path:
            a.type === "quiz"
              ? `/student/courses/${courseId}/quiz/${a.id}`
              : `/student/courses/${courseId}/lesson/${a.id}`,
        };
      }
    }
    return null;
  }, [topicsWithActivities, courseId]);

  /* ==================== Ładowanie ==================== */
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <button
          className="inline-flex items-center gap-2 text-muted-foreground cursor-default"
          disabled
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Powrót</span>
        </button>
        <HeaderSkeleton />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TopicSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  /* ==================== Brak danych ==================== */
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-5xl">🤷‍♂️</div>
        <h2 className="mt-3 text-xl font-semibold">Nie znaleziono kursu</h2>
        <p className="text-muted-foreground mt-1">
          Spróbuj wrócić do listy kursów i wybrać ponownie.
        </p>
        <button
          onClick={() => navigate("/student/courses")}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-ring"
        >
          Przejdź do kursów
        </button>
      </div>
    );
  }

  /* ==================== Widok ==================== */
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* BACK */}
      <button
        onClick={() => navigate("/student/dashboard#courses")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Powrót</span>
      </button>

      {/* ========================= HERO: KURS ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        {/* Delikatne tło jak na dashboardzie */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-secondary/[0.10] to-accent/[0.12]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--ring)/0.35) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--ring)/0.35) 1px, transparent 1px)
              `,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <div className="grid md:grid-cols-12 gap-6 md:items-center">
            {/* Info */}
            <div className="md:col-span-7 flex items-start gap-4 min-w-0">
              <div className="text-5xl md:text-6xl leading-none shrink-0">
                {course.icon_emoji || "📚"}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="mt-2 text-sm md:text-base text-muted-foreground line-clamp-3">
                    {course.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1.5 shadow-soft">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Ukończone:{" "}
                      <span className="tabular-nums">
                        <AnimatedCounter value={stats.completedActivities} />
                      </span>
                      /{stats.totalActivities}
                    </span>
                  </span>
                  {stats.progress === 100 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 shadow-soft text-sm font-semibold">
                      <Check className="h-4 w-4" />
                      Kurs ukończony
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress + CTA */}
            <div className="md:col-span-5">
              <div className="rounded-xl border bg-card p-4 md:p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Postęp kursu
                  </span>
                  <span className="text-sm font-semibold">{stats.progress}%</span>
                </div>
                <div className="mt-2">
                  <AnimatedProgress value={stats.progress} />
                </div>

                <div className="mt-3 flex gap-2">
                  {nextActivity ? (
                    <button
                      onClick={() => navigate(nextActivity.path)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 focus-ring"
                    >
                      Kontynuuj
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 rounded-lg border px-4 py-2 text-muted-foreground cursor-default"
                      title="Brak kolejnej aktywności"
                    >
                      Wszystko ukończone
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/student/courses")}
                    className="rounded-lg border px-3 py-2 hover:bg-primary/5 focus-ring"
                    title="Wróć do listy"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================= ŚCIEŻKA TEMATÓW ========================= */}
      <div className="space-y-6">
        {topicsWithActivities.map((topic: any, topicIndex: number) => (
          <AnimatedCard
            key={topic.id}
            index={topicIndex}
            className={cn(
              "relative rounded-2xl border bg-card p-4 md:p-5 shadow-soft",
              !topic.isUnlocked && "opacity-60"
            )}
          >
            {/* Nagłówek tematu */}
            <div className="flex items-center justify-between gap-4 mb-3 md:mb-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    topic.isCompleted
                      ? "bg-green-600 text-white"
                      : topic.isUnlocked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                  aria-label={
                    topic.isCompleted
                      ? "Temat ukończony"
                      : topic.isUnlocked
                      ? "Temat odblokowany"
                      : "Temat zablokowany"
                  }
                >
                  {topic.isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : topic.isUnlocked ? (
                    <span className="font-semibold">{topic.position}</span>
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-foreground">
                    {topic.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {
                      topic.activities.filter((a: any) => a.completed).length
                    }{" "}
                    z {topic.activities.length} ukończonych
                  </p>
                </div>
              </div>

              {/* Mini-progress tematu */}
              <div className="hidden md:block w-40">
                <AnimatedProgress
                  value={
                    topic.activities.length
                      ? Math.round(
                          (topic.activities.filter((a: any) => a.completed)
                            .length /
                            topic.activities.length) *
                            100
                        )
                      : 0
                  }
                />
              </div>
            </div>

            {/* Aktywności */}
            <div className="mt-3 md:mt-4 space-y-3">
              {topic.activities.map((activity: any) => {
                const isQuiz = activity.type === "quiz";
                const path =
                  activity.type === "quiz"
                    ? `/student/courses/${courseId}/quiz/${activity.id}`
                    : `/student/courses/${courseId}/lesson/${activity.id}`;

                return (
                  <motion.button
                    key={activity.id}
                    whileHover={activity.isUnlocked ? { x: 2 } : {}}
                    whileTap={activity.isUnlocked ? { scale: 0.98 } : {}}
                    onClick={() => {
                      if (!activity.isUnlocked) return;
                      navigate(path);
                    }}
                    disabled={!activity.isUnlocked}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-colors focus-ring",
                      activity.isUnlocked
                        ? "bg-background/60 hover:bg-primary/5"
                        : "bg-muted/40 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          isQuiz 
                            ? activity.isUnlocked 
                              ? "bg-purple-100" 
                              : "bg-muted"
                            : activity.isUnlocked 
                              ? "bg-blue-100" 
                              : "bg-muted"
                        )}
                      >
                        {!activity.isUnlocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : isQuiz ? (
                          <Zap className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className={cn(
                          "font-medium",
                          activity.isUnlocked ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {activity.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isQuiz ? "Quiz" : "Materiał"}
                          {activity.score !== null && ` • ${activity.score}%`}
                          {!activity.isUnlocked && " • Zablokowane"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!activity.completed && activity.isUnlocked && (
                        <span className="hidden sm:inline text-xs text-muted-foreground">
                          Przejdź
                        </span>
                      )}
                      {activity.completed ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : activity.isUnlocked ? (
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};