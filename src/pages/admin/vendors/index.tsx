// src/pages/admin/vendors/index.tsx
import { Route } from "react-router";
import { Building } from "lucide-react";
import { VendorsList } from "./list";

export { VendorsList } from "./list";

/**
 * Do menu (useMenu) – ścieżka absolutna z prefiksem /admin
 */
export const vendorsResource = {
  name: "vendors",
  list: "/admin/vendors",
  meta: {
    label: "Organizacje",
    icon: <Building className="h-4 w-4" />,
  },
};

/**
 * Do routingu wewnętrznego modułu /admin/*
 */
export const vendorsRoutes = [
  <Route key="vendors-list" path="vendors" element={<VendorsList />} />,
];