// ============================================
// src/pages/auth/login/utils/loginErrors.ts
// ============================================

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
    'Invalid login credentials': 'Nieprawidłowe dane logowania',
    'Email not confirmed': 'Email nie został potwierdzony',
    'User not found': 'Nie znaleziono użytkownika',
    'Network request failed': 'Błąd połączenia z serwerem',
    'Too many requests': 'Zbyt wiele prób. Spróbuj ponownie za chwilę',
  };
  
  export const parseLoginError = (error: any): string => {
    if (!error) return 'Nieznany błąd logowania';
    
    const errorMessage = error?.message || error?.error_description || '';
    
    // Sprawdź znane komunikaty błędów
    for (const [key, value] of Object.entries(LOGIN_ERROR_MESSAGES)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    
    // Zwróć oryginalny komunikat jeśli nie znaleziono
    return errorMessage || 'Błąd logowania';
  };