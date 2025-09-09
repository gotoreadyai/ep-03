// ============================================
// src/utility/auth/services/sessionService.ts
// WSPÓLNY SERWIS DLA SESJI
// ============================================

import { supabaseClient } from '@/utility';
import { userCache } from './userCache';

export const sessionService = {
  logout: async () => {
    try {
      userCache.clear();
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        return { 
          success: false, 
          error: {
            message: 'Błąd podczas wylogowania',
            name: 'LogoutError',
            statusCode: 500
          }
        };
      }
      
      return { 
        success: true, 
        redirectTo: "/login"
      };
    } catch (error) {
      return { 
        success: false, 
        error: {
          message: 'Nieoczekiwany błąd podczas wylogowania',
          name: 'LogoutError',
          statusCode: 500
        }
      };
    }
  },

  check: async () => {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        return { 
          authenticated: false,
          redirectTo: "/login"
        };
      }

      const expiresAt = session.expires_at;
      if (expiresAt && expiresAt * 1000 < Date.now()) {
        return {
          authenticated: false,
          redirectTo: "/login"
        };
      }

      return { authenticated: true };
    } catch (error) {
      return { 
        authenticated: false,
        redirectTo: "/login"
      };
    }
  },

  handleError: async (error: any) => {
    console.error("Auth error:", error);
    
    if (error?.statusCode === 401) {
      userCache.clear();
      return {
        redirectTo: "/login",
        logout: true,
        error
      };
    }

    return { error };
  }
};