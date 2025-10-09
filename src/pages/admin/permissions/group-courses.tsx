// src/pages/admin/permissions/group-courses.tsx
import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { supabaseClient } from "@/utility";
import { SubPage } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { Calendar, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
};

type Course = {
  id: number;
  title: string;
  icon_emoji?: string;
  is_published?: boolean | null;
};

type CourseAccess = {
  course_id: number;
  group_id: number | null;
  teacher_id: string | null;
};

export const GroupCoursesManagement = () => {
  const [search, setSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Kursy (pierwsza lista)
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useList<Course>({
    resource: "courses",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  // Grupy (do przypisań)
  const { data: groupsData } = useList<Group>({
    resource: "groups",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
    queryOptions: { enabled: showDialog },
  });

  // Wszystkie przypisania (filtrowane w JS do group_id != null)
  const { data: accessData, refetch: refetchAccess } = useList<CourseAccess>({
    resource: "course_access",
    pagination: { pageSize: 10000 },
  });

  const courses = coursesData?.data ?? [];
  const groups = groupsData?.data ?? [];
  const allAccessGroupOnly = useMemo(
    () => (accessData?.data ?? []).filter((a) => a.group_id !== null),
    [accessData]
  );

  // Filtrowanie kursów
  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) => !search || c.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  // Zliczanie przypisań na kurs
  const courseGroupCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    filteredCourses.forEach((c) => {
      counts[c.id] = allAccessGroupOnly.filter((a) => a.course_id === c.id).length;
    });
    return counts;
  }, [filteredCourses, allAccessGroupOnly]);

  // ID grup przypisanych do wybranego kursu
  const selectedCourseGroupIds = useMemo(() => {
    if (!selectedCourse) return new Set<number>();
    return new Set(
      allAccessGroupOnly
        .filter((a) => a.course_id === selectedCourse.id)
        .map((a) => a.group_id!) // group_id != null
    );
  }, [selectedCourse, allAccessGroupOnly]);

  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        !groupSearch ||
        g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
        g.academic_year.includes(groupSearch)
    );
  }, [groups, groupSearch]);

  const openAssignDialog = (course: Course) => {
    setSelectedCourse(course);
    setGroupSearch("");
    setShowDialog(true);
  };

  const toggleGroup = async (groupId: number) => {
    if (!selectedCourse || saving) return;
    const isAssigned = selectedCourseGroupIds.has(groupId);
    setSaving(true);

    try {
      if (isAssigned) {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", selectedCourse.id)
          .eq("group_id", groupId);

        if (error) throw error;
        toast.success("Usunięto grupę z kursu");
      } else {
        const { error } = await supabaseClient.from("course_access").insert({
          course_id: selectedCourse.id,
          group_id: groupId,
          teacher_id: null,
        });

        if (error) throw error;
        toast.success("Dodano grupę do kursu");
      }

      await refetchAccess();
    } catch (e: any) {
      toast.error(e.message || "Wystąpił błąd");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      const { error } = await supabaseClient
        .from("courses")
        .update({ is_published: !course.is_published })
        .eq("id", course.id);

      if (error) throw error;
      toast.success(course.is_published ? "Przeniesiono do szkicu" : "Opublikowano kurs");
      await refetchCourses();
    } catch (e: any) {
      toast.error(e.message || "Błąd zmiany publikacji");
    }
  };

  const deleteCourse = async (courseId: number) => {
    if (!confirm("Na pewno usunąć ten kurs? Tej operacji nie można cofnąć.")) return;

    try {
      const { error } = await supabaseClient.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      toast.success("Kurs usunięty");
      await refetchCourses();
      await refetchAccess();
    } catch (e: any) {
      toast.error(e.message || "Błąd usuwania kursu");
    }
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-bold">Kursy i grupy</h1>
          <p className="text-muted-foreground mt-1">
            Najpierw wybierz kurs, potem przypisz do niego grupy
          </p>
        </div>

        {/* Wyszukiwarka */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj kursu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela kursów */}
        <Card>
          <CardHeader>
            <CardTitle>Kursy ({filteredCourses.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {coursesLoading ? (
              <div className="p-8 text-center">Ładowanie...</div>
            ) : filteredCourses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Brak kursów</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kurs</TableHead>
                    <TableHead className="text-center">Grupy</TableHead>
                    <TableHead className="text-center">Publikacja</TableHead>
                    <TableHead className="text-center">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{course.icon_emoji || "📚"}</span>
                          {course.title}
                          {course.is_published ? (
                            <Badge variant="secondary" className="ml-2">Opublikowany</Badge>
                          ) : (
                            <Badge className="ml-2">Szkic</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {courseGroupCounts[course.id] || 0} grup
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={!!course.is_published}
                          onCheckedChange={() => togglePublish(course)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => openAssignDialog(course)}>
                            <Users className="w-4 h-4 mr-1" />
                            Zarządzaj grupami
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCourse(course.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog przypisań grup do kursu */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <div>
                  <div>Grupy dla kursu: {selectedCourse?.title}</div>
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    Zaznacz grupy, które mają mieć dostęp do tego kursu
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Szukaj grupy..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="h-9"
            />

            <ScrollArea className="h-[420px] border rounded-lg p-3">
              <div className="space-y-2">
                {filteredGroups.map((group) => {
                  const isSelected = selectedCourseGroupIds.has(group.id);
                  return (
                    <label
                      key={group.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                      }`}
                      onClick={() => toggleGroup(group.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={saving}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleGroup(group.id)}
                      />
                      <span className="text-2xl">👥</span>
                      <div className="flex-1">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {group.academic_year}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {filteredGroups.length === 0 && (
                  <div className="text-center text-muted-foreground py-10 text-sm">
                    Brak wyników
                  </div>
                )}
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
