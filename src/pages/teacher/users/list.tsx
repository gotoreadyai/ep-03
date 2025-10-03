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
  AlertCircle,
  BookOpen
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
import { useState, useEffect, useMemo } from "react";
import { supabaseClient } from "@/utility";
import { useNavigate } from "react-router-dom";
import type { StudentData, TeacherIdentity, Group, GroupMember, UserStats } from '../types';

export const UsersList = () => {
  const { show } = useNavigation();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<TeacherIdentity>();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [teacherGroups, setTeacherGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherCourses, setTeacherCourses] = useState<Map<number, number[]>>(new Map());
  
  useEffect(() => {
    const fetchTeacherStudents = async () => {
      if (!identity?.id) {
        return;
      }
      
      setLoading(true);
      
      try {
        // 1. Pobierz kursy nauczyciela
        const { data: teacherCoursesData, error: coursesError } = await supabaseClient
          .from('course_access')
          .select('course_id')
          .eq('teacher_id', identity.id);

        if (coursesError) throw coursesError;

        if (!teacherCoursesData || teacherCoursesData.length === 0) {
          setTeacherGroups([]);
          setStudents([]);
          setLoading(false);
          return;
        }

        const courseIds = [...new Set(teacherCoursesData.map(ca => ca.course_id))];

        // 2. Pobierz grupy które mają dostęp do tych kursów
        const { data: groupAccessData, error: groupAccessError } = await supabaseClient
          .from('course_access')
          .select('group_id, course_id')
          .in('course_id', courseIds)
          .not('group_id', 'is', null);

        if (groupAccessError) throw groupAccessError;

        // Stwórz mapę grupa -> kursy
        const groupToCourses = new Map<number, number[]>();
        groupAccessData?.forEach(ga => {
          if (ga.group_id) {
            const courses = groupToCourses.get(ga.group_id) || [];
            courses.push(ga.course_id);
            groupToCourses.set(ga.group_id, courses);
          }
        });
        setTeacherCourses(groupToCourses);

        const groupIds = [...new Set(groupAccessData?.map(ga => ga.group_id).filter(Boolean) || [])];

        if (groupIds.length === 0) {
          setTeacherGroups([]);
          setStudents([]);
          setLoading(false);
          return;
        }

        // 3. Pobierz szczegóły grup
        const { data: groupsData, error: groupsError } = await supabaseClient
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .order('name');

        if (groupsError) throw groupsError;

        const groups: Group[] = groupsData?.map(g => ({
          id: g.id,
          name: g.name,
          academic_year: g.academic_year,
          vendor_id: g.vendor_id || 0,
          is_active: g.is_active ?? true,
          created_at: g.created_at || new Date().toISOString()
        })) || [];
        
        setTeacherGroups(groups);

        // 4. Pobierz wszystkich uczniów z grup za jednym razem
        const { data: studentsData, error: studentsError } = await supabaseClient
          .from('users')
          .select(`
            *,
            user_stats(*),
            group_members!inner(
              group_id,
              user_id,
              joined_at,
              groups!inner(*)
            )
          `)
          .in('group_members.group_id', groupIds)
          .eq('role', 'student')
          .order('full_name');

        if (studentsError) throw studentsError;

        // 5. Przekształć dane na format StudentData
        const formattedStudents: StudentData[] = studentsData?.map(user => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          vendor_id: user.vendor_id,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          groups: user.group_members?.map((gm: any) => ({
            group_id: gm.group_id,
            user_id: gm.user_id,
            joined_at: gm.joined_at,
            groups: gm.groups
          })) || [],
          user_stats: user.user_stats ? (Array.isArray(user.user_stats) ? user.user_stats : [user.user_stats]) : []
        })) || [];

        setStudents(formattedStudents);

      } catch (error) {
        console.error('Error fetching students:', error);
        setTeacherGroups([]);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherStudents();
  }, [identity]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !searchTerm || 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesGroup = groupFilter === "all" || 
        student.groups?.some(g => g.groups?.id.toString() === groupFilter);
        
      return matchesSearch && matchesGroup;
    });
  }, [students, searchTerm, groupFilter]);

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

  const getFirstCourseForStudent = (student: StudentData): number | null => {
    const groupId = student.groups?.[0]?.group_id;
    if (!groupId) return null;
    const courses = teacherCourses.get(groupId);
    return courses?.[0] || null;
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
          title="Uczniowie z moich kursów"
          description={`Uczniowie z grup które mają dostęp do Twoich kursów (${teacherGroups.length} ${teacherGroups.length === 1 ? 'grupa' : teacherGroups.length < 5 ? 'grupy' : 'grup'})`}
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
        
        {teacherGroups.length > 0 && (
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
        )}
      </FlexBox>

      {teacherGroups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Nie masz przypisanych kursów</p>
            <p className="text-muted-foreground">
              Poproś administratora o przypisanie Cię do kursów.
              Administrator może to zrobić w module "Zarządzanie dostępem" → "Dostęp do kursów"
            </p>
          </CardContent>
        </Card>
      ) : filteredStudents.length === 0 && students.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Brak uczniów w grupach z Twoimi kursami</p>
            <p className="text-muted-foreground">
              Uczniowie pojawią się tutaj, gdy administrator przypisze grupy do Twoich kursów
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const stats: UserStats | undefined = student.user_stats?.[0];
            const activityStatus = getActivityStatus(stats?.last_active);
            const groupId = student.groups?.[0]?.group_id;
            const courseId = getFirstCourseForStudent(student);
            
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
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => show("users", student.id)}
                        title="Zobacz profil"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {groupId && courseId && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/teacher/groups/${groupId}/courses/${courseId}/students/${student.id}`)}
                          title="Zobacz szczegóły w kursie"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Grupa
                      </span>
                      <div className="flex gap-1 flex-wrap justify-end">
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