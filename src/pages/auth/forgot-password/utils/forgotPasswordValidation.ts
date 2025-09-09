// ============================================
// src/pages/auth/forgot-password/utils/forgotPasswordValidation.ts
// ============================================

export const validateForgotPasswordEmail = (email: string): string | null => {
    if (!email) {
      return 'Email jest wymagany';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Nieprawidłowy format adresu email';
    }
    
    return null;
  };