// src/pages/admin/permissions/components/TeacherCourseAssign.tsx
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Button, Checkbox, ScrollArea } from "@/components/ui";
import { UserCog, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";

type Teacher = {
  id: string;
  full_name: string;
  email: string;
};

type CourseAccess = {
  course_id: number;
  teacher_id: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: { id: number; title: string } | null;
  teachers: Teacher[];
  access: CourseAccess[];
  refetchAccess: () => Promise<any>;
};

export const TeacherCourseAssign = ({ open, onOpenChange, course, teachers, access, refetchAccess }: Props) => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const assignedIds = useMemo(() => {
    if (!course) return new Set<string>();
    return new Set(access.filter((a) => a.course_id === course.id && a.teacher_id).map((a) => a.teacher_id!));
  }, [course, access]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        !search ||
        t.full_name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [teachers, search]);

  const toggleAssignment = async (teacherId: string) => {
    if (!course || loading) return;
    const assigned = assignedIds.has(teacherId);
    setLoading(true);
    try {
      if (assigned) {
        const { error } = await supabaseClient
          .from("course_access")
          .delete()
          .eq("teacher_id", teacherId)
          .eq("course_id", course.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseClient
          .from("course_access")
          .insert({ course_id: course.id, teacher_id: teacherId, group_id: null });
        if (error) throw error;
      }
      await refetchAccess();
      toast.success(assigned ? "Usunięto przypisanie" : "Dodano przypisanie");
    } catch (err) {
      toast.error("Błąd przypisania");
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              <div>
                <div>Nauczyciele dla kursu: {course.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Zaznacz nauczycieli, którzy mają dostęp do tego kursu
                </div>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Szukaj nauczyciela..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />

          <ScrollArea className="h-[400px] border rounded-lg p-3">
            <div className="space-y-2">
              {filteredTeachers.map((teacher) => {
                const checked = assignedIds.has(teacher.id);
                return (
                  <label
                    key={teacher.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      checked ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted"
                    }`}
                    onClick={() => toggleAssignment(teacher.id)}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={loading}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleAssignment(teacher.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{teacher.full_name}</div>
                      <div className="text-xs text-muted-foreground">{teacher.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Zamknij
          </Button>
          {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
