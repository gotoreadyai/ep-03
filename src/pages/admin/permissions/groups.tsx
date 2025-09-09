// src/pages/admin/permissions/groups.tsx
import { useState, useMemo } from "react";
import { useList, useCreate, useUpdate, useNotification, useDelete } from "@refinedev/core";
import { supabaseClient } from "@/utility";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button,
  Badge,
  Input,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  ScrollArea,
  Avatar,
  AvatarFallback,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Edit, 
  Trash2,
  UserPlus,
  BookOpen,
  GraduationCap,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
};

type Student = {
  id: string;
  full_name: string;
  email: string;
};

type Teacher = {
  id: string;
  full_name: string;
  email: string;
};

type Course = {
  id: number;
  title: string;
};

export const GroupManagement = () => {
  const { open } = useNotification();
  const [search, setSearch] = useState("");
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupYear, setNewGroupYear] = useState(new Date().getFullYear().toString());
  const [addingStudent, setAddingStudent] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);

  // Pobieranie danych
  const { data: groupsData, isLoading: loadingGroups, refetch: refetchGroups } = useList<Group>({
    resource: "groups",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
  });

  const { data: studentsData } = useList<Student>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "student" },
      { field: "is_active", operator: "eq", value: true }
    ],
    pagination: { pageSize: 10000 },
  });

  const { data: teachersData } = useList<Teacher>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "teacher" },
      { field: "is_active", operator: "eq", value: true }
    ],
    pagination: { pageSize: 1000 },
  });

  const { data: membersData, refetch: refetchMembers } = useList({
    resource: "group_members",
    pagination: { pageSize: 10000 },
    meta: {
      select: `
        *,
        users!inner(id, full_name, email, role)
      `
    }
  });

  const { data: courseAccessData, refetch: refetchCourseAccess } = useList({
    resource: "course_access",
    pagination: { pageSize: 10000 },
    meta: {
      select: `
        *,
        courses(id, title),
        groups(id, name)
      `
    }
  });

  const { mutate: createGroup, isLoading: creating } = useCreate();
  const { mutate: updateGroup } = useUpdate();
  const { mutate: deleteGroup } = useDelete();

  const groups = groupsData?.data ?? [];
  const students = studentsData?.data ?? [];
  const teachers = teachersData?.data ?? [];
  const members = membersData?.data ?? [];
  const courseAccess = courseAccessData?.data ?? [];

  // Filtrowanie grup
  const filteredGroups = groups.filter(group =>
    search === "" || 
    group.name.toLowerCase().includes(search.toLowerCase()) ||
    group.academic_year.includes(search)
  );

  // Członkowie wybranej grupy
  const selectedGroupMembers = useMemo(() => {
    if (!selectedGroup) return [];
    return members.filter(m => m.group_id === selectedGroup.id);
  }, [selectedGroup, members]);

  // Nauczyciele przypisani do grupy (przez kursy)
  const selectedGroupTeachers = useMemo(() => {
    if (!selectedGroup) return [];
    
    const groupCourses = courseAccess.filter(ca => ca.group_id === selectedGroup.id);
    const teacherIds = new Set<string>();
    const teacherCourses = new Map<string, string[]>();
    
    groupCourses.forEach(ca => {
      if (ca.teacher_id) {
        teacherIds.add(ca.teacher_id);
        if (!teacherCourses.has(ca.teacher_id)) {
          teacherCourses.set(ca.teacher_id, []);
        }
        teacherCourses.get(ca.teacher_id)?.push(ca.courses.title);
      }
    });
    
    return Array.from(teacherIds).map(teacherId => {
      const teacher = teachers.find(t => t.id === teacherId);
      return {
        ...teacher,
        courses: teacherCourses.get(teacherId) || []
      };
    }).filter(Boolean);
  }, [selectedGroup, courseAccess, teachers]);

  // Dostępni studenci do dodania
  const availableStudents = students.filter(student => 
    !selectedGroupMembers.some(m => m.user_id === student.id)
  );

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
        successNotification: () => ({
          message: "Grupa została utworzona",
          type: "success"
        }),
      },
      {
        onSuccess: () => {
          setShowNewGroupDialog(false);
          setNewGroupName("");
          refetchGroups();
        }
      }
    );
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !newGroupName.trim()) return;

    updateGroup(
      {
        resource: "groups",
        id: editingGroup.id,
        values: {
          name: newGroupName,
          academic_year: newGroupYear,
        },
        successNotification: () => ({
          message: "Grupa została zaktualizowana",
          type: "success"
        }),
      },
      {
        onSuccess: () => {
          setEditingGroup(null);
          setNewGroupName("");
          refetchGroups();
        }
      }
    );
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć tę grupę?")) return;

    deleteGroup(
      {
        resource: "groups",
        id: groupId,
        successNotification: () => ({
          message: "Grupa została usunięta",
          type: "success"
        }),
      },
      {
        onSuccess: () => {
          refetchGroups();
          if (selectedGroup?.id === groupId) {
            setSelectedGroup(null);
          }
        }
      }
    );
  };

  const handleAddStudent = async (studentId: string) => {
    if (!selectedGroup) return;

    setAddingStudent(true);
    try {
      const { error } = await supabaseClient
        .from('group_members')
        .insert({
          group_id: selectedGroup.id,
          user_id: studentId
        });

      if (error) throw error;

      open?.({
        type: "success",
        message: "Uczeń został dodany do grupy",
      });

      refetchMembers();
    } catch (error) {
      open?.({
        type: "error",
        message: "Nie udało się dodać ucznia",
      });
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;

    setRemovingMember(true);
    try {
      const { error } = await supabaseClient
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroup.id)
        .eq('user_id', userId);

      if (error) throw error;

      open?.({
        type: "success",
        message: "Uczeń został usunięty z grupy",
      });

      refetchMembers();
    } catch (error) {
      open?.({
        type: "error",
        message: "Nie udało się usunąć ucznia",
      });
    } finally {
      setRemovingMember(false);
    }
  };

  const handleToggleActive = (groupId: number, isActive: boolean) => {
    updateGroup(
      {
        resource: "groups",
        id: groupId,
        values: { is_active: isActive },
        successNotification: () => ({
          message: isActive ? "Grupa aktywowana" : "Grupa dezaktywowana",
          type: "success"
        }),
      },
      { onSuccess: () => refetchGroups() }
    );
  };

  return (
    <SubPage>
      <Lead 
        title="Zarządzanie grupami" 
        description="Twórz grupy, przypisuj uczniów i zarządzaj dostępem"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista grup */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Grupy
                  </CardTitle>
                  <Button size="sm" onClick={() => setShowNewGroupDialog(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingGroups ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {filteredGroups.map(group => {
                      const memberCount = members.filter(m => m.group_id === group.id).length;
                      
                      return (
                        <div
                          key={group.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedGroup?.id === group.id
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedGroup(group)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{group.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {group.academic_year} • {memberCount} uczniów
                              </div>
                            </div>
                            <Badge variant={group.is_active ? "default" : "secondary"}>
                              {group.is_active ? "Aktywna" : "Nieaktywna"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Szczegóły grupy */}
        <div className="lg:col-span-2">
          {!selectedGroup ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  Wybierz grupę z listy po lewej stronie
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Nagłówek grupy */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Rok akademicki: {selectedGroup.academic_year}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingGroup(selectedGroup);
                          setNewGroupName(selectedGroup.name);
                          setNewGroupYear(selectedGroup.academic_year);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(selectedGroup.id, !selectedGroup.is_active)}
                      >
                        {selectedGroup.is_active ? "Dezaktywuj" : "Aktywuj"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteGroup(selectedGroup.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Zakładki */}
              <Tabs defaultValue="students">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="students">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Uczniowie ({selectedGroupMembers.length})
                  </TabsTrigger>
                  <TabsTrigger value="teachers">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Nauczyciele ({selectedGroupTeachers.length})
                  </TabsTrigger>
                </TabsList>

                {/* Uczniowie */}
                <TabsContent value="students">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Uczniowie w grupie</CardTitle>
                        <Select 
                          onValueChange={handleAddStudent} 
                          disabled={addingStudent || availableStudents.length === 0}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Dodaj ucznia" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableStudents.length === 0 ? (
                              <div className="p-2 text-sm text-muted-foreground text-center">
                                Brak dostępnych uczniów
                              </div>
                            ) : (
                              availableStudents.map(student => (
                                <SelectItem key={student.id} value={student.id}>
                                  {student.full_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedGroupMembers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Brak uczniów w tej grupie</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedGroupMembers.map(member => (
                            <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {member.users.full_name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{member.users.full_name}</div>
                                  <div className="text-xs text-muted-foreground">{member.users.email}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMember(member.user_id)}
                                disabled={removingMember}
                              >
                                {removingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Nauczyciele */}
                <TabsContent value="teachers">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Nauczyciele z dostępem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedGroupTeachers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Brak nauczycieli przypisanych do grupy</p>
                          <p className="text-sm mt-2">
                            Przypisz nauczycieli do kursów w zakładce "Dostęp do kursów"
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedGroupTeachers.map((teacher: any) => (
                            <div key={teacher.id} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {teacher.full_name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{teacher.full_name}</div>
                                  <div className="text-xs text-muted-foreground">{teacher.email}</div>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {teacher.courses.map((course: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {course}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* Dialog tworzenia/edycji grupy */}
      <Dialog open={showNewGroupDialog || !!editingGroup} onOpenChange={(open) => {
        if (!open) {
          setShowNewGroupDialog(false);
          setEditingGroup(null);
          setNewGroupName("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edytuj grupę" : "Utwórz nową grupę"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa grupy</Label>
              <Input
                id="name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="np. Klasa 3A"
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
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewGroupDialog(false);
                setEditingGroup(null);
              }}
            >
              Anuluj
            </Button>
            <Button 
              onClick={editingGroup ? handleUpdateGroup : handleCreateGroup} 
              disabled={creating || !newGroupName.trim()}
            >
              {editingGroup ? "Zapisz zmiany" : "Utwórz grupę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SubPage>
  );
};