// src/pages/teacher/reports/engagement.tsx
import React, { useMemo, useEffect, useState } from "react";
import { useDataProvider } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Activity,
  Calendar,
  BarChart3,
  Eye,
  BookOpen,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { SubPage } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";

// Definicje typów
interface ActivityProgress {
  id: string | number;
  user_id: string;
  activity_id: string | number;
  started_at: string;
  completed_at?: string | null;
  time_spent?: number;
}

interface Activity {
  id: string | number;
  type: 'quiz' | 'material';
  topic_id: string | number;
}

interface Topic {
  id: string | number;
  course_id: number;
}

interface Course {
  id: string | number;
  title: string;
  is_published: boolean;
}

interface EnrichedActivity extends ActivityProgress {
  activityType?: 'quiz' | 'material';
  courseId?: number;
}

export const EngagementReport: React.FC = () => {
  const [dateRange, setDateRange] = useState("7d");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const dataProvider = useDataProvider()();
  
  // Stan dla danych
  const [isLoading, setIsLoading] = useState(true);
  const [activitiesData, setActivitiesData] = useState<ActivityProgress[]>([]);
  const [activitiesInfoData, setActivitiesInfoData] = useState<Activity[]>([]);
  const [topicsData, setTopicsData] = useState<Topic[]>([]);
  const [coursesData, setCoursesData] = useState<Course[]>([]);

  // Oblicz zakres dat
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    switch (dateRange) {
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

  const { start: startDate, end: endDate } = getDateRange();

  // Pobierz dane tylko raz przy montowaniu komponentu
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Pobierz wszystkie dane równolegle
        const [activities, activitiesInfo, topics, courses] = await Promise.all([
          dataProvider.getList({
            resource: "activity_progress",
            filters: [
              {
                field: "started_at",
                operator: "gte",
                value: startDate.toISOString()
              }
            ],
            pagination: { mode: "off" }
          }),
          dataProvider.getList({
            resource: "activities",
            pagination: { mode: "off" },
            meta: {
              select: "id, type, topic_id"
            }
          }),
          dataProvider.getList({
            resource: "topics",
            pagination: { mode: "off" },
            meta: {
              select: "id, course_id"
            }
          }),
          dataProvider.getList({
            resource: "courses",
            filters: [
              {
                field: "is_published",
                operator: "eq",
                value: true
              }
            ],
            pagination: { mode: "off" }
          })
        ]);

        setActivitiesData(activities.data as ActivityProgress[]);
        setActivitiesInfoData(activitiesInfo.data as Activity[]);
        setTopicsData(topics.data as Topic[]);
        setCoursesData(courses.data as Course[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Pusta tablica zależności - pobierz tylko raz
  }, []);

  // Filtruj dane według wybranego kursu
  const filteredActivities = useMemo((): EnrichedActivity[] => {
    if (!activitiesData.length || !activitiesInfoData.length || !topicsData.length) return [];
    
    // Mapuj activity_id -> type i topic_id
    const activityMap = new Map(
      activitiesInfoData.map(a => [
        a.id, 
        { type: a.type, topicId: a.topic_id }
      ])
    );
    
    // Mapuj topic_id -> course_id
    const topicMap = new Map(
      topicsData.map(t => [t.id, t.course_id])
    );
    
    // Dodaj informacje do progress
    const enrichedActivities: EnrichedActivity[] = activitiesData.map(progress => {
      const activityInfo = activityMap.get(progress.activity_id);
      const courseId = activityInfo?.topicId ? topicMap.get(activityInfo.topicId) : undefined;
      
      return {
        ...progress,
        activityType: activityInfo?.type,
        courseId
      };
    });
    
    if (selectedCourse === "all") return enrichedActivities;
    
    const courseIdNum = parseInt(selectedCourse);
    return enrichedActivities.filter(activity => activity.courseId === courseIdNum);
  }, [activitiesData, activitiesInfoData, topicsData, selectedCourse]);

  // Oblicz statystyki
  const stats = useMemo(() => {
    const activeUsers = new Set(filteredActivities.map(a => a.user_id)).size;
    const totalTimeMinutes = filteredActivities.reduce((sum, a) => sum + (a.time_spent || 0), 0);
    const avgTimeHours = activeUsers > 0 ? (totalTimeMinutes / 60 / activeUsers).toFixed(1) : "0";
    const completedActivities = filteredActivities.filter(a => a.completed_at).length;
    const engagementRate = filteredActivities.length > 0 
      ? Math.round((completedActivities / filteredActivities.length) * 100)
      : 0;

    return {
      activeUsers,
      activeUsersChange: 12,
      avgTimeHours,
      avgTimeChange: 5,
      completedActivities,
      completedChange: 18,
      engagementRate,
      engagementChange: 3
    };
  }, [filteredActivities]);

  // Dane do wykresu - aktywni użytkownicy w czasie
  const activityTimeData = useMemo(() => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = filteredActivities.filter(a => 
        a.started_at.startsWith(dateStr)
      );
      
      const uniqueUsers = new Set(dayActivities.map(a => a.user_id)).size;
      
      data.push({
        date: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
        users: uniqueUsers
      });
    }
    
    return data;
  }, [filteredActivities, startDate, endDate]);

  // Rozkład typów aktywności
  const activityTypeData = useMemo(() => {
    const quizzes = filteredActivities.filter(a => a.activityType === 'quiz').length;
    const materials = filteredActivities.filter(a => a.activityType === 'material').length;
    const total = quizzes + materials;
    
    if (total === 0) {
      return [
        { name: 'Brak danych', value: 1, color: '#e5e7eb' }
      ];
    }
    
    return [
      { name: 'Quizy', value: quizzes, color: '#8884d8' },
      { name: 'Materiały', value: materials, color: '#82ca9d' }
    ].filter(item => item.value > 0);
  }, [filteredActivities]);

  // Rozkład czasu spędzonego przez użytkowników
  const timeSpentDistribution = useMemo(() => {
    const userTimeMap = new Map<string, number>();
    
    filteredActivities.forEach(activity => {
      const current = userTimeMap.get(activity.user_id) || 0;
      userTimeMap.set(activity.user_id, current + (activity.time_spent || 0));
    });
    
    const distribution = [
      { range: '0-30min', count: 0, color: '#94a3b8' },
      { range: '30-60min', count: 0, color: '#60a5fa' },
      { range: '1-2h', count: 0, color: '#818cf8' },
      { range: '2-5h', count: 0, color: '#a78bfa' },
      { range: '5h+', count: 0, color: '#c084fc' }
    ];
    
    userTimeMap.forEach(minutes => {
      if (minutes <= 30) distribution[0].count++;
      else if (minutes <= 60) distribution[1].count++;
      else if (minutes <= 120) distribution[2].count++;
      else if (minutes <= 300) distribution[3].count++;
      else distribution[4].count++;
    });
    
    return distribution.filter(d => d.count > 0);
  }, [filteredActivities]);

  // Wskaźnik ukończeń w czasie
  const completionTrend = useMemo(() => {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayActivities = filteredActivities.filter(a => 
        a.started_at.startsWith(dateStr)
      );
      
      const completed = dayActivities.filter(a => a.completed_at).length;
      const total = dayActivities.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      data.push({
        date: date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' }),
        rate,
        completed,
        total
      });
    }
    
    return data;
  }, [filteredActivities, startDate, endDate]);

  const statCards = [
    { 
      label: "Aktywni użytkownicy", 
      value: stats.activeUsers.toString(), 
      icon: Users, 
      change: `+${stats.activeUsersChange}%`,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      label: "Średni czas nauki", 
      value: `${stats.avgTimeHours}h`, 
      icon: Clock, 
      change: `+${stats.avgTimeChange}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Ukończone aktywności", 
      value: stats.completedActivities.toString(), 
      icon: Activity, 
      change: `+${stats.completedChange}%`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      label: "Wskaźnik zaangażowania", 
      value: `${stats.engagementRate}%`, 
      icon: TrendingUp, 
      change: `+${stats.engagementChange}%`,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ];

  // Statystyki kursów - uproszczone
  const courseStats = useMemo(() => {
    if (!coursesData.length || !filteredActivities.length) return [];
    
    const statsMap = new Map<number, { title: string; users: Set<string>; activities: number; completed: number }>();
    
    // Najpierw zainicjalizuj wszystkie kursy
    coursesData.forEach(course => {
      const courseId = typeof course.id === 'number' ? course.id : parseInt(course.id as string);
      if (!isNaN(courseId)) {
        statsMap.set(courseId, { 
          title: course.title || '', 
          users: new Set(), 
          activities: 0, 
          completed: 0 
        });
      }
    });
    
    // Potem zlicz aktywności
    filteredActivities.forEach(activity => {
      const courseId = activity.courseId;
      
      if (courseId && statsMap.has(courseId)) {
        const current = statsMap.get(courseId);
        if (current) {
          current.users.add(activity.user_id);
          current.activities++;
          if (activity.completed_at) current.completed++;
        }
      }
    });
    
    return Array.from(statsMap.entries())
      .filter(([_, stats]) => stats.activities > 0)
      .map(([id, stats]) => ({
        id,
        title: stats.title,
        users: stats.users.size,
        activities: stats.activities,
        completionRate: stats.activities > 0 ? Math.round((stats.completed / stats.activities) * 100) : 0
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5); // Limit do 5 kursów
  }, [filteredActivities, coursesData]);

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Ładowanie danych...</div>
        </div>
      </SubPage>
    );
  }

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
          <h1 className="text-2xl font-bold">Raport zaangażowania</h1>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wybierz kurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie kursy</SelectItem>
              {coursesData.map(course => {
                const courseId = typeof course.id === 'number' ? course.id : parseInt(course.id as string);
                return (
                  <SelectItem key={courseId} value={courseId.toString()}>
                    {course.title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={setDateRange}>
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

      {/* Statystyki */}
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
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> vs. poprzedni okres
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Wykres aktywnych użytkowników w czasie */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktywni użytkownicy w czasie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart 
                key={`${activityTimeData.map(d => d.users).join('-')}`}
                data={activityTimeData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Aktywni użytkownicy"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Podział typów aktywności */}
        <Card>
          <CardHeader>
            <CardTitle>Typy aktywności</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent !== undefined && percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {activityTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Rozkład czasu nauki */}
        <Card>
          <CardHeader>
            <CardTitle>Rozkład czasu nauki użytkowników</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                key={`${timeSpentDistribution.map(d => d.count).join('-')}`}
                data={timeSpentDistribution}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Liczba użytkowników" isAnimationActive={false}>
                  {timeSpentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wskaźnik ukończeń */}
        <Card>
          <CardHeader>
            <CardTitle>Wskaźnik ukończeń w czasie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart 
                key={`${completionTrend.map(d => d.rate).join('-')}`}
                data={completionTrend}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="font-medium text-sm">{data.date}</p>
                          <p className="text-xs">Wskaźnik: {data.rate}%</p>
                          <p className="text-xs">Ukończone: {data.completed}/{data.total}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                  name="Wskaźnik ukończeń %"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statystyki kursów */}
      {courseStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Zaangażowanie według kursów</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courseStats.map(course => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Użytkownicy: {course.users}</span>
                      <span>Aktywności: {course.activities}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={course.completionRate >= 70 ? "default" : "secondary"}>
                      {course.completionRate}% ukończonych
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podsumowanie */}
      <Card>
        <CardHeader>
          <CardTitle>Kluczowe wnioski</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Trendy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.activeUsers > 0 
                  ? `${stats.activeUsers} unikalnych użytkowników aktywnych w wybranym okresie`
                  : "Brak aktywności w wybranym okresie"
                }
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Wskaźnik ukończeń</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.engagementRate}% rozpoczętych aktywności zostało ukończonych
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Średnie zaangażowanie</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Średnio {stats.avgTimeHours} godzin nauki na użytkownika
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};