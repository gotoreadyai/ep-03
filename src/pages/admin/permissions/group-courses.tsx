// src/pages/admin/permissions/group-courses.tsx
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
import { Search, Users, BookOpen, Calendar } from "lucide-react";
import { toast } from "sonner";
import { GroupCoursesInfoCard } from "./components/GroupCoursesInfoCard";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
};

type Course = {
  id: number;
  title: string;
  icon_emoji: string;
};

type CourseAccess = {
  course_id: number;
  group_id: number;
};

export const GroupCoursesManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Pobierz grupy
  const { data: groupsData, isLoading } = useList<Group>({
    resource: "groups",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
  });

  // Pobierz kursy
  const { data: coursesData } = useList<Course>({
    resource: "courses",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  // Pobierz przypisania - POPRAWIONY FILTR
  const { data: accessData, refetch: refetchAccess } = useList<CourseAccess>({
    resource: "course_access",
    filters: [{ field: "group_id", operator: "nnull", value: null }],
    pagination: { pageSize: 10000 },
  });

  const groups = groupsData?.data ?? [];
  const courses = coursesData?.data ?? [];
  const allAccess = accessData?.data ?? [];

  // Liczba kursów na grupę
  const groupCourseCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    groups.forEach((g) => {
      counts[g.id] = allAccess.filter((a) => a.group_id === g.id).length;
    });
    return counts;
  }, [groups, allAccess]);

  // Kursy wybranej grupy
  const selectedGroupCourseIds = useMemo(() => {
    if (!selectedGroup) return new Set<number>();
    return new Set(allAccess.filter((a) => a.group_id === selectedGroup.id).map((a) => a.course_id));
  }, [selectedGroup, allAccess]);

  // Filtrowanie
  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.academic_year.includes(search)
    );
  }, [groups, search]);

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) => !courseSearch || c.title.toLowerCase().includes(courseSearch.toLowerCase())
    );
  }, [courses, courseSearch]);

  const handleOpenDialog = (group: Group) => {
    setSelectedGroup(group);
    setShowDialog(true);
    setCourseSearch("");
  };

  const handleToggleCourse = async (courseId: number) => {
    if (!selectedGroup || saving) return;

    const hasAccess = selectedGroupCourseIds.has(courseId);
    setSaving(true);

    try {
      if (hasAccess) {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", courseId)
          .eq("group_id", selectedGroup.id);

        if (error) throw error;
        toast.success("Kurs usunięty");
      } else {
        const { error } = await supabaseClient.from("course_access").insert({
          course_id: courseId,
          group_id: selectedGroup.id,
          teacher_id: null,
        });

        if (error) throw error;
        toast.success("Kurs dodany");
      }

      // Poczekaj na refetch - POPRAWIONE
      await refetchAccess();
    } catch (error: any) {
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
          <h1 className="text-2xl font-bold">Kursy dla grup</h1>
          <p className="text-muted-foreground mt-1">Przypisz kursy do których grupy mają dostęp</p>
        </div>

        {/* Info */}
        <GroupCoursesInfoCard />

        {/* Wyszukiwarka */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj grupy..."
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
            <CardTitle>Grupy ({groups.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Ładowanie...</div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {search ? "Nie znaleziono grup" : "Brak aktywnych grup"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupa</TableHead>
                    <TableHead>Rok akademicki</TableHead>
                    <TableHead className="text-center">Liczba kursów</TableHead>
                    <TableHead className="text-center">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {group.academic_year}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{groupCourseCounts[group.id] || 0} kursów</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(group)}>
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
                <Users className="w-5 h-5" />
                <div>
                  <div>Kursy dla grupy: {selectedGroup?.name}</div>
                  <div className="text-sm font-normal text-muted-foreground mt-1">
                    Zaznacz kursy dostępne dla tej grupy
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Wybrano: <strong>{selectedGroupCourseIds.size}</strong> z {courses.length} kursów
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
                  const isSelected = selectedGroupCourseIds.has(course.id);
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