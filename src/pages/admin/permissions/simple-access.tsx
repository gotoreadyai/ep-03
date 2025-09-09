// src/pages/admin/permissions/simple-access.tsx
import { useState, useMemo } from "react";
import { useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Button,
  Badge,
  Input,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  Search,
  Info,
  BookOpen,
  Users,
  UserCog,
  Settings,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { CourseAccessDialog } from "./access/CourseAccessDialog";
import { AccessInfoCard } from "./access/AccessInfoCard";

type Course = {
  id: number;
  title: string;
  icon_emoji: string;
  is_published: boolean;
};

type CourseAccess = {
  course_id: number;
  group_id: number | null;
  teacher_id: string | null;
};

type CourseStats = {
  groupCount: number;
  teacherCount: number;
};

type SortConfig = {
  key: keyof Course | "groupCount" | "teacherCount" | null;
  direction: "asc" | "desc";
};

export const SimpleAccessManagement = () => {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAccessDialog, setShowAccessDialog] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "title",
    direction: "asc",
  });

  // Pobieranie kursów
  const { data: coursesData, isLoading: loadingCourses } = useList<Course>({
    resource: "courses",
    filters: [{ field: "is_published", operator: "eq", value: true }],
    pagination: { pageSize: 1000 },
    sorters: [{ field: "title", order: "asc" }],
  });

  // Pobieranie dostępów
  const { data: accessData, refetch: refetchAccess } = useList<CourseAccess>({
    resource: "course_access",
    pagination: { pageSize: 10000 },
  });

  const courses = useMemo(() => coursesData?.data ?? [], [coursesData]);
  const access = useMemo(() => accessData?.data ?? [], [accessData]);

  // Statystyki kursów
  const courseStats = useMemo(() => {
    const stats: { [key: number]: CourseStats } = {};

    courses.forEach((course) => {
      const courseAccess = access.filter((a) => a.course_id === course.id);
      stats[course.id] = {
        groupCount: courseAccess.filter((a) => a.group_id).length,
        teacherCount: courseAccess.filter((a) => a.teacher_id).length,
      };
    });

    return stats;
  }, [courses, access]);

  // Filtrowanie i sortowanie kursów
  const processedCourses = useMemo(() => {
    const filtered = courses.filter(
      (course) =>
        search === "" ||
        course.title.toLowerCase().includes(search.toLowerCase())
    );

    // Sortowanie
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key === "groupCount") {
          aValue = courseStats[a.id]?.groupCount || 0;
          bValue = courseStats[b.id]?.groupCount || 0;
        } else if (sortConfig.key === "teacherCount") {
          aValue = courseStats[a.id]?.teacherCount || 0;
          bValue = courseStats[b.id]?.teacherCount || 0;
        } else if (sortConfig.key && sortConfig.key in a) {
          aValue = a[sortConfig.key as keyof Course];
          bValue = b[sortConfig.key as keyof Course];
        }

        if (aValue < bValue)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [courses, search, sortConfig, courseStats]);

  const handleSort = (key: keyof Course | "groupCount" | "teacherCount") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIcon = ({
    column,
  }: {
    column: keyof Course | "groupCount" | "teacherCount";
  }) => {
    if (sortConfig.key !== column) {
      return <ChevronUp className="w-4 h-4 opacity-20" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <SubPage>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Nagłówek */}
        <div>
          <h1 className="text-2xl font-bold">Dostęp do kursów</h1>
          <p className="text-muted-foreground mt-1">
            Zarządzaj dostępem grup i nauczycieli do kursów
          </p>
        </div>

        {/* Alert informacyjny */}
        <AccessInfoCard />

        {/* Wyszukiwarka */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Szukaj kursu po nazwie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela kursów */}
        <Card>
          <CardContent className="p-0">
            {loadingCourses ? (
              <div className="p-8 text-center text-muted-foreground">
                Ładowanie kursów...
              </div>
            ) : processedCourses.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {search ? "Nie znaleziono kursów" : "Brak kursów w systemie"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="cursor-pointer select-none"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center gap-1">
                          Kurs
                          <SortIcon column="title" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none text-center"
                        onClick={() => handleSort("groupCount")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Grupy z dostępem
                          <SortIcon column="groupCount" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none text-center"
                        onClick={() => handleSort("teacherCount")}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Nauczyciele
                          <SortIcon column="teacherCount" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedCourses.map((course) => {
                      const stats = courseStats[course.id] || {
                        groupCount: 0,
                        teacherCount: 0,
                      };
                      return (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {course.icon_emoji || "📚"}
                              </span>
                              <div className="font-medium">{course.title}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                stats.groupCount > 0 ? "default" : "secondary"
                              }
                              className="gap-1"
                            >
                              <Users className="w-3 h-3" />
                              {stats.groupCount} grup
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={
                                stats.teacherCount > 0 ? "default" : "secondary"
                              }
                              className="gap-1"
                            >
                              <UserCog className="w-3 h-3" />
                              {stats.teacherCount} nauczycieli
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowAccessDialog(true);
                              }}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Zarządzaj dostępem
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informacja o wynikach */}
        <div className="text-sm text-muted-foreground text-center">
          Wyświetlono {processedCourses.length} z {courses.length} kursów
        </div>
      </div>

      {/* Dialog zarządzania dostępem */}
      <CourseAccessDialog
        course={selectedCourse}
        open={showAccessDialog}
        onOpenChange={setShowAccessDialog}
        onAccessUpdate={refetchAccess}
      />
    </SubPage>
  );
};