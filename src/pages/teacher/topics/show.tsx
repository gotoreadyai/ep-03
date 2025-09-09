
import { useOne, useNavigation, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, Users, FileText, Plus } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";

export const CoursesShow = () => {
  const { list, edit } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: courseData, isLoading: courseLoading } = useOne({
    resource: "courses",
    id: id as string,
  });

  const { data: topicsData, isLoading: topicsLoading } = useList({
    resource: "topics",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: id,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    meta: {
      select: '*, activities(count)'
    }
  });

  const { data: accessData } = useList({
    resource: "course_access",
    filters: [
      {
        field: "course_id",
        operator: "eq",
        value: id,
      },
    ],
  });

  if (courseLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const course = courseData?.data;

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("courses")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <Lead
          title={
            <div className="flex items-center gap-3">
              {course?.icon_emoji && (
                <span className="text-4xl">{course.icon_emoji}</span>
              )}
              {course?.title}
            </div>
          }
          description={course?.description}
        />
        <Button onClick={() => edit("courses", course?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj kurs
        </Button>
      </FlexBox>

      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={course?.is_published ? "default" : "secondary"}>
              {course?.is_published ? "Opublikowany" : "Szkic"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tematy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicsData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dostęp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accessData?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utworzono</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(course?.created_at).toLocaleDateString("pl-PL")}
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <GridBox variant="1-2-2">
        {/* Lista tematów */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle>Tematy kursu</CardTitle>
              <Button
                size="sm"
                onClick={() => navigate(`/teacher/topics/create?course_id=${id}`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj temat
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {topicsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : topicsData?.data?.length ? (
              <div className="space-y-3">
                {topicsData.data.map((topic: any) => (
                  <div
                    key={topic.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <FlexBox>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {topic.position}. {topic.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {topic._count?.activities || 0} aktywności
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={topic.is_published ? "default" : "secondary"}
                        >
                          {topic.is_published ? "Opublikowany" : "Szkic"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/teacher/activities/create?topic_id=${topic.id}`)}
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Dodaj treść
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => edit("topics", topic.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </FlexBox>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Brak tematów w tym kursie</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate(`/teacher/topics/create?course_id=${id}`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dodaj pierwszy temat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grupy z dostępem */}
        <Card>
          <CardHeader>
            <CardTitle>Grupy z dostępem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Lista grup (do implementacji)</p>
            </div>
          </CardContent>
        </Card>
      </GridBox>
    </SubPage>
  );
};
