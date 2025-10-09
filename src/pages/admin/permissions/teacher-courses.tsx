// src/pages/admin/permissions/teacher-courses.tsx
import { useState, useMemo } from "react";
import { useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { TeacherCourseAssign } from "./components/TeacherCourseAssign";
import { CoursesList } from "./components/CoursesList";

export const TeacherCoursesManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);

  const { data: coursesData, refetch: refetchCourses } = useList<any>({
    resource: "courses",
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  const { data: teachersData } = useList<any>({
    resource: "users",
    filters: [
      { field: "role", operator: "eq", value: "teacher" },
      { field: "is_active", operator: "eq", value: true },
    ],
    pagination: { pageSize: 1000 },
  });

  const { data: accessData, refetch: refetchAccess } = useList<any>({
    resource: "course_access",
    pagination: { pageSize: 10000 },
  });

  const courses = coursesData?.data ?? [];
  const teachers = teachersData?.data ?? [];
  const access = (accessData?.data ?? []).filter((a) => a.teacher_id !== null);

  const getAssignmentCount = (courseId: number) =>
    access.filter((a) => a.course_id === courseId).length;

  const handleTogglePublish = async (courseId: number, state: boolean) => {
    const { error } = await supabaseClient
      .from("courses")
      .update({ is_published: !state })
      .eq("id", courseId);
    if (error) {
      toast.error("Błąd zmiany statusu");
    } else {
      toast.success(!state ? "Kurs opublikowany" : "Kurs ukryty");
      refetchCourses();
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm("Czy na pewno chcesz usunąć ten kurs?")) return;
    const { error } = await supabaseClient.from("courses").delete().eq("id", courseId);
    if (error) toast.error("Błąd usuwania kursu");
    else {
      toast.success("Kurs usunięty");
      refetchCourses();
    }
  };

  const handleManage = (course: any) => {
    setSelectedCourse(course);
    setShowDialog(true);
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Kursy i nauczyciele</h1>
          <p className="text-muted-foreground mt-1">
            Zarządzaj przypisaniem nauczycieli do kursów
          </p>
        </div>

        <CoursesList
          courses={courses}
          getAssignmentCount={getAssignmentCount}
          onTogglePublish={handleTogglePublish}
          onDelete={handleDelete}
          onManage={handleManage}
        />

        <TeacherCourseAssign
          open={showDialog}
          onOpenChange={setShowDialog}
          course={selectedCourse}
          teachers={teachers}
          access={access}
          refetchAccess={refetchAccess}
        />
      </div>
    </SubPage>
  );
};
