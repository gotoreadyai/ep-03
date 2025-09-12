// src/pages/teacher/index.tsx
/**
 * MODUŁ TEACHER — izolowany, z własnym guardem roli
 */

import { lazy, Suspense } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";


import { TeacherLayout } from "./TeacherLayout";

import { dashboardRoutes } from "./dashboard";
import { coursesRoutes } from "./courses";
import { topicsRoutes } from "./topics";
import { activitiesRoutes } from "./activities";
import { groupsRoutes } from "./groups";
import { usersRoutes } from "./users";

import { reportsRoutes } from "./reports";
import { courseStructureRoutes } from "./ai-tools/course-structure-wizard";
import { educationalMaterialRoutes } from "./ai-tools/educational-material-wizard";
import { quizWizardRoutes } from "./ai-tools/quiz-wizard";
import { questionsRoutes } from "./questions";
import { aiToolsRoutes } from "./ai-tools";

const allTeacherRoutes = [
  ...dashboardRoutes,
  ...coursesRoutes,
  ...topicsRoutes,
  ...aiToolsRoutes,
  ...activitiesRoutes,
  ...questionsRoutes,
  ...courseStructureRoutes,
  ...educationalMaterialRoutes,
  ...quizWizardRoutes,
  ...groupsRoutes,
  ...usersRoutes,

  ...reportsRoutes,
];

const TeacherPanelComponent = () => (
  <Routes>
    <Route
      element={
        <TeacherLayout>
          <Outlet />
        </TeacherLayout>
      }
    >
      <Route index element={<Navigate to="dashboard/overview" replace />} />
      <Route path="dashboard" element={<Navigate to="dashboard/overview" replace />} />
      {allTeacherRoutes}
    </Route>
  </Routes>
);

const TeacherPanel = lazy(() => Promise.resolve({ default: TeacherPanelComponent }));

const LoadingFallback = ({ text, colorClass }: { text: string; colorClass: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="text-center">
      <div className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-current border-r-transparent ${colorClass}`} />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  </div>
);

// Guard: wpuszcza tylko teacher/admin, resztę przekierowuje do student dashboard
const TeacherAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: identity, isLoading } = useGetIdentity<any>();

  if (isLoading || !identity) {
    return <LoadingFallback text="Sprawdzanie uprawnień..." colorClass="border-indigo-600" />;
  }

  if (!["teacher", "admin"].includes(identity.role)) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export const TeacherModule = (
  <Route
    path="/teacher/*"
    element={
      <Authenticated key="teacher-auth" fallback={<CatchAllNavigate to="/login" />}>
        <TeacherAccessGuard>
          <Suspense
            fallback={<LoadingFallback text="Ładowanie panelu nauczyciela..." colorClass="border-indigo-600" />}
          >
            <TeacherPanel />
          </Suspense>
        </TeacherAccessGuard>
      </Authenticated>
    }
  />
);
