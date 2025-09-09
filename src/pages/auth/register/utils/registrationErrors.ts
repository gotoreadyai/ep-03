// ============================================
// src/pages/auth/register/utils/registrationErrors.ts
// ============================================

const REGISTRATION_ERROR_MESSAGES: Record<string, string> = {
    'User already registered': 'Konto z tym adresem email już istnieje',
    'already exists': 'Konto z tym adresem email już istnieje',
    'Password should be at least': 'Hasło musi mieć co najmniej 6 znaków',
    'Password cannot be longer than 72': 'Hasło nie może być dłuższe niż 72 znaki',
    'Invalid email': 'Nieprawidłowy format adresu email',
    'over_email_send_rate_limit': 'Za szybko! Poczekaj 2 sekundy przed ponowną próbą',
    'Network request failed': 'Błąd połączenia z serwerem',
  };
  
  export const parseRegistrationError = (error: any): string => {
    if (!error) return 'Nieznany błąd rejestracji';
    
    const errorMessage = error?.message || error?.error_description || '';
    
    // Sprawdź znane komunikaty błędów
    for (const [key, value] of Object.entries(REGISTRATION_ERROR_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    
    // Zwróć oryginalny komunikat jeśli nie znaleziono
    return errorMessage || 'Rejestracja nie powiodła się';
  };
  