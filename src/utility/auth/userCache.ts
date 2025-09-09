// ============================================
// src/utility/auth/services/userCache.ts
// USER CACHE - WSPÓLNY SERWIS
// ============================================

import { supabaseClient } from '@/utility';
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  full_name: string;
  vendor_id: number;
  role: 'student' | 'teacher' | 'admin';
  is_active?: boolean;
  created_at?: string;
}

class UserCache {
  private cache: User | null = null;
  private lastFetch = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minut
  private fetchPromise: Promise<User | null> | null = null;

  async get(forceFetch = false): Promise<User | null> {
    const now = Date.now();
    
    // Jeśli mamy cache i nie minął czas
    if (!forceFetch && this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    // Jeśli już trwa pobieranie, czekaj na nie
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Rozpocznij nowe pobieranie
    this.fetchPromise = this.fetchUser();
    const user = await this.fetchPromise;
    this.fetchPromise = null;
    
    return user;
  }

  private async fetchUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session?.user) {
        this.clear();
        return null;
      }

      // Pobierz dane użytkownika z tabeli users
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error("Error fetching user data:", error);
        // Fallback do danych z sesji
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          vendor_id: 1,
          role: 'student'
        };
        this.set(fallbackUser);
        return fallbackUser;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        vendor_id: userData.vendor_id,
        role: userData.role,
        is_active: userData.is_active,
        created_at: userData.created_at
      };

      this.set(user);
      return user;
    } catch (error) {
      console.error("Error in fetchUser:", error);
      this.clear();
      return null;
    }
  }

  set(user: User): void {
    this.cache = user;
    this.lastFetch = Date.now();
  }

  clear(): void {
    this.cache = null;
    this.lastFetch = 0;
    this.fetchPromise = null;
  }

  // Metoda pomocnicza do odświeżania cache
  async refresh(): Promise<User | null> {
    return this.get(true);
  }
}

// Instancja cache
export const userCache = new UserCache();

// Listener dla zmian sesji
supabaseClient.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
  if (event === 'SIGNED_OUT' || !session) {
    userCache.clear();
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Wymuś odświeżenie cache po zalogowaniu lub odświeżeniu tokena
    userCache.get(true);
  }
});