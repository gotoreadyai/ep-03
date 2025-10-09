// src/pages/admin/permissions/components/CoursesTable.tsx
import { Badge, Button, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { BookOpen, Trash2 } from "lucide-react";

export type CourseRow = {
  id: number;
  title: string;
  icon_emoji?: string;
  is_published?: boolean | null;
};

type CoursesTableProps = {
  courses: CourseRow[];
  counts: Record<number, number>; // courseId -> liczba przypisań (grup/nauczycieli)
  isLoading?: boolean;
  emptyLabel?: string;
  manageLabel: string; // np. "Zarządzaj nauczycielami" | "Zarządzaj grupami"
  onTogglePublish: (course: CourseRow) => void;
  onManage: (course: CourseRow) => void;
  onDelete: (courseId: number) => void;
};

export const CoursesTable = ({
  courses,
  counts,
  isLoading,
  emptyLabel = "Brak kursów",
  manageLabel,
  onTogglePublish,
  onManage,
  onDelete,
}: CoursesTableProps) => {
  if (isLoading) {
    return <div className="p-8 text-center">Ładowanie...</div>;
  }

  if (!courses?.length) {
    return <div className="p-8 text-center text-muted-foreground">{emptyLabel}</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kurs</TableHead>
          <TableHead className="text-center">Przypisania</TableHead>
          <TableHead className="text-center">Publikacja</TableHead>
          <TableHead className="text-center">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => {
          const isPublished = !!course.is_published;
          return (
            <TableRow key={course.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{course.icon_emoji || "📚"}</span>
                  {course.title}
                  {isPublished ? (
                    <Badge variant="secondary" className="ml-2">Opublikowany</Badge>
                  ) : (
                    <Badge className="ml-2">Szkic</Badge>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-center">
                <Badge variant="secondary">{counts[course.id] || 0}</Badge>
              </TableCell>

              <TableCell className="text-center">
                <Switch checked={isPublished} onCheckedChange={() => onTogglePublish(course)} />
              </TableCell>

              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => onManage(course)}>
                    <BookOpen className="w-4 h-4 mr-1" />
                    {manageLabel}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(course.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
