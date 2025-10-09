// src/pages/teacher/courses/list.tsx

import {  useNavigation, useDelete, useGetIdentity, useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  FileText,
  MoreVertical,
  Layout,
  Sparkles,
  Brain,
  Clock,
  AlertCircle,
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Button, Input } from "@/components/ui";
import { SubPage } from "@/components/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePublishToggle } from "./hooks";
import { toast } from "sonner";
import { useState, useMemo } from "react";

interface Course {
  id: number;
  title: string;
  description?: string;
  icon_emoji?: string;
  is_published: boolean;
  created_at: string;
  vendor_id: number;
}

export const CoursesList = () => {
  const { create, edit, show } = useNavigation();
  const { mutate: deleteCourse } = useDelete();
  const { togglePublish } = usePublishToggle("courses");
  const { data: identity } = useGetIdentity<any>();
  const [searchQuery, setSearchQuery] = useState("");

  // Pobierz wszystkie kursy
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useList<Course>({
    resource: "courses",
    pagination: { mode: "off" },
    sorters: [{ field: "created_at", order: "desc" }],
  });

  // Pobierz course_access dla nauczyciela
  const {
    data: accessData,
    isLoading: accessLoading,
  } = useList({
    resource: "course_access",
    filters: identity?.role === 'teacher' ? [
      { field: "teacher_id", operator: "eq", value: identity?.id }
    ] : [],
    pagination: { mode: "off" },
    queryOptions: {
      enabled: !!identity?.id && identity?.role === 'teacher',
    },
  });

  // Pobierz statystyki (topics count)
  const {
    data: topicsData,
  } = useList({
    resource: "topics",
    pagination: { mode: "off" },
    meta: {
      select: "course_id",
    },
  });

  // Pobierz wszystkie course_access dla liczenia
  const {
    data: allAccessData,
  } = useList({
    resource: "course_access",
    pagination: { mode: "off" },
    meta: {
      select: "course_id",
    },
  });

  // Filtruj kursy dla nauczyciela
  const teacherCourseIds = useMemo(() => {
    return accessData?.data?.map(access => access.course_id) || [];
  }, [accessData?.data]);
  
  const filteredCourses = useMemo(() => {
    let courses = coursesData?.data || [];
    
    // Filtruj dla nauczyciela
    if (identity?.role === 'teacher') {
      courses = courses.filter(course => teacherCourseIds.includes(course.id));
    }
    
    // Filtruj po nazwie
    if (searchQuery) {
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return courses;
  }, [coursesData?.data, teacherCourseIds, identity?.role, searchQuery]);

  // Policz tematy i dostępy dla każdego kursu
  const getCourseStats = (courseId: number) => {
    const topicsCount = topicsData?.data?.filter(t => t.course_id === courseId).length || 0;
    const accessCount = allAccessData?.data?.filter(a => a.course_id === courseId).length || 0;
    return { topicsCount, accessCount };
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć kurs "${title}"?`)) {
      deleteCourse(
        {
          resource: "courses",
          id,
        },
        {
          onSuccess: () => {
            toast.success("Kurs został usunięty");
            refetchCourses();
          },
        }
      );
    }
  };

  const handleNavigateToWizard = (
    wizardPath: string,
    courseId?: number,
    courseTitle?: string
  ) => {
    if (courseId && courseTitle) {
      sessionStorage.setItem(
        "wizardContext",
        JSON.stringify({
          courseId,
          courseTitle,
        })
      );
    }
    window.location.href = wizardPath;
  };

  // Sprawdzanie ładowania MUSI być PO wszystkich hookach
  const isLoading = coursesLoading || (identity?.role === 'teacher' && accessLoading);
  const isError = coursesError;

  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const isTeacher = identity?.role === 'teacher';
  const isAdmin = identity?.role === 'admin';

  return (
    <SubPage>
      <FlexBox>
        <Lead 
          title="Moje kursy" 
          description={
            isAdmin 
              ? "Zarządzaj wszystkimi kursami w systemie" 
              : "Kursy, które prowadzisz"
          } 
        />
        {isAdmin && (
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleNavigateToWizard("/teacher/course-structure/step1")
                    }
                  >
                    <Layout className="w-4 h-4 mr-2" />
                    <Sparkles className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Stwórz kurs z pomocą AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button onClick={() => create("courses")}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj kurs
            </Button>
          </div>
        )}
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj kursów..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isTeacher && (
          <Badge variant="outline">
            Pokazuję tylko kursy, które prowadzisz
          </Badge>
        )}
      </FlexBox>

      <GridBox>
        {filteredCourses.map((course) => {
          const stats = getCourseStats(course.id);
          
          return (
            <Card
              key={course.id}
              className={`relative cursor-pointer transition-all duration-200 ${
                !course.is_published
                  ? "opacity-80 hover:opacity-90 "
                  : "hover:shadow-lg"
              }`}
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('[role="menu"]')) {
                  show("courses", course.id);
                }
              }}
            >
              <CardHeader>
                <FlexBox>
                  <CardTitle className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0">
                      {course.icon_emoji ? (
                        <span className="text-2xl">{course.icon_emoji}</span>
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </span>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate">{course.title}</span>
                        </TooltipTrigger>
                        {course.title.length > 30 && (
                          <TooltipContent>
                            <p className="max-w-xs">{course.title}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => show("courses", course.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Podgląd
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuItem
                            onClick={() => edit("courses", course.id)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edytuj
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              togglePublish(
                                course.id,
                                course.is_published,
                                course.title,
                                refetchCourses
                              )
                            }
                          >
                            {course.is_published ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Ukryj kurs
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Opublikuj kurs
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem
                        onClick={() =>
                          handleNavigateToWizard(
                            "/teacher/educational-material/step1",
                            course.id,
                            course.title
                          )
                        }
                        className="text-purple-600 focus:text-purple-600"
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generuj materiał z AI
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleNavigateToWizard(
                            "/teacher/quiz-wizard/step1",
                            course.id,
                            course.title
                          )
                        }
                        className="text-blue-600 focus:text-blue-600"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        Generuj quiz z AI
                      </DropdownMenuItem> */}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(course.id, course.title)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Usuń
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FlexBox>
              </CardHeader>
              <CardContent>
                {course.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge
                      variant={course.is_published ? "default" : "secondary"}
                      className={course.is_published ? "bg-green-600" : ""}
                    >
                      {course.is_published ? "Opublikowany" : "Szkic"}
                    </Badge>
                  </div>

                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {stats.topicsCount}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Liczba tematów</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {stats.accessCount}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Liczba przypisań</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {course.created_at && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>
                      Utworzono:{" "}
                      {new Date(course.created_at).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </GridBox>

      {/* Karta informująca o braku kursów */}
      {filteredCourses.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            {isTeacher ? (
              <>
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Nie prowadzisz jeszcze żadnych kursów
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Operator systemu tworzy kursy i przypisuje do nich nauczycieli. 
                  Skontaktuj się z operatorem, aby uzyskać dostęp do kursów, które będziesz prowadzić.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" disabled>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Kursy tworzy operator
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Layout className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
                <h3 className="text-lg font-semibold mb-2">
                  Brak kursów
                </h3>
                <p className="text-muted-foreground mb-6">
                  Rozpocznij od stworzenia pierwszego kursu
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => create("courses")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj ręcznie
                  </Button>
                  <Button
                    onClick={() =>
                      handleNavigateToWizard("/teacher/course-structure/step1")
                    }
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Wygeneruj z AI
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

     
    </SubPage>
  );
};