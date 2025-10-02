// src/pages/admin/permissions/groups.tsx
import { useState, useMemo } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
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
  Label,
  Switch,
  Checkbox,
  ScrollArea,
} from "@/components/ui";
import { Search, Plus, Users, Trash2, Calendar, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { GroupsInfoCard } from "./components/GroupsInfoCard";


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

export const GroupsManagement = () => {
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupYear, setNewGroupYear] = useState("2024/2025");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  // Pobierz grupy
  const { data: groupsData, isLoading, refetch: refetchGroups } = useList<Group>({
    resource: "groups",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
  });

  // Pobierz uczniów
  const { data: studentsData } = useList<Student>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "student" },
      { field: "is_active", operator: "eq", value: true },
    ],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "full_name", order: "asc" }],
    queryOptions: { enabled: showMembersDialog },
  });

  // Pobierz członków grup
  const { data: membersData, refetch: refetchMembers } = useList<GroupMember>({
    resource: "group_members",
    pagination: { pageSize: 10000 },
    meta: { select: "*, users!inner(full_name, email)" },
  });

  const { mutate: createGroup } = useCreate();
  const { mutate: updateGroup } = useUpdate();
  const { mutate: deleteGroup } = useDelete();

  const groups = groupsData?.data ?? [];
  const students = studentsData?.data ?? [];
  const members = membersData?.data ?? [];

  // Statystyki
  const groupStats = useMemo(() => {
    const stats: Record<number, number> = {};
    groups.forEach((g) => {
      stats[g.id] = members.filter((m) => m.group_id === g.id).length;
    });
    return stats;
  }, [groups, members]);

  // Filtrowane grupy
  const filteredGroups = useMemo(() => {
    return groups.filter(
      (g) =>
        !search ||
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.academic_year.includes(search)
    );
  }, [groups, search]);

  // Uczniowie w wybranej grupie
  const groupMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return members.filter((m) => m.group_id === selectedGroup.id);
  }, [selectedGroup, members]);

  // Dostępni uczniowie (nie w grupie)
  const availableStudents = useMemo(() => {
    if (!selectedGroup) return [];
    const studentsInGroup = new Set(groupMembers.map((m) => m.user_id));
    return students.filter(
      (s) =>
        !studentsInGroup.has(s.id) &&
        (!studentSearch ||
          s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.email.toLowerCase().includes(studentSearch.toLowerCase()))
    );
  }, [selectedGroup, students, groupMembers, studentSearch]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    createGroup(
      {
        resource: "groups",
        values: {
          name: newGroupName,
          academic_year: newGroupYear,
          vendor_id: 1,
        },
      },
      {
        onSuccess: () => {
          toast.success("Grupa utworzona");
          setShowCreateDialog(false);
          setNewGroupName("");
          refetchGroups();
        },
        onError: () => toast.error("Błąd tworzenia grupy"),
      }
    );
  };

  const handleDeleteGroup = (groupId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę grupę?")) return;

    deleteGroup(
      {
        resource: "groups",
        id: groupId,
      },
      {
        onSuccess: () => {
          toast.success("Grupa usunięta");
          refetchGroups();
        },
        onError: () => toast.error("Błąd usuwania grupy"),
      }
    );
  };

  const handleToggleActive = (group: Group) => {
    updateGroup(
      {
        resource: "groups",
        id: group.id,
        values: { is_active: !group.is_active },
      },
      {
        onSuccess: () => {
          toast.success(group.is_active ? "Grupa dezaktywowana" : "Grupa aktywowana");
          refetchGroups();
        },
        onError: () => toast.error("Błąd zmiany statusu"),
      }
    );
  };

  const handleOpenMembersDialog = (group: Group) => {
    setSelectedGroup(group);
    setShowMembersDialog(true);
    setSelectedStudents(new Set());
    setStudentSearch("");
  };

  const handleAddStudents = async () => {
    if (!selectedGroup || selectedStudents.size === 0) return;

    try {
      const insertData = Array.from(selectedStudents).map((userId) => ({
        group_id: selectedGroup.id,
        user_id: userId,
      }));

      const { error } = await supabaseClient.from("group_members").insert(insertData);

      if (error) throw error;

      toast.success(`Dodano ${selectedStudents.size} uczniów`);
      setSelectedStudents(new Set());
      setStudentSearch("");
      refetchMembers();
    } catch (error) {
      toast.error("Błąd dodawania uczniów");
    }
  };

  const handleRemoveStudent = async (userId: string) => {
    if (!selectedGroup) return;

    try {
      const { error } = await supabaseClient
        .from("group_members")
        .delete()
        .eq("group_id", selectedGroup.id)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Uczeń usunięty z grupy");
      refetchMembers();
    } catch (error) {
      toast.error("Błąd usuwania ucznia");
    }
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Grupy i uczniowie</h1>
            <p className="text-muted-foreground mt-1">Twórz klasy i przypisuj uczniów</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nowa grupa
          </Button>
        </div>

        {/* Info */}
        <GroupsInfoCard />

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

        {/* Tabela grup */}
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
                <p className="text-muted-foreground mb-4">
                  {search ? "Nie znaleziono grup" : "Brak grup"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Utwórz pierwszą grupę
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa grupy</TableHead>
                    <TableHead>Rok akademicki</TableHead>
                    <TableHead className="text-center">Liczba uczniów</TableHead>
                    <TableHead className="text-center">Status</TableHead>
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
                        <Badge variant="secondary">{groupStats[group.id] || 0} uczniów</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={group.is_active}
                          onCheckedChange={() => handleToggleActive(group)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenMembersDialog(group)}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Zarządzaj uczniami
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteGroup(group.id)}
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

      {/* Dialog tworzenia grupy */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Utwórz nową grupę</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa grupy</Label>
              <Input
                id="name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="np. Klasa 1A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Rok akademicki</Label>
              <Input
                id="year"
                value={newGroupYear}
                onChange={(e) => setNewGroupYear(e.target.value)}
                placeholder="np. 2024/2025"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>
              Utwórz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zarządzania uczniami */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Uczniowie w grupie: {selectedGroup?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Obecni uczniowie */}
            <div className="space-y-3">
              <div className="font-medium text-sm">Obecni uczniowie ({groupMembers.length})</div>
              <ScrollArea className="h-[400px] border rounded-lg p-3">
                {groupMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Brak uczniów w grupie</p>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted"
                      >
                        <div>
                          <div className="font-medium text-sm">{member.users?.full_name}</div>
                          <div className="text-xs text-muted-foreground">{member.users?.email}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveStudent(member.user_id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
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
              <ScrollArea className="h-[350px] border rounded-lg p-3">
                {availableStudents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {studentSearch ? "Nie znaleziono" : "Wszyscy uczniowie są w grupie"}
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
                          <div className="font-medium text-sm">{student.full_name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {selectedStudents.size > 0 && (
                <Button onClick={handleAddStudents} className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Dodaj zaznaczonych ({selectedStudents.size})
                </Button>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMembersDialog(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubPage>
  );
};