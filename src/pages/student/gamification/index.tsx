// src/pages/student/gamification/index.tsx
import { Route } from "react-router-dom";
import { GamificationUpgrades } from "./upgrades";

export { GamificationUpgrades } from "./upgrades";

export const gamificationRoutes = [
  <Route key="gamification" path="/gamification" element={<GamificationUpgrades />} />,
];