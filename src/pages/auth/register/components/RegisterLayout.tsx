// ============================================
// src/pages/auth/register/components/RegisterLayout.tsx
// ============================================

import React from "react";
import { NarrowCol } from "@/components/layout/NarrowCol";

interface RegisterLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
}

export const RegisterLayout: React.FC<RegisterLayoutProps> = ({ children, currentStep }) => {
  return (
    <NarrowCol>
      {currentStep && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      {children}
    </NarrowCol>
  );
};
