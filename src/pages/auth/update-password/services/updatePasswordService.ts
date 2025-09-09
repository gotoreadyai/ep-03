// ============================================
// src/pages/auth/update-password/services/updatePasswordService.ts
// KOMPLETNY SERWIS Z WŁASNĄ OBSŁUGĄ BŁĘDÓW
// ============================================

import { supabaseClient } from '@/utility';

const UPDATE_PASSWORD_ERRORS: Record<string, string> = {
  'New password should be different': 'Nowe hasło musi być inne niż obecne',
  'Password should be at least': 'Hasło musi mieć co najmniej 6 znaków',
  'Invalid token': 'Link wygasł lub jest nieprawidłowy',
  'session_not_found': 'Sesja wygasła. Spróbuj ponownie',
};

const parseUpdatePasswordError = (error: any) => {
  if (!error) {
    return {
      message: 'Nieznany błąd',
      name: 'UnknownError',
      statusCode: 500
    };
  }
  
  const errorMessage = error.message || '';
  
  for (const [key, value] of Object.entries(UPDATE_PASSWORD_ERRORS)) {
    if (errorMessage.includes(key)) {
      return {
        message: value,
        name: 'UpdatePasswordError',
        statusCode: key.includes('token') || key.includes('session') ? 401 : 400
      };
    }
  }
  
  return {
    message: errorMessage || 'Błąd aktualizacji hasła',
    name: 'UpdatePasswordError',
    statusCode: 400
  };
};

export const updatePasswordService = {
  checkSession: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");

      if (!data.session && type !== "recovery") {
        return {
          isValid: false,
          error: "Link wygasł lub jest nieprawidłowy"
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: "Błąd weryfikacji sesji"
      };
    }
  },

  updatePassword: async (password: string) => {
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: password,
      });

      if (error) {
        const parsed = parseUpdatePasswordError(error);
        return {
          success: false,
          error: parsed.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Błąd aktualizacji hasła'
      };
    }
  },

  updatePasswordForRefine: async (password: string) => {
    const result = await updatePasswordService.updatePassword(password);
    
    if (!result.success) {
      return {
        success: false,
        error: parseUpdatePasswordError({ message: result.error })
      };
    }
    
    return {
      success: true,
      redirectTo: "/login?passwordChanged=true"
    };
  }
};