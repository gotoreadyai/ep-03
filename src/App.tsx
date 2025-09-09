// path: src/App.tsx
/**
 * APP ROOT
 * — Jeden <Refine>, ale "resources" dobierane dynamicznie na podstawie segmentu URL.
 * — Dzięki temu każdy moduł (admin/teacher/student) ma własne menu i strukturę, bez mieszania.
 * — Routing modułów zostaje w ich pakietach (AdminModule/TeacherModule/StudentModule).
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { dataProvider } from "@refinedev/supabase";
import { supabaseClient } from "./utility";
import { authProvider } from "./utility/auth/authProvider";



// Auth
import { LoginModule, RegisterModule, ForgotPasswordModule, UpdatePasswordModule } from "./pages/auth";

// Moduły (ROUTES)
import { AdminModule } from "./pages/admin";
import { TeacherModule } from "./pages/teacher";
import { StudentModule } from "./pages/student";

// Zestawy resources per moduł
import { adminResources } from "./pages/admin/resources";
import { teacherResources } from "./pages/teacher/resources";
import { studentResources } from "./pages/student/resources";
import LandingPage from "./pages/landing/Landing";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false, staleTime: 5 * 60 * 1000 } },
});

function RefineResourceSwitcher({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const segment = pathname.split("/")[1]; // '', 'admin', 'teacher', 'student', ...
  
  const resources =
    segment === "admin" ? adminResources :
    segment === "teacher" ? teacherResources :
    segment === "student" ? studentResources :
    []; // public/landing/auth — bez menu

  return (
    <Refine
      dataProvider={dataProvider(supabaseClient)}
      authProvider={authProvider}
      routerProvider={routerProvider}
      resources={resources}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: false,
        useNewQueryKeys: true,
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RefineResourceSwitcher>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* AUTH */}
            {LoginModule}
            {RegisterModule}
            {ForgotPasswordModule}
            {UpdatePasswordModule}

            {/* APP (ROUTES per rola) */}
            {AdminModule}
            {TeacherModule}
            {StudentModule}

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RefineResourceSwitcher>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;