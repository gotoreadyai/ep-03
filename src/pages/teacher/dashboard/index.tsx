import { Route } from "react-router";
import { LayoutDashboard } from "lucide-react";
import { DashboardOverview } from "./overview";

export { DashboardOverview } from "./overview";

export const dashboardResource = {
  name: "dashboard",
  list: "/dashboard/overview",
  meta: {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
};

export const dashboardRoutes = [
  <Route key="dashboard" path="/dashboard/overview" element={<DashboardOverview />} />,
];