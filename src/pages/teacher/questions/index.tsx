import { Route } from "react-router";
import { QuestionsManage } from "./manage";
import { QuestionsCreate } from "./create";

export { QuestionsManage } from "./manage";
export { QuestionsCreate } from "./create";

export const questionsRoutes = [
  <Route key="questions-manage" path="/questions/manage/:activityId" element={<QuestionsManage />} />,
  <Route key="questions-create" path="/questions/create" element={<QuestionsCreate />} />,
];