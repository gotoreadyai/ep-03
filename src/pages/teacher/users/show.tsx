// src/pages/teacher/users/show.tsx
import { useOne, useNavigation, useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  Mail,
  Trophy,
  Clock,
  Activity,
  BookOpen,
  Target,
  TrendingUp,
  Award,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button, Badge, Progress } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/utility";
import type { 
  StudentData, 
  TeacherIdentity, 
  CourseProgress, 
  ActivityProgress,
  UserStats,
  GroupMember 
} from '../types';

export const UsersShow = () => {
  const { list } = useNavigation();
  const { id } = useParams();
  const { data: identity } = useGetIdentity<TeacherIdentity>();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentData | null>(null);

  // Pobierz dane ucznia
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select(`
            *,
            user_stats(*),
            group_members(
              group_id,
              user_id,
              joined_at,
              groups(*)
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // Normalizuj dane do formatu StudentData
          const formatted: StudentData = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            vendor_id: data.vendor_id,
            role: data.role,
            is_active: data.is_active,
            created_at: data.created_at,
            groups: data.group_members?.map((gm: any) => ({
              group_id: gm.group_id,
              user_id: gm.user_id,
              joined_at: gm.joined_at,
              groups: gm.groups
            })) || [],
            user_stats: data.user_stats ? (Array.isArray(data.user_stats) ? data.user_stats : [data.user_stats]) : []
          };
          
          setStudentData(formatted);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

  // Pobierz postępy ucznia w kursach nauczyciela
  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!id || !identity?.id) return;

      try {
        // Pobierz kursy nauczyciela
        const { data: teacherCourses } = await supabaseClient
          .from('course_access')
          .select('course_id')
          .eq('teacher_id', identity.id);

        if (!teacherCourses || teacherCourses.length === 0) return;

        const courseIds = teacherCourses.map(c => c.course_id);

        // Pobierz postępy ucznia w tych kursach
        const { data: progressData } = await supabaseClient
          .from('courses')
          .select(`
            id,
            title,
            topics!inner(
              id,
              title,
              activities!inner(
                id,
                type,
                activity_progress!left(
                  completed_at,
                  score,
                  attempts,
                  time_spent
                )
              )
            )
          `)
          .in('id', courseIds)
          .eq('topics.activities.activity_progress.user_id', id);

        if (progressData) {
          // Przetworz dane na format CourseProgress
          const formatted: CourseProgress[] = progressData.map((course: any) => {
            let totalActivities = 0;
            let completedActivities = 0;
            let totalScore = 0;
            let scoreCount = 0;
            let quizzesPassed = 0;
            let quizzesFailed = 0;
            let lastActivity: string | null = null;

            course.topics?.forEach((topic: any) => {
              topic.activities?.forEach((activity: any) => {
                totalActivities++;
                
                const progress = activity.activity_progress?.[0];
                if (progress?.completed_at) {
                  completedActivities++;
                  // Aktualizuj ostatnią aktywność
                  if (!lastActivity || new Date(progress.completed_at) > new Date(lastActivity)) {
                    lastActivity = progress.completed_at;
                  }
                }
                
                if (activity.type === 'quiz' && progress?.score !== null) {
                  totalScore += progress.score;
                  scoreCount++;
                  
                  if (progress.score >= 70) {
                    quizzesPassed++;
                  } else if (progress.attempts > 0) {
                    quizzesFailed++;
                  }
                }
              });
            });

            return {
              course_id: course.id,
              course_title: course.title,
              total_activities: totalActivities,
              completed_activities: completedActivities,
              avg_score: scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0,
              quizzes_passed: quizzesPassed,
              quizzes_failed: quizzesFailed,
              last_activity: lastActivity || ''
            };
          });

          setCourseProgress(formatted);
        }

        // Pobierz ostatnie aktywności
        const { data: activitiesData } = await supabaseClient
          .from('activity_progress')
          .select(`
            *,
            activities(
              id,
              title,
              type,
              topics(
                title,
                courses(title)
              )
            )
          `)
          .eq('user_id', id)
          .order('completed_at', { ascending: false, nullsFirst: false })
          .limit(10);

        if (activitiesData) {
          setRecentActivities(activitiesData as ActivityProgress[]);
        }

      } catch (error) {
        console.error('Error fetching student progress:', error);
      }
    };

    fetchStudentProgress();
  }, [id, identity]);

  if (loading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const user = studentData;
  const stats: UserStats | undefined = user?.user_stats?.[0];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getActivityTypeIcon = (type: 'quiz' | 'material') => {
    return type === 'quiz' ? '📝' : '📚';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const getActivityStatusColor = (lastActive: string | undefined) => {
    if (!lastActive) return "text-gray-500";
    
    const daysSinceActive = Math.floor(
      (new Date().getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActive === 0) return "text-green-600";
    if (daysSinceActive <= 7) return "text-yellow-600";
    if (daysSinceActive <= 30) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("users")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <div>
          <Lead title={user?.full_name || ''} description={user?.email || ''} />
          <div className="flex gap-2 mt-2">
            {user?.groups?.map((g: GroupMember) => (
              <Badge key={g.groups?.id} variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {g.groups?.name} ({g.groups?.academic_year})
              </Badge>
            ))}
            {!user?.is_active && (
              <Badge variant="destructive">
                Nieaktywny
              </Badge>
            )}
          </div>
        </div>
      </FlexBox>

      <GridBox>
        {/* Główna kolumna */}
        <div className="lg:col-span-2 space-y-6">
          {/* Podsumowanie postępów */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Podsumowanie postępów
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{stats?.total_points || 0}</p>
                  <p className="text-sm text-muted-foreground">Punkty</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{stats?.current_level || 1}</p>
                  <p className="text-sm text-muted-foreground">Poziom</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{stats?.quizzes_completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Ukończone quizy</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{stats?.daily_streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Dni z rzędu</p>
                </div>
              </div>

              {/* Dodatkowe statystyki */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Perfekcyjne wyniki</p>
                  <p className="text-lg font-semibold text-green-600">
                    {stats?.perfect_scores || 0}
                    {stats && stats.quizzes_completed > 0 && (
                      <span className="text-sm text-muted-foreground ml-1">
                        ({Math.round((stats.perfect_scores / stats.quizzes_completed) * 100)}%)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Czas nauki</p>
                  <p className="text-lg font-semibold">
                    {stats ? formatTime(stats.total_time_spent) : '0min'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Punkty/h (idle)</p>
                  <p className="text-lg font-semibold">
                    {stats?.idle_points_rate || 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Postępy w kursach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Postępy w Twoich kursach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseProgress.map((course) => {
                const progressPercent = course.total_activities > 0
                  ? Math.round((course.completed_activities / course.total_activities) * 100)
                  : 0;

                return (
                  <div key={course.course_id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{course.course_title}</h4>
                      <Badge variant={progressPercent === 100 ? "default" : "outline"}>
                        {progressPercent}% ukończone
                      </Badge>
                    </div>
                    
                    <Progress value={progressPercent} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ukończone</p>
                        <p className="font-medium">
                          {course.completed_activities}/{course.total_activities} aktywności
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Średni wynik</p>
                        <p className={`font-medium ${course.avg_score > 0 ? getScoreColor(course.avg_score) : ''}`}>
                          {course.avg_score > 0 ? `${course.avg_score}%` : 'Brak'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quizy</p>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {course.quizzes_passed}
                          </span>
                          <span className="text-red-600 flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            {course.quizzes_failed}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {course.last_activity && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Ostatnia aktywność: {new Date(course.last_activity).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {courseProgress.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Uczeń nie rozpoczął jeszcze żadnego z Twoich kursów
                </p>
              )}
            </CardContent>
          </Card>

          {/* Ostatnie aktywności */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Ostatnie aktywności
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={`${activity.user_id}-${activity.activity_id}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {activity.activities && getActivityTypeIcon(activity.activities.type)}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{activity.activities?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.activities?.topics?.courses?.title} • {activity.activities?.topics?.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.score !== null && (
                        <p className={`font-medium ${getScoreColor(activity.score)}`}>
                          {activity.score}%
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {activity.completed_at 
                          ? new Date(activity.completed_at).toLocaleDateString('pl-PL')
                          : new Date(activity.started_at).toLocaleDateString('pl-PL')
                        }
                      </p>
                      {activity.attempts > 1 && (
                        <p className="text-xs text-muted-foreground">
                          Próba {activity.attempts}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {recentActivities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Brak aktywności do wyświetlenia
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel boczny */}
        <div className="space-y-6">
          {/* Czas nauki */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Czas nauki
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Łączny czas</p>
                <p className="text-xl font-bold">
                  {stats ? formatTime(stats.total_time_spent) : '0min'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ostatnia aktywność</p>
                <p className={`text-sm font-medium ${getActivityStatusColor(stats?.last_active)}`}>
                  {stats?.last_active
                    ? new Date(stats.last_active).toLocaleDateString("pl-PL", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Brak aktywności"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ostatnie pobieranie idle</p>
                <p className="text-sm font-medium">
                  {stats?.last_idle_claim
                    ? new Date(stats.last_idle_claim).toLocaleString("pl-PL", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "Nigdy"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statystyki quizów */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-4 h-4" />
                Statystyki quizów
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ukończone</span>
                <span className="font-bold">{stats?.quizzes_completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Wyniki 100%</span>
                <span className="font-bold text-green-600">{stats?.perfect_scores || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Współczynnik</span>
                <span className="font-bold">
                  {stats && stats.quizzes_completed > 0 
                    ? `${Math.round((stats.perfect_scores / stats.quizzes_completed) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Średni czas/quiz</span>
                <span className="font-bold">
                  {stats && stats.quizzes_completed > 0 
                    ? formatTime(Math.round(stats.total_time_spent / stats.quizzes_completed))
                    : '0min'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Daty */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Informacje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Dołączył</p>
                <p className="text-sm font-medium">
                  {user?.created_at && new Date(user.created_at).toLocaleDateString("pl-PL", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dni od rejestracji</p>
                <p className="text-sm font-medium">
                  {user?.created_at && Math.floor(
                    (new Date().getTime() - new Date(user.created_at).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )} dni
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status konta</p>
                <p className="text-sm font-medium">
                  {user?.is_active ? (
                    <span className="text-green-600">✓ Aktywny</span>
                  ) : (
                    <span className="text-red-600">✗ Nieaktywny</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grupy</p>
                <div className="text-sm font-medium">
                  {user?.groups?.map((g: GroupMember) => (
                    <div key={g.groups?.id}>
                      {g.groups?.name} ({g.groups?.academic_year})
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </GridBox>
    </SubPage>
  );
};