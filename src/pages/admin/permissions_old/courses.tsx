// src/pages/admin/permissions/courses.tsx - POPRAWIONA WERSJA
import { useState, useMemo } from "react";
import { useList, useCreate, useNotification } from "@refinedev/core";
import { supabaseClient } from "@/utility";
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
 Skeleton,
 ScrollArea,
 Tabs,
 TabsContent,
 TabsList,
 TabsTrigger,
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui";
import { 
 BookOpen, 
 Users, 
 UserCheck, 
 Plus, 
 X, 
 Loader2,
 Link,
 AlertCircle
} from "lucide-react";

type Course = {
 id: number;
 title: string;
 is_published: boolean;
};

type Group = {
 id: number;
 name: string;
 academic_year: string;
};

type Teacher = {
 id: string;
 full_name: string;
 email: string;
};

type CourseAccess = {
 course_id: number;
 group_id: number | null;
 teacher_id: string | null;
};

export const CoursePermissions = () => {
 const { open } = useNotification();
 const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
 const [removing, setRemoving] = useState(false);
 const [showAssignDialog, setShowAssignDialog] = useState(false);
 const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
 const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

 // Pobierz dane
 const { data: coursesData, isLoading: loadingCourses } = useList<Course>({
   resource: "courses",
   pagination: { pageSize: 1000 },
   sorters: [{ field: "title", order: "asc" }],
 });

 const { data: groupsData, isLoading: loadingGroups } = useList<Group>({
   resource: "groups",
   filters: [{ field: "is_active", operator: "eq", value: true }],
   pagination: { pageSize: 1000 },
 });

 const { data: teachersData, isLoading: loadingTeachers } = useList<Teacher>({
   resource: "users",
   filters: [
     { field: "role", operator: "eq", value: "teacher" },
     { field: "is_active", operator: "eq", value: true }
   ],
   pagination: { pageSize: 1000 },
 });

 const { data: accessData, refetch: refetchAccess, isLoading: loadingAccess } = useList<CourseAccess>({
   resource: "course_access",
   pagination: { pageSize: 10000 },
   meta: {
     select: `
       *,
       groups(id, name, academic_year),
       users!course_access_teacher_id_fkey(id, full_name, email)
     `
   }
 });

 const { mutate: createAccess, isLoading: creating } = useCreate();

 const courses = coursesData?.data ?? [];
 const groups = groupsData?.data ?? [];
 const teachers = teachersData?.data ?? [];
 const access = accessData?.data ?? [];

 const selectedCourse = courses.find(c => c.id === selectedCourseId);

 // Dostęp do wybranego kursu
 const courseAccess = useMemo(() => {
   if (!selectedCourseId) return { assignments: [] };
   
   const courseAccessRows = access.filter(a => a.course_id === selectedCourseId);
   
   // Grupuj po teacher_id i group_id
   const assignments = courseAccessRows.map(row => ({
     teacher: row.teacher_id ? teachers.find(t => t.id === row.teacher_id) : null,
     group: row.group_id ? groups.find(g => g.id === row.group_id) : null,
     raw: row
   })).filter(a => a.teacher || a.group);
   
   return { assignments };
 }, [selectedCourseId, access, teachers, groups]);

 // Grupy bez nauczyciela w tym kursie
 const groupsWithoutTeacher = useMemo(() => {
   if (!selectedCourseId) return [];
   
   const courseGroups = courseAccess.assignments
     .filter(a => a.group && !a.teacher)
     .map(a => a.group);
     
   return courseGroups;
 }, [courseAccess]);

 const handleAddGroup = (groupId: number) => {
   if (!selectedCourseId) return;

   createAccess(
     {
       resource: "course_access",
       values: { 
         course_id: selectedCourseId, 
         group_id: groupId,
         teacher_id: null 
       },
       successNotification: () => ({
         message: "Grupa dodana do kursu",
         type: "success"
       }),
     },
     { onSuccess: () => refetchAccess() }
   );
 };

 const handleAssignTeacherToGroup = () => {
   if (!selectedCourseId || !selectedTeacherId) return;

   createAccess(
     {
       resource: "course_access",
       values: { 
         course_id: selectedCourseId, 
         group_id: null,  // POPRAWKA: null zamiast selectedGroupId
         teacher_id: selectedTeacherId 
       },
       successNotification: () => ({
         message: "Nauczyciel przypisany do kursu",
         type: "success"
       }),
     },
     { 
       onSuccess: () => {
         refetchAccess();
         setShowAssignDialog(false);
         setSelectedGroupId(null);
         setSelectedTeacherId(null);
       }
     }
   );
 };

 const handleRemoveAccess = async (type: 'group' | 'teacher', id: string | number) => {
   if (!selectedCourseId) return;

   setRemoving(true);
   try {
     const query = supabaseClient
       .from('course_access')
       .delete()
       .eq('course_id', selectedCourseId);

     if (type === 'group') {
       query.eq('group_id', id);
     } else if (type === 'teacher') {
       query.eq('teacher_id', id);
     }

     const { error } = await query;
     if (error) throw error;

     open?.({
       type: "success",
       message: "Dostęp został usunięty",
     });

     refetchAccess();
   } catch (error) {
     open?.({
       type: "error",
       message: "Nie udało się usunąć dostępu",
     });
   } finally {
     setRemoving(false);
   }
 };

 const loading = loadingCourses || loadingGroups || loadingTeachers || loadingAccess;

 // Grupuj przypisania
 const groupedAssignments = useMemo(() => {
   const groups = courseAccess.assignments.filter(a => a.group);
   const teachers = courseAccess.assignments.filter(a => a.teacher);
   
   return { groups, teachers };
 }, [courseAccess]);

 // Dostępne grupy do dodania
 const availableGroups = groups.filter(g => 
   !groupedAssignments.groups.some(ga => ga.group?.id === g.id)
 );

 return (
   <SubPage>
     <Lead 
       title="Zarządzanie dostępem do kursów" 
       description="Przypisz grupy i nauczycieli do kursów"
     />

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       {/* Lista kursów */}
       <div className="lg:col-span-1">
         <Card>
           <CardHeader>
             <CardTitle className="text-base flex items-center gap-2">
               <BookOpen className="w-4 h-4" />
               Wybierz kurs
             </CardTitle>
           </CardHeader>
           <CardContent>
             {loadingCourses ? (
               <div className="space-y-2">
                 {[1, 2, 3].map(i => (
                   <Skeleton key={i} className="h-12" />
                 ))}
               </div>
             ) : (
               <ScrollArea className="h-[600px]">
                 <div className="space-y-2">
                   {courses.map(course => (
                     <button
                       key={course.id}
                       onClick={() => setSelectedCourseId(course.id)}
                       className={`w-full text-left p-3 rounded-lg transition-colors ${
                         selectedCourseId === course.id
                           ? 'bg-primary text-primary-foreground'
                           : 'hover:bg-muted'
                       }`}
                     >
                       <div className="font-medium">{course.title}</div>
                       <Badge 
                         variant={selectedCourseId === course.id ? "secondary" : "outline"}
                         className="mt-1"
                       >
                         {course.is_published ? "Opublikowany" : "Szkic"}
                       </Badge>
                     </button>
                   ))}
                 </div>
               </ScrollArea>
             )}
           </CardContent>
         </Card>
       </div>

       {/* Zarządzanie dostępem */}
       <div className="lg:col-span-2">
         {!selectedCourse ? (
           <Card>
             <CardContent className="text-center py-12">
               <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
               <p className="text-muted-foreground">
                 Wybierz kurs z listy po lewej stronie
               </p>
             </CardContent>
           </Card>
         ) : (
           <Tabs defaultValue="groups">
             <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="groups">
                 <Users className="w-4 h-4 mr-2" />
                 Grupy ({groupedAssignments.groups.length})
               </TabsTrigger>
               <TabsTrigger value="teachers">
                 <UserCheck className="w-4 h-4 mr-2" />
                 Nauczyciele ({groupedAssignments.teachers.length})
               </TabsTrigger>
             </TabsList>

             {/* Tab z grupami */}
             <TabsContent value="groups">
               <Card>
                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <CardTitle>Grupy w kursie</CardTitle>
                     <Select onValueChange={(v) => handleAddGroup(Number(v))} disabled={creating}>
                       <SelectTrigger className="w-[200px]">
                         <SelectValue placeholder="Dodaj grupę" />
                       </SelectTrigger>
                       <SelectContent>
                         {availableGroups.length === 0 ? (
                           <div className="p-2 text-sm text-muted-foreground text-center">
                             Brak dostępnych grup
                           </div>
                         ) : (
                           availableGroups.map(group => (
                             <SelectItem key={group.id} value={String(group.id)}>
                               {group.name} ({group.academic_year})
                             </SelectItem>
                           ))
                         )}
                       </SelectContent>
                     </Select>
                   </div>
                 </CardHeader>
                 <CardContent>
                   {groupedAssignments.groups.length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p>Brak grup przypisanych do tego kursu</p>
                     </div>
                   ) : (
                     <div className="space-y-4">
                       {groupedAssignments.groups.map((assignment) => {
                         if (!assignment.group) return null;
                         return (
                           <div key={assignment.group.id} className="border rounded-lg p-4">
                             <div className="flex items-center justify-between">
                               <div>
                                 <h4 className="font-medium flex items-center gap-2">
                                   <Users className="w-4 h-4" />
                                   {assignment.group.name}
                                 </h4>
                                 <p className="text-sm text-muted-foreground">
                                   Rok: {assignment.group.academic_year}
                                 </p>
                               </div>
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 onClick={() => handleRemoveAccess('group', assignment.group!.id)}
                                 disabled={removing}
                               >
                                 <X className="w-4 h-4" />
                               </Button>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </CardContent>
               </Card>
             </TabsContent>

             {/* Tab z nauczycielami */}
             <TabsContent value="teachers">
               <Card>
                 <CardHeader>
                   <div className="flex items-center justify-between">
                     <CardTitle>Nauczyciele prowadzący</CardTitle>
                     <Button
                       size="sm"
                       onClick={() => setShowAssignDialog(true)}
                     >
                       <Plus className="w-4 h-4 mr-2" />
                       Dodaj nauczyciela
                     </Button>
                   </div>
                 </CardHeader>
                 <CardContent>
                   {groupedAssignments.teachers.length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground">
                       <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p>Brak nauczycieli przypisanych do tego kursu</p>
                     </div>
                   ) : (
                     <div className="space-y-3">
                       {groupedAssignments.teachers.map((assignment) => {
                         if (!assignment.teacher) return null;
                         return (
                           <div key={assignment.teacher.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                             <div>
                               <div className="font-medium">{assignment.teacher.full_name}</div>
                               <div className="text-sm text-muted-foreground">{assignment.teacher.email}</div>
                             </div>
                             <Button
                               size="sm"
                               variant="ghost"
                               onClick={() => handleRemoveAccess('teacher', assignment.teacher!.id)}
                               disabled={removing}
                             >
                               <X className="w-3 h-3" />
                             </Button>
                           </div>
                         );
                       })}
                     </div>
                   )}
                 </CardContent>
               </Card>
             </TabsContent>
           </Tabs>
         )}
       </div>
     </div>

     {/* Dialog przypisywania nauczyciela */}
     <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>Dodaj nauczyciela do kursu</DialogTitle>
         </DialogHeader>
         <div className="py-4">
           <Select onValueChange={setSelectedTeacherId}>
             <SelectTrigger>
               <SelectValue placeholder="Wybierz nauczyciela" />
             </SelectTrigger>
             <SelectContent>
               {teachers.map(teacher => (
                 <SelectItem key={teacher.id} value={teacher.id}>
                   {teacher.full_name} ({teacher.email})
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>
         <DialogFooter>
           <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
             Anuluj
           </Button>
           <Button 
             onClick={handleAssignTeacherToGroup} 
             disabled={!selectedTeacherId || creating}
           >
             Przypisz
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   </SubPage>
 );
};