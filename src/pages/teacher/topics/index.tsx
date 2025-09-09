// path: src/pages/teacher/topics/index.tsx
/**
 * TEACHER > TOPICS
 * - 'list' jako "/teacher/topics" gwarantuje poprawny link w menu.
 */
import { Route } from "react-router-dom";
import { FileText } from "lucide-react";
import { TopicsList } from "./list";
import { TopicsCreate } from "./create";
import { TopicsEdit } from "./edit";

export { TopicsList } from "./list";
export { TopicsCreate } from "./create";
export { TopicsEdit } from "./edit";

export const topicsResource = {
  name: "topics",
  list: "/teacher/topics",
  create: "/teacher/topics/create",
  edit: "/teacher/topics/edit/:id",
  meta: {
    label: "Tematy",
    icon: <FileText className="h-4 w-4" />,
  },
};

export const topicsRoutes = [
  <Route key="topics-list" path="topics" element={<TopicsList />} />,
  <Route key="topics-create" path="topics/create" element={<TopicsCreate />} />,
  <Route key="topics-edit" path="topics/edit/:id" element={<TopicsEdit />} />,
];
