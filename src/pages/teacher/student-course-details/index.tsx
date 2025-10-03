import { Route } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { StudentCourseDetailsShow } from "./show";

export { StudentCourseDetailsShow } from "./show";

export const studentCourseDetailsResource = {
  name: "student-course-details",
  list: "/teacher/groups/:groupId/courses/:courseId/students/:studentId",
  meta: {
    label: "Szczegóły ucznia",
    icon: <UserCircle className="h-4 w-4" />,
    hide: true,
  },
};

export const studentCourseDetailsRoutes = [
  <Route
    key="student-course-details"
    path="groups/:groupId/courses/:courseId/students/:studentId"
    element={<StudentCourseDetailsShow />}
  />,
];