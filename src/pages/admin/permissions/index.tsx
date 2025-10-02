// src/pages/admin/permissions/index.tsx
import { Route, Navigate } from "react-router-dom";
import { ShieldCheck, Users, UsersRound, BookOpen, GraduationCap } from "lucide-react";
import { UsersManagement } from "./users";
import { GroupsManagement } from "./groups";
import { TeacherCoursesManagement } from "./teacher-courses";
import { GroupCoursesManagement } from "./group-courses";

// Główny zasób
export const permissionsResource = {
  name: "permissions",
  list: "/admin/permissions",
  meta: {
    label: "Uprawnienia",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

// 1. Użytkownicy - zarządzanie rolami
export const usersResource = {
  name: "permissions-users",
  list: "/admin/permissions/users",
  meta: {
    label: "Użytkownicy",
    icon: <Users className="h-4 w-4" />,
    parent: "permissions",
  },
};

// 2. Grupy - tworzenie klas i przypisywanie uczniów
export const groupsResource = {
  name: "permissions-groups",
  list: "/admin/permissions/groups",
  meta: {
    label: "Grupy i uczniowie",
    icon: <UsersRound className="h-4 w-4" />,
    parent: "permissions",
  },
};

// 3. Kursy nauczycieli - przypisywanie kursów do nauczycieli
export const teacherCoursesResource = {
  name: "permissions-teacher-courses",
  list: "/admin/permissions/teacher-courses",
  meta: {
    label: "Kursy nauczycieli",
    icon: <BookOpen className="h-4 w-4" />,
    parent: "permissions",
  },
};

// 4. Kursy grup - przypisywanie kursów do grup
export const groupCoursesResource = {
  name: "permissions-group-courses",
  list: "/admin/permissions/group-courses",
  meta: {
    label: "Kursy dla grup",
    icon: <GraduationCap className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Routing
export const permissionsRoutes = [
  <Route 
    key="permissions-default" 
    path="permissions" 
    element={<Navigate to="/admin/permissions/users" replace />} 
  />,
  
  <Route 
    key="permissions-users" 
    path="permissions/users" 
    element={<UsersManagement />} 
  />,
  
  <Route 
    key="permissions-groups" 
    path="permissions/groups" 
    element={<GroupsManagement />} 
  />,
  
  <Route 
    key="permissions-teacher-courses" 
    path="permissions/teacher-courses" 
    element={<TeacherCoursesManagement />} 
  />,
  
  <Route 
    key="permissions-group-courses" 
    path="permissions/group-courses" 
    element={<GroupCoursesManagement />} 
  />,
];

// Eksportuj zasoby
export const permissionsResources = [
  permissionsResource,
  usersResource,
  groupsResource,
  teacherCoursesResource,
  groupCoursesResource,
];