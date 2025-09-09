// src/pages/student/lessons/index.tsx
import { Route } from "react-router-dom";
import { LessonView } from "./view";

export { LessonView } from "./view";

export const lessonsRoutes = [
  <Route key="lesson-view" path="/courses/:courseId/lesson/:lessonId" element={<LessonView />} />,
];