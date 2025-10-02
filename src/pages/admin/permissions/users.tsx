// src/pages/admin/permissions/users.tsx
import { useState, useMemo } from "react";
import { useList, useUpdate } from "@refinedev/core";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/components/ui";
import { Search, Shield, GraduationCap, UserCog } from "lucide-react";
import { toast } from "sonner";
import { UsersInfoCard } from "./components/UsersInfoCard";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  is_active: boolean;
};

export const UsersManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher" | "admin">("all");

  const { data: usersData, isLoading, refetch } = useList<User>({
    resource: "users",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "full_name", order: "asc" }],
  });

  const { mutate: updateUser } = useUpdate();

  const users = usersData?.data ?? [];

  // Statystyki
  const stats = useMemo(() => {
    return {
      total: users.length,
      students: users.filter((u) => u.role === "student").length,
      teachers: users.filter((u) => u.role === "teacher").length,
      admins: users.filter((u) => u.role === "admin").length,
    };
  }, [users]);

  // Filtrowanie
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleRoleChange = (userId: string, newRole: "student" | "teacher" | "admin") => {
    updateUser(
      {
        resource: "users",
        id: userId,
        values: { role: newRole },
      },
      {
        onSuccess: () => {
          toast.success("Rola zmieniona");
          refetch();
        },
        onError: () => toast.error("Błąd zmiany roli"),
      }
    );
  };

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    updateUser(
      {
        resource: "users",
        id: userId,
        values: { is_active: !currentStatus },
      },
      {
        onSuccess: () => {
          toast.success(currentStatus ? "Konto dezaktywowane" : "Konto aktywowane");
          refetch();
        },
        onError: () => toast.error("Błąd zmiany statusu"),
      }
    );
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-500">
            <Shield className="w-3 h-3 mr-1" />
            Administrator
          </Badge>
        );
      case "teacher":
        return (
          <Badge className="bg-blue-500">
            <UserCog className="w-3 h-3 mr-1" />
            Nauczyciel
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-500">
            <GraduationCap className="w-3 h-3 mr-1" />
            Uczeń
          </Badge>
        );
    }
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-bold">Użytkownicy</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj rolami użytkowników w systemie</p>
        </div>

        {/* Info */}
        <UsersInfoCard />

        {/* Statystyki */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Wszyscy</div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.students}</div>
              <div className="text-sm text-muted-foreground">Uczniowie</div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.teachers}</div>
              <div className="text-sm text-muted-foreground">Nauczyciele</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.admins}</div>
              <div className="text-sm text-muted-foreground">Administratorzy</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtry */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj po imieniu lub emailu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie role</SelectItem>
                  <SelectItem value="student">Tylko uczniowie</SelectItem>
                  <SelectItem value="teacher">Tylko nauczyciele</SelectItem>
                  <SelectItem value="admin">Tylko administratorzy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>
              Użytkownicy ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">Ładowanie...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nie znaleziono użytkowników
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Obecna rola</TableHead>
                    <TableHead>Zmień rolę</TableHead>
                    <TableHead className="text-center">Aktywny</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className={!user.is_active ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v as any)}
                        >
                          <SelectTrigger className="w-[160px] h-8">
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
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() => handleToggleActive(user.id, user.is_active)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
};