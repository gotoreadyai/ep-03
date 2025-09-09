// ============================================
// src/pages/auth/forgot-password/utils/forgotPasswordErrors.ts
// ============================================

const FORGOT_PASSWORD_ERROR_MESSAGES: Record<string, string> = {
    'User not found': 'Nie znaleziono użytkownika z tym adresem email',
    'Invalid email': 'Nieprawidłowy format adresu email',
    'over_email_send_rate_limit': 'Za szybko! Poczekaj chwilę przed kolejną próbą',
    'reset_password_rate_limit': 'Zbyt wiele prób. Spróbuj ponownie za kilka minut',
    'Network request failed': 'Błąd połączenia z serwerem',
  };
  
  export const parseForgotPasswordError = (error: any): string => {
    if (!error) return 'Nieznany błąd';
    
    const errorMessage = error?.message || error?.error_description || '';
    
    // Sprawdź znane komunikaty błędów
    for (const [key, value] of Object.entries(FORGOT_PASSWORD_ERROR_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    
    // Zwróć oryginalny komunikat jeśli nie znaleziono
    return errorMessage || 'Błąd podczas wysyłania emaila';
  };