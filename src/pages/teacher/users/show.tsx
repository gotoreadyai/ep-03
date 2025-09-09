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

interface CourseProgress {
  course_id: number;
  course_title: string;
  completed_activities: number;
  total_activities: number;
  avg_score: number;
  last_activity: string;
  quizzes_passed: number;
  quizzes_failed: number;
}

export const UsersShow = () => {
  const { list } = useNavigation();
  const { id } = useParams();
  const { data: identity } = useGetIdentity<any>();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const { data: userData, isLoading: userLoading } = useOne({
    resource: "users",
    id: id as string,
    meta: {
      select: `
        *,
        user_stats(*),
        groups:group_members(
          group_id,
          groups(id, name)
        )
      `,
    },
  });

  // Pobierz postępy ucznia w kursach nauczyciela
  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!id || !identity?.id) return;

      // Postępy w kursach
      const { data: progressData } = await supabaseClient
        .rpc('get_student_course_progress', {
          p_student_id: id,
          p_teacher_id: identity.id
        });

      if (progressData) {
        setCourseProgress(progressData);
      }

      // Ostatnie aktywności
      const { data: activitiesData } = await supabaseClient
        .from('activity_progress')
        .select(`
          *,
          activities!inner(
            id,
            title,
            type,
            topics!inner(
              id,
              title,
              courses!inner(
                id,
                title,
                course_access!inner(teacher_id)
              )
            )
          )
        `)
        .eq('user_id', id)
        .eq('activities.topics.courses.course_access.teacher_id', identity.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (activitiesData) {
        setRecentActivities(activitiesData);
      }
    };

    fetchStudentProgress();
  }, [id, identity]);

  if (userLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const user = userData?.data;
  const stats = user?.user_stats?.[0] || {};

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getActivityTypeIcon = (type: string) => {
    return type === 'quiz' ? '📝' : '📚';
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("users")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <div>
          <Lead title={user?.full_name} description={user?.email} />
          <div className="flex gap-2 mt-2">
            {user?.groups?.map((g: any) => (
              <Badge key={g.groups.id} variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {g.groups.name}
              </Badge>
            ))}
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
                  <p className="text-2xl font-bold">{stats.total_points || 0}</p>
                  <p className="text-sm text-muted-foreground">Punkty</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">{stats.current_level || 1}</p>
                  <p className="text-sm text-muted-foreground">Poziom</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">{stats.quizzes_completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Ukończone quizy</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">{stats.daily_streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Dni z rzędu</p>
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
                        <p className={`font-medium ${getScoreColor(course.avg_score || 0)}`}>
                          {course.avg_score ? `${Math.round(course.avg_score)}%` : 'Brak'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Quizy</p>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {course.quizzes_passed || 0}
                          </span>
                          <span className="text-red-600 flex items-center">
                            <XCircle className="w-3 h-3 mr-1" />
                            {course.quizzes_failed || 0}
                          </span>
                        </div>
                      </div>
                    </div>
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
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getActivityTypeIcon(activity.activities.type)}</span>
                      <div>
                        <p className="font-medium text-sm">{activity.activities.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.activities.topics.courses.title} • {activity.activities.topics.title}
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
                        {new Date(activity.completed_at || activity.started_at).toLocaleDateString('pl-PL')}
                      </p>
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
                  {Math.round((stats.total_time_spent || 0) / 60)}h {(stats.total_time_spent || 0) % 60}min
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ostatnia aktywność</p>
                <p className="text-sm font-medium">
                  {stats.last_active
                    ? new Date(stats.last_active).toLocaleDateString("pl-PL", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "Brak aktywności"}
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
                <span className="font-bold">{stats.quizzes_completed || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Wyniki 100%</span>
                <span className="font-bold text-green-600">{stats.perfect_scores || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Współczynnik</span>
                <span className="font-bold">
                  {stats.quizzes_completed > 0 
                    ? `${Math.round((stats.perfect_scores / stats.quizzes_completed) * 100)}%`
                    : '0%'
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
                  {new Date(user?.created_at).toLocaleDateString("pl-PL", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dni od rejestracji</p>
                <p className="text-sm font-medium">
                  {Math.floor(
                    (new Date().getTime() - new Date(user?.created_at).getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </GridBox>
    </SubPage>
  );
};