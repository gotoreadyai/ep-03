// ============================================
// src/pages/auth/register/services/registerService.ts
// KOMPLETNY SERWIS REGISTER Z WŁASNĄ OBSŁUGĄ BŁĘDÓW
// ============================================

import { supabaseClient } from '@/utility';

const REGISTER_ERRORS: Record<string, string> = {
  'user_already_exists': 'Konto z tym adresem email już istnieje',
  'User already registered': 'Konto z tym adresem email już istnieje',
  'already exists': 'Konto z tym adresem email już istnieje',
  'weak_password': 'Hasło musi mieć co najmniej 6 znaków',
  'Password should be at least': 'Hasło musi mieć co najmniej 6 znaków',
  'Password cannot be longer than 72': 'Hasło nie może być dłuższe niż 72 znaki',
  'invalid_email': 'Nieprawidłowy format adresu email',
  'Invalid email': 'Nieprawidłowy format adresu email',
  'over_email_send_rate_limit': 'Za szybko! Poczekaj 2 sekundy przed ponowną próbą',
};

const parseRegisterError = (error: any) => {
  if (!error) {
    return {
      message: 'Nieznany błąd',
      name: 'UnknownError',
      statusCode: 500
    };
  }
  
  const errorMessage = error.message || '';
  
  for (const [key, value] of Object.entries(REGISTER_ERRORS)) {
    if (errorMessage.includes(key)) {
      let statusCode = 400;
      if (key.includes('already')) statusCode = 409;
      if (key.includes('email_send_rate')) statusCode = 429;
      
      return {
        message: value,
        name: 'RegisterError',
        statusCode
      };
    }
  }
  
  return {
    message: errorMessage || 'Rejestracja nie powiodła się',
    name: 'RegisterError',
    statusCode: 400
  };
};

export const registerService = {
  // Wersja dla komponentów
  register: async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: 'student'
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      if (error) {
        const parsed = parseRegisterError(error);
        return {
          success: false,
          error: parsed.message
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Rejestracja nie powiodła się'
        };
      }

      return { 
        success: true,
        needsEmailConfirmation: !data.session
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Błąd rejestracji'
      };
    }
  },

  // Wersja dla Refine z notification
  registerForRefine: async (email: string, password: string, name: string) => {
    const result = await registerService.register(email, password, name);
    
    if (!result.success) {
      return {
        success: false,
        error: parseRegisterError({ message: result.error })
      };
    }
    
    return {
      success: true,
      successNotification: result.needsEmailConfirmation ? {
        message: "Rejestracja udana!",
        description: "Sprawdź email aby potwierdzić konto."
      } : {
        message: "Rejestracja udana!",
        description: "Możesz się teraz zalogować."
      }
    };
  }
};