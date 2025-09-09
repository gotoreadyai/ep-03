// src/pages/admin/permissions/simple-groups.tsx
import { useState, useMemo } from "react";
import { useList, useCreate, useUpdate, useDelete } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Badge, 
  Input, 
  Alert, 
  AlertDescription, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Switch
} from "@/components/ui";
import { 
  Search, 
  Info, 
  Users, 
  Plus, 
  Calendar, 
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { GroupMembersDialog } from "./groups/GroupMembersDialog";
import { GroupsInfoCard } from "./groups/GroupsInfoCard";

type Group = {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
};

type GroupMember = {
  group_id: number;
  user_id: string;
  users?: {
    full_name: string;
    email: string;
  };
};

type SortConfig = {
  key: keyof Group | 'memberCount' | null;
  direction: 'asc' | 'desc';
};

export const SimpleGroupsManagement = () => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupYear, setNewGroupYear] = useState("2024/2025");
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

  // Pobieranie danych
  const { data: groupsData, isLoading: loadingGroups, refetch: refetchGroups } = useList<Group>({
    resource: "groups",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "name", order: "asc" }],
  });

  const { data: membersData, refetch: refetchMembers } = useList<GroupMember>({
    resource: "group_members",
    pagination: { pageSize: 10000 },
  });

  const { mutate: createGroup, isLoading: creating } = useCreate();
  const { mutate: updateGroup } = useUpdate();
  const { mutate: deleteGroup } = useDelete();

  // Memoizowane dane
  const groups = useMemo(() => groupsData?.data ?? [], [groupsData]);
  const members = useMemo(() => membersData?.data ?? [], [membersData]);

  // Statystyki grup
  const groupStats = useMemo(() => {
    const stats: Record<number, number> = {};
    groups.forEach(group => {
      stats[group.id] = members.filter(m => m.group_id === group.id).length;
    });
    return stats;
  }, [groups, members]);

  // Filtrowanie i sortowanie grup
  const processedGroups = useMemo(() => {
    const filtered = groups.filter(group =>
      search === "" || 
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.academic_year.includes(search)
    );

    // Sortowanie
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        if (sortConfig.key === 'memberCount') {
          aValue = groupStats[a.id] || 0;
          bValue = groupStats[b.id] || 0;
        } else {
          aValue = a[sortConfig.key as keyof Group];
          bValue = b[sortConfig.key as keyof Group];
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [groups, search, sortConfig, groupStats]);

  const handleSort = (key: keyof Group | 'memberCount') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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
          setShowCreateDialog(false);
          setNewGroupName("");
          refetchGroups();
        }
      }
    );
  };

  const handleDeleteGroup = (groupId: number) => {
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
      { onSuccess: () => refetchGroups() }
    );
  };

  const handleToggleGroupActive = async (group: Group) => {
    updateGroup(
      {
        resource: "groups",
        id: group.id,
        values: { is_active: !group.is_active },
        successNotification: () => ({
          message: group.is_active ? "Grupa dezaktywowana" : "Grupa aktywowana",
          type: "success"
        }),
      },
      { onSuccess: () => refetchGroups() }
    );
  };

  const SortIcon = ({ column }: { column: keyof Group | 'memberCount' }) => {
    if (sortConfig.key !== column) {
      return <ChevronUp className="w-4 h-4 opacity-20" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  const loading = loadingGroups;

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Zarządzanie grupami i klasami</h1>
            <p className="text-muted-foreground mt-1">
              Twórz grupy i przypisuj do nich uczniów
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nowa grupa
          </Button>
        </div>

        {/* Alert informacyjny */}
        <GroupsInfoCard />

        {/* Wyszukiwarka */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj grupy po nazwie lub roku akademickim..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela grup */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Ładowanie grup...
              </div>
            ) : processedGroups.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  {search ? "Nie znaleziono grup" : "Brak grup w systemie"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Utwórz pierwszą grupę
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Nazwa grupy
                          <SortIcon column="name" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('academic_year')}
                      >
                        <div className="flex items-center gap-1">
                          Rok akademicki
                          <SortIcon column="academic_year" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none text-center"
                        onClick={() => handleSort('memberCount')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Liczba uczniów
                          <SortIcon column="memberCount" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {group.academic_year}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {groupStats[group.id] || 0} uczniów
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={group.is_active}
                            onCheckedChange={() => handleToggleGroupActive(group)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedGroup(group);
                                setShowMembersDialog(true);
                              }}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              Zarządzaj
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteGroup(group.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
            <Button onClick={handleCreateGroup} disabled={creating || !newGroupName.trim()}>
              Utwórz grupę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zarządzania członkami grupy - teraz jako osobny komponent */}
      <GroupMembersDialog
        group={selectedGroup}
        open={showMembersDialog}
        onOpenChange={setShowMembersDialog}
        onMembersUpdate={refetchMembers}
      />
    </SubPage>
  );
};