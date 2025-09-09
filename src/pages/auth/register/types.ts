// ============================================
// src/pages/auth/register/types.ts
// ============================================

export interface RegistrationData {
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
    registrationComplete?: boolean;
  }
  
  export interface RegistrationStore {
    data: RegistrationData;
    currentStep: number;
    setData: (data: Partial<RegistrationData>) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
  }
  
  export interface RegistrationLogic {
    isSubmitting: boolean;
    error: string | null;
    submitStep1: (data: { email: string; name: string }) => Promise<boolean>;
    submitStep2: (data: { password: string; confirmPassword: string }) => Promise<boolean>;
    submitRegistration: () => Promise<boolean>;
  }