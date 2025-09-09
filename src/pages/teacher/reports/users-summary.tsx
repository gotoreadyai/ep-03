// path: src/pages/teacher/reports/users-summary.tsx
import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Users, 
  UserCheck,
  UserX,
  Clock,
  Award,
  AlertTriangle,
  Activity,
  Zap,
  Target,
  BookOpen,
  Brain,
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";
import { SubPage } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  ZAxis
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  created_at: string;
}

interface UserStats {
  user_id: string;
  total_points: number;
  current_level: number;
  daily_streak: number;
  last_active: string;
  total_time_spent: number;
  activities_completed: number;
  perfect_scores: number;
}

interface ActivityProgress {
  user_id: string;
  activity_id: number;
  started_at: string;
  completed_at?: string;
  score?: number;
  time_spent?: number;
  activities?: {
    type: 'quiz' | 'material';
  };
}

const ACTIVITY_COLORS = {
  veryActive: '#22c55e',
  active: '#3b82f6',
  moderate: '#f59e0b',
  lowActivity: '#ef4444',
  inactive: '#6b7280'
};

const SEGMENT_COLORS = {
  champions: '#8b5cf6',
  loyalists: '#3b82f6',
  potentials: '#10b981',
  newUsers: '#f59e0b',
  atRisk: '#ef4444',
  dormant: '#6b7280'
};

export const ReportUsersSummary: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [segmentFilter, setSegmentFilter] = useState<string>("all");

  // Stabilne opcje react-query (nie wpływają na key, ale trzymamy jedną referencję)
  const queryOptions = useMemo(
    () => ({
      staleTime: Infinity,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchInterval: 10000, // Refetch every 10 seconds
      retry: 0,
    }),
    []
  );

  // Stabilny zakres dat – liczone TYLKO przy zmianie timeRange
  const { startISO } = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    switch (timeRange) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
    }
    // zaokrąglamy do początku dnia, żeby izo nie różnił się milisekundami
    start.setHours(0, 0, 0, 0);
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  }, [timeRange]);

  // Stabilne meta/filters (te obiekty trafiają do queryKey w refine)
  const usersFilters = useMemo(
    () =>
      roleFilter !== "all"
        ? [
            {
              field: "role",
              operator: "eq",
              value: roleFilter,
            } as const,
          ]
        : [],
    [roleFilter]
  );

  const userStatsMeta = useMemo(
    () => ({ select: "*, users!user_stats_user_id_fkey(email, full_name)" }),
    []
  );

  const activityMeta = useMemo(
    () => ({ select: "*, activities(type)" }),
    []
  );

  const activityFilters = useMemo(
    () => [
      {
        field: "started_at",
        operator: "gte",
        value: startISO, // stabilny ISO
      } as const,
    ],
    [startISO]
  );

  // Pobrania
  const { data: usersData } = useList<UserProfile>({
    resource: "users",
    pagination: { mode: "off" },
    filters: usersFilters,
    queryOptions,
  });

  const { data: userStatsData } = useList<UserStats>({
    resource: "user_stats",
    pagination: { mode: "off" },
    meta: userStatsMeta,
    queryOptions,
  });

  const { data: activityData } = useList<ActivityProgress>({
    resource: "activity_progress",
    filters: activityFilters,
    pagination: { mode: "off" },
    meta: activityMeta,
    queryOptions,
  });

  // ---- Analiza i wizualizacje (bez zmian merytorycznych poza stabilnością) ----

  const enrichedUsers = useMemo(() => {
    if (!usersData?.data || !userStatsData?.data || !activityData?.data) return [];

    const statsMap = new Map(userStatsData.data.map(s => [s.user_id, s]));
    const activityMap = new Map<string, ActivityProgress[]>();
    
    activityData.data.forEach(activity => {
      const arr = activityMap.get(activity.user_id) || [];
      arr.push(activity);
      activityMap.set(activity.user_id, arr);
    });

    return usersData.data.map(user => {
      const stats = statsMap.get(user.id);
      const activities = activityMap.get(user.id as string) || [];
      
      let segment: keyof typeof SEGMENT_COLORS;
      const daysSinceLastActive = stats?.last_active 
        ? Math.floor((Date.now() - new Date(stats.last_active).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      if (!stats) {
        segment = 'dormant';
      } else if (daysSinceLastActive > 30) {
        segment = 'dormant';
      } else if (daysSinceLastActive > 14) {
        segment = 'atRisk';
      } else if (stats.total_points < 100 && daysSinceLastActive < 7) {
        segment = 'newUsers';
      } else if (stats.total_points > 1000 && stats.daily_streak > 7) {
        segment = 'champions';
      } else if (stats.daily_streak > 3) {
        segment = 'loyalists';
      } else {
        segment = 'potentials';
      }

      const scored = activities.filter(a => typeof a.score === 'number') as Required<Pick<ActivityProgress,'score'>>[];
      const avgScore = scored.length
        ? Math.round(scored.reduce((sum, a) => sum + (a.score as number), 0) / scored.length)
        : null;

      return {
        ...user,
        stats,
        activities,
        segment,
        daysSinceLastActive,
        avgScore
      };
    });
  }, [usersData?.data, userStatsData?.data, activityData?.data]);

  const filteredUsers = useMemo(() => {
    if (segmentFilter === "all") return enrichedUsers;
    return enrichedUsers.filter(user => user.segment === segmentFilter);
  }, [enrichedUsers, segmentFilter]);

  const mainStats = useMemo(() => {
    const total = filteredUsers.length;
    const active = filteredUsers.filter(u => u.is_active).length;
    const activeLastWeek = filteredUsers.filter(u => u.daysSinceLastActive <= 7).length;
    const usersWithStats = filteredUsers.filter(u => u.stats);
    const avgLevel = usersWithStats.length
      ? Math.round(usersWithStats.reduce((sum, u) => sum + (u.stats?.current_level || 0), 0) / usersWithStats.length)
      : 0;
    
    const withStreaks = usersWithStats.filter(u => (u.stats?.daily_streak || 0) > 0).length;
    const avgTimeHours = usersWithStats.length
      ? Math.round(usersWithStats.reduce((sum, u) => sum + (u.stats?.total_time_spent || 0), 0) / usersWithStats.length / 60)
      : 0;

    return {
      total,
      active,
      activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
      activeLastWeek,
      activeLastWeekPercent: total > 0 ? Math.round((activeLastWeek / total) * 100) : 0,
      avgLevel,
      withStreaks,
      streakPercent: total > 0 ? Math.round((withStreaks / total) * 100) : 0,
      avgTimeHours
    };
  }, [filteredUsers]);

  const userSegments = useMemo(() => {
    const base = [
      { name: 'Champions', key: 'champions', count: 0, color: SEGMENT_COLORS.champions, description: 'Wysokie punkty, aktywna seria' },
      { name: 'Lojaliści', key: 'loyalists', count: 0, color: SEGMENT_COLORS.loyalists, description: 'Regularna aktywność' },
      { name: 'Potencjalni', key: 'potentials', count: 0, color: SEGMENT_COLORS.potentials, description: 'Niska regularność' },
      { name: 'Nowi', key: 'newUsers', count: 0, color: SEGMENT_COLORS.newUsers, description: 'Niedawno dołączyli' },
      { name: 'Zagrożeni', key: 'atRisk', count: 0, color: SEGMENT_COLORS.atRisk, description: 'Spadek aktywności' },
      { name: 'Nieaktywni', key: 'dormant', count: 0, color: SEGMENT_COLORS.dormant, description: 'Brak aktywności >30 dni' }
    ] as const;

    const counts: Record<string, number> = {};
    enrichedUsers.forEach(u => {
      counts[u.segment] = (counts[u.segment] || 0) + 1;
    });

    return base.map(s => ({ ...s, count: counts[s.key] || 0 })).filter(s => s.count > 0);
  }, [enrichedUsers]);

  const allSegments = useMemo(() => {
    const base = [
      { name: 'Champions', key: 'champions', count: 0, color: SEGMENT_COLORS.champions, description: 'Wysokie punkty, aktywna seria' },
      { name: 'Lojaliści', key: 'loyalists', count: 0, color: SEGMENT_COLORS.loyalists, description: 'Regularna aktywność' },
      { name: 'Potencjalni', key: 'potentials', count: 0, color: SEGMENT_COLORS.potentials, description: 'Niska regularność' },
      { name: 'Nowi', key: 'newUsers', count: 0, color: SEGMENT_COLORS.newUsers, description: 'Niedawno dołączyli' },
      { name: 'Zagrożeni', key: 'atRisk', count: 0, color: SEGMENT_COLORS.atRisk, description: 'Spadek aktywności' },
      { name: 'Nieaktywni', key: 'dormant', count: 0, color: SEGMENT_COLORS.dormant, description: 'Brak aktywności >30 dni' }
    ];
    const counts: Record<string, number> = {};
    enrichedUsers.forEach(u => {
      counts[u.segment] = (counts[u.segment] || 0) + 1;
    });
    return base.map(s => ({ ...s, count: counts[s.key] || 0 }));
  }, [enrichedUsers]);

  const activityDistribution = useMemo(() => {
    const distribution = [
      { name: 'Bardzo aktywni', range: 'Codziennie', count: 0, color: ACTIVITY_COLORS.veryActive },
      { name: 'Aktywni', range: '2-6 dni/tydz', count: 0, color: ACTIVITY_COLORS.active },
      { name: 'Umiarkowani', range: '1 dzień/tydz', count: 0, color: ACTIVITY_COLORS.moderate },
      { name: 'Niska aktywność', range: '<1 dzień/tydz', count: 0, color: ACTIVITY_COLORS.lowActivity },
      { name: 'Nieaktywni', range: 'Brak', count: 0, color: ACTIVITY_COLORS.inactive }
    ];

    filteredUsers.forEach(user => {
      if (!user.stats || user.daysSinceLastActive > 30) {
        distribution[4].count++;
      } else if (user.daysSinceLastActive <= 1) {
        distribution[0].count++;
      } else if (user.daysSinceLastActive <= 3) {
        distribution[1].count++;
      } else if (user.daysSinceLastActive <= 7) {
        distribution[2].count++;
      } else {
        distribution[3].count++;
      }
    });

    return distribution;
  }, [filteredUsers]);

  const activityPattern = useMemo(() => {
    const dailyActivity = new Map<string, Set<string>>();
    activityData?.data?.forEach(a => {
      const dayKey = a.started_at.slice(0, 10);
      const users = dailyActivity.get(dayKey) || new Set();
      users.add(a.user_id);
      dailyActivity.set(dayKey, users);
    });

    const sortedKeys = Array.from(dailyActivity.keys()).sort().slice(-30);

    return sortedKeys.map(iso => ({
      date: new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
      activeUsers: dailyActivity.get(iso)?.size || 0,
      newUsers: filteredUsers.filter(u => (u.created_at?.slice(0,10) === iso)).length
    }));
  }, [activityData?.data, filteredUsers]);

  const pointsVsTime = useMemo(() => {
    return filteredUsers
      .filter(u => u.stats && (u.stats.total_time_spent || 0) > 0)
      .map(user => ({
        timeHours: Math.round((user.stats!.total_time_spent || 0) / 60),
        points: user.stats!.total_points,
        level: user.stats!.current_level,
        streak: user.stats!.daily_streak,
        segment: user.segment
      }));
  }, [filteredUsers]);

  const topPerformers = useMemo(() => {
    return filteredUsers
      .filter(u => u.stats)
      .sort((a, b) => (b.stats?.total_points || 0) - (a.stats?.total_points || 0))
      .slice(0, 10);
  }, [filteredUsers]);

  const cohortAnalysis = useMemo(() => {
    const cohorts = new Map<string, { total: number; retained: number[] }>();
    const weeks = 4;

    filteredUsers.forEach(user => {
      const joinWeek = new Date(user.created_at);
      joinWeek.setHours(0, 0, 0, 0);
      joinWeek.setDate(joinWeek.getDate() - joinWeek.getDay());
      const cohortKey = joinWeek.toISOString().slice(0,10);
      
      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, { total: 0, retained: Array(weeks).fill(0) });
      }
      const cohort = cohorts.get(cohortKey)!;
      cohort.total++;
      
      for (let week = 0; week < weeks; week++) {
        const weekStart = new Date(joinWeek);
        weekStart.setDate(weekStart.getDate() + week * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const wasActive = user.activities.some(a => {
          const activityDate = new Date(a.started_at);
          return activityDate >= weekStart && activityDate < weekEnd;
        });
        if (wasActive) cohort.retained[week]++;
      }
    });

    return Array.from(cohorts.entries())
      .map(([week, data]) => ({
        cohort: new Date(week).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
        week0: 100,
        week1: data.total > 0 ? Math.round((data.retained[1] / data.total) * 100) : 0,
        week2: data.total > 0 ? Math.round((data.retained[2] / data.total) * 100) : 0,
        week3: data.total > 0 ? Math.round((data.retained[3] / data.total) * 100) : 0,
        total: data.total
      }))
      .slice(-4);
  }, [filteredUsers]);

  const statCards = [
    {
      label: "Wszyscy użytkownicy",
      value: mainStats.total.toString(),
      subValue: `${mainStats.activePercent}% aktywnych`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Aktywni w ostatnim tygodniu",
      value: mainStats.activeLastWeek.toString(),
      subValue: `${mainStats.activeLastWeekPercent}% wszystkich`,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Średni poziom",
      value: mainStats.avgLevel.toString(),
      subValue: `${mainStats.avgTimeHours}h średnio`,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Z aktywną serią",
      value: mainStats.withStreaks.toString(),
      subValue: `${mainStats.streakPercent}% wszystkich`,
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <SubPage>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/teacher/reports/overview">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót do centrum raportów
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Analiza użytkowników</h1>
        </div>
        
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie role</SelectItem>
              <SelectItem value="student">Uczniowie</SelectItem>
              <SelectItem value="teacher">Nauczyciele</SelectItem>
              <SelectItem value="admin">Administratorzy</SelectItem>
            </SelectContent>
          </Select>

          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie segmenty</SelectItem>
              {allSegments.map(segment => (
                <SelectItem key={segment.key} value={segment.key}>
                  {segment.name} ({segment.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Ostatnie 7 dni</SelectItem>
              <SelectItem value="30d">Ostatnie 30 dni</SelectItem>
              <SelectItem value="90d">Ostatnie 90 dni</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Główne statystyki */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="segments">Segmentacja</TabsTrigger>
          <TabsTrigger value="activity">Aktywność</TabsTrigger>
          <TabsTrigger value="performance">Wyniki</TabsTrigger>
          <TabsTrigger value="retention">Retencja</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Segmentacja użytkowników</CardTitle>
              </CardHeader>
              <CardContent>
                {userSegments.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-6 border rounded-lg">
                    Brak danych do wyświetlenia dla wybranego zakresu.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userSegments}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        label={({ name, percent }) =>
                          percent !== undefined ? `${name}: ${(percent * 100).toFixed(0)}%` : name
                        }
                        isAnimationActive={false}
                      >
                        {userSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Charakterystyka segmentów</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allSegments.map(segment => (
                    <div key={segment.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: segment.color }} />
                        <div>
                          <p className="font-medium">{segment.name}</p>
                          <p className="text-xs text-muted-foreground">{segment.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{segment.count}</p>
                        <p className="text-xs text-muted-foreground">użytkowników</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Kluczowe obserwacje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {allSegments.find(s => s.key === 'atRisk')?.count ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-orange-600">
                      <UserX className="h-4 w-4" />
                      <span className="text-sm font-medium">Użytkownicy zagrożeni</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {allSegments.find(s => s.key === 'atRisk')?.count} użytkowników wymaga uwagi – rozważ wysłanie powiadomień motywacyjnych
                    </p>
                  </div>
                ) : null}
                
                {allSegments.find(s => s.key === 'champions')?.count ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Award className="h-4 w-4" />
                      <span className="text-sm font-medium">Champions do wykorzystania</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {allSegments.find(s => s.key === 'champions')?.count} najaktywniejszych użytkowników – mogą być mentorami lub ambasadorami
                    </p>
                  </div>
                ) : null}
                
                {allSegments.find(s => s.key === 'newUsers')?.count ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">Nowi użytkownicy</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {allSegments.find(s => s.key === 'newUsers')?.count} nowych użytkowników – upewnij się, że mają dobre wsparcie onboardingowe
                    </p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Wzorzec aktywności użytkowników</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stackId="1"
                      stroke="#3b82f6" 
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Aktywni użytkownicy"
                      isAnimationActive={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="newUsers" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Nowi użytkownicy"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Poziomy aktywności</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Użytkownicy" isAnimationActive={false}>
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metryki zaangażowania</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Średnia częstotliwość logowania</span>
                    </div>
                    <Badge variant="outline">3.2 dni/tydzień</Badge>
                  </div>
                  <Progress value={64} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Średni czas sesji</span>
                    </div>
                    <Badge variant="outline">24 min</Badge>
                  </div>
                  <Progress value={48} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Ukończenia na użytkownika</span>
                    </div>
                    <Badge variant="outline">7.8 aktywności</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Punkty vs Czas nauki</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeHours" name="Czas nauki (h)" />
                  <YAxis dataKey="points" name="Punkty" />
                  <ZAxis dataKey="level" range={[50, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter 
                    name="Użytkownicy" 
                    data={pointsVsTime} 
                    fill="#8884d8"
                    isAnimationActive={false}
                  >
                    {pointsVsTime.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SEGMENT_COLORS[entry.segment as keyof typeof SEGMENT_COLORS] || '#8884d8'} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rozkład wyników</CardTitle>
              </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: '90-100%', count: filteredUsers.filter(u => u.avgScore !== null && u.avgScore! >= 90).length, color: '#22c55e' },
                  { label: '80-89%', count: filteredUsers.filter(u => u.avgScore !== null && u.avgScore! >= 80 && u.avgScore! < 90).length, color: '#84cc16' },
                  { label: '70-79%', count: filteredUsers.filter(u => u.avgScore !== null && u.avgScore! >= 70 && u.avgScore! < 80).length, color: '#eab308' },
                  { label: '60-69%', count: filteredUsers.filter(u => u.avgScore !== null && u.avgScore! >= 60 && u.avgScore! < 70).length, color: '#f97316' },
                  { label: '<60%',   count: filteredUsers.filter(u => u.avgScore !== null && u.avgScore! < 60).length, color: '#ef4444' }
                ].map(range => {
                  const total = filteredUsers.filter(u => u.avgScore !== null).length;
                  const percent = total > 0 ? (range.count / total) * 100 : 0;
                  return (
                    <div key={range.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{range.label}</span>
                        <span className="font-medium">{range.count} użytkowników</span>
                      </div>
                      <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full transition-all duration-500"
                          style={{ width: `${percent}%`, backgroundColor: range.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wskaźniki sukcesu</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="90%" data={[
                    { name: 'Ukończenia', value: 68, fill: '#8884d8' },
                    { name: 'Zdawalność', value: 74, fill: '#82ca9d' },
                    { name: 'Zaangażowanie', value: 82, fill: '#ffc658' }
                  ]}>
                    <RadialBar dataKey="value" isAnimationActive={false} />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza kohortowa retencji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kohorta</TableHead>
                      <TableHead className="text-center">Tydzień 0</TableHead>
                      <TableHead className="text-center">Tydzień 1</TableHead>
                      <TableHead className="text-center">Tydzień 2</TableHead>
                      <TableHead className="text-center">Tydzień 3</TableHead>
                      <TableHead className="text-center">Liczba użytkowników</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohortAnalysis.map((cohort) => (
                      <TableRow key={cohort.cohort}>
                        <TableCell className="font-medium">{cohort.cohort}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-8 rounded"
                              style={{ backgroundColor: `rgba(34, 197, 94, ${cohort.week0 / 100})` }}>
                            {cohort.week0}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-8 rounded"
                              style={{ backgroundColor: `rgba(34, 197, 94, ${cohort.week1 / 100})` }}>
                            {cohort.week1}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-8 rounded"
                              style={{ backgroundColor: `rgba(34, 197, 94, ${cohort.week2 / 100})` }}>
                            {cohort.week2}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center justify-center w-16 h-8 rounded"
                              style={{ backgroundColor: `rgba(34, 197, 94, ${cohort.week3 / 100})` }}>
                            {cohort.week3}%
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{cohort.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Interpretacja:</strong> Wartości pokazują procent użytkowników z danej kohorty, którzy byli aktywni w kolejnych tygodniach po dołączeniu.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Czynniki wpływające na retencję</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-sm">Ukończenie pierwszego quizu</p>
                        <p className="text-xs text-muted-foreground">+42% retencji po 30 dniach</p>
                      </div>
                    </div>
                    <Badge variant="default">Kluczowy</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Osiągnięcie 100 punktów</p>
                        <p className="text-xs text-muted-foreground">+28% retencji po 30 dniach</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ważny</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">Dołączenie do grupy</p>
                        <p className="text-xs text-muted-foreground">+15% retencji po 30 dniach</p>
                      </div>
                    </div>
                    <Badge variant="outline">Pomocny</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prognoza churn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {allSegments.find(s => s.key === 'atRisk')?.count || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">użytkowników zagrożonych odejściem</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Główne przyczyny:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Brak aktywności powyżej 14 dni (78%)</li>
                      <li>• Niskie wyniki quizów (45%)</li>
                      <li>• Brak postępów w kursie (34%)</li>
                      <li>• Utrata daily streak (23%)</li>
                    </ul>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Wygeneruj kampanię reaktywacyjną
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Top 10 użytkowników
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500' : 
                          index === 1 ? 'bg-gray-100 text-gray-700 ring-2 ring-gray-400' :
                          index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' :
                          'bg-muted text-muted-foreground'}`}>
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarFallback className="text-xs">
                        {user.full_name?.split(' ').map((n: string) => n[0]).join('') || 
                          user.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || `Użytkownik ${index + 1}`}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ 
                              borderColor: SEGMENT_COLORS[user.segment as keyof typeof SEGMENT_COLORS] || '#8884d8',
                              color: SEGMENT_COLORS[user.segment as keyof typeof SEGMENT_COLORS] || '#8884d8'
                            }}
                          >
                            {allSegments.find(s => s.key === user.segment)?.name || user.segment}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Poziom {user.stats?.current_level || 0}
                          </Badge>
                          {user.stats && user.stats.daily_streak > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {user.stats.daily_streak} dni
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{user.stats?.total_points.toLocaleString('pl-PL') || 0}</p>
                      <p className="text-xs text-muted-foreground">punktów</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Najbardziej zaangażowani</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers
                    .filter(u => u.stats)
                    .sort((a, b) => (b.stats?.total_time_spent || 0) - (a.stats?.total_time_spent || 0))
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm">{user.full_name || `Użytkownik ${index + 1}`}</span>
                        <Badge variant="outline">
                          {Math.round((user.stats?.total_time_spent || 0) / 60)}h
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Najlepsze wyniki</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers
                    .filter(u => u.avgScore !== null)
                    .sort((a, b) => (a.avgScore! < b.avgScore! ? 1 : -1))
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm">{user.full_name || `Użytkownik ${index + 1}`}</span>
                        <Badge variant={user.avgScore! >= 80 ? "default" : "secondary"}>
                          {user.avgScore}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Najdłuższe serie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredUsers
                    .filter(u => u.stats)
                    .sort((a, b) => (b.stats?.daily_streak || 0) - (a.stats?.daily_streak || 0))
                    .slice(0, 5)
                    .map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <span className="text-sm">{user.full_name || `Użytkownik ${index + 1}`}</span>
                        <Badge variant="outline">
                          <Zap className="w-3 h-3 mr-1" />
                          {user.stats?.daily_streak} dni
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </SubPage>
  );
};
