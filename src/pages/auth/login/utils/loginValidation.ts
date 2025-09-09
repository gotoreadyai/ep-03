// ============================================
// src/pages/auth/login/utils/loginValidation.ts
// ============================================

export const validateEmail = (email: string): string | null => {
    if (!email) return 'Email jest wymagany';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Nieprawidłowy format email';
    }
    
    return null;
  };
  
  export const validatePassword = (password: string): string | null => {
    if (!password) return 'Hasło jest wymagane';
    if (password.length < 6) return 'Hasło musi mieć minimum 6 znaków';
    if (password.length > 72) return 'Hasło może mieć maksimum 72 znaki';
    
    return null;
  };