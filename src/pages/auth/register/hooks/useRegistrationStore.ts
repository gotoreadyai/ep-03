// ============================================
// src/pages/auth/register/hooks/useRegistrationStore.ts
// ============================================

import React from "react";
import type { RegistrationData, RegistrationStore } from "../types";

export const useRegistrationStore = (): RegistrationStore => {
  const [data, setDataState] = React.useState<RegistrationData>({});
  const [currentStep, setCurrentStep] = React.useState(1);

  return {
    data,
    currentStep,
    setData: (newData) => setDataState(prev => ({ ...prev, ...newData })),
    nextStep: () => setCurrentStep(prev => Math.min(prev + 1, 4)),
    prevStep: () => setCurrentStep(prev => Math.max(prev - 1, 1)),
    reset: () => {
      setDataState({});
      setCurrentStep(1);
    }
  };
};
