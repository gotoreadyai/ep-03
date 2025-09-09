/* path: src/pages/student/components/StudentAchievements.tsx */
import React from "react";
import { Flame, Star, Zap, Trophy, Target, Rocket } from "lucide-react";
import { cn } from "@/utility";
import {
  AnimatedCard,
  AnimatedProgress,
  motion,
} from "../motion";

const achievements = [
  {
    id: 1,
    icon: Flame,
    title: "Pierwszy Krok",
    description: "Ukończ pierwszą lekcję",
    unlocked: true,
    rarity: "common" as const,
    unlockedAt: "2024-01-15",
    progress: 100,
  },
  {
    id: 2,
    icon: Star,
    title: "Perfekcjonista",
    description: "Zdobądź 100% w 10 quizach",
    unlocked: true,
    rarity: "rare" as const,
    unlockedAt: "2024-02-20",
    progress: 100,
  },
  {
    id: 3,
    icon: Zap,
    title: "Błyskawica",
    description: "Ukończ 5 lekcji w jeden dzień",
    unlocked: false,
    rarity: "epic" as const,
    progress: 60,
  },
  {
    id: 4,
    icon: Trophy,
    title: "Mistrz",
    description: "Osiągnij poziom 50",
    unlocked: false,
    rarity: "legendary" as const,
    progress: 24,
  },
  {
    id: 5,
    icon: Target,
    title: "Snajper",
    description: "Odpowiedz poprawnie na 100 pytań z rzędu",
    unlocked: false,
    rarity: "epic" as const,
    progress: 45,
  },
  {
    id: 6,
    icon: Rocket,
    title: "Rakieta",
    description: "Ukończ kurs w mniej niż tydzień",
    unlocked: false,
    rarity: "rare" as const,
    progress: 0,
  },
];

const rarityConfig = {
  common: {
    bg: "bg-muted",
    ring: "ring-1 ring-border",
    label: "Pospolite",
    badge:
      "border border-muted-foreground/20 text-muted-foreground bg-background/60",
  },
  rare: {
    bg: "bg-blue-500/10",
    ring: "ring-1 ring-blue-500/30",
    label: "Rzadkie",
    badge: "border border-blue-500/30 text-blue-600 dark:text-blue-400",
  },
  epic: {
    bg: "bg-purple-500/10",
    ring: "ring-1 ring-purple-500/30",
    label: "Epiczne",
    badge: "border border-purple-500/30 text-purple-600 dark:text-purple-400",
  },
  legendary: {
    bg: "bg-orange-500/10",
    ring: "ring-1 ring-orange-500/30",
    label: "Legendarne",
    badge: "border border-orange-500/30 text-orange-600 dark:text-orange-400",
  },
};

export const AchievementsList = () => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const totalPct = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* ========================= HERO / NAGŁÓWEK (spójny z Dashboard) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        {/* delikatne tło jak w dashboardzie */}
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Osiągnięcia
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Odblokowano{" "}
                <span className="font-semibold tabular-nums">
                  {unlockedCount}
                </span>{" "}
                z{" "}
                <span className="font-semibold tabular-nums">{totalCount}</span>{" "}
                ({totalPct}%)
              </p>
            </div>

            {/* Pasek postępu – spójny z kartami z dashboardu */}
            <div className="w-full md:w-96">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Postęp osiągnięć</span>
                <span className="font-medium tabular-nums">{totalPct}%</span>
              </div>
              <AnimatedProgress value={totalPct} />
            </div>
          </div>

          {/* Liczniki rzadkości – kompaktowe badge’e jak w dashboardzie */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(rarityConfig).map(([rarity, config]) => {
              const count = achievements.filter(
                (a) => a.rarity === rarity && a.unlocked
              ).length;
              const total = achievements.filter((a) => a.rarity === rarity)
                .length;

              return (
                <div
                  key={rarity}
                  className={cn(
                    "rounded-xl border bg-card/70 backdrop-blur-sm p-3 shadow-soft"
                  )}
                >
                  <p className="text-lg font-semibold tabular-nums">
                    {count}/{total}
                  </p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ========================= SIATKA KART (spójne karty jak na liście kursów) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
      >
        {achievements.map((achievement, index) => {
          const conf = rarityConfig[achievement.rarity];
          const Icon = achievement.icon;

          const badge = achievement.unlocked ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                conf.badge
              )}
            >
              Odblokowane
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 text-primary px-2.5 py-1 text-[11px] font-semibold">
              {achievement.progress}%
            </span>
          );

          return (
            <AnimatedCard
              key={achievement.id}
              index={index}
              className={cn(
                "group relative rounded-2xl border bg-card p-5 shadow-soft hover:bg-muted/40 transition-colors",
                !achievement.unlocked && "opacity-95"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      conf.bg,
                      conf.ring
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                {badge}
              </div>

              {/* Dolna część karty */}
              <div className="mt-4">
                {achievement.unlocked ? (
                  <div className="text-xs text-muted-foreground">
                    Odblokowano:{" "}
                    <span className="font-medium">
                      {new Date(
                        achievement.unlockedAt!
                      ).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Postęp</span>
                      <span className="font-medium tabular-nums">
                        {achievement.progress}%
                      </span>
                    </div>
                    <AnimatedProgress value={achievement.progress} />
                  </div>
                )}
              </div>
            </AnimatedCard>
          );
        })}
      </motion.section>
    </div>
  );
};
