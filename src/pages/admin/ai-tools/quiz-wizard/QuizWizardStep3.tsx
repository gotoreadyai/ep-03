/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCreate, useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, Input, Switch, Alert, AlertDescription, ScrollArea, Badge } from "@/components/ui";
import { Save, AlertCircle, CheckCircle, ArrowLeft, Trash2 } from "lucide-react";

type QuizItem = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
  points?: number;
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
  const { mutate: createQuestion } = useCreate();

  const initialItem = useMemo<GeneratedQuiz | null>(
    () => location?.state?.item ?? null,
    [location?.state?.item]
  );

  // Pobierz parametry z Step1
  const step1Data = useMemo(() => {
    try {
      const stored = localStorage.getItem('formWizard_qw_step1');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse step1 data:', e);
    }
    return {};
  }, []);

  const [title, setTitle] = useState<string>(initialItem?.title ?? "");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [items, setItems] = useState<QuizItem[]>(initialItem?.items ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedActivityId, setSavedActivityId] = useState<number | null>(null);
  const [progress, setProgress] = useState<string>("");

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
    }
  }, [initialItem, navigate]);

  const handleRemoveQuestion = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof QuizItem, value: any) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    if (!initialItem) return;
    if (!title || title.trim().length < 3) {
      setError("Tytuł musi mieć minimum 3 znaki.");
      return;
    }

    if (items.length === 0) {
      setError("Quiz musi mieć przynajmniej jedno pytanie.");
      return;
    }

    // Walidacja pytań
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.question || item.question.trim().length < 5) {
        setError(`Pytanie ${i + 1}: treść pytania jest za krótka (min. 5 znaków).`);
        return;
      }
      if (!item.options || item.options.length !== 4) {
        setError(`Pytanie ${i + 1}: musi mieć dokładnie 4 opcje odpowiedzi.`);
        return;
      }
      if (item.answerIndex < 0 || item.answerIndex > 3) {
        setError(`Pytanie ${i + 1}: nieprawidłowy indeks poprawnej odpowiedzi.`);
        return;
      }
      for (let j = 0; j < item.options.length; j++) {
        if (!item.options[j] || item.options[j].trim().length < 1) {
          setError(`Pytanie ${i + 1}, opcja ${j + 1}: nie może być pusta.`);
          return;
        }
      }
    }

    setSaving(true);
    setError(null);
    setProgress("Tworzenie aktywności quizu...");

    try {
      const topicId = Number(initialItem.topic_id);
      const lastActivity = activitiesData?.data?.[0];
      const nextPosition = lastActivity?.position ? Number(lastActivity.position) + 1 : 1;

      // Pobierz parametry z Step1
      const passingScore = step1Data.passingScore ?? 70;
      const timeLimit = step1Data.timeLimit ?? null;
      const maxAttempts = step1Data.maxAttempts ?? null;
      const durationMin = Math.ceil(items.length * 1.5); // Szacunkowy czas: 1.5 min/pytanie

      // KROK 1: Utwórz aktywność typu "quiz" BEZ treści content
      setProgress("Zapisywanie aktywności...");
      const activityId = await new Promise<number>((resolve, reject) => {
        createActivity(
          {
            resource: "activities",
            values: {
              topic_id: topicId,
              type: "quiz",
              title: title.trim(),
              content: null, // ✅ Brak YAML - pytania będą w tabeli questions
              duration_min: durationMin,
              passing_score: passingScore,
              time_limit: timeLimit,
              max_attempts: maxAttempts,
              position: nextPosition,
              is_published: isPublished,
            },
          },
          {
            onSuccess: (res: any) => {
              const newId = res?.data?.id;
              if (newId) {
                const numId = typeof newId === 'string' ? parseInt(newId, 10) : newId;
                resolve(numId);
              } else {
                reject(new Error("Nie otrzymano ID aktywności"));
              }
            },
            onError: (e: any) => reject(e),
          }
        );
      });

      setSavedActivityId(activityId);

      // KROK 2: Zapisz każde pytanie do tabeli questions
      setProgress(`Zapisywanie pytań (0/${items.length})...`);
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(`Zapisywanie pytań (${i + 1}/${items.length})...`);

        // Konwersja opcji do formatu JSONB zgodnego z bazą
        const optionsJsonb = item.options.map((text, idx) => ({
          id: idx + 1,
          text: text.trim(),
          is_correct: idx === item.answerIndex
        }));

        await new Promise<void>((resolve, reject) => {
          createQuestion(
            {
              resource: "questions",
              values: {
                activity_id: activityId,
                question: item.question.trim(),
                options: optionsJsonb, // ✅ Format JSONB zgodny z bazą
                points: item.points ?? 1,
                position: i + 1,
                explanation: item.explanation?.trim() || null,
              },
            },
            {
              onSuccess: () => resolve(),
              onError: (e: any) => reject(e),
            }
          );
        });
      }

      setProgress("Quiz zapisany pomyślnie!");
      
    } catch (e: any) {
      console.error('Save error:', e);
      if (e?.code === '23505') {
        setError("Quiz o tym tytule już istnieje w tym temacie. Zmień tytuł.");
      } else if (e?.code === '23503') {
        setError("Nieprawidłowy temat lub aktywność. Odśwież stronę i spróbuj ponownie.");
      } else if (e?.message) {
        setError(e.message);
      } else {
        setError("Nie udało się zapisać quizu. Spróbuj ponownie.");
      }
      setSaving(false);
      setSavedActivityId(null);
      setProgress("");
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
      <Lead title="Krok 3" description="Edycja i zapis quizu do bazy" />

      <div className="grid gap-6 lg:grid-cols-[0.7fr,1.3fr]">
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

            <div className="rounded-lg border p-3 space-y-2 text-xs">
              <div className="font-medium">Parametry quizu:</div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <div>Wynik zaliczający:</div>
                <div className="font-medium text-foreground">{step1Data.passingScore ?? 70}%</div>
                
                <div>Limit czasu:</div>
                <div className="font-medium text-foreground">
                  {step1Data.timeLimit ? `${step1Data.timeLimit} min` : 'Brak'}
                </div>
                
                <div>Max. prób:</div>
                <div className="font-medium text-foreground">
                  {step1Data.maxAttempts ?? 'Bez limitu'}
                </div>

                <div>Liczba pytań:</div>
                <div className="font-medium text-foreground">{items.length}</div>
              </div>
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

            {progress && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-900 text-sm">
                  {progress}
                </AlertDescription>
              </Alert>
            )}

            {savedActivityId && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <span className="font-medium">Quiz zapisany!</span><br />
                  ID aktywności: {savedActivityId}<br />
                  Liczba pytań: {items.length}<br />
                  <span className="text-xs">Możesz wrócić do panelu lub dodać kolejny quiz.</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || savedActivityId !== null || !title.trim() || items.length === 0}
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

            {savedActivityId && (
              <Button
                asChild
                variant="default"
                className="w-full"
              >
                <Link to="/admin/quiz-wizard">
                  Wróć do panelu
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Edytor pytań */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Edycja pytań ({items.length})</span>
              <Badge variant="outline">{items.length} pytań</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {items.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Brak pytań w quizie. Wróć do kroku 2 i wygeneruj pytania.
                    </AlertDescription>
                  </Alert>
                ) : (
                  items.map((item, idx) => (
                    <div key={idx} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground">
                            Pytanie {idx + 1}
                          </label>
                          <Input
                            value={item.question}
                            onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                            disabled={saving || savedActivityId !== null}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveQuestion(idx)}
                          disabled={saving || savedActivityId !== null}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Odpowiedzi</label>
                        {item.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <div 
                              className={[
                                "shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                optIdx === item.answerIndex 
                                  ? "border-green-500 bg-green-500" 
                                  : "border-gray-300"
                              ].join(" ")}
                            >
                              {optIdx === item.answerIndex && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const newOptions = [...item.options];
                                newOptions[optIdx] = e.target.value;
                                handleUpdateQuestion(idx, 'options', newOptions);
                              }}
                              disabled={saving || savedActivityId !== null}
                              className="flex-1"
                              placeholder={`Opcja ${String.fromCharCode(65 + optIdx)}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateQuestion(idx, 'answerIndex', optIdx)}
                              disabled={saving || savedActivityId !== null}
                              className={optIdx === item.answerIndex ? "text-green-600" : ""}
                            >
                              {optIdx === item.answerIndex ? "✓ Poprawna" : "Ustaw"}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {item.explanation && (
                        <div>
                          <label className="text-xs text-muted-foreground">Wyjaśnienie</label>
                          <Input
                            value={item.explanation}
                            onChange={(e) => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                            disabled={saving || savedActivityId !== null}
                            className="mt-1"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2 border-t">
                        <label className="text-xs text-muted-foreground">Punkty:</label>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          value={item.points ?? 1}
                          onChange={(e) => handleUpdateQuestion(idx, 'points', Number(e.target.value))}
                          disabled={saving || savedActivityId !== null}
                          className="w-20"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="mt-4 text-xs text-muted-foreground">
              Pytania zostaną zapisane do tabeli <code className="bg-muted px-1 py-0.5 rounded">questions</code> z referencją do aktywności.
              Każda opcja będzie miała flagę <code className="bg-muted px-1 py-0.5 rounded">is_correct</code>.
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}