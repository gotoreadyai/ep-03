import { useState, useMemo, useEffect } from "react";
import { useList, useNotification } from "@refinedev/core";
import { supabaseClient } from "@/utility";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Badge,
  ScrollArea,
  Checkbox,
} from "@/components/ui";
import { Search, Users, UserPlus, Check } from "lucide-react";

type Course = {
  id: number;
  title: string;
  icon_emoji: string;
  is_published: boolean;
};

type Group = {
  id: number;
  name: string;
  academic_year: string;
};

type Teacher = {
  id: string;
  full_name: string;
  email: string;
};

type CourseAccess = {
  course_id: number;
  group_id: number | null;
  teacher_id: string | null;
};

interface CourseAccessDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccessUpdate: () => void;
}

export const CourseAccessDialog = ({
  course,
  open,
  onOpenChange,
  onAccessUpdate,
}: CourseAccessDialogProps) => {
  const { open: notify } = useNotification();
  const [groupSearch, setGroupSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // Pobieranie grup
  const { data: groupsData } = useList<Group>({
    resource: "groups",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
    queryOptions: { enabled: open },
  });

  // Pobieranie nauczycieli
  const { data: teachersData } = useList<Teacher>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "teacher" },
      { field: "is_active", operator: "eq", value: true },
    ],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "full_name", order: "asc" }],
    queryOptions: { enabled: open },
  });

  // Pobieranie dostępów
  const { data: accessData, refetch: refetchAccess } = useList<CourseAccess>({
    resource: "course_access",
    filters: course ? [{ field: "course_id", operator: "eq", value: course.id }] : [],
    pagination: { pageSize: 10000 },
    queryOptions: { enabled: open && !!course },
  });

  const groups = useMemo(() => groupsData?.data ?? [], [groupsData]);
  const teachers = useMemo(() => teachersData?.data ?? [], [teachersData]);
  const access = useMemo(() => accessData?.data ?? [], [accessData]);

  // Stan dostępu
  const courseAccessState = useMemo(() => {
    if (!course) return { groupAccess: {}, teacherAccess: {} };

    const groupAccess: Record<number, boolean> = {};
    const teacherAccess: Record<string, boolean> = {};

    access.forEach((row) => {
      if (row.group_id) groupAccess[row.group_id] = true;
      if (row.teacher_id) teacherAccess[row.teacher_id] = true;
    });

    return { groupAccess, teacherAccess };
  }, [course, access]);

  // Filtrowane grupy
  const filteredGroups = useMemo(() => {
    return groups.filter(
      (group) =>
        !groupSearch ||
        group.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
        group.academic_year.includes(groupSearch)
    );
  }, [groups, groupSearch]);

  // Filtrowanie nauczycieli
  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (teacher) =>
        !teacherSearch ||
        teacher.full_name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.email.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  }, [teachers, teacherSearch]);

  // Reset przy zamknięciu
  useEffect(() => {
    if (!open) {
      setGroupSearch("");
      setTeacherSearch("");
    }
  }, [open]);

  const handleToggleGroupAccess = async (groupId: number, hasAccess: boolean) => {
    if (!course) return;

    setSaving(true);
    try {
      if (hasAccess) {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", course.id)
          .eq("group_id", groupId);

        if (error) throw error;
      } else {
        const { error } = await supabaseClient
          .from("course_access")
          .insert({
            course_id: course.id,
            group_id: groupId,
            teacher_id: null,
          });

        if (error) throw error;
      }

      notify?.({
        type: "success",
        message: hasAccess ? "Dostęp usunięty" : "Dostęp przyznany",
      });

      refetchAccess();
      onAccessUpdate();
    } catch (error) {
      notify?.({
        type: "error",
        message: "Wystąpił błąd podczas zapisywania",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTeacherAccess = async (
    teacherId: string,
    hasAccess: boolean
  ) => {
    if (!course) return;

    setSaving(true);
    try {
      if (hasAccess) {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("course_id", course.id)
          .eq("teacher_id", teacherId);

        if (error) throw error;
      } else {
        const { error } = await supabaseClient
          .from("course_access")
          .insert({
            course_id: course.id,
            group_id: null,
            teacher_id: teacherId,
          });

        if (error) throw error;
      }

      notify?.({
        type: "success",
        message: hasAccess ? "Dostęp usunięty" : "Dostęp przyznany",
      });

      refetchAccess();
      onAccessUpdate();
    } catch (error) {
      notify?.({
        type: "error",
        message: "Wystąpił błąd podczas zapisywania",
      });
    } finally {
      setSaving(false);
    }
  };

  const accessedGroupsCount = Object.values(courseAccessState.groupAccess).filter(Boolean).length;
  const accessedTeachersCount = Object.values(courseAccessState.teacherAccess).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{course?.icon_emoji || "📚"}</span>
            <div>
              <div>Zarządzaj dostępem do kursu</div>
              <div className="text-sm font-normal text-muted-foreground">
                {course?.title}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 overflow-hidden">
          {/* Grupy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Grupy z dostępem
              </div>
              <Badge variant="secondary">
                {accessedGroupsCount} z {groups.length}
              </Badge>
            </div>
            <Input
              placeholder="Szukaj grupy..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="h-9"
            />
            <ScrollArea className="h-[350px] border rounded-lg p-3">
              <div className="space-y-2">
                {filteredGroups.map((group) => {
                  const hasAccess = courseAccessState.groupAccess[group.id] || false;
                  return (
                    <label
                      key={group.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        hasAccess
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={hasAccess}
                        onCheckedChange={() =>
                          handleToggleGroupAccess(group.id, hasAccess)
                        }
                        disabled={saving}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{group.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {group.academic_year}
                        </div>
                      </div>
                      {hasAccess && <Check className="w-4 h-4 text-primary" />}
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Nauczyciele */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Nauczyciele prowadzący
              </div>
              <Badge variant="secondary">
                {accessedTeachersCount} z {teachers.length}
              </Badge>
            </div>
            <Input
              placeholder="Szukaj nauczyciela..."
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              className="h-9"
            />
            <ScrollArea className="h-[350px] border rounded-lg p-3">
              <div className="space-y-2">
                {filteredTeachers.map((teacher) => {
                  const hasAccess = courseAccessState.teacherAccess[teacher.id] || false;
                  return (
                    <label
                      key={teacher.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        hasAccess
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={hasAccess}
                        onCheckedChange={() =>
                          handleToggleTeacherAccess(teacher.id, hasAccess)
                        }
                        disabled={saving}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{teacher.full_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {teacher.email}
                        </div>
                      </div>
                      {hasAccess && <Check className="w-4 h-4 text-primary" />}
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Kurs dostępny dla <strong>{accessedGroupsCount} grup</strong> i{" "}
            <strong>{accessedTeachersCount} nauczycieli</strong>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};