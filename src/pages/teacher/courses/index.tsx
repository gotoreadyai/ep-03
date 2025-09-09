// path: src/pages/teacher/courses/index.tsx
/**
 * TEACHER > COURSES
 * - 'list' jest BEZWZGLĘDNE ("/teacher/courses") → menu linkuje poprawnie.
 * - Ścieżki Route pozostają relatywne (dziedziczą bazę /teacher/*).
 */
import { Route } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { CoursesList } from "./list";
import { CoursesCreate } from "./create";
import { CoursesEdit } from "./edit";
import { CoursesShow } from "./show";

export { CoursesList } from "./list";
export { CoursesCreate } from "./create";
export { CoursesEdit } from "./edit";
export { CoursesShow } from "./show";

export const coursesResource = {
  name: "courses",
  list: "/teacher/courses",
  create: "/teacher/courses/create",
  edit: "/teacher/courses/edit/:id",
  show: "/teacher/courses/show/:id",
  meta: {
    label: "Kursy",
    icon: <BookOpen className="h-4 w-4" />,
  },
};

export const coursesRoutes = [
  <Route key="courses-list" path="courses" element={<CoursesList />} />,
  <Route key="courses-create" path="courses/create" element={<CoursesCreate />} />,
  <Route key="courses-edit" path="courses/edit/:id" element={<CoursesEdit />} />,
  <Route key="courses-show" path="courses/show/:id" element={<CoursesShow />} />,
];
