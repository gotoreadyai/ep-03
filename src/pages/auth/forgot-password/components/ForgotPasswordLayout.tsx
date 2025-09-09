// ============================================
// src/pages/auth/forgot-password/components/ForgotPasswordLayout.tsx
// ============================================

import React from 'react';
import { NarrowCol } from '@/components/layout/NarrowCol';

interface ForgotPasswordLayoutProps {
  children: React.ReactNode;
}

export const ForgotPasswordLayout: React.FC<ForgotPasswordLayoutProps> = ({ children }) => {
  return (
    <NarrowCol>
      {children}
    </NarrowCol>
  );
};