// src/pages/admin/permissions/group-courses.tsx
import { useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { supabaseClient } from "@/utility";
import { SubPage } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea,
} from "@/components/ui";
import { Calendar, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { GroupCoursesInfoCard } from "./components/GroupCoursesInfoCard";
import { CoursesTable, CourseRow } from "./components/CoursesTable";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
};

type Course = CourseRow;

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

  // Kursy
  const { data: coursesData, isLoading: coursesLoading, refetch: refetchCourses } = useList<Course>({
    resource: "courses",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  // Grupy
  const { data: groupsData } = useList<Group>({
    resource: "groups",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
    queryOptions: { enabled: showDialog },
  });

  // Przypisania (group_id != null)
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
  const filteredCourses = useMemo(
    () => courses.filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase())),
    [courses, search]
  );

  // Licznik przypisań per kurs
  const courseGroupCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    filteredCourses.forEach((c) => {
      counts[c.id] = allAccessGroupOnly.filter((a) => a.course_id === c.id).length;
    });
    return counts;
  }, [filteredCourses, allAccessGroupOnly]);

  // Zestaw groupId dla wybranego kursu
  const selectedCourseGroupIds = useMemo(() => {
    if (!selectedCourse) return new Set<number>();
    return new Set(
      allAccessGroupOnly
        .filter((a) => a.course_id === selectedCourse.id)
        .map((a) => a.group_id!) // != null
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
          <h1 className="text-2xl font-bold">Kursy dla grup</h1>
          <p className="text-muted-foreground mt-1">Najpierw wybierz kurs, potem przypisz do niego grupy</p>
        </div>

        {/* Info */}
        <GroupCoursesInfoCard />

        {/* Wyszukiwarka kursów */}
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

        {/* Tabela kursów (wspólny komponent) */}
        <Card>
          <CardHeader>
            <CardTitle>Kursy ({filteredCourses.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CoursesTable
              courses={filteredCourses}
              counts={courseGroupCounts}
              isLoading={coursesLoading}
              manageLabel="Zarządzaj grupami"
              onTogglePublish={togglePublish}
              onManage={openAssignDialog}
              onDelete={deleteCourse}
            />
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
                {useMemo(() => {
                  const list = filteredGroups;
                  if (!list.length) {
                    return (
                      <div className="text-center text-muted-foreground py-10 text-sm">
                        Brak wyników
                      </div>
                    );
                  }
                  return list.map((group) => {
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
                  });
                }, [filteredGroups, saving, selectedCourseGroupIds])}
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
