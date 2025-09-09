// src/pages/admin/permissions/users/index.tsx
import { Route } from "react-router-dom";
import { Users } from "lucide-react";
import { UsersList } from "./list";
import { UsersCreate } from "./create";
import { UsersEdit } from "./edit";
import { UsersShow } from "./show";

export { UsersList } from "./list";
export { UsersCreate } from "./create";
export { UsersEdit } from "./edit";
export { UsersShow } from "./show";

export const usersResource = {
  name: "permissions-users",
  list: "/admin/permissions/users",
  create: "/admin/permissions/users/create",
  edit: "/admin/permissions/users/edit/:id",
  show: "/admin/permissions/users/show/:id",
  meta: {
    label: "Użytkownicy",
    icon: <Users className="h-4 w-4" />,
    parent: "permissions",
  },
};

export const usersRoutes = [
  <Route key="users-list" path="users" element={<UsersList />} />,
  <Route key="users-create" path="users/create" element={<UsersCreate />} />,
  <Route key="users-edit" path="users/edit/:id" element={<UsersEdit />} />,
  <Route key="users-show" path="users/show/:id" element={<UsersShow />} />,
];