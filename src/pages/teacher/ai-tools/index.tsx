import { Route } from "react-router";
import { AiToolsDashboard } from "./AiToolsDashboard";

// Eksport komponentu
export { AiToolsDashboard } from "./AiToolsDashboard";

// Eksport routes
export const aiToolsRoutes = [
  <Route key="ai-tools" path="ai-tools" element={<AiToolsDashboard />} />,
];