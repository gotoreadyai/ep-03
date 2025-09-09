import { useOne, useNavigation, useList } from "@refinedev/core";
import {
  Edit,
  FileText,
  HelpCircle,
  ListChecks,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { FlexBox } from "@/components/shared";
import { SubPage } from "@/components/layout";
import { useParams, useNavigate } from "react-router-dom";
import { BackToCourseButton } from "../courses/components/BackToCourseButton";
import { ActivityMaterialView } from "./components/ActivityMaterialView";
import { ActivityQuizView } from "./components/ActivityQuizView";

interface Activity {
  id: string;
  title: string;
  type: 'material' | 'quiz';
  content?: string;
  duration_min?: number;
  position: number;
  created_at: string;
  updated_at?: string;
  is_published: boolean;
  passing_score?: number;
  time_limit?: number;
  max_attempts?: number;
  topic_id: number;
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
  questions?: Array<{ count: number }>;
  _count?: {
    questions: number;
  };
}

interface Question {
  id: string;
  content: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  points: number;
  explanation?: string;
  position?: number;
}

export const ActivitiesShow = () => {
  const { edit } = useNavigation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: activityData, isLoading } = useOne<Activity>({
    resource: "activities",
    id: id as string,
    meta: {
      select: "*, topics(*, courses(*)), questions:questions(count)",
    },
  });

  // Pobierz listę pytań dla quizu
  const { data: questionsData, isLoading: questionsLoading } = useList<Question>({
    resource: "questions",
    filters: [
      {
        field: "activity_id",
        operator: "eq",
        value: parseInt(id as string),
      },
    ],
    sorters: [
      {
        field: "position",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: activityData?.data?.type === "quiz" && !!id,
    },
  });

  if (isLoading) {
    return (
      <SubPage>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </SubPage>
    );
  }

  const activity = activityData?.data;
  
  if (!activity) {
    return (
      <SubPage>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nie znaleziono aktywności</p>
        </div>
      </SubPage>
    );
  }

  const topic = activity.topics;
  const course = topic?.courses;
  
  // Obsługa różnych formatów odpowiedzi Supabase dla count
  const questionsCount = activity.questions?.[0]?.count || activity._count?.questions || 0;

  const handleEdit = () => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', currentUrl);
    edit("activities", activity.id ?? "");
  };

  const handleNavigateWithState = (path: string) => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', currentUrl);
    navigate(path);
  };

  const getActivityIcon = () => {
    return activity.type === "quiz" ? (
      <HelpCircle className="w-5 h-5" />
    ) : (
      <FileText className="w-5 h-5" />
    );
  };

  const getActivityTypeColor = () => {
    return activity.type === "quiz" ? "text-blue-500" : "text-green-500";
  };

  return (
    <SubPage>
      <BackToCourseButton />

      {/* Nagłówek z breadcrumbs */}
      <div className="mb-6">
        <div className="text-sm text-muted-foreground mb-2">
          {course?.title} → Temat {topic?.position}: {topic?.title}
        </div>
        <FlexBox>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${getActivityTypeColor()}`}>
              {getActivityIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{activity.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={activity.type === "quiz" ? "default" : "secondary"}>
                  {activity.type === "quiz" ? "Quiz" : "Materiał"}
                </Badge>
                <Badge variant={activity.is_published ? "default" : "outline"}>
                  {activity.is_published ? (
                    <><Eye className="w-3 h-3 mr-1" /> Opublikowany</>
                  ) : (
                    <><EyeOff className="w-3 h-3 mr-1" /> Szkic</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {activity.type === "quiz" && (
              <Button
                variant="outline"
                onClick={() => handleNavigateWithState(`/teacher/questions/manage/${activity.id}`)}
              >
                <ListChecks className="w-4 h-4 mr-2" />
                Zarządzaj pytaniami ({questionsCount})
              </Button>
            )}
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edytuj
            </Button>
          </div>
        </FlexBox>
      </div>

      {/* Renderowanie odpowiedniego widoku */}
      {activity.type === "material" ? (
        <ActivityMaterialView activity={activity as any} />
      ) : (
        <ActivityQuizView 
          activity={activity as any}
          questionsCount={questionsCount}
          questionsData={questionsData?.data}
          questionsLoading={questionsLoading}
          onNavigateToQuestions={(activityId) => 
            handleNavigateWithState(`/teacher/questions/manage/${activityId}`)
          }
        />
      )}
    </SubPage>
  );
};