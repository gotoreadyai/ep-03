// src/pages/teacher/reports/progress.tsx
import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  TrendingUp, 
  BookOpen, 
  Users,
  Target,
  Filter,
  Download,
  ChevronDown,
  ChevronUp
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
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  Cell
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CourseProgress {
  courseId: number;
  courseTitle: string;
  totalActivities: number;
  completedActivities: number;
  avgScore: number | null;
  totalStudents: number;
  activeStudents: number;
}

interface StudentProgress {
  userId: string;
  userName?: string;
  courseId: number;
  courseTitle: string;
  completedActivities: number;
  totalActivities: number;
  avgScore: number | null;
  lastActivity: string | null;
  timeSpent: number;
}

export const ProgressReport: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"progress" | "score" | "activity">("progress");

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

  // Pobierz kursy
  const { data: coursesData } = useList({
    resource: "courses",
    filters: [
      {
        field: "is_published",
        operator: "eq",
        value: true
      }
    ],
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz aktywności (potrzebujemy ich do policzenia ile jest w każdym kursie)
  const { data: activitiesData } = useList({
    resource: "activities",
    filters: [
      {
        field: "is_published",
        operator: "eq",
        value: true
      }
    ],
    pagination: { mode: "off" },
    meta: {
      select: "id, topic_id, type, topics(id, course_id)"
    },
    ...staticQuery
  });

  // Pobierz postępy
  const { data: progressData } = useList({
    resource: "activity_progress",
    pagination: { mode: "off" },
    meta: {
      select: "*, activities(id, topic_id, type, topics(id, course_id))"
    },
    ...staticQuery
  });

  // Pobierz grupy
  const { data: groupsData } = useList({
    resource: "groups",
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz członków grup
  const { data: groupMembersData } = useList({
    resource: "group_members",
    pagination: { mode: "off" },
    filters: selectedGroup !== "all" ? [
      {
        field: "group_id",
        operator: "eq",
        value: parseInt(selectedGroup)
      }
    ] : [],
    ...staticQuery
  });

  // Przygotuj dane o postępach kursów
  const courseProgressData = useMemo(() => {
    if (!coursesData?.data || !activitiesData?.data || !progressData?.data) return [];

    const courseMap = new Map<number, CourseProgress>();

    coursesData.data.forEach(course => {
      const courseId = typeof course.id === 'number' ? course.id : parseInt(course.id as string);
      
      // Policz aktywności w kursie
      const courseActivities = activitiesData.data.filter(a => 
        a.topics?.course_id === courseId
      );
      const totalActivities = courseActivities.length;

      // Policz postępy
      const courseProgress = progressData.data.filter(p => 
        p.activities?.topics?.course_id === courseId
      );

      // Filtruj według grupy
      const filteredProgress = selectedGroup !== "all" && groupMembersData?.data
        ? courseProgress.filter(p => 
            groupMembersData.data.some(gm => gm.user_id === p.user_id)
          )
        : courseProgress;

      const uniqueStudents = new Set(filteredProgress.map(p => p.user_id));
      const completedByStudent = new Map<string, number>();
      const scoresByStudent = new Map<string, number[]>();

      filteredProgress.forEach(p => {
        if (p.completed_at) {
          const count = completedByStudent.get(p.user_id) || 0;
          completedByStudent.set(p.user_id, count + 1);
        }
        if (p.score !== null && p.score !== undefined) {
          const scores = scoresByStudent.get(p.user_id) || [];
          scores.push(Number(p.score));
          scoresByStudent.set(p.user_id, scores);
        }
      });

      const activeStudents = completedByStudent.size;
      const avgCompleted = activeStudents > 0
        ? Array.from(completedByStudent.values()).reduce((a, b) => a + b, 0) / activeStudents
        : 0;

      const allScores = Array.from(scoresByStudent.values()).flat();
      const avgScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : null;

      courseMap.set(courseId, {
        courseId,
        courseTitle: course.title || '',
        totalActivities,
        completedActivities: Math.round(avgCompleted),
        avgScore,
        totalStudents: uniqueStudents.size,
        activeStudents
      });
    });

    return Array.from(courseMap.values())
      .filter(c => c.totalActivities > 0) // Tylko kursy z aktywnościami
      .sort((a, b) => {
        const aProgress = a.totalActivities > 0 ? (a.completedActivities / a.totalActivities) : 0;
        const bProgress = b.totalActivities > 0 ? (b.completedActivities / b.totalActivities) : 0;
        return bProgress - aProgress;
      });
  }, [coursesData?.data, activitiesData?.data, progressData?.data, selectedGroup, groupMembersData?.data]);

  // Przygotuj dane o postępach studentów
  const studentProgressData = useMemo(() => {
    if (!progressData?.data || !courseProgressData.length) return [];

    const studentMap = new Map<string, Map<number, StudentProgress>>();

    courseProgressData.forEach(course => {
      const courseProgress = progressData.data.filter(p => 
        p.activities?.topics?.course_id === course.courseId
      );

      // Filtruj według grupy
      const filteredProgress = selectedGroup !== "all" && groupMembersData?.data
        ? courseProgress.filter(p => 
            groupMembersData.data.some(gm => gm.user_id === p.user_id)
          )
        : courseProgress;

      // Grupuj według studenta
      filteredProgress.forEach(p => {
        if (!studentMap.has(p.user_id)) {
          studentMap.set(p.user_id, new Map());
        }
        
        const studentCourses = studentMap.get(p.user_id)!;
        
        if (!studentCourses.has(course.courseId)) {
          studentCourses.set(course.courseId, {
            userId: p.user_id,
            courseId: course.courseId,
            courseTitle: course.courseTitle,
            completedActivities: 0,
            totalActivities: course.totalActivities,
            avgScore: null,
            lastActivity: null,
            timeSpent: 0
          });
        }
        
        const current = studentCourses.get(course.courseId)!;

        if (p.completed_at) {
          current.completedActivities++;
        }

        if (p.score !== null && p.score !== undefined) {
          const scores: number[] = [];
          if (current.avgScore !== null) {
            // Przybliżone odtworzenie poprzednich wyników
            scores.push(current.avgScore);
          }
          scores.push(Number(p.score));
          current.avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        }

        current.timeSpent += p.time_spent || 0;

        if (!current.lastActivity || new Date(p.started_at) > new Date(current.lastActivity)) {
          current.lastActivity = p.started_at;
        }
      });
    });

    // Przekształć na płaską listę i posortuj
    const flatList: StudentProgress[] = [];
    studentMap.forEach((courses) => {
      courses.forEach(progress => {
        flatList.push(progress);
      });
    });

    return flatList.sort((a, b) => {
      switch (sortBy) {
        case "progress": {
          const aProgress = a.totalActivities > 0 ? (a.completedActivities / a.totalActivities) : 0;
          const bProgress = b.totalActivities > 0 ? (b.completedActivities / b.totalActivities) : 0;
          return bProgress - aProgress;
        }
        case "score":
          return (b.avgScore || 0) - (a.avgScore || 0);
        case "activity":
          return new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime();
        default:
          return 0;
      }
    });
  }, [progressData?.data, courseProgressData, selectedGroup, groupMembersData?.data, sortBy]);

  // Przygotuj dane lejka konwersji
  const funnelData = useMemo(() => {
    const stages = [
      { name: "Rozpoczęli kurs", value: 0, fill: "#8884d8" },
      { name: "Ukończyli 25%", value: 0, fill: "#83a6ed" },
      { name: "Ukończyli 50%", value: 0, fill: "#8dd1e1" },
      { name: "Ukończyli 75%", value: 0, fill: "#82ca9d" },
      { name: "Ukończyli 100%", value: 0, fill: "#67b26f" }
    ];

    const studentProgress = new Map<string, number>();

    studentProgressData.forEach(sp => {
      const progress = sp.totalActivities > 0 
        ? (sp.completedActivities / sp.totalActivities) * 100
        : 0;
      
      const currentMax = studentProgress.get(sp.userId) || 0;
      studentProgress.set(sp.userId, Math.max(currentMax, progress));
    });

    studentProgress.forEach(progress => {
      if (progress > 0) stages[0].value++;
      if (progress >= 25) stages[1].value++;
      if (progress >= 50) stages[2].value++;
      if (progress >= 75) stages[3].value++;
      if (progress >= 100) stages[4].value++;
    });

    return stages;
  }, [studentProgressData]);

  // Statystyki główne
  const mainStats = useMemo(() => {
    const totalStudents = new Set(studentProgressData.map(sp => sp.userId)).size;
    const activeStudents = new Set(
      studentProgressData.filter(sp => sp.completedActivities > 0).map(sp => sp.userId)
    ).size;
    const avgCompletion = courseProgressData.length > 0
      ? Math.round(
          courseProgressData.reduce((sum, c) => 
            sum + (c.totalActivities > 0 ? (c.completedActivities / c.totalActivities) * 100 : 0), 0
          ) / courseProgressData.length
        )
      : 0;
    
    const coursesWithScores = courseProgressData.filter(c => c.avgScore !== null);
    const avgScore = coursesWithScores.length > 0
      ? Math.round(
          coursesWithScores.reduce((sum, c) => sum + c.avgScore!, 0) / coursesWithScores.length
        )
      : 0;

    return {
      totalStudents,
      activeStudents,
      avgCompletion,
      avgScore
    };
  }, [studentProgressData, courseProgressData]);

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
          <h1 className="text-2xl font-bold">Raport postępów</h1>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wybierz grupę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie grupy</SelectItem>
              {groupsData?.data?.map(group => (
                <SelectItem 
                  key={group.id || 'unknown'} 
                  value={group.id?.toString() || ''}
                >
                  {group.name || 'Bez nazwy'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Eksportuj
          </Button>
        </div>
      </div>

      {/* Główne statystyki */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszyscy uczniowie</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              w wybranych grupach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni uczniowie</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              {mainStats.totalStudents > 0 
                ? `${Math.round((mainStats.activeStudents / mainStats.totalStudents) * 100)}% wszystkich`
                : '0% wszystkich'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średni postęp</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.avgCompletion}%</div>
            <Progress value={mainStats.avgCompletion} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Średni wynik</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.avgScore}%</div>
            <p className="text-xs text-muted-foreground">
              z ukończonych quizów
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Postęp kursów */}
        <Card>
          <CardHeader>
            <CardTitle>Postęp według kursów</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={courseProgressData} 
                layout="vertical"
                key={`${courseProgressData.map(c => c.courseId).join('-')}`}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  dataKey="courseTitle" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any) => `${value}%`}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="font-medium text-sm">{data.courseTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            Ukończono: {data.completedActivities}/{data.totalActivities} aktywności
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Aktywnych: {data.activeStudents}/{data.totalStudents} uczniów
                          </p>
                          {data.avgScore !== null && (
                            <p className="text-xs text-muted-foreground">
                              Średni wynik: {data.avgScore}%
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey={(data: CourseProgress) => {
                    const progress = data.totalActivities > 0 
                      ? Math.round((data.completedActivities / data.totalActivities) * 100)
                      : 0;
                    return progress;
                  }}
                  fill="#8884d8"
                  name="Postęp"
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lejek konwersji */}
        <Card>
          <CardHeader>
            <CardTitle>Lejek ukończeń</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive={false}
                >
                  <LabelList position="center" fill="#fff" />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Szczegółowa tabela postępów */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Szczegółowe postępy uczniów</span>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Sortuj wg postępu</SelectItem>
                  <SelectItem value="score">Sortuj wg wyniku</SelectItem>
                  <SelectItem value="activity">Sortuj wg aktywności</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Uczeń</TableHead>
                  <TableHead>Kurs</TableHead>
                  <TableHead>Postęp</TableHead>
                  <TableHead>Średni wynik</TableHead>
                  <TableHead>Czas nauki</TableHead>
                  <TableHead>Ostatnia aktywność</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentProgressData.slice(0, 20).map((student, idx) => {
                  const progress = student.totalActivities > 0 
                    ? Math.round((student.completedActivities / student.totalActivities) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={`${student.userId}-${student.courseId}`}>
                      <TableCell className="font-medium">
                        Uczeń #{idx + 1}
                      </TableCell>
                      <TableCell>{student.courseTitle}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="w-[60px]" />
                          <span className="text-sm text-muted-foreground">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.avgScore !== null ? (
                          <Badge variant={student.avgScore >= 70 ? "default" : "secondary"}>
                            {student.avgScore}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {Math.floor(student.timeSpent / 60)}h {student.timeSpent % 60}m
                      </TableCell>
                      <TableCell>
                        {student.lastActivity 
                          ? new Date(student.lastActivity).toLocaleDateString('pl-PL')
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {studentProgressData.length > 20 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Zobacz wszystkich ({studentProgressData.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};