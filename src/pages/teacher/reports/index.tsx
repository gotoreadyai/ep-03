// path: src/pages/teacher/reports/index.tsx
import { Route, Navigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { ReportsOverview } from "./overview";
import { EngagementReport } from "./engagement";
import { ProgressReport } from "./progress";

import { GamificationReport } from "./gamification";
import { ReportUsersSummary } from "./users-summary";
import { PerformanceReport } from "./performance";

/** RODZIC do menu (klik -> overview) */
export const reportsResource = {
  name: "reports",
  list: "/teacher/reports/overview",
  meta: {
    label: "Raporty",
    icon: <BarChart3 className="h-4 w-4" />,
  },
};

/** DZIECI do menu (pod „Raporty") */
export const reportsEngagementResource = {
  name: "reports-engagement",
  list: "/teacher/reports/engagement",
  meta: { label: "Zaangażowanie" },
};

export const reportsProgressResource = {
  name: "reports-progress",
  list: "/teacher/reports/progress",  
  meta: { label: "Postępy" },
};

export const reportsPerformanceResource = {
  name: "reports-performance",
  list: "/teacher/reports/performance",
  meta: { label: "Wyniki" },
};

export const reportsGamificationResource = {
  name: "reports-gamification",
  list: "/teacher/reports/gamification",
  meta: { label: "Gamifikacja" },
};

export const reportsSummaryResource = {
  name: "reports-summary",
  list: "/teacher/reports/summary",
  meta: { label: "Użytkownicy" },
};

/** Trasy WZGLĘDNE w module /teacher/* */
export const reportsRoutes = [
  // alias /teacher/reports -> /teacher/reports/overview
  <Route key="reports-root-redirect" path="reports" element={<Navigate to="overview" replace />} />,
  <Route key="reports-overview" path="reports/overview" element={<ReportsOverview />} />,
  <Route key="reports-engagement" path="reports/engagement" element={<EngagementReport />} />,
  <Route key="reports-progress" path="reports/progress" element={<ProgressReport />} />,
  <Route key="reports-performance" path="reports/performance" element={<PerformanceReport />} />,
  <Route key="reports-gamification" path="reports/gamification" element={<GamificationReport />} />,
  <Route key="reports-summary" path="reports/summary" element={<ReportUsersSummary />} />,
];