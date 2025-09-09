/* path: src/pages/student/components/StudentGamification.tsx */
import React from "react";
import { Zap, Rocket, Brain, Coffee, Book, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utility";
import { useStudentStats } from "../hooks";
import { useRPC } from "../hooks/useRPC";
import { supabaseClient } from "@/utility";
import {
  AnimatedCard,
  AnimatedCounter,
  AnimatedProgress,
  motion,
} from "../motion";

interface IdleUpgrade {
  id: number;
  name: string;
  icon: string;
  current_level: number;
  next_cost: number;
  bonus_per_level: number;
  total_bonus: number;
}

const iconMap: Record<string, any> = {
  "⚡": Zap,
  "🚀": Rocket,
  "🧠": Brain,
  "☕": Coffee,
  "📚": Book,
};

/** Skeleton karty ulepszenia (spójny z kartami kursów) */
const UpgradeSkeleton: React.FC = () => (
  <div className="rounded-2xl border bg-card p-6 shadow-soft animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-muted/70" />
        <div>
          <div className="h-4 w-40 rounded bg-muted/70" />
          <div className="mt-2 h-3 w-24 rounded bg-muted/60" />
        </div>
      </div>
      <div className="h-5 w-16 rounded-full bg-muted/60" />
    </div>
    <div className="space-y-3 mb-4">
      <div className="h-3 w-full rounded bg-muted/60" />
      <div className="h-3 w-2/3 rounded bg-muted/60" />
    </div>
    <div className="h-10 w-full rounded-lg bg-muted/60" />
  </div>
);

export const GamificationUpgrades = () => {
  const { stats, refetch: refetchStats } = useStudentStats();
  const {
    data: upgradesData,
    isLoading,
    refetch: refetchUpgrades,
  } = useRPC<IdleUpgrade[]>("get_idle_upgrades");

  const handleBuyUpgrade = async (upgradeId: number) => {
    try {
      const { data, error } = await supabaseClient.rpc("buy_idle_upgrade", {
        p_upgrade_id: upgradeId,
      });

      if (error) throw error;

      if (data) {
        toast.success(`Ulepszenie zakupione! Poziom ${data.new_level}`);
        refetchStats();
        refetchUpgrades();
      }
    } catch {
      toast.error("Niewystarczająca ilość punktów");
    }
  };

  const upgrades = upgradesData || [];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* ========================= HERO: STATY (spójnie z Dashboard) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        {/* Delikatne tło jak w dashboardzie */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-secondary/[0.10] to-accent/[0.12]" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--ring)/0.35) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--ring)/0.35) 1px, transparent 1px)
              `,
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-12 md:items-center">
            {/* Tytuł + opis */}
            <div className="md:col-span-4 space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Ulepszenia
              </h1>
              <p className="text-sm text-muted-foreground">
                Inwestuj punkty, aby zwiększyć tempo zdobywania kolejnych.
              </p>
            </div>

            {/* Karty statystyk (spójny układ 3 kolumn) */}
            <div className="md:col-span-8 grid grid-cols-3 gap-4 md:gap-6">
              {/* Punkty/h */}
              <div className="rounded-xl border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Punkty / h
                  </span>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl md:text-5xl font-semibold text-accent leading-none tabular-nums">
                    <AnimatedCounter value={stats.idle_rate} />
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                 Premia za obecność.
                </p>
              </div>

              {/* Twoje punkty */}
              <div className="rounded-xl border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Twoje punkty
                  </span>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl md:text-5xl font-semibold text-primary leading-none tabular-nums">
                    <AnimatedCounter value={stats.points} />
                  </span>
                  <span className="mb-[2px] text-sm text-muted-foreground">pkt</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Wydaj je na ulepszenia poniżej.
                </p>
              </div>

              {/* Pasek progresu do kolejnego poziomu (opcjonalnie jak na dashboardzie) */}
              <div className="rounded-xl border bg-card p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Do kolejnego poziomu
                  </span>
                  <Rocket className="h-4 w-4 text-secondary" />
                </div>
                <div className="mt-3">
                  <AnimatedProgress value={stats.points % 100} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pozostało {100 - (stats.points % 100)} pkt
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================= LISTA ULEPSZEŃ ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">
              Dostępne ulepszenia
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Wybierz i zwiększ swoje tempo zdobywania punktów.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
          {/* Skeletony podczas ładowania */}
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => <UpgradeSkeleton key={i} />)}

          {!isLoading &&
            upgrades.map((upgrade, index) => {
              const canAfford = stats.points >= upgrade.next_cost;
              const Icon = iconMap[upgrade.icon] || Zap;

              return (
                <AnimatedCard
                  key={upgrade.id}
                  index={index}
                  className={cn(
                    "group relative rounded-2xl border bg-card p-5 shadow-soft hover:bg-muted/40 transition-colors"
                  )}
                >
                  {/* Góra karty: tytuł + badge kosztu/dostępności */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                          {upgrade.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Poziom {upgrade.current_level}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                        canAfford
                          ? "border-primary/30 text-primary"
                          : "border-muted-foreground/25 text-muted-foreground"
                      )}
                    >
                      {canAfford ? "Dostępne" : "Za drogie"}
                    </span>
                  </div>

                  {/* Środek: liczby i mini-progres (spójny język UI) */}
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Aktualny bonus</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        +<AnimatedCounter value={upgrade.total_bonus} /> pkt/h
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Następny poziom</span>
                      <span className="font-medium">
                        +{upgrade.bonus_per_level} pkt/h
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <motion.button
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                    onClick={() => handleBuyUpgrade(upgrade.id)}
                    disabled={!canAfford}
                    className={cn(
                      "mt-4 w-full py-2.5 sm:py-3 rounded-lg font-medium focus-ring transition-colors",
                      canAfford
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    title={canAfford ? "Kup ulepszenie" : "Brakuje punktów"}
                  >
                    Ulepsz za <AnimatedCounter value={upgrade.next_cost} /> pkt
                  </motion.button>
                </AnimatedCard>
              );
            })}
        </div>
      </motion.section>
    </div>
  );
};
