// src/pages/student/hooks/useIdlePoints.ts
import { useCallback } from "react";
import { supabaseClient } from "@/utility";
import { toast } from "sonner";

export const useIdlePoints = () => {
  // Odbierz nagrody z backendu
  const claimDailyRewards = useCallback(async () => {
    try {
      const { data, error } = await supabaseClient.rpc('claim_daily_rewards');
      
      if (error) throw error;
      
      // Wyświetl powiadomienie o nagrodach
      if (data) {
        const totalEarned = (data.idle_points || 0) + (data.daily_points || 0);
        
        if (totalEarned > 0) {
          toast.success(`Nagrody zebrane! 🎉`, {
            description: `Otrzymałeś ${totalEarned} punktów`
          });
        }
        
        if (data.streak > 1) {
          toast.success(`Seria ${data.streak} dni! 🔥`, {
            description: "Kontynuuj codzienne logowanie!"
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      toast.error("Nie udało się zebrać nagród");
      throw error;
    }
  }, []);

  // Funkcja do kupowania ulepszeń idle
  const buyIdleUpgrade = useCallback(async (upgradeId: number) => {
    try {
      const { data, error } = await supabaseClient.rpc('buy_idle_upgrade', {
        p_upgrade_id: upgradeId
      });
      
      if (error) throw error;
      
      if (data) {
        toast.success("Ulepszenie kupione! 💎", {
          description: `Nowy poziom: ${data.new_level}, Idle rate: +${data.new_idle_rate}/h`
        });
      }
      
      return data;
    } catch (error: any) {
      console.error("Failed to buy upgrade:", error);
      toast.error(error.message || "Nie udało się kupić ulepszenia");
      throw error;
    }
  }, []);

  return { 
    claimDailyRewards,
    buyIdleUpgrade
  };
};