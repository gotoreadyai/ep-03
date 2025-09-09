// ============================================
// src/pages/auth/update-password/utils/updatePasswordErrors.ts
// ============================================

const UPDATE_PASSWORD_ERROR_MESSAGES: Record<string, string> = {
    'New password should be different': 'Nowe hasło musi być inne niż obecne',
    'Password should be at least': 'Hasło musi mieć co najmniej 6 znaków',
    'Invalid token': 'Link wygasł lub jest nieprawidłowy',
    'session_not_found': 'Sesja wygasła. Spróbuj ponownie',
    'Network request failed': 'Błąd połączenia z serwerem',
  };
  
  export const parseUpdatePasswordError = (error: any): string => {
    if (!error) return 'Nieznany błąd';
    
    const errorMessage = error?.message || error?.error_description || '';
    
    // Sprawdź znane komunikaty błędów
    for (const [key, value] of Object.entries(UPDATE_PASSWORD_ERROR_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    
    // Zwróć oryginalny komunikat jeśli nie znaleziono
    return errorMessage || 'Błąd aktualizacji hasła';
  };