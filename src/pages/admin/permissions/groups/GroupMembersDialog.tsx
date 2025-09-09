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
  Checkbox,
} from "@/components/ui";
import { UserPlus, UserMinus } from "lucide-react";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
};

type Student = {
  id: string;
  full_name: string;
  email: string;
};

type GroupMember = {
  group_id: number;
  user_id: string;
  users?: {
    full_name: string;
    email: string;
  };
};

interface GroupMembersDialogProps {
  group: Group | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersUpdate: () => void;
}

export const GroupMembersDialog = ({
  group,
  open,
  onOpenChange,
  onMembersUpdate,
}: GroupMembersDialogProps) => {
  const { open: notify } = useNotification();
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Pobieranie studentów
  const { data: studentsData } = useList<Student>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "student" },
      { field: "is_active", operator: "eq", value: true },
    ],
    pagination: { pageSize: 10000 },
    sorters: [{ field: "full_name", order: "asc" }],
    queryOptions: {
      enabled: open, // Pobieramy tylko gdy dialog jest otwarty
    },
  });

  // Pobieranie członków grupy
  const { data: membersData, refetch: refetchMembers } = useList<GroupMember>({
    resource: "group_members",
    filters: group ? [{ field: "group_id", operator: "eq", value: group.id }] : [],
    pagination: { pageSize: 10000 },
    meta: {
      select: `
        *,
        users!inner(full_name, email)
      `,
    },
    queryOptions: {
      enabled: open && !!group, // Pobieramy tylko gdy dialog jest otwarty i grupa wybrana
    },
  });

  // Memoizowane dane
  const students = useMemo(() => studentsData?.data ?? [], [studentsData]);
  const members = useMemo(() => membersData?.data ?? [], [membersData]);

  // Członkowie wybranej grupy
  const selectedGroupMembers = useMemo(() => {
    if (!group) return [];
    return members.filter((m) => m.group_id === group.id);
  }, [group, members]);

  // Dostępni uczniowie do dodania
  const availableStudents = useMemo(() => {
    if (!group) return [];

    const studentsInGroup = new Set(selectedGroupMembers.map((m) => m.user_id));

    return students.filter((student) => {
      if (studentsInGroup.has(student.id)) return false;
      if (
        studentSearch &&
        !student.full_name.toLowerCase().includes(studentSearch.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [students, group, selectedGroupMembers, studentSearch]);

  // Reset stanu przy zamknięciu
  useEffect(() => {
    if (!open) {
      setSelectedStudents(new Set());
      setStudentSearch("");
    }
  }, [open]);

  const handleAddSelectedStudents = async () => {
    if (!group || selectedStudents.size === 0) return;

    try {
      const insertData = Array.from(selectedStudents).map((userId) => ({
        group_id: group.id,
        user_id: userId,
      }));

      const { error } = await supabaseClient
        .from("group_members")
        .insert(insertData);

      if (error) throw error;

      notify?.({
        type: "success",
        message: `Dodano ${selectedStudents.size} uczniów do grupy`,
      });

      setSelectedStudents(new Set());
      setStudentSearch("");
      refetchMembers();
      onMembersUpdate();
    } catch (error) {
      notify?.({
        type: "error",
        message: "Nie udało się dodać uczniów",
      });
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (!group) return;

    try {
      const { error } = await supabaseClient
        .from("group_members")
        .delete()
        .eq("group_id", group.id)
        .eq("user_id", userId);

      if (error) throw error;

      notify?.({
        type: "success",
        message: "Uczeń usunięty z grupy",
      });

      refetchMembers();
      onMembersUpdate();
    } catch (error) {
      notify?.({
        type: "error",
        message: "Nie udało się usunąć ucznia",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedStudents(new Set());
    setStudentSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Zarządzaj uczniami w grupie: {group?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 overflow-hidden">
          {/* Obecni członkowie */}
          <div className="space-y-3">
            <div className="font-medium text-sm">
              Uczniowie w grupie ({selectedGroupMembers.length})
            </div>
            <div className="border rounded-lg p-3 h-[400px] overflow-y-auto">
              {selectedGroupMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Brak uczniów w grupie
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedGroupMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted"
                    >
                      <div>
                        <div className="font-medium text-sm">
                          {member.users?.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.users?.email}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveStudent(member.user_id)}
                        className="text-red-600"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dostępni uczniowie */}
          <div className="space-y-3">
            <div className="font-medium text-sm">
              Dostępni uczniowie ({availableStudents.length})
            </div>
            <Input
              placeholder="Szukaj ucznia..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="h-9"
            />
            <div className="border rounded-lg p-3 h-[350px] overflow-y-auto">
              {availableStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {studentSearch
                    ? "Nie znaleziono uczniów"
                    : "Wszyscy uczniowie są już w grupie"}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedStudents.has(student.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedStudents);
                          if (checked) {
                            newSet.add(student.id);
                          } else {
                            newSet.delete(student.id);
                          }
                          setSelectedStudents(newSet);
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {student.full_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedStudents.size > 0 && (
              <Button onClick={handleAddSelectedStudents} className="w-full">
                <UserPlus className="w-4 h-4 mr-2" />
                Dodaj zaznaczonych ({selectedStudents.size})
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};