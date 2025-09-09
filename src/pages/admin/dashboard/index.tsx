import { Route } from "react-router-dom";

const DashboardOverview = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p>Welcome to admin panel</p>
  </div>
);

export const dashboardRoutes = [
  <Route key="dashboard-overview" path="dashboard/overview" element={<DashboardOverview />} />,
];