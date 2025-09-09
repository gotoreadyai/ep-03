// src/pages/teacher/reports/overview.tsx
import { useMemo } from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { FlexBox, GridBox } from "@/components/shared";
import { Users, Activity, TrendingUp, Target, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  activeUsers: number;
  activeUsersChange: number;
  avgQuizScore: number;
  avgQuizScoreChange: number;
  completionRate: number;
  completionRateChange: number;
  totalPoints: number;
  totalPointsChange: number;
}

interface ActivityData {
  date: string;
  quizzes: number;
  materials: number;
}

const toUtcDay = (d: string | Date) => {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()))
    .toISOString()
    .slice(0, 10);
};

export const ReportsOverview = () => {
  const navigate = useNavigate();

  // snapshot – bez auto-refetchu
  const staticQuery = {
    queryOptions: {
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchInterval: false,
      retry: 0,
    } as const,
  };

  const { data: activeUsersData } = useList({
    resource: "user_stats",
    filters: [
      {
        field: "last_active",
        operator: "gte",
        value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
    ],
    pagination: { mode: "off" },
    ...staticQuery,
  });

  // ⬇️ KLUCZOWA POPRAWKA: prawdziwe IS NOT NULL po stronie Supabase
  const { data: progressData } = useList({
    resource: "activity_progress",
    pagination: { mode: "off" },
    meta: {
      select: "*, activities(type, passing_score)",
      // refine-supabase: pozwala dopiąć surowy buildera
      query: (q: any) => q.not("completed_at", "is", null),
    },
    ...staticQuery,
  });

  const { data: userStatsData } = useList({
    resource: "user_stats",
    pagination: { mode: "off" },
    sorters: [{ field: "total_points", order: "desc" }],
    ...staticQuery,
  });

  const stats = useMemo<DashboardStats>(() => {
    const activeUsers = activeUsersData?.data?.length || 0;

    const quizScores =
      progressData?.data
        ?.filter((p: any) => p.activities?.type === "quiz" && p.score !== null)
        .map((p: any) => Number(p.score)) || [];
    const avgQuizScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((a: number, b: number) => a + b, 0) / quizScores.length)
        : 0;

    const totalActivities = progressData?.data?.length || 0;
    const completedActivities = progressData?.data?.filter((p: any) => p.completed_at).length || 0;
    const completionRate =
      totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    const totalPoints =
      userStatsData?.data?.reduce((sum: number, user: any) => sum + Number(user.total_points), 0) ||
      0;

    return {
      activeUsers,
      activeUsersChange: 12,
      avgQuizScore,
      avgQuizScoreChange: 3,
      completionRate,
      completionRateChange: 5,
      totalPoints,
      totalPointsChange: 8,
    };
  }, [activeUsersData?.data, progressData?.data, userStatsData?.data]);

  // 7 ostatnich dni (UTC)
  const activityData = useMemo<ActivityData[]>(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const map = new Map<string, { quizzes: number; materials: number }>();
    for (const day of days) map.set(day, { quizzes: 0, materials: 0 });

    for (const p of progressData?.data || []) {
      if (!p?.started_at) continue;
      const day = toUtcDay(p.started_at);
      if (!map.has(day)) continue;
      const bucket = map.get(day)!;
      if (p.activities?.type === "quiz") bucket.quizzes += 1;
      else if (p.activities?.type === "material") bucket.materials += 1;
    }

    return days.map((day) => ({
      date: new Date(day + "T00:00:00Z").toLocaleDateString("pl-PL", {
        weekday: "short",
        day: "numeric",
      }),
      quizzes: map.get(day)!.quizzes,
      materials: map.get(day)!.materials,
    }));
  }, [progressData?.data]);

  const statCards = [
    { title: "Aktywni użytkownicy", value: stats.activeUsers, change: stats.activeUsersChange, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", link: "/teacher/reports/engagement" },
    { title: "Średni wynik quizów", value: `${stats.avgQuizScore}%`, change: stats.avgQuizScoreChange, icon: Target, color: "text-green-600", bgColor: "bg-green-50", link: "/teacher/reports/performance" },
    { title: "Wskaźnik ukończeń", value: `${stats.completionRate}%`, change: stats.completionRateChange, icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50", link: "/teacher/reports/progress" },
    { title: "Suma punktów", value: stats.totalPoints.toLocaleString("pl-PL"), change: stats.totalPointsChange, icon: Trophy, color: "text-orange-600", bgColor: "bg-orange-50", link: "/teacher/reports/gamification" },
  ];

  const reportLinks = [
    { to: "/teacher/reports/engagement", title: "Raport zaangażowania", description: "Aktywność użytkowników, czas nauki, trendy", icon: <Activity className="h-5 w-5" />, color: "text-blue-600" },
    { to: "/teacher/reports/progress", title: "Raport postępów", description: "Postęp kursów, wskaźniki ukończeń", icon: <TrendingUp className="h-5 w-5" />, color: "text-purple-600" },
    { to: "/teacher/reports/performance", title: "Raport wyników", description: "Wyniki quizów, najtrudniejsze pytania", icon: <Target className="h-5 w-5" />, color: "text-green-600" },
    { to: "/teacher/reports/gamification", title: "Raport gamifikacji", description: "Ranking punktowy, poziomy, osiągnięcia", icon: <Trophy className="h-5 w-5" />, color: "text-orange-600" },
  ];

  const topStudents = userStatsData?.data?.slice(0, 5) || [];

  return (
    <SubPage>
      <FlexBox>
        <Lead title="Centrum Raportów" description="Kompleksowy przegląd wyników i postępów uczniów" />
      </FlexBox>

      {/* Karty statystyk */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(stat.link)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className={stat.change > 0 ? "text-green-600" : "text-red-600"}>
                  {stat.change > 0 ? "+" : ""}
                  {stat.change}%
                </span>{" "}
                vs. ostatnie 7 dni
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Wykres aktywności */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aktywność w ostatnich 7 dniach</span>
              <Button variant="ghost" size="sm" onClick={() => navigate("/teacher/reports/engagement")}>
                Zobacz więcej →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  key={`${activityData.map((d) => d.quizzes + d.materials).join("-")}`}
                  data={activityData}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="materials"
                    stackId="1"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    name="Materiały"
                    isAnimationActive={false}
                    dot
                  />
                  <Area
                    type="monotone"
                    dataKey="quizzes"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Quizy"
                    isAnimationActive={false}
                    dot
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top uczniowie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top 5 uczniów</span>
              <Trophy className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents.map((student: any, index: number) => (
                <div key={student.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uczeń #{index + 1}</p>
                      <p className="text-xs text-muted-foreground">Poziom {student.current_level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{student.total_points}</p>
                    <p className="text-xs text-muted-foreground">punktów</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linki do raportów */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Szczegółowe raporty</h2>
        <GridBox variant="2-2-4">
          {reportLinks.map((report) => (
            <Card key={report.to} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(report.to)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={report.color}>{report.icon}</span>
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </CardContent>
            </Card>
          ))}
        </GridBox>
      </div>

      {/* Ostatnie aktywności */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {progressData?.data?.slice(0, 10).map((progress: any) => (
              <div key={`${progress.user_id}-${progress.activity_id}`} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant={progress.activities?.type === "quiz" ? "default" : "secondary"}>
                    {progress.activities?.type === "quiz" ? "Quiz" : "Materiał"}
                  </Badge>
                  <span className="text-sm">Aktywność #{progress.activity_id}</span>
                </div>
                <div className="text-right">
                  {progress.score !== null && <span className="text-sm font-medium">{progress.score}%</span>}
                  <p className="text-xs text-muted-foreground">{new Date(progress.started_at).toLocaleDateString("pl-PL")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};
