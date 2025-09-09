// ============================================
// src/pages/auth/update-password/types.ts
// ============================================

export interface UpdatePasswordFormData {
    password: string;
    confirmPassword: string;
  }
  
  export interface UpdatePasswordLogic {
    password: string;
    confirmPassword: string;
    setPassword: (password: string) => void;
    setConfirmPassword: (password: string) => void;
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    handleSubmit: (e: React.FormEvent) => void;
  }
  
  export interface SessionValidation {
    isChecking: boolean;
    isValid: boolean;
    error?: string;
  }