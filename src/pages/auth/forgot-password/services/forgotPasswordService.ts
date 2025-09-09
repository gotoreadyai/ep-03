// ============================================
// src/pages/auth/forgot-password/services/forgotPasswordService.ts
// KOMPLETNY SERWIS Z WŁASNĄ OBSŁUGĄ BŁĘDÓW
// ============================================

import { supabaseClient } from '@/utility';

const FORGOT_PASSWORD_ERRORS: Record<string, string> = {
  'User not found': 'Nie znaleziono użytkownika z tym adresem email',
  'Invalid email': 'Nieprawidłowy format adresu email',
  'over_email_send_rate_limit': 'Za szybko! Poczekaj chwilę przed kolejną próbą',
  'reset_password_rate_limit': 'Zbyt wiele prób. Spróbuj ponownie za kilka minut',
};

const parseForgotPasswordError = (error: any) => {
  if (!error) {
    return {
      message: 'Nieznany błąd',
      name: 'UnknownError',
      statusCode: 500
    };
  }
  
  const errorMessage = error.message || '';
  
  for (const [key, value] of Object.entries(FORGOT_PASSWORD_ERRORS)) {
    if (errorMessage.includes(key)) {
      return {
        message: value,
        name: 'ForgotPasswordError',
        statusCode: key.includes('rate_limit') ? 429 : 400
      };
    }
  }
  
  return {
    message: errorMessage || 'Błąd podczas wysyłania emaila',
    name: 'ForgotPasswordError',
    statusCode: 400
  };
};

export const forgotPasswordService = {
  sendResetEmail: async (email: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        const parsed = parseForgotPasswordError(error);
        return {
          success: false,
          error: parsed.message
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Błąd podczas wysyłania emaila'
      };
    }
  },

  sendResetEmailForRefine: async (email: string) => {
    const result = await forgotPasswordService.sendResetEmail(email);
    
    if (!result.success) {
      return {
        success: false,
        error: parseForgotPasswordError({ message: result.error })
      };
    }
    
    return {
      success: true,
      successNotification: {
        message: "Email wysłany!",
        description: "Sprawdź swoją skrzynkę odbiorczą"
      }
    };
  }
};
