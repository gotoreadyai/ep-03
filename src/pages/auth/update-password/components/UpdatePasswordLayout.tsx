// ============================================
// src/pages/auth/update-password/components/UpdatePasswordLayout.tsx
// ============================================

import React from "react";
import { NarrowCol } from "@/components/layout/NarrowCol";

interface UpdatePasswordLayoutProps {
  children: React.ReactNode;
}

export const UpdatePasswordLayout: React.FC<UpdatePasswordLayoutProps> = ({ children }) => {
  return (
    <NarrowCol>
      {children}
    </NarrowCol>
  );
};