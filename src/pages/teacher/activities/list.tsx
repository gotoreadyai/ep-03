import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
  HelpCircle,
  MoreVertical,
  Clock,
  BookOpen,
  ListChecks
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

interface Activity {
  id: number;
  topic_id: number;
  type: 'material' | 'quiz';
  title: string;
  position: number;
  is_published: boolean;
  content?: string;
  duration_min?: number;
  passing_score?: number;
  time_limit?: number;
  max_attempts?: number;
  created_at: string;
  topics?: {
    id: number;
    title: string;
    position: number;
    courses?: {
      id: number;
      title: string;
      icon_emoji?: string;
    };
  };
  _count?: {
    questions: number;
  };
}

export const ActivitiesList = () => {
  const { create, edit, show } = useNavigation();
  const navigate = useNavigate();
  const { mutate: deleteActivity } = useDelete();
  
  const {
    tableQuery: { data, isLoading, isError },
    current,
    setCurrent,
    pageSize,
    setFilters,
  } = useTable<Activity>({
    sorters: {
      initial: [
        {
          field: "created_at",
          order: "desc",
        },
      ],
    },
    meta: {
      select: '*, topics(*, courses(*)), questions(count)'
    }
  });
  
  const init = useLoading({ isLoading, isError });
  if (init) return init;

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć aktywność "${title}"?`)) {
      deleteActivity({
        resource: "activities",
        id,
      });
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'quiz' ? <HelpCircle className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-green-500" />;
  };

  const getTypeName = (type: string) => {
    return type === 'quiz' ? 'Quiz' : 'Materiał';
  };

  return (
    <SubPage>
      <FlexBox>
        <Lead
          title="Treści edukacyjne"
          description="Zarządzaj materiałami i quizami"
        />
        <Button onClick={() => navigate("/courses")}>
          <BookOpen className="w-4 h-4 mr-2" />
          Przejdź do kursów
        </Button>
      </FlexBox>

      <FlexBox>
        <Input
          placeholder="Szukaj treści..."
          className="max-w-sm"
          onChange={(e) => {
            setFilters([
              {
                field: "title",
                operator: "contains",
                value: e.target.value,
              },
            ]);
          }}
        />
      </FlexBox>

      <GridBox>
        {data?.data?.map((activity) => (
          <Card 
            key={activity.id} 
            className="relative cursor-pointer transition-shadow hover:shadow-lg"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('[role="menu"]')) {
                show("activities", activity.id);
              }
            }}
          >
            <CardHeader>
              <FlexBox>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(activity.type)}
                  <span className="truncate">{activity.title}</span>
                </CardTitle>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => show("teacher/activities", activity.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Podgląd
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => edit("teacher/activities", activity.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edytuj
                    </DropdownMenuItem>
                    {activity.type === 'quiz' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => navigate(`/teacher/questions/manage/${activity.id}`)}
                          className="text-blue-600"
                        >
                          <ListChecks className="mr-2 h-4 w-4" />
                          Zarządzaj pytaniami ({activity._count?.questions || 0})
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(activity.id, activity.title)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Usuń
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </FlexBox>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {activity.topics?.courses?.icon_emoji && (
                    <span className="text-lg">{activity.topics.courses.icon_emoji}</span>
                  )}
                  <span className="truncate">
                    {activity.topics?.courses?.title} → {activity.topics?.position}. {activity.topics?.title}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {getTypeName(activity.type)}
                    </Badge>
                    <Badge variant={activity.is_published ? "default" : "secondary"}>
                      {activity.is_published ? "Opublikowany" : "Szkic"}
                    </Badge>
                    {activity.type === 'quiz' && (
                      <Badge variant="outline" className="text-xs">
                        {activity._count?.questions || 0} pytań
                      </Badge>
                    )}
                  </div>
                  
                  {activity.duration_min && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activity.duration_min} min
                    </span>
                  )}
                </div>

                {activity.type === 'quiz' && (
                  <div className="text-xs text-muted-foreground">
                    Próg: {activity.passing_score}%
                    {activity.time_limit && ` • Limit: ${activity.time_limit} min`}
                    {activity.max_attempts && ` • Max prób: ${activity.max_attempts}`}
                  </div>
                )}
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
        itemName="treści"
      />
    </SubPage>
  );
};