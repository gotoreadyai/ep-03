// src/pages/student/leaderboard/index.tsx
import { Route } from "react-router-dom";
import { LeaderboardRanking } from "./ranking";

export { LeaderboardRanking } from "./ranking";

export const leaderboardRoutes = [
  <Route key="leaderboard" path="/leaderboard" element={<LeaderboardRanking />} />,
];