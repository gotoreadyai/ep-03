import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  Clock,
  Target,
  Timer,
  RefreshCw,
  Plus,
  CheckCircle,
  ListChecks,
  AlertCircle,
  Edit,
  Calendar,
  Hash,
} from "lucide-react";
import { Button, Badge } from "@/components/ui";

interface Question {
  id: string;
  content: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  points: number;
  explanation?: string;
}

interface ActivityQuizViewProps {
  activity: {
    id: string;
    title: string;
    duration_min?: number;
    passing_score?: number;
    time_limit?: number;
    max_attempts?: number;
    position: number;
    created_at: string;
    updated_at?: string;
  };
  questionsCount: number;
  questionsData?: Question[];
  questionsLoading: boolean;
  onNavigateToQuestions: (activityId: string) => void;
}

export const ActivityQuizView = ({ 
  activity, 
  questionsCount, 
  questionsData, 
  questionsLoading,
  onNavigateToQuestions 
}: ActivityQuizViewProps) => {
  
  const totalPoints = questionsData?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  const passingPoints = Math.ceil(((activity.passing_score || 70) / 100) * totalPoints);

  return (
    <div className="space-y-6">
      {/* Parametry quizu */}
      <Card>
        <CardHeader>
          <CardTitle>Parametry quizu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Czas trwania</span>
              </div>
              <p className="text-2xl font-bold">{activity.duration_min || "-"} min</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Próg zaliczenia</span>
              </div>
              <p className="text-2xl font-bold">{activity.passing_score || 70}%</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Limit czasu</span>
              </div>
              <p className="text-2xl font-bold">
                {activity.time_limit ? `${activity.time_limit} min` : "Brak"}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Liczba prób</span>
              </div>
              <p className="text-2xl font-bold">
                {activity.max_attempts || "Bez limitu"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pytania quizu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pytania ({questionsCount})</span>
            {questionsCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onNavigateToQuestions(activity.id)}
              >
                <Edit className="w-3 h-3 mr-1" />
                Zarządzaj
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questionsCount === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Ten quiz nie ma jeszcze pytań
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Dodaj pytania, aby uczniowie mogli rozwiązać quiz
              </p>
              <Button
                onClick={() => onNavigateToQuestions(activity.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj pierwsze pytanie
              </Button>
            </div>
          ) : questionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {questionsData?.map((question, index) => (
                <div 
                  key={question.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {question.type === 'single_choice' && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Jednokrotny wybór
                        </Badge>
                      )}
                      {question.type === 'multiple_choice' && (
                        <Badge variant="outline" className="text-xs">
                          <ListChecks className="w-3 h-3 mr-1" />
                          Wielokrotny wybór
                        </Badge>
                      )}
                      {question.type === 'true_false' && (
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Prawda/Fałsz
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {question.points} pkt
                      </Badge>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">{question.content}</p>
                    {question.explanation && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        <span className="font-medium">Wyjaśnienie:</span> {question.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informacje dodatkowe */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statystyki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Liczba pytań</span>
                <span className="font-medium">{questionsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Maksymalna liczba punktów</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Wymagane punkty do zaliczenia</span>
                <span className="font-medium">{passingPoints}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informacje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pozycja w temacie</span>
                <span className="font-medium">{activity.position}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Data utworzenia</span>
                <span className="font-medium">
                  {new Date(activity.created_at).toLocaleDateString("pl-PL")}
                </span>
              </div>
              {activity.updated_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ostatnia aktualizacja</span>
                  <span className="font-medium">
                    {new Date(activity.updated_at).toLocaleDateString("pl-PL")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};