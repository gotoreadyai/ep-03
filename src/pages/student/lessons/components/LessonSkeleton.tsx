/* path: src/pages/studentLessons/components/LessonSkeleton.tsx */
import React from "react";

export const LessonSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
    <div className="h-5 w-24 rounded bg-muted/60" />
    <div className="rounded-2xl border bg-card p-6 shadow-soft animate-pulse">
      <div className="h-6 w-2/3 rounded bg-muted/60 mb-2" />
      <div className="h-4 w-40 rounded bg-muted/60" />
    </div>
    <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-4 w-full rounded bg-muted/50" />)}</div>
    <div className="h-10 w-48 rounded-lg bg-muted/60 ml-auto" />
  </div>
);
