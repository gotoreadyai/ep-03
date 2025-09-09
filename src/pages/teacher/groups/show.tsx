import { useOne, useNavigation, useList, useInvalidate } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Edit,
  Users,
  BookOpen,
  Plus,
  UserPlus,
  Trash2,
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabaseClient } from "@/utility/supabaseClient";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const GroupsShow = () => {
  const { list, edit, show } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();
  const invalidate = useInvalidate();

  const { data: groupData, isLoading: groupLoading } = useOne({
    resource: "groups",
    id: id as string,
    liveMode: "off",
  });

  const { data: membersData, isLoading: membersLoading } = useList({
    resource: "group_members",
    filters: [
      {
        field: "group_id",
        operator: "eq",
        value: id,
      },
    ],
    meta: {
      select: "*, users(*)",
    },
    queryOptions: {
      enabled: !!id,
    },
    liveMode: "off",
  });

  const { data: coursesData, isLoading: coursesLoading } = useList({
    resource: "course_access",
    filters: [
      {
        field: "group_id",
        operator: "eq",
        value: id,
      },
    ],
    meta: {
      select: "*, courses(*)",
    },
    queryOptions: {
      enabled: !!id,
    },
    liveMode: "off",
  });

  const handleRemoveCourse = async (courseId: number, courseTitle: string) => {
    if (confirm(`Czy na pewno chcesz odpiąć kurs "${courseTitle}" od tej grupy?`)) {
      try {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", courseId)
          .eq("group_id", parseInt(id as string));
        
        if (error) {
          throw error;
        }
        
        toast.success("Kurs został odpięty od grupy");
        invalidate({
          resource: "course_access",
          invalidates: ["list"],
        });
      } catch (error) {
        console.error("Error removing course:", error);
        toast.error("Błąd podczas odpinania kursu");
      }
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (confirm(`Czy na pewno chcesz usunąć "${userName}" z tej grupy?`)) {
      try {
        const { error } = await supabaseClient
          .from("group_members")
          .delete()
          .eq("user_id", userId)
          .eq("group_id", parseInt(id as string));
        
        if (error) {
          throw error;
        }
        
        toast.success("Uczeń został usunięty z grupy");
        invalidate({
          resource: "group_members",
          invalidates: ["list"],
        });
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Błąd podczas usuwania ucznia z grupy");
      }
    }
  };

  if (groupLoading || membersLoading || coursesLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const group = groupData?.data;
  const membersCount = membersData?.total || 0;
  const coursesCount = coursesData?.total || 0;

  return (
    <SubPage>
      <Button variant="outline" size="sm" onClick={() => list("groups")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do listy
      </Button>

      <FlexBox>
        <div>
          <Lead
            title={group?.name}
            description={`Rok akademicki: ${group?.academic_year}`}
          />
          {!group?.is_active && (
            <Badge variant="secondary" className="mt-2">
              Grupa nieaktywna
            </Badge>
          )}
        </div>
        <Button onClick={() => edit("groups", group?.id ?? "")}>
          <Edit className="w-4 h-4 mr-2" />
          Edytuj grupę
        </Button>
      </FlexBox>

      {!group?.is_active && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ta grupa jest nieaktywna. Uczniowie nie mają dostępu do przypisanych kursów.
          </AlertDescription>
        </Alert>
      )}

      <GridBox variant="2-2-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              variant={group?.is_active ? "default" : "secondary"}
              className={group?.is_active ? "bg-green-600" : ""}
            >
              {group?.is_active ? "Aktywna" : "Nieaktywna"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uczniowie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kursy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utworzono</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {new Date(group?.created_at).toLocaleDateString("pl-PL")}
            </div>
          </CardContent>
        </Card>
      </GridBox>

      <GridBox variant="1-2-2">
        {/* Lista uczniów */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle>Uczniowie grupy</CardTitle>
              <Button 
                size="sm"
                onClick={() => navigate(`/teacher/groups/${id}/assign-students`)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Dodaj ucznia
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {membersData?.data?.length ? (
              <div className="space-y-2">
                {membersData.data.map((member: any) => (
                  <div
                    key={member.user_id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base leading-tight truncate pr-2">
                            {member.users?.full_name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground truncate">
                              {member.users?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => show("users", member.user_id)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Zobacz profil</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50"
                                onClick={() => handleRemoveMember(member.user_id, member.users?.full_name)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Usuń z grupy</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Brak uczniów w grupie</p>
                <Button 
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/teacher/groups/${id}/assign-students`)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Dodaj pierwszego ucznia
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista kursów */}
        <Card>
          <CardHeader>
            <FlexBox>
              <CardTitle>Przypisane kursy</CardTitle>
              <Button
                size="sm"
                onClick={() => navigate(`/teacher/groups/${id}/assign-courses`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Przypisz kurs
              </Button>
            </FlexBox>
          </CardHeader>
          <CardContent>
            {coursesData?.data?.length ? (
              <div className="space-y-2">
                {coursesData.data.map((access: any) => (
                  <div
                    key={access.course_id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          {access.courses?.icon_emoji ? (
                            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                              <span className="text-xl">
                                {access.courses.icon_emoji}
                              </span>
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base leading-tight truncate pr-2">
                            {access.courses?.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(access.assigned_at).toLocaleDateString("pl-PL")}
                              </span>
                            </div>
                            <Badge 
                              variant={access.courses?.is_published ? "default" : "secondary"}
                              className={`text-xs ${access.courses?.is_published ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
                            >
                              {access.courses?.is_published ? "Opublikowany" : "Szkic"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => show("courses", access.course_id)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Zobacz kurs</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 hover:bg-red-50"
                                onClick={() => handleRemoveCourse(access.course_id, access.courses?.title)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Odepnij kurs</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Brak przypisanych kursów</p>
                <Button 
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/teacher/groups/${id}/assign-courses`)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Przypisz pierwszy kurs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </GridBox>
    </SubPage>
  );
};