// src/pages/student/achievements/index.tsx
import { Route } from "react-router-dom";
import { AchievementsList } from "./list";

export { AchievementsList } from "./list";

export const achievementsRoutes = [
  <Route key="achievements" path="/achievements" element={<AchievementsList />} />,
];