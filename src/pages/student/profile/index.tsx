// src/pages/student/profile/index.tsx
import { Route } from "react-router-dom";
import { ProfileSettings } from "./settings";

export { ProfileSettings } from "./settings";

export const profileRoutes = [
  <Route key="profile" path="/profile" element={<ProfileSettings />} />,
];