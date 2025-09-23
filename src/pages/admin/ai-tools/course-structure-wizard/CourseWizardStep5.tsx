// src/pages/admin/ai-tools/course-structure-wizard/CourseWizardStep5.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Sparkles, ChevronRight, AlertCircle, ArrowLeft, CheckSquare, ListChecks, Wand } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
  Button,
  Input,
  ScrollArea,
  Checkbox,
} from "@/components/ui";
import { useList, useCreate } from "@refinedev/core";
import { callLLM } from "@/utility/llmService";

type IdLike = number | string;

const FILL_SCHEMA = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          title: { type: "string", required: true },
          description: { type: "string", required: true },
        },
      },
    },
  },
};

export function CourseWizardStep5() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const courseId = location?.state?.courseId as IdLike | undefined;
  const courseTitle = (location?.state?.courseTitle as string) || "Kurs";
  const courseDescription = (location?.state?.courseDescription as string) || "";

  useEffect(() => {
    if (!courseId) navigate("/admin/course-structure/step4");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Tematy istniejące
  const { data: topicsData, refetch: refetchTopics, isLoading: loadingExisting } = useList({
    resource: "topics",
    filters: courseId
      ? [{ field: "course_id", operator: "eq", value: typeof courseId === "string" ? parseInt(courseId, 10) : courseId }]
      : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { current: 1, pageSize: 500 },
    queryOptions: { enabled: Boolean(courseId) },
  });

  // Stabilizujemy referencję, by zadowolić react-hooks/exhaustive-deps
  const topics = useMemo(() => topicsData?.data ?? [], [topicsData]);

  const maxPosition = useMemo(
    () => topics.reduce((m: number, t: any) => Math.max(m, Number(t.position ?? 0)), 0),
    [topics]
  );

  // Podpowiedź dla LLM (opcjonalna)
  const [hint, setHint] = useState("");

  // Podgląd i selekcja
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState<Array<{ title: string; description: string }>>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({}); // index -> checked

  const { mutate: createTopic } = useCreate();

  const toggleSel = (idx: number) => setSelected((s) => ({ ...s, [idx]: !s[idx] }));
  const selectAll = () => setSelected(Object.fromEntries(preview.map((_, i) => [i, true])));
  const clearSel = () => setSelected({});

  const generateMissing = async () => {
    if (!courseId) return;

    // ZAWSZE generujemy 3 propozycje
    const missing = 3;

    setIsGenerating(true);
    try {
      const existingTitles = topics.map((t: any) => t.title).filter(Boolean);
      const prompt = `
Uzupełnij kurs o NOWE tematy. Wygeneruj DOKŁADNIE ${missing} propozycje (tytuł + krótki opis 1–2 zdania).
Unikaj powtórzeń względem istniejących tematów.
${hint ? `Preferowane kierunki / wskazówki: ${hint}` : ""}
Dane kursu:
- Tytuł: ${courseTitle}
- Opis: ${courseDescription || "(brak)"}
- Istniejące tematy: ${existingTitles.length ? existingTitles.join("; ") : "(brak)"}

Zwróć listę obiektów JSON zgodnych ze schematem.
`.trim();

      const result = await callLLM(prompt, FILL_SCHEMA);
      const newOnes: Array<{ title: string; description: string }> = result?.topics || [];
      setPreview(newOnes);
      setSelected(Object.fromEntries(newOnes.map((_, i) => [i, true]))); // domyślnie zaznacz wszystkie
    } finally {
      setIsGenerating(false);
    }
  };

  const savePreview = async () => {
    if (!courseId || preview.length === 0) return;
    const chosen = preview.filter((_, i) => selected[i]);
    if (chosen.length === 0) return;

    const courseIdNumber = typeof courseId === "string" ? parseInt(courseId, 10) : (courseId as number);
    let p = maxPosition;
    for (let i = 0; i < chosen.length; i++) {
      p += 1;
      const t = chosen[i];
      await new Promise<void>((resolve) => {
        createTopic(
          {
            resource: "topics",
            values: {
              course_id: courseIdNumber,
              title: t.title,
              position: p,
              is_published: false,
            },
          },
          { onSuccess: () => resolve(), onError: () => resolve() }
        );
      });
    }
    await refetchTopics();
    navigate("/admin/course-structure/step4", {
      replace: true,
      state: { courseId, courseTitle, topicsCount: topics.length + chosen.length },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5" />
        <h1 className="text-xl font-semibold">Krok 5 — Uzupełnij brakujące tematy</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lewa kolumna — kontekst + istniejące tematy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              Kontekst kursu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">{courseTitle}</div>
              {courseDescription && (
                <div className="text-xs text-muted-foreground mt-1">{courseDescription}</div>
              )}
            </div>

            <div className="text-sm">
              Aktualnie: <strong>{topics.length}</strong> tematów
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm">Podpowiedź dla generatora (opcjonalnie)</label>
              <Input
                type="text"
                placeholder="Np. dodaj tematy z ekologii i ochrony środowiska…"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Poniżej lista istniejących tematów — generator unika duplikatów.
            </div>

            <ScrollArea className="h-[280px] pr-2">
              {loadingExisting ? (
                <div className="text-sm text-muted-foreground">Ładowanie…</div>
              ) : topics.length === 0 ? (
                <div className="text-sm text-muted-foreground">Brak tematów.</div>
              ) : (
                <div className="space-y-1 text-sm">
                  {topics.map((t: any, i: number) => (
                    <div key={t.id ?? i} className="border-l-2 border-muted pl-2">
                      <span className="text-muted-foreground">{Number(t.position ?? i + 1)}.</span> {t.title}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="pt-2">
            <Button asChild size="sm" variant="outline" className="mr-2">
                <Link to="/admin/course-structure/step4">
                  <ArrowLeft className="mr-1" />
                  Wróć
                </Link>
              </Button>
              <Button size="sm" onClick={generateMissing} disabled={isGenerating}>
                <Wand/>
                {isGenerating ? "Generowanie..." : "Generuj propozycje nowych tematów"}
              </Button>
              
            </div>
          </CardContent>
        </Card>

        {/* Prawa kolumna — podgląd i wybór propozycji */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Propozycje (zaznacz, które dodać)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {preview.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Brak propozycji.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Button size="sm" variant="outline" onClick={selectAll}>
                    Zaznacz wszystko
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSel}>
                    Wyczyść zaznaczenie
                  </Button>
                  <div className="text-xs text-muted-foreground ml-auto">
                    Wybrane: {preview.filter((_, i) => selected[i]).length} / {preview.length}
                  </div>
                </div>

                <ScrollArea className="h-[380px] pr-2">
                  <div className="space-y-2">
                    {preview.map((t, i) => (
                      <div key={i} className="rounded-xl border p-3 flex items-start gap-3">
                        <Checkbox checked={!!selected[i]} onCheckedChange={() => toggleSel(i)} className="mt-1" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{t.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 mt-4">
                  <Button onClick={savePreview} className="flex-1" disabled={preview.every((_, i) => !selected[i])}>
                    Zapisz wybrane
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setPreview([])}>
                    Wyczyść podgląd
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
