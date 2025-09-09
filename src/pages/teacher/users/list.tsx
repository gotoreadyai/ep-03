// src/pages/teacher/users/list.tsx
import { useNavigation, useGetIdentity } from "@refinedev/core";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Eye,
  GraduationCap,
  UserCircle,
  Search,
  Trophy,
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { FlexBox } from "@/components/shared";
import { Lead } from "@/components/reader";
import { Badge, Button, Input } from "@/components/ui";
import { SubPage } from "@/components/layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/utility";
import type { StudentData, TeacherIdentity, Group, GroupMember, UserStats } from '../types';

// Typ dla danych z zapytania course_access
interface CourseAccessWithGroup {
  group_id: number | null;
  groups: {
    id: number;
    name: string;
    academic_year: string;
    vendor_id?: number;
    is_active?: boolean;
    created_at?: string;
  } | null;
}

export const UsersList = () => {
  const { show } = useNavigation();
  const { data: identity } = useGetIdentity<TeacherIdentity>();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [teacherGroups, setTeacherGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pobierz uczniów nauczyciela
  useEffect(() => {
    const fetchTeacherStudents = async () => {
      if (!identity?.id) return;
      
      setLoading(true);
      try {
        // 1. Najpierw pobierz grupy, które mają kursy prowadzone przez nauczyciela
        const { data: teacherGroupsData, error: groupsError } = await supabaseClient
          .from('course_access')
          .select(`
            group_id,
            groups!inner(
              id,
              name,
              academic_year,
              vendor_id,
              is_active,
              created_at
            )
          `)
          .eq('teacher_id', identity.id)
          .not('group_id', 'is', null) as { 
            data: CourseAccessWithGroup[] | null; 
            error: any 
          };

        if (groupsError) throw groupsError;

        // Usuń duplikaty grup
        const uniqueGroupsMap = new Map<number, Group>();
        teacherGroupsData?.forEach(item => {
          if (item.group_id && item.groups) {
            const group: Group = {
              id: item.groups.id,
              name: item.groups.name,
              academic_year: item.groups.academic_year,
              vendor_id: item.groups.vendor_id || 0,
              is_active: item.groups.is_active ?? true,
              created_at: item.groups.created_at || new Date().toISOString()
            };
            uniqueGroupsMap.set(group.id, group);
          }
        });
        const uniqueGroups = Array.from(uniqueGroupsMap.values());
        
        setTeacherGroups(uniqueGroups);

        // 2. Pobierz ID wszystkich grup nauczyciela
        const groupIds = uniqueGroups.map(g => g.id);

        if (groupIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        // 3. Pobierz uczniów z tych grup
        const { data: studentsData, error: studentsError } = await supabaseClient
          .from('users')
          .select(`
            id,
            email,
            full_name,
            vendor_id,
            role,
            is_active,
            created_at,
            groups:group_members!inner(
              group_id,
              user_id,
              joined_at,
              groups!inner(
                id,
                name,
                academic_year,
                vendor_id,
                is_active,
                created_at
              )
            ),
            user_stats!left(
              user_id,
              total_points,
              current_level,
              quizzes_completed,
              last_active,
              daily_streak,
              perfect_scores,
              total_time_spent,
              idle_points_rate,
              last_idle_claim,
              updated_at
            )
          `)
          .eq('role', 'student')
          .in('groups.group_id', groupIds)
          .order('full_name');

        if (studentsError) throw studentsError;

        // Filtruj tylko uczniów z grup nauczyciela i mapuj na StudentData
        const filteredStudents = studentsData?.filter(student => 
          student.groups?.some((g: any) => groupIds.includes(g.groups?.id))
        ).map(student => ({
          ...student,
          role: student.role as 'student' | 'teacher' | 'admin',
          groups: student.groups.map((g: any) => ({
            group_id: g.group_id,
            user_id: g.user_id,
            joined_at: g.joined_at,
            groups: g.groups ? {
              id: g.groups.id,
              vendor_id: g.groups.vendor_id,
              name: g.groups.name,
              academic_year: g.groups.academic_year,
              is_active: g.groups.is_active,
              created_at: g.groups.created_at
            } as Group : undefined
          } as GroupMember)),
          user_stats: student.user_stats as UserStats[]
        } as StudentData)) || [];

        setStudents(filteredStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherStudents();
  }, [identity]);

  // Filtrowanie
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesGroup = groupFilter === "all" || 
      student.groups?.some(g => g.groups?.id.toString() === groupFilter);
      
    return matchesSearch && matchesGroup;
  });

  const getActivityStatus = (lastActive: string | undefined) => {
    if (!lastActive) return { color: "text-gray-500", text: "Brak aktywności" };
    
    const daysSinceActive = Math.floor(
      (new Date().getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActive === 0) return { color: "text-green-600", text: "Dzisiaj" };
    if (daysSinceActive === 1) return { color: "text-green-600", text: "Wczoraj" };
    if (daysSinceActive <= 7) return { color: "text-yellow-600", text: `${daysSinceActive} dni temu` };
    if (daysSinceActive <= 30) return { color: "text-orange-600", text: `${Math.floor(daysSinceActive / 7)} tyg. temu` };
    return { color: "text-red-600", text: "Ponad miesiąc temu" };
  };

  if (loading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Moi uczniowie"
          description={`Uczniowie z Twoich grup (${teacherGroups.length} ${teacherGroups.length === 1 ? 'grupa' : 'grup'})`}
        />
      </FlexBox>

      <FlexBox className="gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Szukaj ucznia..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtruj po grupie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie grupy</SelectItem>
            {teacherGroups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name} ({group.academic_year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FlexBox>

      {teacherGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nie masz przypisanych grup</p>
            <p className="text-muted-foreground">
              Poproś administratora o przypisanie Cię do kursów z grupami
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const stats: UserStats | undefined = student.user_stats?.[0];
            const activityStatus = getActivityStatus(stats?.last_active);
            
            return (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{student.full_name}</h3>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => show("users", student.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Grupa
                      </span>
                      <div className="flex gap-1">
                        {student.groups?.slice(0, 2).map((g: GroupMember) => (
                          <Badge key={g.groups?.id} variant="outline" className="text-xs">
                            {g.groups?.name}
                          </Badge>
                        ))}
                        {student.groups?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{student.groups.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Punkty
                      </span>
                      <span className="font-medium">
                        {stats?.total_points || 0}
                        <span className="text-xs text-muted-foreground ml-1">
                          (poz. {stats?.current_level || 1})
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        Quizy
                      </span>
                      <span className="font-medium">
                        {stats?.quizzes_completed || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Aktywność
                      </span>
                      <span className={`font-medium ${activityStatus.color}`}>
                        {activityStatus.text}
                      </span>
                    </div>
                    
                    {stats && stats.daily_streak > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Seria dni
                        </span>
                        <span className="font-medium text-orange-600">
                          🔥 {stats.daily_streak}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {activityStatus.color === "text-red-600" && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-xs text-orange-600">
                        <AlertCircle className="w-3 h-3" />
                        <span>Uczeń może potrzebować wsparcia</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          
          {filteredStudents.length === 0 && students.length > 0 && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nie znaleziono uczniów spełniających kryteria
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </SubPage>
  );
};