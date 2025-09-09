// ============================================
// src/pages/auth/login/components/LoginLayout.tsx
// ============================================

import React from "react";
import { NarrowCol } from "@/components/layout/NarrowCol";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <NarrowCol>
      {children}
    </NarrowCol>
  );
};