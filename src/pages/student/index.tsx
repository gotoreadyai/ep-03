// src/pages/student/index.tsx
/**
 * MODUŁ STUDENT — izolowany, z własnym guardem roli
 */

import { lazy, Suspense } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";

import { StudentLayout } from "./StudentLayout";

import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { courseDetailRoutes } from "./course-detail";
import { lessonsRoutes } from "./lessons";
import { quizzesRoutes } from "./quizzes";
import { gamificationRoutes } from "./gamification";
import { leaderboardRoutes } from "./leaderboard";
import { achievementsRoutes } from "./achievements";
import { profileRoutes } from "./profile";

const allStudentRoutes = [
  ...dashboardRoutes,
  ...coursesRoutes,
  ...courseDetailRoutes,
  ...lessonsRoutes,
  ...quizzesRoutes,
  ...gamificationRoutes,
  ...leaderboardRoutes,
  ...achievementsRoutes,
  ...profileRoutes,
];

const StudentPanelComponent = () => (
  <Routes>
    <Route
      element={
        <StudentLayout>
          <Outlet />
        </StudentLayout>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      {allStudentRoutes}
    </Route>
  </Routes>
);

const StudentPanel = lazy(() => Promise.resolve({ default: StudentPanelComponent }));

const LoadingFallback = ({ text, colorClass }: { text: string; colorClass: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="text-center">
      <div className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-current border-r-transparent ${colorClass}`} />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Guard: wpuszcza tylko student, resztę przekierowuje do teacher overview
const StudentAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: identity, isLoading } = useGetIdentity<any>();

  if (isLoading || !identity) {
    return <LoadingFallback text="Sprawdzanie uprawnień..." colorClass="border-blue-600" />;
  }

  if (identity.role !== "student") {
    return <Navigate to="/teacher/dashboard/overview" replace />;
  }

  return <>{children}</>;
};

export const StudentModule = (
  <Route
    path="/student/*"
    element={
      <Authenticated key="student-auth" fallback={<CatchAllNavigate to="/login" />}>
        <StudentAccessGuard>
          <Suspense
            fallback={<LoadingFallback text="Ładowanie panelu ucznia..." colorClass="border-blue-600" />}
          >
            <StudentPanel />
          </Suspense>
        </StudentAccessGuard>
      </Authenticated>
    }
  />
);
