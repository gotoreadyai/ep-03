// ============================================
// src/pages/auth/register/utils/registrationValidation.ts
// ============================================

export const validateEmail = (email: string): string | null => {
    if (!email) return "Email jest wymagany";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Nieprawidłowy format email";
    }
    
    return null;
  };
  
  export const validateName = (name: string): string | null => {
    if (!name) return "Imię i nazwisko są wymagane";
    if (name.trim().length < 3) return "Imię i nazwisko muszą mieć co najmniej 3 znaki";
    if (!name.includes(" ")) return "Podaj zarówno imię jak i nazwisko";
    
    return null;
  };
  
  export const validatePassword = (password: string): string | null => {
    if (!password) return "Hasło jest wymagane";
    if (password.length < 6) return "Hasło musi mieć co najmniej 6 znaków";
    if (password.length > 72) return "Hasło nie może być dłuższe niż 72 znaki";
    
    return null;
  };
  
  export const getPasswordStrength = (password: string): { 
    score: number; 
    label: string; 
    color: string 
  } => {
    if (!password) return { score: 0, label: "Brak hasła", color: "gray" };
    
    let score = 0;
    
    // Długość
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (password.length >= 14) score++;
    
    // Złożoność
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: "Słabe", color: "red" };
    if (score <= 4) return { score, label: "Średnie", color: "yellow" };
    if (score <= 6) return { score, label: "Dobre", color: "green" };
    return { score, label: "Bardzo dobre", color: "green" };
  };