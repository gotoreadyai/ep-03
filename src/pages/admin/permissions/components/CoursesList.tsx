// src/pages/admin/permissions/components/CoursesList.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, Switch, Badge, Table, TableHead, TableRow, TableCell, TableBody, TableHeader } from "@/components/ui";
import { BookOpen, Trash2 } from "lucide-react";

type Course = {
  id: number;
  title: string;
  icon_emoji: string;
  is_published: boolean;
};

type CoursesListProps = {
  courses: Course[];
  getAssignmentCount: (courseId: number) => number;
  onTogglePublish: (courseId: number, currentState: boolean) => void;
  onDelete: (courseId: number) => void;
  onManage: (course: Course) => void;
};

export const CoursesList = ({
  courses,
  getAssignmentCount,
  onTogglePublish,
  onDelete,
  onManage,
}: CoursesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kursy ({courses.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kurs</TableHead>
              <TableHead className="text-center">Opublikowany</TableHead>
              <TableHead className="text-center">Liczba przypisań</TableHead>
              <TableHead className="text-center">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <span className="text-xl">{course.icon_emoji || "📘"}</span>
                  {course.title}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={course.is_published}
                    onCheckedChange={() => onTogglePublish(course.id, course.is_published)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{getAssignmentCount(course.id)} przypisań</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => onManage(course)}>
                      <BookOpen className="w-4 h-4 mr-1" /> Zarządzaj
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => onDelete(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
