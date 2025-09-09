// ============================================
// src/pages/auth/forgot-password/types.ts
// ============================================

export interface ForgotPasswordFormData {
    email: string;
  }
  
  export interface ForgotPasswordLogic {
    email: string;
    setEmail: (email: string) => void;
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    handleSubmit: (e: React.FormEvent) => void;
  }
  