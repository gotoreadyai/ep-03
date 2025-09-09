// src/pages/admin/permissions/users/list.tsx
import { useTable, useUpdate, useNavigation } from "@refinedev/core";
import type { CrudFilter } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Calendar, Shield, UserCheck, Edit, Power, Eye } from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Input, Button, Switch, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { SubPage } from "@/components/layout";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  is_active: boolean;
  created_at: string;
  vendor_id: number;
}

export const UsersList = () => {
  const { mutate: updateUser } = useUpdate();
  const { create, edit, show } = useNavigation();
  
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
    filters,
  } = useTable<User>({
    resource: "users",
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleToggleActive = async (user: User) => {
    await updateUser({
      resource: "users",
      id: user.id,
      values: {
        is_active: !user.is_active,
      },
      successNotification: () => ({
        message: user.is_active ? "Użytkownik dezaktywowany" : "Użytkownik aktywowany",
        type: "success",
      }),
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'teacher': return <UserCheck className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'teacher': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Użytkownicy"
          description="Zarządzaj wszystkimi użytkownikami w systemie"
        />
        <Button onClick={() => create("permissions-users")}>
          <Users className="w-4 h-4 mr-2" />
          Dodaj użytkownika
        </Button>
      </FlexBox>

      <FlexBox className="gap-4">
        <Input
          placeholder="Szukaj użytkownika..."
          className="max-w-sm"
          onChange={(e) => {
            const existingFilters = filters || [];
            
            // Bezpieczne sprawdzanie typu
            const roleFilter = existingFilters.find((f): f is CrudFilter & { field: string } => 
              'field' in f && f.field === 'role'
            );
            
            const newFilters: CrudFilter[] = [];
            if (roleFilter) newFilters.push(roleFilter);
            
            if (e.target.value) {
              newFilters.push({
                operator: "or",
                value: [
                  {
                    field: "full_name",
                    operator: "contains",
                    value: e.target.value,
                  },
                  {
                    field: "email",
                    operator: "contains",
                    value: e.target.value,
                  },
                ],
              });
            }
            
            setFilters(newFilters);
          }}
        />
        
        <Select
          onValueChange={(value) => {
            const newFilters = filters?.filter((f): f is CrudFilter & { field: string } => 
              'field' in f && f.field !== 'role'
            ) || [];
            
            if (value !== 'all') {
              newFilters.push({
                field: 'role',
                operator: 'eq',
                value: value,
              });
            }
            setFilters(newFilters);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtruj po roli" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie role</SelectItem>
            <SelectItem value="admin">Administratorzy</SelectItem>
            <SelectItem value="teacher">Nauczyciele</SelectItem>
            <SelectItem value="student">Uczniowie</SelectItem>
          </SelectContent>
        </Select>
      </FlexBox>

      <GridBox>
        {data?.data?.map((user) => (
          <Card key={user.id} className={!user.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  {getRoleIcon(user.role)}
                  {user.full_name}
                </CardTitle>
                <FlexBox variant="start" className="gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => show("permissions-users", user.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => edit("permissions-users", user.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={user.is_active}
                    onCheckedChange={() => handleToggleActive(user)}
                  />
                </FlexBox>
              </FlexBox>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(user.role) as any}>
                  {user.role === 'admin' ? 'Administrator' : 
                   user.role === 'teacher' ? 'Nauczyciel' : 'Uczeń'}
                </Badge>
                <Badge variant={user.is_active ? "outline" : "secondary"}>
                  {user.is_active ? "Aktywny" : "Nieaktywny"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>Dołączył: {new Date(user.created_at).toLocaleDateString('pl-PL')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridBox>

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="użytkowników"
      />
    </SubPage>
  );
};