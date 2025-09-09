// src/pages/admin/permissions/index.tsx
import { Route, Navigate } from "react-router-dom";
import { ShieldCheck, Check, Users, UsersRound } from "lucide-react";
import { SimpleAccessManagement } from "./simple-access";
import { SimpleUsersManagement } from "./simple-users";
import { SimpleGroupsManagement } from "./simple-groups";

// Główny zasób
export const permissionsResource = {
  name: "permissions",
  list: "/admin/permissions",
  meta: {
    label: "Zarządzanie dostępem",
    icon: <ShieldCheck className="h-4 w-4" />,
  },
};

// Zarządzanie użytkownikami
export const simpleUsersResource = {
  name: "permissions-users",
  list: "/admin/permissions/users",
  meta: {
    label: "Użytkownicy",
    icon: <Users className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Zarządzanie grupami
export const simpleGroupsResource = {
  name: "permissions-groups",
  list: "/admin/permissions/groups",
  meta: {
    label: "Grupy i klasy",
    icon: <UsersRound className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Prosty dostęp do kursów
export const simpleAccessResource = {
  name: "permissions-access",
  list: "/admin/permissions/access",
  meta: {
    label: "Dostęp do kursów",
    icon: <Check className="h-4 w-4" />,
    parent: "permissions",
  },
};

// Routing
export const permissionsRoutes = [
  // Default route - przekierowanie na użytkowników
  <Route 
    key="permissions-default" 
    path="permissions" 
    element={<Navigate to="/admin/permissions/users" replace />} 
  />,
  
  // Route dla użytkowników
  <Route 
    key="permissions-users" 
    path="permissions/users" 
    element={<SimpleUsersManagement />} 
  />,
  
  // Route dla grup
  <Route 
    key="permissions-groups" 
    path="permissions/groups" 
    element={<SimpleGroupsManagement />} 
  />,
  
  // Route dla dostępu do kursów
  <Route 
    key="permissions-access" 
    path="permissions/access" 
    element={<SimpleAccessManagement />} 
  />,
];

// Eksportuj zasoby do App.tsx
export const permissionsResources = [
  permissionsResource,
  simpleUsersResource,
  simpleGroupsResource,
  simpleAccessResource,
];