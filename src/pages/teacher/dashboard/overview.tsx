// src/pages/teacher/dashboard/overview.tsx
import { useGetIdentity, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  ArrowRight,
  Plus
} from "lucide-react";
import { GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { Button } from "@/components/ui";
import { useNavigate } from "react-router-dom";

export const DashboardOverview = () => {
  const { data: identity } = useGetIdentity<any>();
  const navigate = useNavigate();

  // Tylko 3 proste zapytania z count
  const { data: groupsData } = useList({
    resource: "groups",
    filters: [
      { field: "vendor_id", operator: "eq", value: identity?.vendor_id }
    ],
    pagination: { current: 1, pageSize: 5 },
  });

  const { data: coursesData } = useList({
    resource: "courses",
    filters: [
      { field: "vendor_id", operator: "eq", value: identity?.vendor_id }
    ],
    pagination: { current: 1, pageSize: 5 },
  });

  const { data: studentsData } = useList({
    resource: "users",
    filters: [
      { field: "vendor_id", operator: "eq", value: identity?.vendor_id },
      { field: "role", operator: "eq", value: "student" }
    ],
    pagination: { current: 1, pageSize: 5 },
  });

  return (
    <SubPage>
      <Lead
        title={`Witaj, ${identity?.full_name || 'Nauczycielu'}!`}
        description="Szybki przegląd systemu"
      />

      {/* Statystyki */}
      <GridBox variant="1-2-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupsData?.total || 0}</div>
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto text-xs"
              onClick={() => navigate("/teacher/groups")}
            >
              Zarządzaj grupami
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kursy</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesData?.total || 0}</div>
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto text-xs"
              onClick={() => navigate("/teacher/courses")}
            >
              Przeglądaj kursy
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uczniowie</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsData?.total || 0}</div>
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto text-xs"
              onClick={() => navigate("/teacher/users")}
            >
              Zobacz uczniów
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </GridBox>

      <GridBox variant="1-2-2">
        {/* Ostatnie grupy */}
        {groupsData?.data && groupsData.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Twoje grupy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupsData.data.slice(0, 5).map((group: any) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/teacher/groups/show/${group.id}`)}
                  >
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.academic_year}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ostatnie kursy */}
        {coursesData?.data && coursesData.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Twoje kursy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coursesData.data.slice(0, 5).map((course: any) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/teacher/courses/show/${course.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {course.icon_emoji && (
                        <span className="text-2xl">{course.icon_emoji}</span>
                      )}
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.is_published ? "Opublikowany" : "Szkic"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </GridBox>

      {/* Szybkie akcje */}
      <Card>
        <CardHeader>
          <CardTitle>Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => navigate("/teacher/courses/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Utwórz nowy kurs</div>
              <div className="text-xs text-muted-foreground">
                Dodaj materiały i quizy dla uczniów
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-3"
            onClick={() => navigate("/teacher/groups/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Utwórz nową grupę</div>
              <div className="text-xs text-muted-foreground">
                Zorganizuj uczniów i przypisz kursy
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </SubPage>
  );
};