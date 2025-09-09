/* path: src/pages/student/components/StudentProfile.tsx */
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import {
  Mail,
  Calendar,
  Trophy,
  Target,
  Flame,
  Clock,
  Star,
  PencilLine,
  Lock,
  Bell,
  Trash2,
} from "lucide-react";
import { useStudentStats } from "../hooks";
import { AnimatedCard, AnimatedCounter, motion } from "../motion";

type StatCard = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  iconColor: string;
  highlight?: "primary" | "secondary" | "accent";
  counter?: boolean;
};

export const ProfileSettings = () => {
  const { data: identity } = useGetIdentity<any>();
  const { stats } = useStudentStats();

  const safeName =
    identity?.full_name || identity?.name || identity?.email || "Użytkownik";
  const initials =
    (identity?.full_name || identity?.name || "U")
      .split(" ")
      .map((s: string) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const joinedAt = (() => {
    const raw = identity?.created_at;
    const d = raw ? new Date(raw) : new Date();
    return d.toLocaleDateString("pl-PL");
  })();

  const statCards: StatCard[] = [
    {
      icon: Trophy,
      label: "Punkty",
      value: stats.points,
      iconColor: "text-primary",
      highlight: "primary",
      counter: true,
    },
    {
      icon: Target,
      label: "Ukończone quizy",
      value: stats.quizzes_completed ?? 0,
      iconColor: "text-green-600 dark:text-green-400",
      counter: false,
    },
    {
      icon: Star,
      label: "Perfekcyjne wyniki",
      value: stats.perfect_scores ?? 0,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      counter: false,
    },
    {
      icon: Flame,
      label: "Najdłuższa seria",
      value: `${stats.streak ?? 0} dni`,
      iconColor: "text-destructive",
      counter: false,
    },
    {
      icon: Clock,
      label: "Czas nauki",
      value: `${Math.max(0, Math.floor((stats.total_time ?? 0) / 60))}h`,
      iconColor: "text-blue-600 dark:text-blue-400",
      counter: false,
    },
    {
      icon: Trophy,
      label: "Poziom",
      value: `Poziom ${stats.level ?? 1}`,
      iconColor: "text-secondary",
      counter: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* ========================= HERO (spójny z Dashboard) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        {/* Delikatne tło: gradient + siatka */}
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Lewa strona: avatar + dane */}
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl sm:text-2xl font-semibold shadow-soft">
                {initials}
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {safeName}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {identity?.email && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{identity.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Dołączył {joinedAt}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Prawa strona: akcje nagłówka */}
            <div className="flex flex-wrap items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-primary/5 focus-ring">
                <PencilLine className="w-4 h-4" />
                Edytuj profil
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 focus-ring">
                Ustawienia
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================= STATYSTYKI (karty jak w Dashboard) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight mb-4">
          Statystyki
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedCard
                key={stat.label}
                index={index}
                className="group relative rounded-2xl border bg-card p-5 shadow-soft hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-2xl font-semibold leading-none tabular-nums ${
                        stat.highlight === "primary"
                          ? "text-primary"
                          : stat.highlight === "secondary"
                          ? "text-secondary"
                          : stat.highlight === "accent"
                          ? "text-accent"
                          : "text-foreground"
                      }`}
                    >
                      {stat.counter ? (
                        <AnimatedCounter value={Number(stat.value)} />
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </motion.section>

      {/* ========================= USTAWIENIA — pełne na mobile, kompaktowe na desktop ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="space-y-4"
      >
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
          Ustawienia
        </h2>

        {/* Kontener z responsywnym układem przycisków */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-4 py-3 shadow-soft hover:bg-primary/90 focus-ring"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4" />
              Zmień hasło
            </span>
          </motion.button>

          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center rounded-xl bg-secondary text-white px-4 py-3 shadow-soft hover:opacity-95 focus-ring"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Bell className="w-4 h-4" />
              Ustawienia powiadomień
            </span>
          </motion.button>

          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center rounded-xl bg-destructive text-white px-4 py-3 shadow-soft hover:bg-destructive/90 focus-ring"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Trash2 className="w-4 h-4" />
              Usuń konto
            </span>
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};
