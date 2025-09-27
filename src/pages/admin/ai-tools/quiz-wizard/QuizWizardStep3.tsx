/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCreate, useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, Input, Switch, Alert, AlertDescription, Textarea } from "@/components/ui";
import { Save, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import YAML from "yaml";

type QuizItem = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

type GeneratedQuiz = {
  material_id: number;
  topic_id: number;
  title: string;
  items: QuizItem[];
};

export function QuizWizardStep3() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { mutate: createActivity } = useCreate();

  const initialItem = useMemo<GeneratedQuiz | null>(
    () => location?.state?.item ?? null,
    [location?.state?.item]
  );

  const [title, setTitle] = useState<string>(initialItem?.title ?? "");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedActivityId, setSavedActivityId] = useState<number | null>(null);
  const [yamlPreview, setYamlPreview] = useState<string>("");

  // Ostatnia pozycja w temacie
  const { data: activitiesData } = useList({
    resource: "activities",
    filters: initialItem ? [
      { field: "topic_id", operator: "eq", value: initialItem.topic_id }
    ] : [],
    sorters: [{ field: "position", order: "desc" }],
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !!initialItem?.topic_id }
  });

  useEffect(() => {
    if (!initialItem) {
      navigate("/admin/quiz-wizard/step2");
      return;
    }
    // YAML preview budowany z listy pytań
    const yaml = YAML.stringify({ questions: initialItem.items });
    setYamlPreview(yaml);
  }, [initialItem, navigate]);

  const handleSave = async () => {
    if (!initialItem) return;
    if (!title || title.trim().length < 3) {
      setError("Tytuł musi mieć minimum 3 znaki.");
      return;
    }

    if (!yamlPreview || yamlPreview.trim().length < 10) {
      setError("Zawartość quizu jest pusta lub zbyt krótka.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const topicId = Number(initialItem.topic_id);
      const lastActivity = activitiesData?.data?.[0];
      const nextPosition = lastActivity?.position ? Number(lastActivity.position) + 1 : 1;

      // Zapisz jako aktywność typu "quiz" (treść: YAML z pytaniami)
      await new Promise<number>((resolve, reject) => {
        createActivity(
          {
            resource: "activities",
            values: {
              topic_id: topicId,
              type: "quiz",
              title: title.trim(),
              content: `\`\`\`quiz\n${yamlPreview}\`\`\``,
              duration_min: 10,
              position: nextPosition,
              is_published: isPublished,
              // opcjonalnie można dodać odwołanie do materiału w tytule lub meta jeśli backend to obsługuje
            },
          },
          {
            onSuccess: (res: any) => {
              const newId = res?.data?.id;
              if (newId) {
                const numId = typeof newId === 'string' ? parseInt(newId, 10) : newId;
                setSavedActivityId(numId);
                resolve(numId);
              } else {
                reject(new Error("Nie otrzymano ID aktywności"));
              }
            },
            onError: (e: any) => reject(e),
          }
        );
      });
    } catch (e: any) {
      if (e?.code === '23505') {
        setError("Quiz o tym tytule już istnieje w tym temacie. Zmień tytuł.");
      } else if (e?.code === '23503') {
        setError("Nieprawidłowy temat. Odśwież stronę i spróbuj ponownie.");
      } else if (e?.message) {
        setError(e.message);
      } else {
        setError("Nie udało się zapisać quizu. Spróbuj ponownie.");
      }
      setSaving(false);
    }
  };

  if (!initialItem) {
    return (
      <SubPage>
        <Lead title="Krok 3" description="Zapis quizu" />
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Brak danych z poprzedniego kroku. 
                <Link to="/admin/quiz-wizard/step2" className="underline ml-1">
                  Wróć do kroku 2
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Lead title="Krok 3" description="Zapis quizu do bazy" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formularz */}
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia zapisu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tytuł quizu <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Quiz do materiału: Wprowadzenie do ..."
                disabled={saving || savedActivityId !== null}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tytuł będzie widoczny dla uczniów
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="text-sm">
                <div className="font-medium">Opublikuj od razu</div>
                <div className="text-xs text-muted-foreground">
                  Quiz będzie widoczny dla uczniów
                </div>
              </div>
              <Switch 
                checked={isPublished} 
                onCheckedChange={setIsPublished}
                disabled={saving || savedActivityId !== null}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {savedActivityId && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <span className="font-medium">Quiz zapisany!</span><br />
                  ID: {savedActivityId}<br />
                  <span className="text-xs">Możesz wrócić do panelu lub dodać kolejny quiz.</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || savedActivityId !== null || !title.trim()}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-pulse" />
                    Zapisywanie...
                  </>
                ) : savedActivityId ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Zapisano!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Zapisz quiz
                  </>
                )}
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                disabled={saving}
              >
                <Link to="/admin/quiz-wizard/step2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Podgląd (YAML) */}
        <Card>
          <CardHeader>
            <CardTitle>Podgląd treści (YAML)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              className="font-mono text-xs h-[420px]"
              value={yamlPreview}
              onChange={(e) => setYamlPreview(e.target.value)}
              disabled={saving || savedActivityId !== null}
            />
            <p className="text-xs text-muted-foreground">
              Quiz zostanie zapisany jako aktywność typu <code>quiz</code> z treścią w formacie YAML w bloku <code>```quiz</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}