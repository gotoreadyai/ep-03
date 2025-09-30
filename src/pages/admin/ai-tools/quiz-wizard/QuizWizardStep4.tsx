import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useOne } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, Alert, AlertDescription, Badge } from "@/components/ui";
import { CheckCircle, Home, PlusCircle, ExternalLink, BookOpen, Target, Clock, Trophy, Repeat } from "lucide-react";

type SummaryData = {
  activityId: number;
  title: string;
  questionsCount: number;
  topicId: number;
  isPublished: boolean;
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
};

export function QuizWizardStep4() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const summaryData = location?.state as SummaryData | undefined;

  // Pobierz dane tematu
  const { data: topicData } = useOne({
    resource: "topics",
    id: String(summaryData?.topicId || ""),
    meta: { select: "*, courses(title, icon_emoji)" },
    queryOptions: { enabled: !!summaryData?.topicId }
  });

  useEffect(() => {
    if (!summaryData || !summaryData.activityId) {
      navigate("/admin/quiz-wizard");
    }
  }, [summaryData, navigate]);

  if (!summaryData) {
    return (
      <SubPage>
        <Lead title="Podsumowanie" description="Brak danych" />
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Brak danych podsumowania. 
                <Link to="/admin/quiz-wizard" className="underline ml-1">
                  Wróć do panelu
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </SubPage>
    );
  }

  const course = topicData?.data?.courses as any;
  const topic = topicData?.data;

  return (
    <SubPage>
      <Lead 
        title="✓ Quiz został zapisany!" 
        description="Podsumowanie utworzonego quizu"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
        {/* Lewa kolumna - Podstawowe info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Informacje o quizie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium text-green-900 mb-1">
                    Quiz został pomyślnie zapisany
                  </div>
                  <div className="text-sm text-green-700">
                    Wszystkie pytania zostały zapisane do bazy danych
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">ID aktywności:</span>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {summaryData.activityId}
                </code>
              </div>

              <div className="flex items-start justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Tytuł:</span>
                <span className="text-sm font-medium text-right max-w-[60%]">
                  {summaryData.title}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={summaryData.isPublished ? "default" : "outline"}>
                  {summaryData.isPublished ? "Opublikowany" : "Szkic"}
                </Badge>
              </div>

              {course && topic && (
                <>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Kurs:</span>
                    <span className="text-sm font-medium">
                      {course.icon_emoji} {course.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">Temat:</span>
                    <span className="text-sm font-medium">
                      {topic.title}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Button asChild className="w-full" variant="outline">
              <Link to={`/admin/activities/${summaryData.activityId}`}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Otwórz quiz w edytorze
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Prawa kolumna - Parametry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Parametry quizu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <BookOpen className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Liczba pytań</div>
                  <div className="text-lg font-semibold">{summaryData.questionsCount}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Trophy className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Wynik zaliczający</div>
                  <div className="text-lg font-semibold">{summaryData.passingScore}%</div>
                </div>
              </div>

              {summaryData.timeLimit && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Limit czasu</div>
                    <div className="text-lg font-semibold">{summaryData.timeLimit} min</div>
                  </div>
                </div>
              )}

              {summaryData.maxAttempts && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Repeat className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Maksymalna liczba prób</div>
                    <div className="text-lg font-semibold">{summaryData.maxAttempts}</div>
                  </div>
                </div>
              )}

              {!summaryData.timeLimit && !summaryData.maxAttempts && (
                <Alert>
                  <AlertDescription className="text-xs">
                    Quiz nie ma limitów czasowych ani prób — uczniowie mogą podejść dowolną liczbę razy.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="text-sm font-medium mb-3">Co dalej?</div>
              
              <Button asChild variant="default" className="w-full">
                <Link to="/admin/quiz-wizard/step1">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Utwórz kolejny quiz
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/admin/quiz-wizard">
                  <Home className="w-4 h-4 mr-2" />
                  Wróć do panelu
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dodatkowe informacje */}
      <Card>
        <CardHeader>
          <CardTitle>Następne kroki</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <div className="font-medium text-sm mb-1">1. Sprawdź pytania</div>
              <p className="text-xs text-muted-foreground">
                Otwórz quiz w edytorze i zweryfikuj poprawność wszystkich pytań i odpowiedzi
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="font-medium text-sm mb-1">2. Przypisz do grup</div>
              <p className="text-xs text-muted-foreground">
                Zdecyduj, które grupy uczniów będą miały dostęp do tego quizu
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <div className="font-medium text-sm mb-1">3. Opublikuj</div>
              <p className="text-xs text-muted-foreground">
                {summaryData.isPublished 
                  ? "Quiz jest już opublikowany i widoczny dla uczniów" 
                  : "Zmień status na 'Opublikowany' gdy quiz będzie gotowy"}
              </p>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertDescription className="text-xs">
              <strong>Wskazówka:</strong> Możesz w każdej chwili edytować pytania, zmienić parametry lub dodać nowe pytania do quizu w edytorze aktywności.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </SubPage>
  );
}