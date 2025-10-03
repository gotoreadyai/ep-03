import { Route } from "react-router-dom";
import { Users } from "lucide-react";
import { GroupActivityShow } from "./show";

export { GroupActivityShow } from "./show";

export const groupActivityResource = {
  name: "group-activity",
  list: "/teacher/groups/:groupId/courses/:courseId/activity",
  meta: {
    label: "Aktywność grupy",
    icon: <Users className="h-4 w-4" />,
    hide: true,
  },
};

export const groupActivityRoutes = [
  <Route
    key="group-activity-show"
    path="groups/:groupId/courses/:courseId/activity"
    element={<GroupActivityShow />}
  />,
];