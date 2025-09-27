import { useEffect, useMemo, useState } from "react";
import { useOne } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { callLLM } from "@/utility/llmService";
import { useStepStore } from "@/utility/formWizard";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, Alert, AlertDescription, ScrollArea, Badge, Textarea } from "@/components/ui";
import {
  Loader2,
  Sparkles,
  AlertCircle,
  ChevronRight,
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type Activity = {
  id: number;
  title: string;
  content: string; // markdown source
  topic_id: number;
  position: number;
};

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

const QUIZ_LIST_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      minItems: 3,
      items: {
        type: "object",
        properties: {
          question: { type: "string", required: true },
          options: {
            type: "array",
            items: { type: "string" },
            minItems: 4,
            maxItems: 4,
            required: true,
          },
          answerIndex: { type: "number", minimum: 0, maximum: 3, required: true },
          explanation: { type: "string" },
        },
      },
      required: true,
    },
  },
};

export function QuizWizardStep2() {
  const { getStepData, setStepData } = useStepStore();
  const navigate = useNavigate();

  const step1 = getStepData("qw_step1") as {
    materialId?: number;
    topicId?: number;
    count?: number;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    includeExplanations?: boolean;
    randomized?: boolean;
  };

  const materialId = step1?.materialId;
  const topicId = step1?.topicId;

  const [item, setItem] = useState<GeneratedQuiz | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  useEffect(() => {
    if (!materialId || !topicId) {
      navigate("/admin/quiz-wizard/step1");
    }
  }, [materialId, topicId, navigate]);

  // Pobierz materiał
  const { data: material } = useOne<Activity>({
    resource: "activities",
    id: String(materialId || ""),
    meta: { select: "*" },
    queryOptions: { enabled: !!materialId },
  });

  const handleGenerate = async () => {
    if (!material?.data) return;
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);
    setGenerating(true);
    setStepData("qw_step2", { isGenerating: true });

    const prompt = `
Jesteś nauczycielem tworzącym pytania testowe na podstawie materiału edukacyjnego (Markdown).

PARAMETRY QUIZU:
- liczba pytań: ${step1.count ?? 10}
- poziom trudności: ${step1.difficulty ?? "mixed"}
- losuj kolejność odpowiedzi: ${step1.randomized ? "tak" : "nie"}
- dodawaj wyjaśnienia: ${step1.includeExplanations ? "tak" : "nie"}

MATERIAŁ (źródło, Markdown):
"""
${material.data.content}
"""

WYTYCZNE:
1) Pytania muszą testować zrozumienie kluczowych idei z materiału (nie pamięciówka).
2) Każde pytanie ma DOKŁADNIE 4 opcje odpowiedzi.
3) answerIndex wskazuje poprawną odpowiedź (0-3).
4) Unikaj opcji "wszystkie/żadne z powyższych".
5) Jeśli "dodawaj wyjaśnienia" = tak → pole explanation ma krótkie uzasadnienie odpowiedzi.
6) Zweryfikuj spójność logiczną i brak wieloznaczności.

ZWRÓĆ WYŁĄCZNIE JSON ze strukturą:
{
  "items": [
    { "question": "...", "options": ["A","B","C","D"], "answerIndex": 0, "explanation": "..." }
  ]
}
    `.trim();

    try {
      const out = await callLLM(prompt, QUIZ_LIST_SCHEMA);
      const items = Array.isArray(out.items) ? out.items : [];
      if (items.length < 3) throw new Error("Za mało poprawnych pytań w odpowiedzi modelu.");

      const generated: GeneratedQuiz = {
        material_id: material.data.id,
        topic_id: material.data.topic_id,
        title: `${material.data.title} — Quiz`,
        items,
      };
      setItem(generated);
    } catch (e: any) {
      const msg =
        e?.message?.toString()?.includes("503") || e?.details?.toString()?.includes?.("503")
          ? "Błąd komunikacji z modelem (503)"
          : e?.message || "Nie udało się wygenerować quizu.";
      setError(msg);

      const details =
        e?.info ??
        e?.response ??
        {
          message: e?.message,
          status: e?.status || e?.statusCode,
          details: e?.details,
          raw: e,
        };
      setErrorDetails(details);
    } finally {
      setGenerating(false);
      setStepData("qw_step2", { isGenerating: false });
    }
  };

  const goToSave = () => {
    if (!item) return;
    navigate("/admin/quiz-wizard/step3", { state: { item } });
  };

  return (
    <SubPage>
      <Lead title="Krok 2" description="Generowanie pytań na podstawie materiału" />

      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Panel generowania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Materiał:</span>{" "}
                <span className="font-medium">{material?.data?.title || "-"}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{step1.difficulty ?? "mixed"}</Badge>
                <Badge variant="outline">{(step1.count ?? 10) + " pytań"}</Badge>
                {step1.includeExplanations && <Badge variant="default">Wyjaśnienia</Badge>}
              </div>
            </div>

            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Pytania będą dotyczyły treści wybranego materiału. Możesz je później edytować przed zapisem.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generowanie pytań...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Wygeneruj pytania
                  </>
                )}
              </Button>

              <Button variant="default" onClick={goToSave} disabled={!item || generating} className="w-full">
                Przejdź do zapisu
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {error && (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>

                {errorDetails && (
                  <Card>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Szczegóły błędu</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowErrorDetails((v) => !v)}
                          className="h-7"
                        >
                          {showErrorDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    {showErrorDetails && (
                      <CardContent className="pt-0">
                        <Textarea
                          className="font-mono text-xs h-40"
                          readOnly
                          value={(() => {
                            try {
                              return JSON.stringify(errorDetails, null, 2);
                            } catch {
                              return String(errorDetails);
                            }
                          })()}
                        />
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            )}

            {generating && (
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p>Analizuję materiał i tworzę pytania...</p>
                <p className="text-xs">To może potrwać kilkanaście sekund</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Podgląd */}
        <Card>
          <CardHeader>
            <CardTitle>Podgląd pytań</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                {generating ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                    <div className="text-sm">Generowanie pytań...</div>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-8 h-8 mb-3 opacity-50" />
                    <div className="text-sm">Brak wygenerowanych pytań</div>
                    <div className="text-xs mt-1">Kliknij "Wygeneruj pytania"</div>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[500px] rounded-lg border p-4">
                <div className="space-y-4">
                  {item.items.map((q, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      <div className="text-sm font-medium mb-2">
                        {idx + 1}. {q.question}
                      </div>
                      <ul className="text-sm space-y-1">
                        {q.options.map((opt, i) => (
                          <li key={i} className={i === q.answerIndex ? "font-medium" : ""}>
                            {String.fromCharCode(65 + i)}. {opt} {i === q.answerIndex ? "✓" : ""}
                          </li>
                        ))}
                      </ul>
                      {q.explanation && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Wyjaśnienie: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}