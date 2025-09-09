// src/pages/teacher/topics/list.tsx
import { useList, useNavigation, useUpdate, useDelete } from "@refinedev/core";
import { Edit, BookOpen, Clock, MoreHorizontal, Lock, Unlock, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { FlexBox } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

type Topic = {
  id: number;
  title: string;
  position: number;
  is_published: boolean;
  course_id: number;
  courses: {
    id: number;
    title: string;
  };
  created_at: string;
  updated_at: string;
};

type Course = {
  id: number;
  title: string;
};

export const TopicsList = () => {
  const { edit, list } = useNavigation();
  const { mutate: updateTopic } = useUpdate();
  const { mutate: deleteTopic } = useDelete();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null);
  
  // Filtrowanie po kursie
  const filters = selectedCourseId !== "all" 
    ? [{
        field: "course_id",
        operator: "eq" as const,
        value: selectedCourseId,
      }]
    : [];
  
  const { data, isLoading, refetch } = useList<Topic>({
    resource: "topics",
    meta: {
      populate: ["courses"],
    },
    filters,
    pagination: {
      pageSize: 20,
    },
    sorters: [
      {
        field: "courses.title",
        order: "asc",
      },
      {
        field: "position",
        order: "asc",
      },
    ],
  });

  // Pobierz listę kursów do filtra
  const { data: coursesData } = useList<Course>({
    resource: "courses",
    pagination: {
      pageSize: 100,
    },
    sorters: [
      {
        field: "title",
        order: "asc",
      },
    ],
  });

  const topics = data?.data || [];
  const courses = coursesData?.data || [];

  const handleTogglePublish = async (topic: Topic) => {
    await updateTopic({
      resource: "topics",
      id: topic.id,
      values: {
        is_published: !topic.is_published,
      },
      successNotification: () => ({
        message: topic.is_published ? "Temat został ukryty" : "Temat został opublikowany",
        type: "success",
      }),
    });
    refetch();
  };

  const handleDeleteClick = (topic: Topic) => {
    setTopicToDelete(topic);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!topicToDelete) return;
    
    await deleteTopic({
      resource: "topics",
      id: topicToDelete.id,
      successNotification: () => ({
        message: "Temat został usunięty",
        type: "success",
      }),
      errorNotification: () => ({
        message: "Nie udało się usunąć tematu",
        type: "error",
      }),
    });
    
    setDeleteModalOpen(false);
    setTopicToDelete(null);
    refetch();
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Tematy"
          description="Zarządzaj tematami kursów"
        />
        <FlexBox variant="start" className="gap-2">
          {courses.length > 0 && (
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[250px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtruj po kursie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie kursy</SelectItem>
                <DropdownMenuSeparator />
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={() => list("courses")}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Przejdź do kursów
          </Button>
        </FlexBox>
      </FlexBox>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {selectedCourseId !== "all" 
                  ? "Brak tematów w wybranym kursie"
                  : "Brak tematów"
                }
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Aby dodać temat, przejdź do kursu
              </p>
              <Button onClick={() => list("courses")}>
                <BookOpen className="h-4 w-4 mr-2" />
                Przejdź do kursów
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Tytuł</TableHead>
                  <TableHead className="w-[200px]">Kurs</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[140px]">Data utworzenia</TableHead>
                  <TableHead className="text-right w-[80px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="w-12 justify-center">
                        {topic.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{topic.title}</div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="flex items-center text-sm">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
                        <span className="truncate block" title={topic.courses?.title || "Brak kursu"}>
                          {topic.courses?.title || "Brak kursu"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={topic.is_published ? "default" : "secondary"}>
                        {topic.is_published ? "Opublikowany" : "Szkic"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(topic.created_at).toLocaleDateString('pl-PL')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Otwórz menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => edit("topics", topic.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edytuj
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleTogglePublish(topic)}>
                            {topic.is_published ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Ukryj temat
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Opublikuj temat
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(topic)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Usuń temat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </SubPage>
  );
};