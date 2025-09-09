// src/pages/student/course-detail/index.tsx
import { Route } from "react-router-dom";
import { CourseDetailView } from "./view";

export { CourseDetailView } from "./view";

export const courseDetailRoutes = [
  <Route key="course-detail" path="/courses/:courseId" element={<CourseDetailView />} />,
];