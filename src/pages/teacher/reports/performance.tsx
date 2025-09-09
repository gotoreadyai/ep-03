// src/pages/teacher/reports/performance.tsx
import React, { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Target, 
  TrendingDown,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Download
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
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  ComposedChart,
  Area
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Activity {
  id: number;
  title: string;
  type: string;
  topic_id: number;
  passing_score?: number;
  is_published: boolean;
}

interface Topic {
  id: number;
  title: string;
  course_id: number;
}

interface Course {
  id: number;
  title: string;
}

interface ActivityProgress {
  id: number;
  user_id: string;
  activity_id: number;
  started_at: string;
  completed_at?: string | null;
  score?: number | null;
  time_spent?: number;
}

interface QuizResult {
  activityId: number;
  activityTitle: string;
  topicTitle: string;
  courseTitle: string;
  attempts: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  passRate: number;
  passingScore: number;
}

interface Question {
  id: number;
  activity_id: number;
  question: string;
  order_index: number;
}

interface QuestionAnalysis {
  questionId: number;
  question: string;
  activityTitle: string;
  quizAttempts: number;
  avgQuizScore: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
}

export const PerformanceReport: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

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

  const { start: startDate } = getDateRange();

  // Pobierz pytania dla quizów
  const { data: questionsData } = useList<Question>({
    resource: "questions",
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz kursy
  const { data: coursesData } = useList<Course>({
    resource: "courses",
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz tematy
  const { data: topicsData } = useList<Topic>({
    resource: "topics",
    filters: selectedCourse !== "all" ? [
      {
        field: "course_id",
        operator: "eq",
        value: parseInt(selectedCourse)
      }
    ] : [],
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz aktywności (quizy)
  const { data: activitiesData } = useList<Activity>({
    resource: "activities",
    filters: [
      {
        field: "type",
        operator: "eq",
        value: "quiz"
      },
      {
        field: "is_published",
        operator: "eq",
        value: true
      }
    ],
    pagination: { mode: "off" },
    ...staticQuery
  });

  // Pobierz postępy z wynikami
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
      // Filtrujemy tylko te z wynikami po stronie klienta
      query: (q: any) => q.not("score", "is", null)
    },
    ...staticQuery
  });

  // Mapuj dane - połącz activities z topics i courses
  const enrichedActivities = useMemo(() => {
    if (!activitiesData?.data || !topicsData?.data || !coursesData?.data) return [];
    
    const topicMap = new Map(topicsData.data.map(t => [t.id, t]));
    const courseMap = new Map(coursesData.data.map(c => [c.id, c]));
    
    return activitiesData.data.map(activity => {
      const topic = topicMap.get(activity.topic_id);
      const course = topic ? courseMap.get(topic.course_id) : undefined;
      
      return {
        ...activity,
        topicTitle: topic?.title || '',
        courseId: course?.id,
        courseTitle: course?.title || ''
      };
    });
  }, [activitiesData?.data, topicsData?.data, coursesData?.data]);

  // Filtruj aktywności
  const filteredActivities = useMemo(() => {
    let filtered = enrichedActivities;
    
    if (selectedCourse !== "all") {
      filtered = filtered.filter(a => a.courseId === parseInt(selectedCourse));
    }
    
    if (selectedTopic !== "all") {
      filtered = filtered.filter(a => a.topic_id === parseInt(selectedTopic));
    }
    
    return filtered;
  }, [enrichedActivities, selectedCourse, selectedTopic]);

  // Filtruj postępy
  const filteredProgress = useMemo(() => {
    if (!progressData?.data) return [];
    
    const activityIds = filteredActivities.map(a => a.id);
    return progressData.data.filter(p => 
      activityIds.includes(p.activity_id) && p.score !== null && p.score !== undefined
    );
  }, [progressData?.data, filteredActivities]);

  // Analiza wyników quizów
  const quizResults = useMemo(() => {
    const results = new Map<number, QuizResult>();
    
    filteredActivities.forEach(activity => {
      const quizProgress = filteredProgress.filter(p => p.activity_id === activity.id);
      
      if (quizProgress.length > 0) {
        const scores = quizProgress
          .filter(p => p.score !== null && p.score !== undefined)
          .map(p => p.score as number);
        
        if (scores.length === 0) return; // Skip if no valid scores
        
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const passRate = Math.round(
          (scores.filter(s => s >= (activity.passing_score || 70)).length / scores.length) * 100
        );
        
        results.set(activity.id, {
          activityId: activity.id,
          activityTitle: activity.title,
          topicTitle: activity.topicTitle,
          courseTitle: activity.courseTitle,
          attempts: quizProgress.length,
          avgScore,
          minScore: Math.min(...scores),
          maxScore: Math.max(...scores),
          passRate,
          passingScore: activity.passing_score || 70
        });
      }
    });
    
    return Array.from(results.values()).sort((a, b) => a.avgScore - b.avgScore);
  }, [filteredActivities, filteredProgress]);

  // Główne statystyki
  const mainStats = useMemo(() => {
    const totalAttempts = filteredProgress.length;
    const validScores = filteredProgress
      .filter(p => p.score !== null && p.score !== undefined)
      .map(p => p.score as number);
    
    const avgScore = validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;
    
    // Znajdź passing score dla każdego progress
    const passedAttempts = filteredProgress.filter(p => {
      if (p.score === null || p.score === undefined) return false;
      const activity = filteredActivities.find(a => a.id === p.activity_id);
      const passingScore = activity?.passing_score || 70;
      return p.score >= passingScore;
    }).length;
    
    const passRate = totalAttempts > 0
      ? Math.round((passedAttempts / totalAttempts) * 100)
      : 0;
    
    // Porównanie z poprzednim okresem (mock)
    const avgScoreChange = 3;
    const passRateChange = 5;
    
    return {
      totalAttempts,
      avgScore,
      avgScoreChange,
      passRate,
      passRateChange,
      uniqueStudents: new Set(filteredProgress.map(p => p.user_id)).size,
      totalQuizzes: filteredActivities.length
    };
  }, [filteredProgress, filteredActivities]);

  // Rozkład wyników
  const scoreDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', count: 0, color: '#ef4444' },
      { range: '21-40%', count: 0, color: '#f97316' },
      { range: '41-60%', count: 0, color: '#eab308' },
      { range: '61-80%', count: 0, color: '#84cc16' },
      { range: '81-100%', count: 0, color: '#22c55e' }
    ];
    
    filteredProgress.forEach(p => {
      const score = p.score || 0;
      if (score <= 20) ranges[0].count++;
      else if (score <= 40) ranges[1].count++;
      else if (score <= 60) ranges[2].count++;
      else if (score <= 80) ranges[3].count++;
      else ranges[4].count++;
    });
    
    return ranges;
  }, [filteredProgress]);

  // Wyniki według tematów (dla wykresu radarowego)
  const topicPerformance = useMemo(() => {
    const topicMap = new Map<string, { scores: number[], topic: string }>();
    
    filteredProgress.forEach(p => {
      const activity = filteredActivities.find(a => a.id === p.activity_id);
      if (activity?.topicTitle && p.score !== null && p.score !== undefined) {
        const existing = topicMap.get(activity.topicTitle) || { scores: [], topic: activity.topicTitle };
        existing.scores.push(p.score);
        topicMap.set(activity.topicTitle, existing);
      }
    });
    
    return Array.from(topicMap.values())
      .map(({ topic, scores }) => ({
        topic: topic.length > 20 ? topic.substring(0, 20) + '...' : topic,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        attempts: scores.length
      }))
      .slice(0, 8); // Limit do 8 tematów dla czytelności
  }, [filteredProgress, filteredActivities]);

  // Trend wyników w czasie
  const performanceTrend = useMemo(() => {
    const dailyScores = new Map<string, number[]>();
    
    filteredProgress.forEach(p => {
      const date = new Date(p.started_at).toLocaleDateString('pl-PL');
      const scores = dailyScores.get(date) || [];
      if (p.score !== null && p.score !== undefined) {
        scores.push(p.score);
        dailyScores.set(date, scores);
      }
    });
    
    return Array.from(dailyScores.entries())
      .map(([date, scores]) => ({
        date,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        attempts: scores.length,
        minScore: Math.min(...scores),
        maxScore: Math.max(...scores)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Ostatnie 14 dni
  }, [filteredProgress]);

  // Najtrudniejsze quizy i pytania - na podstawie wyników
  const difficultQuestions = useMemo(() => {
    if (!questionsData?.data || !quizResults.length) return [];
    
    // Weź 5 najtrudniejszych quizów (już posortowane po avgScore rosnąco)
    const hardestQuizzes = quizResults.slice(0, 5);
    
    const questionAnalysis: QuestionAnalysis[] = [];
    
    hardestQuizzes.forEach(quiz => {
      // Znajdź pytania dla tego quizu
      const quizQuestions = questionsData.data
        .filter(q => q.activity_id === quiz.activityId)
        .sort((a, b) => a.order_index - b.order_index);
      
      // Dodaj każde pytanie z informacją o trudności quizu
      quizQuestions.forEach((question, index) => {
        let difficulty: 'easy' | 'medium' | 'hard' | 'very-hard' = 'medium';
        if (quiz.avgScore < 30) difficulty = 'very-hard';
        else if (quiz.avgScore < 50) difficulty = 'hard';
        else if (quiz.avgScore < 70) difficulty = 'medium';
        else difficulty = 'easy';
        
        questionAnalysis.push({
          questionId: question.id,
          question: question.question,
          activityTitle: quiz.activityTitle,
          quizAttempts: quiz.attempts,
          avgQuizScore: quiz.avgScore,
          difficulty
        });
      });
    });
    
    // Sortuj po średnim wyniku quizu (najtrudniejsze pierwsze)
    return questionAnalysis
      .sort((a, b) => a.avgQuizScore - b.avgQuizScore)
      .slice(0, 10); // Top 10 pytań
  }, [questionsData?.data, quizResults]);

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
          <h1 className="text-2xl font-bold">Raport wyników</h1>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wybierz kurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie kursy</SelectItem>
              {coursesData?.data?.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedTopic} 
            onValueChange={setSelectedTopic}
            disabled={selectedCourse === "all"}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Wybierz temat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie tematy</SelectItem>
              {topicsData?.data?.map(topic => (
                <SelectItem key={topic.id} value={topic.id.toString()}>
                  {topic.title}
                </SelectItem>
              ))}
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
            <CardTitle className="text-sm font-medium">Średni wynik</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.avgScore}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={mainStats.avgScoreChange > 0 ? "text-green-600" : "text-red-600"}>
                {mainStats.avgScoreChange > 0 ? <TrendingUp className="inline h-3 w-3" /> : <TrendingDown className="inline h-3 w-3" />}
                {' '}{Math.abs(mainStats.avgScoreChange)}%
              </span>
              {' '}vs. poprzedni okres
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wskaźnik zdawalności</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.passRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className={mainStats.passRateChange > 0 ? "text-green-600" : "text-red-600"}>
                {mainStats.passRateChange > 0 ? "+" : ""}{mainStats.passRateChange}%
              </span>
              {' '}vs. poprzedni okres
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liczba podejść</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground">
              {mainStats.uniqueStudents} unikalnych uczniów
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liczba quizów</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainStats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              aktywnych w okresie
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Rozkład wyników</TabsTrigger>
          <TabsTrigger value="topics">Wyniki według tematów</TabsTrigger>
          <TabsTrigger value="trend">Trend w czasie</TabsTrigger>
          <TabsTrigger value="difficult">Najtrudniejsze pytania</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Histogram wyników */}
            <Card>
              <CardHeader>
                <CardTitle>Rozkład wyników</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Liczba wyników" isAnimationActive={false}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lista najsłabszych quizów */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Quizy wymagające uwagi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {quizResults.slice(0, 5).map((quiz) => (
                    <div key={quiz.activityId} className="space-y-2 pb-3 border-b last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{quiz.activityTitle}</p>
                          <p className="text-xs text-muted-foreground">{quiz.topicTitle}</p>
                        </div>
                        <Badge variant={quiz.avgScore < 50 ? "destructive" : "secondary"}>
                          {quiz.avgScore}%
                        </Badge>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Zdawalność: {quiz.passRate}%</span>
                        <span>Próby: {quiz.attempts}</span>
                        <span>Min/Max: {quiz.minScore}%/{quiz.maxScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Wykres radarowy */}
            <Card>
              <CardHeader>
                <CardTitle>Średnie wyniki według tematów</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={topicPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="topic" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar 
                      name="Średni wynik" 
                      dataKey="avgScore" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                      isAnimationActive={false}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabela wyników według tematów */}
            <Card>
              <CardHeader>
                <CardTitle>Szczegółowe wyniki</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Temat</TableHead>
                      <TableHead className="text-right">Średni wynik</TableHead>
                      <TableHead className="text-right">Liczba prób</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topicPerformance.map((topic) => (
                      <TableRow key={topic.topic}>
                        <TableCell className="font-medium">{topic.topic}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={topic.avgScore >= 70 ? "default" : "secondary"}>
                            {topic.avgScore}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{topic.attempts}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend wyników w czasie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="maxScore"
                    fill="#8884d8"
                    stroke="#8884d8"
                    fillOpacity={0.2}
                    name="Max"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="minScore"
                    fill="#82ca9d"
                    stroke="#82ca9d"
                    fillOpacity={0.2}
                    name="Min"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#ff7300"
                    strokeWidth={3}
                    name="Średnia"
                    dot={{ fill: '#ff7300' }}
                    isAnimationActive={false}
                  />
                  <Bar dataKey="attempts" fill="#ffc658" name="Liczba prób" yAxisId="right" isAnimationActive={false} />
                  <YAxis yAxisId="right" orientation="right" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficult" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Najtrudniejsze pytania
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {difficultQuestions.length > 0 ? (
                  difficultQuestions.map((question, index) => (
                    <div key={question.questionId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge variant={
                              question.difficulty === 'very-hard' ? "destructive" : 
                              question.difficulty === 'hard' ? "secondary" : 
                              "default"
                            }>
                              Quiz: {question.avgQuizScore}% średnio
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Z quizu: {question.activityTitle} • {question.quizAttempts} podejść
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Średni wynik quizu</p>
                          <p className="font-medium">{question.avgQuizScore}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Liczba podejść</p>
                          <p className="font-medium">{question.quizAttempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Poziom trudności</p>
                          <Badge variant={
                            question.difficulty === 'very-hard' ? "destructive" : 
                            question.difficulty === 'hard' ? "secondary" : 
                            question.difficulty === 'medium' ? "outline" :
                            "default"
                          }>
                            {question.difficulty === 'very-hard' ? "Bardzo trudne" : 
                             question.difficulty === 'hard' ? "Trudne" : 
                             question.difficulty === 'medium' ? "Średnie" :
                             "Łatwe"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Brak danych o pytaniach w wybranym okresie.</p>
                    <p className="text-sm mt-2">Upewnij się, że wybrane quizy mają pytania.</p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Wskazówka:</strong> Rozważ dodanie dodatkowych materiałów lub wyjaśnień do pytań z niskim wskaźnikiem poprawnych odpowiedzi.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SubPage>
  );
};