// src/pages/admin/ai-tools/course-structure-wizard/CourseWizardStep4.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, BookOpenCheck, Trash2, Sparkles, RotateCcw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Alert,
  AlertDescription,
  ScrollArea,
  Badge,
  Skeleton,
  Button,
  Input,
  Progress,
} from "@/components/ui";
import { useList, useDelete, useCreate } from "@refinedev/core";
import { callLLM } from "@/utility/llmService";

type IdLike = number | string;

const REGEN_SCHEMA = {
  type: "object",
  properties: {
    courseTitle: { type: "string" },
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

export function CourseWizardStep4() {
  const location = useLocation() as any;
  const navigate = useNavigate();

  // dane przekazane z kroku 3
  const createdCourseId = location?.state?.courseId as IdLike | undefined;
  const createdCourseTitle = (location?.state?.courseTitle as string) || "Nowy kurs";
  const topicsCount = (location?.state?.topicsCount as number) || 0;

  // --- lista kursów ---
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useList({
    resource: "courses",
    pagination: { current: 1, pageSize: 50 },
    sorters: [{ field: "id", order: "desc" }],
  });

  const courses = coursesData?.data ?? [];

  // wybrany kurs (domyślnie nowo utworzony, a jeśli brak — pierwszy z listy)
  const [selectedId, setSelectedId] = useState<IdLike | undefined>(createdCourseId);

  useEffect(() => {
    if (!selectedId && courses.length > 0) setSelectedId(courses[0].id);
  }, [selectedId, courses]);

  // odśwież po wejściu
  useEffect(() => {
    refetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- tematy dla wybranego kursu ---
  const {
    data: topicsData,
    isLoading: topicsLoading,
    isError: topicsError,
    refetch: refetchTopics,
  } = useList({
    resource: "topics",
    filters: selectedId
      ? [
          {
            field: "course_id",
            operator: "eq",
            value: typeof selectedId === "string" ? parseInt(selectedId, 10) : selectedId,
          },
        ]
      : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { current: 1, pageSize: 500 },
    queryOptions: { enabled: Boolean(selectedId) },
  });

  useEffect(() => {
    if (selectedId) refetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const topics = topicsData?.data ?? [];

  const createdIdAsNumber = useMemo(() => {
    if (createdCourseId === undefined) return undefined;
    return typeof createdCourseId === "string" ? parseInt(createdCourseId, 10) : createdCourseId;
  }, [createdCourseId]);

  // --- USUWANIE TEMATÓW (pojedynczo) ---
  const { mutate: deleteTopic } = useDelete();
  const [deletingId, setDeletingId] = useState<IdLike | null>(null);
  const handleDeleteTopic = async (topicId: IdLike, title?: string) => {
    const ok = window.confirm(`Na pewno usunąć temat${title ? `: “${title}”` : ""}? Tego nie można cofnąć.`);
    if (!ok) return;
    setDeletingId(topicId);
    await new Promise<void>((resolve) => {
      deleteTopic(
        { resource: "topics", id: topicId }, // <-- BaseKey gwarantowany przez wywołanie tylko gdy id istnieje
        {
          onSuccess: () => {
            setDeletingId(null);
            refetchTopics();
            resolve();
          },
          onError: () => {
            setDeletingId(null);
            resolve();
          },
        }
      );
    });
  };

  // --- GENEROWANIE OD NOWA ---
  const { mutate: createTopic } = useCreate();
  const [regenCount, setRegenCount] = useState<number>(topics.length || 15);
  const [regenBusy, setRegenBusy] = useState(false);
  const [regenProgress, setRegenProgress] = useState(0);

  const handleRegenerateAll = async () => {
    if (!selectedId) return;
    const course = courses.find((c: any) => Number(c.id) === Number(selectedId));
    const courseTitle = course?.title || "Kurs";
    const courseDescription = course?.description || "";

    const ok = window.confirm(
      `To zastąpi WSZYSTKIE tematy kursu „${courseTitle}”.\n\nKontynuować?`
    );
    if (!ok) return;

    setRegenBusy(true);
    setRegenProgress(0);

    try {
      // 1) Poproś LLM o nowe tematy (bazując na tytule/opisie kursu)
      const prompt = `
Jesteś metodykiem. Wygeneruj dokładnie ${regenCount} tematów lekcji do kursu:
- Tytuł kursu: ${courseTitle}
- Opis (jeśli jest): ${courseDescription || "(brak)"}

Wypisz listę tematów (tytuł + krótki opis 1–2 zdania) z narastającą trudnością.
`.trim();

      const gen = await callLLM(prompt, REGEN_SCHEMA);
      const newTopics: Array<{ title: string; description: string }> = gen?.topics || [];

      // 2) Usuń wszystkie obecne tematy (tylko te z prawdziwym id)
      const deletables = topics.filter((t: any) => t?.id !== undefined && t?.id !== null);
      for (let i = 0; i < deletables.length; i++) {
        const id = deletables[i].id as IdLike;
        await new Promise<void>((resolve) => {
          deleteTopic(
            { resource: "topics", id },
            { onSuccess: () => resolve(), onError: () => resolve() }
          );
        });
        setRegenProgress(Math.round(((i + 1) / (deletables.length + newTopics.length)) * 100));
      }

      // 3) Utwórz nowe tematy
      for (let i = 0; i < newTopics.length; i++) {
        const t = newTopics[i];
        await new Promise<void>((resolve) => {
          createTopic(
            {
              resource: "topics",
              values: {
                course_id: typeof selectedId === "string" ? parseInt(selectedId, 10) : (selectedId as number),
                title: t.title,
                position: i + 1,
                is_published: false,
              },
            },
            {
              onSuccess: () => {
                setRegenProgress(
                  Math.round(((deletables.length + (i + 1)) / (deletables.length + newTopics.length)) * 100)
                );
                resolve();
              },
              onError: () => resolve(),
            }
          );
        });
      }

      await refetchTopics();
    } catch (e) {
      console.error("Regeneracja tematów nie powiodła się", e);
    } finally {
      setRegenBusy(false);
      setRegenProgress(0);
    }
  };

  // --- PRZEJŚCIE DO „UZUPEŁNIJ BRAKI” (KROK 5) ---
  const goToFillGaps = () => {
    if (!selectedId) return;
    const course = courses.find((c: any) => Number(c.id) === Number(selectedId));
    navigate("/admin/course-structure/step5", {
      state: {
        courseId: typeof selectedId === "string" ? parseInt(selectedId, 10) : selectedId,
        courseTitle: course?.title || `Kurs #${String(selectedId)}`,
        courseDescription: course?.description || "",
        currentCount: topics.length,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen flex flex-col">
      <header className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <h1 className="text-xl font-semibold">Krok 4 — Zakończone</h1>
      </header>

      {/* Pasek informacji o świeżo utworzonym kursie */}
      {createdCourseId !== undefined && (
        <Card className="mb-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-green-700" />
              Kurs utworzony
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Alert>
              <AlertDescription className="text-sm">
                <span className="font-medium">{createdCourseTitle}</span>
                {topicsCount ? (
                  <> — zapisano {topicsCount} temat{topicsCount === 1 ? "" : topicsCount < 5 ? "y" : "ów"}.</>
                ) : null}{" "}
                (ID: {String(createdCourseId)})
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground">
              Nowy kurs jest wyróżniony i zaznaczony — po prawej widzisz jego tematy.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Lista kursów */}
        <Card className="lg:col-span-2 lg:h-full flex flex-col">
          <CardHeader>
            <CardTitle>Wszystkie kursy</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {coursesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : coursesError ? (
              <Alert variant="destructive">
                <AlertDescription>Nie udało się pobrać listy kursów.</AlertDescription>
              </Alert>
            ) : courses.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">Brak kursów.</div>
            ) : (
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {courses.map((c: any) => {
                    const isNew = createdIdAsNumber !== undefined && Number(c.id) === Number(createdIdAsNumber);
                    const isSelected = selectedId !== undefined && Number(c.id) === Number(selectedId);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={[
                          "w-full text-left rounded-xl border px-3 py-2 transition",
                          isSelected ? "border-black/80 bg-black text-white" : "hover:bg-muted/60",
                          isNew && !isSelected ? "border-green-400" : "",
                          isNew && isSelected ? "ring-2 ring-green-300" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className={["font-medium", isSelected ? "text-white" : "text-foreground"].join(" ")}>
                              {c.title || `Kurs #${c.id}`}
                            </div>
                            {c.description ? (
                              <div className={["text-xs line-clamp-2", isSelected ? "text-white/80" : "text-muted-foreground"].join(" ")}>
                                {c.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {isNew && <Badge variant={isSelected ? "secondary" : "default"}>NOWY</Badge>}
                            {!c.is_published && (
                              <Badge variant={isSelected ? "secondary" : "outline"} className="text-[10px]">
                                szkic
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Tematy + narzędzia generowania */}
        <Card className="lg:col-span-3 lg:h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span>
                Tematy:{" "}
                {(() => {
                  const current = courses.find((c: any) => Number(c.id) === Number(selectedId));
                  return current?.title ? current.title : selectedId ? `Kurs #${String(selectedId)}` : "—";
                })()}
              </span>

              {/* Akcje: Uzupełnij braki (krok 5) */}
              <Button size="sm" variant="outline" onClick={goToFillGaps} disabled={!selectedId || topicsLoading}>
                <Sparkles className="w-4 h-4 mr-1" />
                Uzupełnij braki
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden space-y-4">
            {/* Regeneracja od zera */}
            <div className="rounded-xl border p-3">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="w-4 h-4" />
                <div className="text-sm font-medium">Wygeneruj od nowa</div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={5}
                  max={50}
                  value={regenCount}
                  onChange={(e) => setRegenCount(Number(e.target.value))}
                  className="max-w-[120px]"
                  disabled={regenBusy || topicsLoading || !selectedId}
                />
                <Button
                  size="sm"
                  onClick={handleRegenerateAll}
                  disabled={regenBusy || topicsLoading || !selectedId || regenCount < 1}
                >
                  {regenBusy ? (
                    <>
                      <Progress value={regenProgress} className="w-28 mr-2" />
                      Przebudowa…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Generuj {regenCount}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Zastąpi wszystkie istniejące tematy nowymi propozycjami (LLM) na podstawie tytułu/opisu kursu.
              </p>
            </div>

            {/* Lista tematów */}
            {!selectedId ? (
              <div className="text-sm text-muted-foreground py-4">Wybierz kurs z listy po lewej.</div>
            ) : topicsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : topicsError ? (
              <Alert variant="destructive">
                <AlertDescription>Nie udało się pobrać tematów dla wybranego kursu.</AlertDescription>
              </Alert>
            ) : topics.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">Brak tematów dla tego kursu.</div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {topics.map((t: any, i: number) => {
                    const position = Number(t.position ?? i + 1);
                    const hasId = t?.id !== undefined && t?.id !== null;
                    const isDeleting = hasId && deletingId === t.id;
                    return (
                      <div key={t.id ?? `row-${i}`} className="rounded-xl border p-3 flex items-start gap-3">
                        <span className="text-sm text-muted-foreground">{position}.</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{t.title}</div>
                          {"description" in t && t.description ? (
                            <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          disabled={!hasId || isDeleting}
                          onClick={() => hasId && handleDeleteTopic(t.id as IdLike, t.title)}
                          title={hasId ? "Usuń temat" : "Brak ID tematu"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
