// src/pages/admin/ai-tools/course-structure-wizard/CourseWizardStep4.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle2, BookOpenCheck, Trash2 } from "lucide-react";
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
} from "@/components/ui";
import { useList, useDelete } from "@refinedev/core";

type IdLike = number | string;

export function CourseWizardStep4() {
  const location = useLocation() as any;

  // dane przekazane z kroku 3
  const createdCourseId = location?.state?.courseId as IdLike | undefined;
  const createdCourseTitle =
    (location?.state?.courseTitle as string) || "Nowy kurs";
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
  const [selectedId, setSelectedId] = useState<IdLike | undefined>(
    createdCourseId
  );

  useEffect(() => {
    if (!selectedId && courses.length > 0) {
      setSelectedId(courses[0].id);
    }
  }, [selectedId, courses]);

  // — odśwież listę po wejściu (żeby mieć świeżo zapisany kurs)
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
            value:
              typeof selectedId === "string"
                ? parseInt(selectedId, 10)
                : selectedId,
          },
        ]
      : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { current: 1, pageSize: 200 },
    queryOptions: { enabled: Boolean(selectedId) },
  });

  useEffect(() => {
    if (selectedId) refetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const topics = topicsData?.data ?? [];

  const createdIdAsNumber = useMemo(() => {
    if (createdCourseId === undefined) return undefined;
    return typeof createdCourseId === "string"
      ? parseInt(createdCourseId, 10)
      : createdCourseId;
  }, [createdCourseId]);

  // --- USUWANIE TEMATÓW ---
  const { mutate: deleteTopic } = useDelete();
  const [deletingId, setDeletingId] = useState<IdLike | null>(null);
  const handleDeleteTopic = async (topicId: IdLike, title?: string) => {
    const ok = window.confirm(
      `Na pewno usunąć temat${title ? `: “${title}”` : ""}? Tego nie można cofnąć.`
    );
    if (!ok) return;
    setDeletingId(topicId);
    await new Promise<void>((resolve) => {
      deleteTopic(
        {
          resource: "topics",
          id: topicId,
        },
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
                  <>
                    {" "}
                    — zapisano {topicsCount} temat
                    {topicsCount === 1 ? "" : topicsCount < 5 ? "y" : "ów"}.
                  </>
                ) : null}{" "}
                (ID: {String(createdCourseId)})
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground">
              Lista kursów poniżej. Nowy kurs jest wyróżniony i zaznaczony — po
              prawej widzisz jego tematy.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Lista kursów (lewa kolumna) */}
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
                <AlertDescription>
                  Nie udało się pobrać listy kursów.
                </AlertDescription>
              </Alert>
            ) : courses.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                Brak kursów.
              </div>
            ) : (
              <ScrollArea className="h-full pr-2">
                <div className="space-y-2">
                  {courses.map((c: any) => {
                    const isNew =
                      createdIdAsNumber !== undefined &&
                      Number(c.id) === Number(createdIdAsNumber);
                    const isSelected =
                      selectedId !== undefined &&
                      Number(c.id) === Number(selectedId);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={[
                          "w-full text-left rounded-xl border px-3 py-2 transition",
                          isSelected
                            ? "border-black/80 bg-black text-white"
                            : "hover:bg-muted/60",
                          isNew && !isSelected ? "border-green-400" : "",
                          isNew && isSelected ? "ring-2 ring-green-300" : "",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div
                              className={[
                                "font-medium",
                                isSelected ? "text-white" : "text-foreground",
                              ].join(" ")}
                            >
                              {c.title || `Kurs #${c.id}`}
                            </div>
                            {c.description ? (
                              <div
                                className={[
                                  "text-xs line-clamp-2",
                                  isSelected
                                    ? "text-white/80"
                                    : "text-muted-foreground",
                                ].join(" ")}
                              >
                                {c.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {isNew && (
                              <Badge
                                variant={isSelected ? "secondary" : "default"}
                              >
                                NOWY
                              </Badge>
                            )}
                            {!c.is_published && (
                              <Badge
                                variant={isSelected ? "secondary" : "outline"}
                                className="text-[10px]"
                              >
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

        {/* Szczegóły: tematy wybranego kursu (prawa kolumna) */}
        <Card className="lg:col-span-3 lg:h-full flex flex-col">
          <CardHeader>
            <CardTitle>
              Tematy:{" "}
              {(() => {
                const current = courses.find(
                  (c: any) => Number(c.id) === Number(selectedId)
                );
                return current?.title
                  ? current.title
                  : selectedId
                  ? `Kurs #${String(selectedId)}`
                  : "—";
              })()}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {!selectedId ? (
              <div className="text-sm text-muted-foreground py-4">
                Wybierz kurs z listy po lewej.
              </div>
            ) : topicsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : topicsError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Nie udało się pobrać tematów dla wybranego kursu.
                </AlertDescription>
              </Alert>
            ) : topics.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                Brak tematów dla tego kursu.
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {topics.map((t: any, i: number) => {
                    const position = Number(t.position ?? i + 1);
                    const isDeleting = deletingId === (t.id ?? null);
                    return (
                      <div
                        key={t.id ?? i}
                        className="rounded-xl border p-3 flex items-start gap-3"
                      >
                        <span className="text-sm text-muted-foreground">
                          {position}.
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{t.title}</div>
                          {"description" in t && t.description ? (
                            <div className="text-xs text-muted-foreground mt-1">
                              {t.description}
                            </div>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          disabled={isDeleting}
                          onClick={() => handleDeleteTopic(t.id, t.title)}
                          title="Usuń temat"
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

