// path: src/pages/teacher/activities/index.tsx
/**
 * TEACHER > ACTIVITIES
 * - Nie masz listy? 'list' kieruje na create, ale BEZWZGLĘDNIE ("/teacher/...").
 * - Gdy dodasz ActivitiesList, wystarczy podmienić 'list' na "/teacher/activities"
 *   i dodać Route jak w topics/courses.
 */
import { Route } from "react-router-dom";
import { ActivitiesCreate } from "./create";
import { ActivitiesEdit } from "./edit";
import { ActivitiesShow } from "./show";

export { ActivitiesCreate } from "./create";
export { ActivitiesEdit } from "./edit";
export { ActivitiesShow } from "./show";

export const activitiesResource = {
  name: "activities",
  list: "/teacher/activities/create",
  create: "/teacher/activities/create",
  edit: "/teacher/activities/edit/:id",
  show: "/teacher/activities/show/:id",
  meta: {
    hide: true, // Ukrywa pozycję w menu
  },
};

export const activitiesRoutes = [
  <Route key="activities-create" path="activities/create" element={<ActivitiesCreate />} />,
  <Route key="activities-edit" path="activities/edit/:id" element={<ActivitiesEdit />} />,
  <Route key="activities-show" path="activities/show/:id" element={<ActivitiesShow />} />,
];
