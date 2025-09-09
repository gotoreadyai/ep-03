// src/pages/student/courses/list.tsx

import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRPC } from "../hooks/useRPC";
import { AnimatedCard, AnimatedProgress, motion } from "../motion";

export const CoursesList = () => {
  const navigate = useNavigate();
  const { data: coursesData, isLoading } = useRPC<any[]>("get_my_courses");
  const courses = coursesData || [];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-secondary/[0.10] to-accent/[0.12]" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Twoje kursy
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Wybierz kurs i kontynuuj naukę w swoim tempie.
          </p>
        </div>
      </motion.section>

      {/* LISTA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {courses.map((course: any, index: number) => (
          <AnimatedCard
            key={course.course_id}
            index={index}
            className="group relative rounded-2xl border bg-card p-4 sm:p-5 shadow-soft hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => navigate(`/student/courses/${course.course_id}`)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl sm:text-3xl shrink-0 leading-none">
                  {course.icon_emoji || "📚"}
                </span>
                <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                  {course.title}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 text-primary px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold">
                {course.progress_percent}%
              </span>
            </div>

            <div className="mt-4">
              <AnimatedProgress value={course.progress_percent} />
            </div>

            <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Kontynuuj
              <ArrowRight className="h-4 w-4" />
            </button>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
};