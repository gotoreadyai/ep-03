// ============================================
// src/pages/auth/update-password/utils/updatePasswordValidation.ts
// ============================================

export const validateUpdatePassword = (
    password: string, 
    confirmPassword: string
  ): string | null => {
    if (!password) {
      return "Hasło jest wymagane";
    }
  
    if (password.length < 6) {
      return "Hasło musi mieć co najmniej 6 znaków";
    }
  
    if (password.length > 72) {
      return "Hasło nie może być dłuższe niż 72 znaki";
    }
  
    if (password !== confirmPassword) {
      return "Hasła nie są identyczne";
    }
  
    return null;
  };
  
  export const getPasswordRequirements = () => [
    { text: "Minimum 6 znaków", check: (pwd: string) => pwd.length >= 6 },
    { text: "Maksimum 72 znaki", check: (pwd: string) => pwd.length <= 72 },
    { text: "Zawiera małą literę", check: (pwd: string) => /[a-z]/.test(pwd) },
    { text: "Zawiera dużą literę", check: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: "Zawiera cyfrę", check: (pwd: string) => /[0-9]/.test(pwd) },
    { text: "Zawiera znak specjalny", check: (pwd: string) => /[^a-zA-Z0-9]/.test(pwd) },
  ];