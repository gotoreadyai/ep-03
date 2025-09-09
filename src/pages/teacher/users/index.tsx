// src/pages/teacher/users/index.tsx
import { Route } from "react-router";
import { Users } from "lucide-react";
import { UsersList } from "./list";
import { UsersShow } from "./show";

export { UsersList } from "./list";
export { UsersShow } from "./show";

/**
 * Ścieżki *absolutne* do menu (Refine -> useMenu), MUSZĄ mieć prefiks /teacher
 */
export const usersResource = {
  name: "users",
  list: "/teacher/users",
  show: "/teacher/users/show/:id",
  meta: {
    label: "Uczniowie",
    icon: <Users className="h-4 w-4" />,
  },
};

/**
 * Ścieżki *względne* do routingu wewnątrz modułu /teacher/*
 */
export const usersRoutes = [
  <Route key="users-list" path="users" element={<UsersList />} />,
  <Route key="users-show" path="users/show/:id" element={<UsersShow />} />,
];