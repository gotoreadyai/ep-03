// src/pages/student/hooks/useStudentStats.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { supabaseClient } from "@/utility";
import { useGetIdentity } from "@refinedev/core";

// Globalny stan i event emitter
class StatsManager {
  private stats = {
    points: 0,
    level: 1,
    streak: 0,
    idle_rate: 1,
    next_level_points: 200,
    quizzes_completed: 0,
    perfect_scores: 0,
    total_time: 0,
    rank: 0
  };
  
  private listeners = new Set<(stats: any) => void>();
  private channel: any = null;
  private userId: string | null = null;
  
  subscribe(listener: (stats: any) => void) {
    this.listeners.add(listener);
    // Natychmiast wyślij obecne statystyki
    listener(this.stats);
    
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  private notify() {
    this.listeners.forEach(listener => listener(this.stats));
  }
  
  async fetchStats(userId: string) {
    if (!userId) return;
    
    try {
      const { data, error } = await supabaseClient.rpc('get_my_stats');
      
      if (error) throw error;
      
      if (data) {
        console.log('Fetched stats from DB:', data);
        this.stats = {
          points: data.points || 0,
          level: data.level || 1,
          streak: data.streak || 0,
          idle_rate: data.idle_rate || 1,
          next_level_points: data.next_level_points || 200,
          quizzes_completed: data.quizzes_completed || 0,
          perfect_scores: data.perfect_scores || 0,
          total_time: data.total_time || 0,
          rank: data.rank || 0
        };
        this.notify();
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }
  
  setupSubscription(userId: string) {
    // Jeśli to ten sam user i mamy już kanał, nic nie rób
    if (this.userId === userId && this.channel) return;
    
    // Jeśli to inny user, zamknij stary kanał
    if (this.channel && this.userId !== userId) {
      console.log('Closing old subscription for user:', this.userId);
      supabaseClient.removeChannel(this.channel);
      this.channel = null;
    }
    
    this.userId = userId;
    
    console.log('Setting up global stats subscription for user:', userId);
    
    this.channel = supabaseClient
      .channel(`global-user-stats-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_stats',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('user_stats change received:', payload);
          this.fetchStats(userId);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gamification_log',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('gamification_log INSERT received:', payload);
          setTimeout(() => this.fetchStats(userId), 300);
        }
      )
      .subscribe((status) => {
        console.log('Global subscription status:', status);
      });
    
    // Pobierz początkowe dane
    this.fetchStats(userId);
  }
  
  cleanup() {
    if (this.channel) {
      console.log('Cleaning up global subscription');
      supabaseClient.removeChannel(this.channel);
      this.channel = null;
      this.userId = null;
    }
  }
}

// Pojedyncza globalna instancja
const statsManager = new StatsManager();

export const useStudentStats = () => {
  const { data: identity } = useGetIdentity<any>();
  const [stats, setStats] = useState({
    points: 0,
    level: 1,
    streak: 0,
    idle_rate: 1,
    next_level_points: 200,
    quizzes_completed: 0,
    perfect_scores: 0,
    total_time: 0,
    rank: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!identity?.id) return;
    
    // Ustaw globalną subskrypcję
    statsManager.setupSubscription(identity.id);
    
    // Subskrybuj zmiany
    const unsubscribe = statsManager.subscribe((newStats) => {
      setStats(newStats);
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, [identity?.id]);
  
  const refetch = useCallback(async () => {
    if (identity?.id) {
      setIsLoading(true);
      await statsManager.fetchStats(identity.id);
      setIsLoading(false);
    }
  }, [identity?.id]);
  
  return { stats, isLoading, refetch };
};