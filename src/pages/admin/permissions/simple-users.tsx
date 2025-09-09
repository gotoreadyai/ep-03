// src/pages/admin/permissions/simple-users.tsx
import { useState, useMemo } from "react";
import { useList, useUpdate, useNotification } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Badge, 
  Input, 
  Alert, 
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch
} from "@/components/ui";
import { 
  Search, 
  Info, 
  Shield, 
  GraduationCap, 
  UserCog,
  Filter,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { UsersInfoCard } from "./users/UsersInfoCard";

type UserType = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  created_at: string;
};

type SortConfig = {
  key: keyof UserType | null;
  direction: 'asc' | 'desc';
};

export const SimpleUsersManagement = () => {
  const { open } = useNotification();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'full_name', direction: 'asc' });
  
  const { data: usersData, isLoading, refetch } = useList<UserType>({
    resource: "users",
    pagination: { pageSize: 10000 },
    sorters: [{ field: "full_name", order: "asc" }],
  });

  const { mutate: updateUser, isLoading: updating } = useUpdate();

  const users = usersData?.data ?? [];

  // Filtrowanie i sortowanie użytkowników
  const processedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = search === "" || 
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' ? user.is_active : !user.is_active);
      
      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sortowanie
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, search, roleFilter, statusFilter, sortConfig]);

  // Statystyki
  const stats = useMemo(() => {
    return {
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
    };
  }, [users]);

  const handleSort = (key: keyof UserType) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    updateUser(
      {
        resource: "users",
        id: userId,
        values: { is_active: !currentStatus },
        successNotification: () => ({
          message: currentStatus ? "Konto dezaktywowane" : "Konto aktywowane",
          type: "success"
        }),
      },
      { onSuccess: () => refetch() }
    );
  };

  const handleRoleChange = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    updateUser(
      {
        resource: "users",
        id: userId,
        values: { role: newRole },
        successNotification: () => ({
          message: "Rola zmieniona",
          type: "success"
        }),
      },
      { onSuccess: () => refetch() }
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Administrator</Badge>;
      case 'teacher':
        return <Badge className="bg-blue-500"><UserCog className="w-3 h-3 mr-1" />Nauczyciel</Badge>;
      default:
        return <Badge className="bg-green-500"><GraduationCap className="w-3 h-3 mr-1" />Uczeń</Badge>;
    }
  };

  const SortIcon = ({ column }: { column: keyof UserType }) => {
    if (sortConfig.key !== column) {
      return <ChevronUp className="w-4 h-4 opacity-20" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-bold">Zarządzanie użytkownikami</h1>
          <p className="text-muted-foreground mt-1">
            Zmień role użytkowników i zarządzaj ich dostępem do systemu
          </p>
        </div>

        <UsersInfoCard />

        {/* Statystyki */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Wszyscy</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.students}</div>
              <div className="text-xs text-muted-foreground">Uczniowie</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.teachers}</div>
              <div className="text-xs text-muted-foreground">Nauczyciele</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
              <div className="text-xs text-muted-foreground">Admini</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Aktywni</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <div className="text-xs text-muted-foreground">Nieaktywni</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtry */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj po imieniu lub emailu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Wszystkie role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie role</SelectItem>
                  <SelectItem value="student">Tylko uczniowie</SelectItem>
                  <SelectItem value="teacher">Tylko nauczyciele</SelectItem>
                  <SelectItem value="admin">Tylko admini</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Wszystkie statusy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="active">Tylko aktywni</SelectItem>
                  <SelectItem value="inactive">Tylko nieaktywni</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela użytkowników */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Ładowanie użytkowników...
              </div>
            ) : processedUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nie znaleziono użytkowników spełniających kryteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('full_name')}
                      >
                        <div className="flex items-center gap-1">
                          Imię i nazwisko
                          <SortIcon column="full_name" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-1">
                          Email
                          <SortIcon column="email" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer select-none"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center gap-1">
                          Rola
                          <SortIcon column="role" />
                        </div>
                      </TableHead>
                      <TableHead>Zmień rolę</TableHead>
                      <TableHead 
                        className="cursor-pointer select-none text-center"
                        onClick={() => handleSort('is_active')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Status
                          <SortIcon column="is_active" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedUsers.map((user) => (
                      <TableRow key={user.id} className={!user.is_active ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={user.role} 
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole as any)}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Uczeń</SelectItem>
                              <SelectItem value="teacher">Nauczyciel</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={user.is_active}
                              onCheckedChange={() => handleToggleActive(user.id, user.is_active)}
                              disabled={updating}
                            />
                            <span className="text-sm">
                              {user.is_active ? 
                                <Badge variant="outline" className="text-green-600">Aktywny</Badge> : 
                                <Badge variant="destructive">Nieaktywny</Badge>
                              }
                            </span>
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

        {/* Informacja o wynikach */}
        <div className="text-sm text-muted-foreground text-center">
          Wyświetlono {processedUsers.length} z {users.length} użytkowników
        </div>
      </div>
    </SubPage>
  );
};