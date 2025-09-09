/* path: src/pages/student/components/StudentLeaderboard.tsx */
import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Trophy, Medal, Award, RotateCcw } from "lucide-react";
import { cn } from "@/utility";
import { useRPC } from "../hooks/useRPC";
import { AnimatedCard, AnimatedCounter, motion } from "../motion";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  points: number;
  level: number;
  streak: number;
}

/** Skeleton wiersza rankingu – spójny z resztą UI */
const RowSkeleton: React.FC = () => (
  <div className="rounded-2xl border bg-card p-4 shadow-soft animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-8 h-5 rounded bg-muted/60" />
      <div className="w-10 h-10 rounded-full bg-muted/70" />
      <div className="flex-1">
        <div className="h-4 w-40 rounded bg-muted/60" />
        <div className="mt-2 h-3 w-28 rounded bg-muted/50" />
      </div>
      <div className="h-5 w-16 rounded bg-muted/60" />
    </div>
  </div>
);

export const LeaderboardRanking = () => {
  const { data: identity } = useGetIdentity<any>();
  const [filter, setFilter] = React.useState<"all" | "students" | "teachers">(
    "all"
  );

  const {
    data: leaderboardData,
    isLoading,
    refetch,
    error,
  } = useRPC<LeaderboardEntry[]>("get_leaderboard", {
    p_limit: 20,
    p_filter: filter,
  });

  // 🔧 Kluczowy fix: nie używamy refetch w deps żeby nie zapętlać
  React.useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const doRefetch = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        await refetch();
      } finally {
        inFlight = false;
      }
    };

    doRefetch();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const leaderboard = leaderboardData || [];

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return (
          <span className="text-sm font-medium text-muted-foreground">
            {rank}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* ========================= HERO (spójny z Dashboard) ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border"
      >
        {/* delikatne tło: gradient + siatka */}
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
                Ranking
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Top 20 użytkowników według punktów.
              </p>
            </div>

            {/* Filtry segmentowe */}
            <div className="bg-muted rounded-lg p-1 inline-flex gap-1">
              {[
                { value: "all", label: "Wszyscy" },
                { value: "students", label: "Uczniowie" },
                { value: "teachers", label: "Nauczyciele" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value as any)}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                    filter === tab.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ========================= LISTA RANKINGU ========================= */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-2"
      >
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}

        {!isLoading && (error || leaderboard.length === 0) && (
          <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
            <div className="text-4xl">🥲</div>
            <h4 className="mt-3 text-base sm:text-lg font-semibold">
              Brak wyników
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {error
                ? "Nie udało się pobrać rankingu."
                : "Brak danych dla wybranego filtra."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-primary/5 focus-ring"
            >
              <RotateCcw className="w-4 h-4" />
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!isLoading &&
          leaderboard.length > 0 &&
          leaderboard.map((entry, index) => {
            const isCurrentUser = entry.user_id === identity?.id;
            const isTop3 = entry.rank <= 3;

            return (
              <AnimatedCard
                key={entry.user_id || `${entry.rank}-${index}`}
                index={index}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border shadow-soft transition-colors",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground border-primary/40"
                    : isTop3
                    ? "bg-muted/50 border-border"
                    : "bg-card hover:bg-muted/40 border-border"
                )}
              >
                {/* Rank */}
                <div className="w-8 flex justify-center">
                  {getRankDisplay(entry.rank)}
                </div>

                {/* Avatar */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold shrink-0",
                    isCurrentUser
                      ? "bg-primary-foreground text-primary"
                      : isTop3
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                  aria-label={`Avatar użytkownika ${entry.full_name || "Użytkownik"}`}
                  title={entry.full_name || "Użytkownik"}
                >
                  {entry.full_name?.charAt(0) ?? "U"}
                </div>

                {/* Dane użytkownika */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {entry.full_name || "Użytkownik"}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm opacity-80">(Ty)</span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-sm",
                      isCurrentUser
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    Poziom {entry.level} • Seria {entry.streak} dni
                  </div>
                </div>

                {/* Punkty */}
                <div className="text-right">
                  <div className="font-semibold tabular-nums">
                    <AnimatedCounter value={entry.points} />
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      isCurrentUser
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    punktów
                  </div>
                </div>
              </AnimatedCard>
            );
          })}
      </motion.section>
    </div>
  );
};
