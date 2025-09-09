// src/pages/admin/permissions/users.tsx
import { useState } from "react";
import { useList, useUpdate, useNotification } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Button, 
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Switch,
} from "@/components/ui";
import { UserCog, Search, Mail, Shield, User } from "lucide-react";

type UserRole = "student" | "teacher" | "admin";

type UserType = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  vendor_id: number;
};

export const UserManagement = () => {
  const { open } = useNotification();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const { data: usersData, isLoading, refetch } = useList<UserType>({
    resource: "users",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "full_name", order: "asc" }],
  });

  const { mutate: updateUser, isLoading: updating } = useUpdate();

  const users = usersData?.data ?? [];

  // Filtrowanie
  const filteredUsers = users.filter(user => {
    const matchesSearch = search === "" || 
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUser(
      {
        resource: "users",
        id: userId,
        values: { role: newRole },
        successNotification: () => ({
          message: "Rola została zmieniona",
          type: "success"
        }),
      },
      { onSuccess: () => refetch() }
    );
  };

  const handleActiveToggle = (userId: string, isActive: boolean) => {
    updateUser(
      {
        resource: "users",
        id: userId,
        values: { is_active: isActive },
        successNotification: () => ({
          message: isActive ? "Użytkownik aktywowany" : "Użytkownik dezaktywowany",
          type: "success"
        }),
      },
      { onSuccess: () => refetch() }
    );
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "teacher":
        return <Badge>Nauczyciel</Badge>;
      case "student":
        return <Badge variant="secondary">Uczeń</Badge>;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "teacher":
        return <UserCog className="w-4 h-4" />;
      case "student":
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <SubPage>
      <Lead 
        title="Zarządzanie użytkownikami" 
        description="Zmień role i status użytkowników w systemie"
      />

      {/* Filtry */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj po imieniu lub emailu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtruj po roli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie role</SelectItem>
                <SelectItem value="admin">Administratorzy</SelectItem>
                <SelectItem value="teacher">Nauczyciele</SelectItem>
                <SelectItem value="student">Uczniowie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista użytkowników */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista użytkowników</CardTitle>
            <Badge variant="outline">
              {filteredUsers.length} użytkowników
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="w-[150px]">Rola</TableHead>
                    <TableHead className="w-[100px] text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nie znaleziono użytkowników
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              {getRoleIcon(user.role)}
                            </div>
                            <div className="font-medium">{user.full_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                            disabled={updating}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="teacher">Nauczyciel</SelectItem>
                              <SelectItem value="student">Uczeń</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={(v) => handleActiveToggle(user.id, v)}
                            disabled={updating}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};