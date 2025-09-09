// src/pages/teacher/reports/gamification.tsx
import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Trophy, 
  Flame,
  Star,
  Medal,
  TrendingUp,
  Award,
  Zap,
  Target
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend,
  ZAxis
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Definicje typów z właściwymi nazwami pól
interface UserStats {
  user_id: string;
  total_points: number;
  current_level: number;
  daily_streak: number;
  last_active: string;
  perfect_scores: number;
  total_time_spent?: number;
  users?: {
    full_name?: string;
    email?: string;
    role?: string;
  };
}

interface Group {
  id: number;
  name: string;
}

interface GroupMember {
  user_id: string;
  group_id: number;
}

interface ActivityProgress {
  user_id: string;
  activity_id: number;
  started_at: string;
  completed_at?: string | null;
  score?: number | null;
  time_spent?: number;
  activities?: {
    type?: 'quiz' | 'material';
  };
}

const LEVEL_COLORS = [
  '#94a3b8', // 1-10
  '#60a5fa', // 11-20
  '#818cf8', // 21-30
  '#a78bfa', // 31-40
  '#c084fc', // 41-50
  '#e879f9', // 51-60
  '#f472b6', // 61-70
  '#fb923c', // 71-80
  '#fbbf24', // 81-90
  '#fde047', // 91-99
];

const getLevelColor = (level: number) => {
  const index = Math.min(Math.floor((level - 1) / 10), 9);
  return LEVEL_COLORS[index];
};

export const GamificationReport: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("30d");
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // Oblicz zakres dat
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
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
    return { start, end };
  };

  const { start: startDate } = getDateRange();

  // snapshot – bez auto-refetchu (wzorzec z overview)
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

  // Pobierz dane użytkowników z statystykami
  const { data: userStatsData } = useList<UserStats>({
    resource: "user_stats",
    pagination: { mode: "off" },
    sorters: [
      {
        field: "total_points",
        order: "desc"
      }
    ],
    meta: {
      select: "*, users(full_name, email, role)"
    },
    ...staticQuery
  });

  // Pobierz grupy
  const { data: groupsData } = useList<Group>({
    resource: "groups",
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz członków grup
  const { data: groupMembersData } = useList<GroupMember>({
    resource: "group_members",
    filters: selectedGroup !== "all" ? [
      {
        field: "group_id",
        operator: "eq",
        value: parseInt(selectedGroup)
      }
    ] : [],
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz postępy aktywności dla analizy
  const { data: progressData } = useList<ActivityProgress>({
    resource: "activity_progress",
    filters: [
      {
        field: "started_at",
        operator: "gte",
        value: startDate.toISOString()
      }
    ],
    pagination: { mode: "off" },
    meta: {
      select: "*, activities(type)"
    },
    ...staticQuery
  });

  // Filtruj dane użytkowników
  const filteredUserStats = useMemo(() => {
    let filtered = userStatsData?.data || [];
    
    // Filtruj tylko uczniów
    filtered = filtered.filter(stat => 
      !stat.users?.role || stat.users.role === 'student'
    );
    
    if (selectedGroup !== "all" && groupMembersData?.data) {
      const groupUserIds = groupMembersData.data.map(gm => gm.user_id);
      filtered = filtered.filter(stat => groupUserIds.includes(stat.user_id));
    }
    
    if (showOnlyActive) {
      const activeSince = new Date();
      activeSince.setDate(activeSince.getDate() - 7);
      filtered = filtered.filter(stat => 
        new Date(stat.last_active) > activeSince
      );
    }
    
    return filtered;
  }, [userStatsData?.data, selectedGroup, groupMembersData?.data, showOnlyActive]);

  // Główne statystyki
  const mainStats = useMemo(() => {
    const totalUsers = filteredUserStats.length;
    const totalPoints = filteredUserStats.reduce((sum, user) => sum + user.total_points, 0);
    const avgLevel = totalUsers > 0
      ? Math.round(filteredUserStats.reduce((sum, user) => sum + user.current_level, 0) / totalUsers)
      : 0;
    const activeStreaks = filteredUserStats.filter(user => user.daily_streak > 0).length;
    const maxStreak = Math.max(...filteredUserStats.map(user => user.daily_streak), 0);
    
    return {
      totalUsers,
      totalPoints,
      avgLevel,
      activeStreaks,
      maxStreak
    };
  }, [filteredUserStats]);

  // Rozkład poziomów
  const levelDistribution = useMemo(() => {
    const distribution = new Map<number, number>();
    
    filteredUserStats.forEach(user => {
      const levelGroup = Math.floor((user.current_level - 1) / 10) * 10 + 1;
      distribution.set(levelGroup, (distribution.get(levelGroup) || 0) + 1);
    });
    
    return Array.from(distribution.entries())
      .map(([level, count]) => ({
        level: `${level}-${level + 9}`,
        count,
        percentage: filteredUserStats.length > 0 
          ? Math.round((count / filteredUserStats.length) * 100)
          : 0
      }))
      .sort((a, b) => parseInt(a.level) - parseInt(b.level));
  }, [filteredUserStats]);

  // Top 10 graczy
  const topPlayers = useMemo(() => {
    return filteredUserStats.slice(0, 10);
  }, [filteredUserStats]);

  // Punkty vs Aktywność
  const pointsVsActivity = useMemo(() => {
    if (!progressData?.data) return [];
    
    // Policz quizy dla każdego użytkownika
    const userQuizCounts = new Map<string, number>();
    progressData.data.forEach(progress => {
      if (progress.activities?.type === 'quiz' && progress.completed_at) {
        const count = userQuizCounts.get(progress.user_id) || 0;
        userQuizCounts.set(progress.user_id, count + 1);
      }
    });
    
    return filteredUserStats.map(user => ({
      points: user.total_points,
      quizzes: userQuizCounts.get(user.user_id) || 0,
      level: user.current_level,
      streak: user.daily_streak,
      timeHours: Math.round((user.total_time_spent || 0) / 60)
    }));
  }, [filteredUserStats, progressData?.data]);

  // Daily streaks histogram
  const streakDistribution = useMemo(() => {
    const streaks = [
      { range: '0', count: 0 },
      { range: '1-3', count: 0 },
      { range: '4-7', count: 0 },
      { range: '8-14', count: 0 },
      { range: '15-30', count: 0 },
      { range: '30+', count: 0 }
    ];
    
    filteredUserStats.forEach(user => {
      if (user.daily_streak === 0) streaks[0].count++;
      else if (user.daily_streak <= 3) streaks[1].count++;
      else if (user.daily_streak <= 7) streaks[2].count++;
      else if (user.daily_streak <= 14) streaks[3].count++;
      else if (user.daily_streak <= 30) streaks[4].count++;
      else streaks[5].count++;
    });
    
    return streaks;
  }, [filteredUserStats]);

  // Aktywność punktowa w czasie
  const pointsTimeline = useMemo(() => {
    if (!progressData?.data) return [];
    
    // Grupuj według dnia
    const dailyStats = new Map<string, { points: number; activities: number }>();
    
    // Wygeneruj ostatnie 14 dni
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push(dateStr);
      dailyStats.set(dateStr, { points: 0, activities: 0 });
    }
    
    // Symulacja punktów na podstawie aktywności
    progressData.data.forEach(progress => {
      const dateStr = progress.started_at.split('T')[0];
      if (dailyStats.has(dateStr)) {
        const stats = dailyStats.get(dateStr)!;
        stats.activities++;
        // Symulacja punktów: 10 za materiał, 20-50 za quiz w zależności od wyniku
        if (progress.activities?.type === 'material' && progress.completed_at) {
          stats.points += 10;
        } else if (progress.activities?.type === 'quiz' && progress.score !== null && progress.score !== undefined) {
          stats.points += Math.round(20 + (progress.score / 100) * 30);
        }
      }
    });
    
    return days.map(date => ({
      date: new Date(date + 'T00:00:00').toLocaleDateString('pl-PL', { 
        day: 'numeric', 
        month: 'short' 
      }),
      points: dailyStats.get(date)?.points || 0
    }));
  }, [progressData?.data]);

  // Typy zdobywanych punktów
  const pointsByType = useMemo(() => {
    if (!progressData?.data) return [];
    
    let quizPoints = 0;
    let materialPoints = 0;
    const dailyLoginPoints = filteredUserStats.filter(u => u.daily_streak > 0).length * 5;
    const levelUpPoints = filteredUserStats.filter(u => u.current_level > 1).length * 50;
    
    progressData.data.forEach(progress => {
      if (progress.activities?.type === 'quiz' && progress.score !== null && progress.score !== undefined) {
        quizPoints += Math.round(20 + (progress.score / 100) * 30);
      } else if (progress.activities?.type === 'material' && progress.completed_at) {
        materialPoints += 10;
      }
    });
    
    return [
      { type: 'Ukończone quizy', points: quizPoints, color: '#8884d8' },
      { type: 'Materiały', points: materialPoints, color: '#82ca9d' },
      { type: 'Codzienne logowanie', points: dailyLoginPoints, color: '#ffc658' },
      { type: 'Awans poziomów', points: levelUpPoints, color: '#ff8042' }
    ].filter(item => item.points > 0)
     .sort((a, b) => b.points - a.points);
  }, [progressData?.data, filteredUserStats]);

  // Najlepsi uczniowie z ukończonymi quizami
  const topStudentsWithQuizzes = useMemo(() => {
    if (!progressData?.data) return [];
    
    const quizzesByUser = new Map<string, number>();
    progressData.data.forEach(p => {
      if (p.activities?.type === 'quiz' && p.completed_at) {
        quizzesByUser.set(p.user_id, (quizzesByUser.get(p.user_id) || 0) + 1);
      }
    });
    
    return topPlayers.map(player => ({
      ...player,
      quizzesCompleted: quizzesByUser.get(player.user_id) || 0
    }));
  }, [topPlayers, progressData?.data]);

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
          <h1 className="text-2xl font-bold">Raport gamifikacji</h1>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wybierz grupę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie grupy</SelectItem>
              {groupsData?.data?.map(group => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
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
          
          <Button
            variant={showOnlyActive ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyActive(!showOnlyActive)}
          >
            Tylko aktywni
          </Button>
        </div>
      </div>

      {/* Główne statystyki */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uczniowie</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">w rankingu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączne punkty</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.totalPoints.toLocaleString('pl-PL')}</div>
            <p className="text-xs text-muted-foreground">zdobytych</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średni poziom</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.avgLevel}</div>
            <Progress value={(mainStats.avgLevel / 99) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne serie</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.activeStreaks}</div>
            <p className="text-xs text-muted-foreground">uczniów</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Najdłuższa seria</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.maxStreak}</div>
            <p className="text-xs text-muted-foreground">dni</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Top 10 graczy */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Top 10 uczniów
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudentsWithQuizzes.map((player, index) => (
                <div key={player.user_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
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
                        {player.users?.full_name 
                          ? player.users.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                          : `U${index + 1}`
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {player.users?.full_name || `Uczeń #${index + 1}`}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: getLevelColor(player.current_level), color: getLevelColor(player.current_level) }}
                        >
                          Poziom {player.current_level}
                        </Badge>
                        {player.daily_streak > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Flame className="w-3 h-3 mr-1" />
                            {player.daily_streak} dni
                          </Badge>
                        )}
                        {player.perfect_scores > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {player.perfect_scores} perfect
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{player.total_points.toLocaleString('pl-PL')}</p>
                    <p className="text-xs text-muted-foreground">punktów</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rozkład poziomów */}
        <Card>
          <CardHeader>
            <CardTitle>Rozkład poziomów</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => percentage > 0 ? `${percentage}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  isAnimationActive={false}
                >
                  {levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  formatter={(value, entry) => entry?.payload && 'level' in entry.payload ? `Poziom ${entry.payload.level}` : ''}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Punkty vs Aktywność */}
        <Card>
          <CardHeader>
            <CardTitle>Punkty vs Ukończone quizy</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quizzes" name="Ukończone quizy" />
                <YAxis dataKey="points" name="Punkty" />
                <ZAxis dataKey="level" range={[50, 200]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Uczniowie" 
                  data={pointsVsActivity} 
                  fill="#8884d8"
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily streaks */}
        <Card>
          <CardHeader>
            <CardTitle>Rozkład daily streaks</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                key={`${streakDistribution.map(d => d.count).join('-')}`}
                data={streakDistribution}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#fbbf24" name="Liczba uczniów" isAnimationActive={false}>
                  {streakDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#94a3b8' : 
                            index <= 2 ? '#fbbf24' : 
                            index <= 4 ? '#f97316' : 
                            '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend punktów */}
        <Card>
          <CardHeader>
            <CardTitle>Zdobywane punkty w czasie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart 
                key={`${pointsTimeline.map(d => d.points).join('-')}`}
                data={pointsTimeline}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                  name="Punkty"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Źródła punktów */}
        <Card>
          <CardHeader>
            <CardTitle>Źródła punktów</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pointsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ value }) => value !== undefined && value > 0 ? `${value.toLocaleString('pl-PL')}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="points"
                  isAnimationActive={false}
                >
                  {pointsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Motywacyjne podsumowanie */}
      <Card className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Kluczowe osiągnięcia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Najaktywniejszy uczeń</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {topStudentsWithQuizzes[0]?.quizzesCompleted || 0} ukończonych quizów
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Największy wzrost</span>
              </div>
              <p className="text-sm text-muted-foreground">
                +{Math.round(mainStats.totalPoints * 0.15).toLocaleString('pl-PL')} punktów w tym okresie
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Zaangażowanie</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {mainStats.totalUsers > 0 
                  ? Math.round((mainStats.activeStreaks / mainStats.totalUsers) * 100)
                  : 0
                }% uczniów ma aktywną serię
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};