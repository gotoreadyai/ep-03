import { useNavigate } from "react-router-dom";
import {
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  Trash2,
  Clock,
  HelpCircle,
  FileText,
  GripVertical,
  ListChecks,
  Plus,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ActivityCardProps {
  activity: {
    id: number;
    title: string;
    type: "material" | "quiz";
    position: number;
    is_published: boolean;
    duration_min?: number;
    _count?: {
      questions: number;
    };
  };
  topicPosition: number;
  onDelete: (id: number, title: string) => void;
  onEdit: (resource: string, id: number) => void;
  onTogglePublish: (id: number, currentState: boolean, title: string) => void;
  dragHandleProps?: any;
}

export const ActivityCard = ({
  activity,
  topicPosition,
  onDelete,
  onEdit,
  onTogglePublish,
  dragHandleProps,
}: ActivityCardProps) => {
  const navigate = useNavigate();

  const getActivityIcon = () => {
    return activity.type === "quiz" ? (
      <div className="p-2 bg-blue-600 rounded-lg">
        <HelpCircle className="w-5 h-5 text-white" />
      </div>
    ) : (
      <div className="p-2 bg-green-600 rounded-lg">
        <FileText className="w-5 h-5 text-white" />
      </div>
    );
  };

  const getActivityTypeLabel = () => {
    return activity.type === "quiz" ? "Quiz" : "Materiał";
  };

  return (
    <div className="group flex items-center gap-4 p-4 bg-white border-2 rounded-lg hover:border-primary/50 transition-all duration-200">
      <div 
        className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        {...dragHandleProps}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      
      {getActivityIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h5 className="font-semibold text-sm text-foreground">
            {topicPosition}.{activity.position} {activity.title}
          </h5>
          <div className="flex items-center gap-2">
            <Badge 
              variant={activity.type === "quiz" ? "default" : "secondary"}
              className="text-xs font-medium"
            >
              {getActivityTypeLabel()}
            </Badge>
            {activity.type === "quiz" && activity._count?.questions !== undefined && (
              <Badge variant="outline" className="text-xs font-medium border-2">
                <ListChecks className="w-3 h-3 mr-1" />
                {activity._count.questions} {activity._count.questions === 1 ? 'pytanie' : 'pytań'}
              </Badge>
            )}
            <Badge 
              variant={activity.is_published ? "default" : "outline"}
              className={`text-xs font-medium ${
                activity.is_published ? 'bg-green-600 hover:bg-green-700' : 'border-2'
              }`}
            >
              {activity.is_published ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Opublikowany
                </>
              ) : (
                'Szkic'
              )}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {activity.duration_min && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{activity.duration_min} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>0 ukończeń</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {activity.type === "quiz" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/teacher/questions/manage/${activity.id}`)}
            title="Zarządzaj pytaniami"
            className="h-8 w-8 p-0"
          >
            <ListChecks className="h-4 w-4" />
          </Button>
        )}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/teacher/activities/show/${activity.id}`)}
          title="Podgląd"
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigate(`/teacher/activities/show/${activity.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Podgląd
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit("teacher/activities", activity.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onTogglePublish(activity.id, activity.is_published, activity.title)}
            >
              {activity.is_published ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Ukryj aktywność
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Opublikuj aktywność
                </>
              )}
            </DropdownMenuItem>
            {activity.type === "quiz" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate(`/teacher/questions/manage/${activity.id}`)}
                  className="text-blue-600 focus:text-blue-600"
                >
                  <ListChecks className="mr-2 h-4 w-4" />
                  Zarządzaj pytaniami
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigate(`/teacher/questions/create?activity_id=${activity.id}`)
                  }
                  className="text-blue-600 focus:text-blue-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj pytanie
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(activity.id, activity.title)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};