import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  MoreVertical,
  BookOpen,
  ArrowRight,
  UserPlus
} from "lucide-react";
import { FlexBox, GridBox } from "@/components/shared";
import { PaginationSwith } from "@/components/navigation";
import { Lead } from "@/components/reader";
import { useLoading } from "@/utility";
import { Badge, Button, Input } from "@/components/ui";
import { SubPage } from "@/components/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Group {
  id: number;
  name: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  vendor_id: number;
  group_members?: Array<{ count: number }>;
  course_access?: Array<{ count: number }>;
}

export const GroupsList = () => {
  const { create, edit, show } = useNavigation();
  const navigate = useNavigate();
  const { mutate: deleteGroup } = useDelete();
  
  const {
    tableQuery: { data, isLoading, isError, refetch },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<Group>({
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    meta: {
      select: '*, group_members(count), course_access(count)'
    }
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć grupę "${name}"? Ta akcja usunie również wszystkie przypisania uczniów i kursów.`)) {
      deleteGroup(
        {
          resource: "groups",
          id,
        },
        {
          onSuccess: () => {
            toast.success("Grupa została usunięta");
            refetch();
          },
          onError: () => {
            toast.error("Błąd podczas usuwania grupy");
          }
        }
      );
    }
  };

  const navigateToAssignCourses = (groupId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/teacher/groups/${groupId}/assign-courses`);
  };

  const navigateToAssignStudents = (groupId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigate(`/teacher/groups/${groupId}/assign-students`);
  };

  // Funkcja pomocnicza do wyciągania liczby
  const getCount = (countArray: Array<{ count: number }> | undefined): number => {
    if (!countArray || !Array.isArray(countArray) || countArray.length === 0) return 0;
    return countArray[0].count || 0;
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Grupy"
          description="Zarządzaj grupami uczniów i przypisuj im kursy"
        />
        <Button onClick={() => create("groups")}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj grupę
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj grup..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "name",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      {data?.data?.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Brak grup</h3>
            <p className="text-muted-foreground mb-6">
              Utwórz pierwszą grupę, aby móc przypisywać uczniów do kursów
            </p>
            <Button onClick={() => create("groups")}>
              <Plus className="w-4 h-4 mr-2" />
              Utwórz pierwszą grupę
            </Button>
          </CardContent>
        </Card>
      ) : (
        <GridBox>
          {data?.data?.map((group) => {
            const memberCount = getCount(group.group_members);
            const courseCount = getCount(group.course_access);
            
            return (
              <Card 
                key={group.id} 
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 relative overflow-hidden"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('[role="menu"]') && 
                      !(e.target as HTMLElement).closest('.quick-action')) {
                    show("groups", group.id);
                  }
                }}
              >
                {!group.is_active && (
                  <div className="absolute inset-0 bg-muted/50 z-10 pointer-events-none" />
                )}
                
                <CardHeader>
                  <FlexBox>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="truncate">{group.name}</span>
                    </CardTitle>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="relative z-20"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => show("groups", group.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Podgląd
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => edit("groups", group.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edytuj
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => navigateToAssignStudents(group.id, e)}
                          className="text-blue-600 focus:text-blue-600"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Dodaj uczniów
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => navigateToAssignCourses(group.id, e)}
                          className="text-green-600 focus:text-green-600"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Przypisz kursy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(group.id, group.name)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FlexBox>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Rok akademicki: {group.academic_year}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-background rounded-md">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Uczniowie</p>
                            <p className="text-lg font-semibold">{memberCount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-background rounded-md">
                            <BookOpen className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Kursy</p>
                            <p className="text-lg font-semibold">{courseCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Badge 
                        variant={group.is_active ? "default" : "secondary"}
                        className={group.is_active ? "bg-green-600" : ""}
                      >
                        {group.is_active ? "Aktywna" : "Nieaktywna"}
                      </Badge>
                      
                      <div className="flex gap-1">
                        {memberCount === 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 quick-action text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => navigateToAssignStudents(group.id, e)}
                            title="Dodaj uczniów"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 quick-action text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={(e) => navigateToAssignCourses(group.id, e)}
                          title="Przypisz kursy"
                        >
                          <BookOpen className="h-4 w-4" />
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </GridBox>
      )}

      <PaginationSwith
        current={current}
        pageSize={pageSize}
        total={data?.total || 0}
        setCurrent={setCurrent}
        itemName="grup"
      />
    </SubPage>
  );
};