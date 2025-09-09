import { useGetIdentity } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  Trophy, 
  TrendingUp,
  Clock,
  Award,
  Activity,
  Target
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout"; // Dodaj import jeśli brakuje

import { useEffect, useState } from "react";
import { supabaseClient } from "@/utility/supabaseClient";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalActivities: number;
  completedActivities: number;
  averageScore: number;
  totalPoints: number;
}

export const DashboardOverview = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity<any>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // WAŻNE: Dodaj warunek aby uniknąć wielokrotnych wywołań
    if (identityLoading || !identity?.vendor_id) {
      setLoading(false);
      return;
    }

    let isMounted = true; // Flaga do anulowania efektów po odmontowaniu

    const fetchStats = async () => {
      try {
        // Pobierz statystyki
        const [
          usersRes,
          coursesRes,
          activitiesRes,
          progressRes,
          pointsRes
        ] = await Promise.all([
          // Użytkownicy
          supabaseClient
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('vendor_id', identity.vendor_id),
          
          // Kursy
          supabaseClient
            .from('courses')
            .select('*', { count: 'exact' })
            .eq('vendor_id', identity.vendor_id),
          
          // Aktywności
          supabaseClient
            .from('activities')
            .select('*, topics!inner(course_id, courses!inner(vendor_id))', { count: 'exact' })
            .eq('topics.courses.vendor_id', identity.vendor_id),
          
          // Postępy
          supabaseClient
            .from('activity_progress')
            .select('score, completed_at')
            .not('completed_at', 'is', null),
          
          // Punkty
          supabaseClient
            .from('user_stats')
            .select('total_points')
        ]);

        // Sprawdź czy komponent jest nadal zamontowany
        if (!isMounted) return;

        const avgScore = progressRes.data?.length 
          ? progressRes.data.reduce((acc, p) => acc + (p.score || 0), 0) / progressRes.data.length
          : 0;

        const totalPoints = pointsRes.data?.reduce((acc, p) => acc + p.total_points, 0) || 0;

        setStats({
          totalUsers: usersRes.count || 0,
          activeUsers: usersRes.count || 0, // TODO: dodać faktyczną logikę
          totalCourses: coursesRes.count || 0,
          publishedCourses: coursesRes.data?.filter(c => c.is_published).length || 0,
          totalActivities: activitiesRes.count || 0,
          completedActivities: progressRes.data?.length || 0,
          averageScore: Math.round(avgScore),
          totalPoints
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [identity?.vendor_id, identityLoading]); // Bardziej specyficzne zależności

  if (loading || identityLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  // Jeśli nie ma identity, pokaż komunikat
  if (!identity) {
    return (
      <SubPage>
        <div className="text-center text-muted-foreground">
          Nie można załadować danych użytkownika
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Lead
        title="Dashboard"
        description="Przegląd statystyk systemu e-learning"
      />

      <GridBox variant="1-2-2">
        {/* Użytkownicy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Użytkownicy
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} aktywnych
            </p>
          </CardContent>
        </Card>

        {/* Kursy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kursy
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedCourses || 0} opublikowanych
            </p>
          </CardContent>
        </Card>

        {/* Aktywności */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktywności
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalActivities || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completedActivities || 0} ukończonych
            </p>
          </CardContent>
        </Card>

        {/* Średni wynik */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Średni wynik
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageScore || 0}%</div>
            <p className="text-xs text-muted-foreground">
              z wszystkich quizów
            </p>
          </CardContent>
        </Card>
      </GridBox>

      {/* Wykres aktywności - placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Aktywność w ostatnich 7 dniach</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mr-2" />
            Wykres aktywności (do implementacji)
          </div>
        </CardContent>
      </Card>

      {/* Najlepsi użytkownicy */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 użytkowników</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className={`h-5 w-5 ${i <= 3 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <span>Użytkownik {i}</span>
                </div>
                <span className="font-semibold">{1000 - i * 100} pkt</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};