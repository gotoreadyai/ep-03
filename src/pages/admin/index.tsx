// src/pages/admin/index.tsx
import { lazy, Suspense } from "react";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { Authenticated, useGetIdentity } from "@refinedev/core";
import { CatchAllNavigate } from "@refinedev/react-router";

import { AdminLayout } from "./AdminLayout";

import { dashboardRoutes } from "./dashboard";
import { permissionsRoutes } from "./permissions"; 
import { vendorsRoutes } from "./vendors";

import { courseStructureRoutes } from "./ai-tools/course-structure-wizard";
import { aiToolsRoutes } from "./ai-tools";
import { educationalMaterialRoutes } from "./ai-tools/educational-material-wizard";

const allAdminRoutes = [
  ...dashboardRoutes,
  ...permissionsRoutes, 
  ...vendorsRoutes,
  ...aiToolsRoutes,
  ...courseStructureRoutes,
  ...educationalMaterialRoutes,
  // ...quizWizardRoutes,

];

const AdminPanelComponent = () => (
  <Routes>
    <Route
      element={
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      }
    >
      <Route index element={<Navigate to="dashboard/overview" replace />} />
      <Route path="dashboard" element={<Navigate to="dashboard/overview" replace />} />
      {allAdminRoutes}
    </Route>
  </Routes>
);

const AdminPanel = lazy(() => Promise.resolve({ default: AdminPanelComponent }));

const LoadingFallback = ({ text, colorClass }: { text: string; colorClass: string }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="text-center">
      <div className={`inline-block h-12 w-12 animate-spin rounded-full border-4 border-current border-r-transparent ${colorClass}`} />
      <p className="mt-4 text-muted-foreground">{text}</p>
    </div>
  </div>
);

const AdminAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: identity, isLoading } = useGetIdentity<any>();

  if (isLoading || !identity) {
    return <LoadingFallback text="Sprawdzanie uprawnień..." colorClass="border-red-600" />;
  }

  if (identity.role !== "admin") {
    const redirectPath = identity.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export const AdminModule = (
  <Route
    path="/admin/*"
    element={
      <Authenticated key="admin-auth" fallback={<CatchAllNavigate to="/login" />}>
        <AdminAccessGuard>
          <Suspense
            fallback={<LoadingFallback text="Ładowanie panelu administratora..." colorClass="border-red-600" />}
          >
            <AdminPanel />
          </Suspense>
        </AdminAccessGuard>
      </Authenticated>
    }
  />
);
