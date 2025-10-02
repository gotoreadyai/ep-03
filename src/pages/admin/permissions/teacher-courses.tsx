// src/pages/admin/permissions/teacher-courses.tsx
import { useState, useMemo } from "react";
import { useList } from "@refinedev/core";
import { supabaseClient } from "@/utility";
import { SubPage } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Checkbox,
  ScrollArea,
} from "@/components/ui";
import { Search, UserCog, BookOpen, Mail } from "lucide-react";
import { toast } from "sonner";
import { TeacherCoursesInfoCard } from "./components/TeacherCoursesInfoCard";


type Teacher = {
  id: string;
  full_name: string;
  email: string;
};

type Course = {
  id: number;
  title: string;
  icon_emoji: string;
};

type CourseAccess = {
  course_id: number;
  teacher_id: string | null;
  group_id: number | null;
};

export const TeacherCoursesManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Pobierz nauczycieli
  const { data: teachersData, isLoading } = useList<Teacher>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "teacher" },
      { field: "is_active", operator: "eq", value: true },
    ],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "full_name", order: "asc" }],
  });

  // Pobierz kursy
  const { data: coursesData } = useList<Course>({
    resource: "courses",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  // Pobierz przypisania - BEZ FILTRA, filtrujemy w JS
  const { data: accessData, refetch: refetchAccess } = useList<CourseAccess>({
    resource: "course_access",
    pagination: { pageSize: 10000 },
  });

  const teachers = teachersData?.data ?? [];
  const courses = coursesData?.data ?? [];
  
  // Filtruj tylko przypisania dla nauczycieli (teacher_id nie null)
  const allAccess = useMemo(() => {
    return (accessData?.data ?? []).filter((a) => a.teacher_id !== null);
  }, [accessData]);

  // Liczba kursów na nauczyciela
  const teacherCourseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    teachers.forEach((t) => {
      counts[t.id] = allAccess.filter((a) => a.teacher_id === t.id).length;
    });
    return counts;
  }, [teachers, allAccess]);

  // Kursy wybranego nauczyciela
  const selectedTeacherCourseIds = useMemo(() => {
    if (!selectedTeacher) return new Set<number>();
    return new Set(
      allAccess.filter((a) => a.teacher_id === selectedTeacher.id).map((a) => a.course_id)
    );
  }, [selectedTeacher, allAccess]);

  // Filtrowanie
  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        !search ||
        t.full_name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) => !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courses, courseSearch]);

  const handleOpenDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDialog(true);
    setCourseSearch("");
  };

  const handleToggleCourse = async (courseId: number) => {
    if (!selectedTeacher || saving) return;

    const hasAccess = selectedTeacherCourseIds.has(courseId);
    setSaving(true);

    try {
      if (hasAccess) {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", courseId)
          .eq("teacher_id", selectedTeacher.id);

        if (error) throw error;
        toast.success("Kurs usunięty");
      } else {
        const { error } = await supabaseClient
          .from("course_access")
          .insert({
            course_id: courseId,
            teacher_id: selectedTeacher.id,
            group_id: null,
          });

        if (error) throw error;
        toast.success("Kurs dodany");
      }

      await refetchAccess();
    } catch (error: any) {
      console.error("Error toggling course:", error);
      toast.error(error.message || "Wystąpił błąd");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-bold">Kursy nauczycieli</h1>
          <p className="text-muted-foreground mt-1">
            Przypisz kursy, które nauczyciele będą prowadzić
          </p>
        </div>

        {/* Info */}
        <TeacherCoursesInfoCard />

        {/* Wyszukiwarka */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj nauczyciela..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Nauczyciele ({teachers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Ładowanie...</div>
            ) : filteredTeachers.length === 0 ? (
              <div className="p-8 text-center">
                <UserCog className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {search ? "Nie znaleziono nauczycieli" : "Brak nauczycieli"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nauczyciel</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Liczba kursów</TableHead>
                    <TableHead className="text-center">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell className="font-medium">{teacher.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {teacher.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{teacherCourseCounts[teacher.id] || 0} kursów</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(teacher)}>
                          <BookOpen className="w-4 h-4 mr-1" />
                          Zarządzaj
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                <div>
                  <div>Kursy dla: {selectedTeacher?.full_name}</div>
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    Zaznacz kursy, które nauczyciel będzie prowadzić
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Wybrano: <strong>{selectedTeacherCourseIds.size}</strong> z {courses.length} kursów
            </div>

            <Input
              placeholder="Szukaj kursu..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              className="h-9"
            />

            <ScrollArea className="h-[400px] border rounded-lg p-3">
              <div className="space-y-2">
                {filteredCourses.map((course) => {
                  const isSelected = selectedTeacherCourseIds.has(course.id);
                  return (
                    <label
                      key={course.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => handleToggleCourse(course.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={saving}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleToggleCourse(course.id)}
                      />
                      <span className="text-2xl">{course.icon_emoji || "📚"}</span>
                      <div className="flex-1 font-medium">{course.title}</div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubPage>
  );
};