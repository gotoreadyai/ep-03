// src/pages/student/courses/index.tsx
import { Route } from "react-router-dom";
import { CoursesList } from "./list";

export { CoursesList } from "./list";

export const coursesRoutes = [
  <Route key="courses-list" path="/courses" element={<CoursesList />} />,
];