// src/pages/admin/permissions/users/show.tsx
import { useOne, useList, useNavigation } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { ArrowLeft, User, Mail, Calendar, Shield, Activity, BookOpen, Users, Edit, Clock } from "lucide-react";
import { useParams } from "react-router-dom";

export const UsersShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();

  const { data: userData, isLoading: userLoading } = useOne({
    resource: "users",
    id: id as string,
  });

  const { data: statsData } = useOne({
    resource: "user_stats",
    id: id as string,
  });

  const { data: progressData } = useList({
    resource: "activity_progress",
    filters: [
      {
        field: "user_id",
        operator: "eq",
        value: id,
      },
    ],
    pagination: {
      pageSize: 10,
    },
    sorters: [
      {
        field: "completed_at",
        order: "desc",
      },
    ],
  });

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
  const stats = statsData?.data;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'teacher': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("permissions-users")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-3">
              {getRoleIcon(user?.role)}
              {user?.full_name}
            </div>
          }
          description={user?.email}
        />
        <Button onClick={() => edit("permissions-users", user?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj
        </Button>
      </FlexBox>

      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rola</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getRoleBadgeVariant(user?.role) as any}>
              {user?.role === 'admin' ? 'Administrator' : 
               user?.role === 'teacher' ? 'Nauczyciel' : 'Uczeń'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={user?.is_active ? "default" : "secondary"}>
              {user?.is_active ? "Aktywny" : "Nieaktywny"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Punkty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_points || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dołączył</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(user?.created_at).toLocaleDateString("pl-PL", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Statystyki aktywności
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Poziom</span>
                <span className="text-2xl font-bold">{stats?.current_level || 1}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Seria dni</span>
                <span className="text-2xl font-bold">{stats?.daily_streak || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Ukończone quizy</span>
                <span className="text-2xl font-bold">{stats?.quizzes_completed || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Idealne wyniki</span>
                <span className="text-2xl font-bold">{stats?.perfect_scores || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Informacje o koncie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID użytkownika</p>
              <p className="font-mono text-xs">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ID organizacji</p>
              <p className="font-medium">{user?.vendor_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ostatnia aktywność</p>
              <p className="font-medium">
                {stats?.last_active 
                  ? new Date(stats.last_active).toLocaleDateString("pl-PL")
                  : "Brak danych"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ostatnia aktywność</CardTitle>
        </CardHeader>
        <CardContent>
          {progressData?.data && progressData.data.length > 0 ? (
            <div className="space-y-2">
              {progressData.data.map((progress: any) => (
                <div key={progress.activity_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Aktywność #{progress.activity_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {progress.completed_at 
                        ? `Ukończono: ${new Date(progress.completed_at).toLocaleDateString("pl-PL")}`
                        : "W trakcie"}
                    </p>
                  </div>
                  {progress.score !== null && (
                    <Badge variant={progress.score >= 70 ? "default" : "secondary"}>
                      {progress.score}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Brak aktywności
            </p>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};