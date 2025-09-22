// src/pages/admin/ai-tools/educational-material-wizard/EduMaterialsStep1.tsx
import { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Alert,
  AlertDescription,
  ScrollArea,
  Badge,
} from "@/components/ui";
import { useStepStore } from "@/utility/formWizard";
import { getLatestCurriculumForSubject, SUBJECTS } from "../course-structure-wizard/curriculum";
import { Info, ChevronRight, Search, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

type StepData = {
  courseId?: number;
  topicId?: number;
  subject?: string;
  level?: "podstawowy" | "rozszerzony" | string;
  isMaturaCourse?: boolean;
  alignToCurriculum?: boolean;
  defaultDuration?: number;
  style?: "notebook" | "exam" | "concise";
  tone?: "neutral" | "friendly" | "formal";
  includeExercises?: boolean;
};

const SCHEMA = {
  type: "object",
  properties: {
    courseId: { type: "number", required: true },
    topicId: { type: "number", required: true },
    subject: { type: "string" },
    level: { type: "string" },
    isMaturaCourse: { type: "boolean" },
    alignToCurriculum: { type: "boolean" },
    defaultDuration: { type: "number" },
    style: { type: "string" },
    tone: { type: "string" },
    includeExercises: { type: "boolean" },
  },
};

type MaterialSummary = {
  count: number;
  titles: string[];
};

export function EduMaterialsStep1() {
  const { registerStep, setStepData, getStepData } = useStepStore();
  const navigate = useNavigate();
  const data = (getStepData("em_step1") || {}) as StepData;
  
  // Nowy stan dla filtra publikacji
  const [showOnlyPublished, setShowOnlyPublished] = useState(false);

  useEffect(() => {
    registerStep("em_step1", SCHEMA);
    if (!data.subject) {
      setStepData("em_step1", {
        subject: "Matematyka",
        level: "podstawowy",
        isMaturaCourse: true,
        alignToCurriculum: true,
        style: "notebook",
        tone: "friendly",
        includeExercises: true,
        defaultDuration: 20,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pobierz WSZYSTKIE kursy (lub filtrowane według checkboxa)
  const { data: coursesData } = useList({
    resource: "courses",
    filters: showOnlyPublished ? [
      { field: "is_published", operator: "eq", value: true }
    ] : [],
    sorters: [{ field: "created_at", order: "desc" }], // Najnowsze najpierw
    pagination: { pageSize: 100 },
  });

  // Pobierz WSZYSTKIE tematy w wybranym kursie (nawet nieopublikowane)
  const { data: topicsData, isLoading: topicsLoading } = useList({
    resource: "topics",
    filters: [{ field: "course_id", operator: "eq", value: data.courseId || -1 }],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 500 },
    queryOptions: { enabled: !!data.courseId },
  });

  // Po zmianie kursu czyść wybrany temat
  useEffect(() => {
    setStepData("em_step1", { topicId: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.courseId]);

  // ------- Materiały istniejące per temat -------
  const [materialsByTopic, setMaterialsByTopic] = useState<Record<number, MaterialSummary>>({});
  const topicIds = useMemo(
    () => (topicsData?.data || []).map((t: any) => t.id) as number[],
    [topicsData?.data]
  );

  useEffect(() => {
    let aborted = false;
    async function loadMaterials() {
      if (!topicIds.length) {
        setMaterialsByTopic({});
        return;
      }
      try {
        const ids = topicIds.join(",");
        const resp = await fetch(
          `/rest/activities?select=topic_id,title,type&topic_id=in.(${ids})&type=eq.material&order=position.asc`,
          { headers: { Prefer: "count=exact" } }
        );
        const arr = (await resp.json()) as Array<{ topic_id: number; title: string; type: string }>;
        if (aborted) return;
        const map: Record<number, MaterialSummary> = {};
        for (const row of arr) {
          if (!map[row.topic_id]) map[row.topic_id] = { count: 0, titles: [] };
          map[row.topic_id].count += 1;
          if (map[row.topic_id].titles.length < 3) {
            map[row.topic_id].titles.push(row.title);
          }
        }
        setMaterialsByTopic(map);
      } catch {
        if (!aborted) setMaterialsByTopic({});
      }
    }
    loadMaterials();
    return () => {
      aborted = true;
    };
  }, [topicIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------- Filtr listy tematów -------
  const [query, setQuery] = useState("");
  const filteredTopics = useMemo(() => {
    const list = (topicsData?.data || []) as any[];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((t) =>
      String(t.title).toLowerCase().includes(q) || String(t.position).includes(q)
    );
  }, [topicsData?.data, query]);

  const latestCurriculum = useMemo(
    () => getLatestCurriculumForSubject(data.subject),
    [data.subject]
  );

  const canContinue = !!data.courseId && !!data.topicId;

  // Znajdź wybrany kurs
  const selectedCourse = useMemo(() => {
    return coursesData?.data?.find((c: any) => c.id === data.courseId);
  }, [coursesData?.data, data.courseId]);

  return (
    <SubPage>
      <Lead title="Krok 1" description="Wybór kursu, tematu i parametrów" />

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Kurs i temat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Checkbox do filtrowania tylko opublikowanych */}
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Checkbox
                checked={showOnlyPublished}
                onCheckedChange={(checked) => setShowOnlyPublished(!!checked)}
              />
              <label className="text-sm cursor-pointer">
                Pokazuj tylko opublikowane kursy
              </label>
            </div>

            <Select
              value={data.courseId ? String(data.courseId) : ""}
              onValueChange={(v) =>
                setStepData("em_step1", { courseId: Number(v) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kurs" />
              </SelectTrigger>
              <SelectContent>
                {(coursesData?.data || []).length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground">
                    {showOnlyPublished 
                      ? "Brak opublikowanych kursów. Odznacz filtr."
                      : "Brak kursów. Najpierw wygeneruj kurs."
                    }
                  </div>
                ) : (
                  (coursesData?.data || []).map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      <div className="flex items-center gap-2">
                        {c.icon_emoji ? `${c.icon_emoji} ` : "📚 "}
                        <span>{c.title}</span>
                        {!c.is_published && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Szkic
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Informacja o wybranym kursie */}
            {selectedCourse && !selectedCourse.is_published && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Wybrany kurs jest szkicem (nieopublikowany).
                  Materiały zostaną utworzone, ale nie będą widoczne dla uczniów
                  dopóki nie opublikujesz kursu.
                </AlertDescription>
              </Alert>
            )}

            {/* Lista tematów z materiałami */}
            {data.courseId && (
              <div className="rounded-lg border">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/40">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filtruj tematy…"
                    className="h-8"
                  />
                </div>
                <ScrollArea className="max-h-72">
                  <div className="divide-y">
                    {topicsLoading && (
                      <div className="p-3 text-xs text-muted-foreground">
                        Ładowanie tematów…
                      </div>
                    )}
                    {!topicsLoading && filteredTopics.length === 0 && (
                      <div className="p-3 text-xs text-muted-foreground">
                        {query 
                          ? "Brak wyników dla filtru."
                          : "Ten kurs nie ma jeszcze tematów."
                        }
                      </div>
                    )}
                    {filteredTopics.map((t: any) => {
                      const summary = materialsByTopic[t.id];
                      const selected = data.topicId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setStepData("em_step1", { topicId: t.id })}
                          className={[
                            "w-full text-left p-3 hover:bg-muted/50 transition",
                            selected ? "bg-blue-50/60 ring-1 ring-blue-200" : "",
                          ].join(" ")}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate flex items-center gap-2">
                                {t.position}. {t.title}
                                {!t.is_published && (
                                  <Badge variant="outline" className="text-xs">
                                    <EyeOff className="w-3 h-3" />
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                {summary ? (
                                  <>
                                    Materiały:{" "}
                                    <Badge variant="secondary" className="align-middle">
                                      {summary.count}
                                    </Badge>
                                    {summary.titles.length > 0 && (
                                      <span className="ml-2">
                                        {summary.titles.join(" • ")}
                                        {summary.count > summary.titles.length ? " • …" : ""}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  <>Materiały: <Badge variant="outline">0</Badge></>
                                )}
                              </div>
                            </div>
                            <div
                              className={[
                                "shrink-0 w-3 h-3 rounded-full border",
                                selected ? "bg-blue-500 border-blue-500" : "bg-white",
                              ].join(" ")}
                              aria-hidden
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="p-2 border-t text-[11px] text-muted-foreground">
                  Kliknij temat aby go wybrać. Pokazywane są wszystkie tematy (także szkice).
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parametry generowania</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={data.subject || "Matematyka"}
              onValueChange={(v) => setStepData("em_step1", { subject: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Przedmiot" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={data.level || "podstawowy"}
              onValueChange={(v) => setStepData("em_step1", { level: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Poziom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="podstawowy">Podstawowy</SelectItem>
                <SelectItem value="rozszerzony">Rozszerzony</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={data.isMaturaCourse || false}
                onCheckedChange={(v) =>
                  setStepData("em_step1", {
                    isMaturaCourse: Boolean(v),
                    alignToCurriculum: v ? data.alignToCurriculum : false,
                  })
                }
              />
              <span className="text-sm">Kurs maturalny</span>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={data.alignToCurriculum || false}
                onCheckedChange={(v) =>
                  setStepData("em_step1", { alignToCurriculum: Boolean(v) })
                }
                disabled={!data.isMaturaCourse}
              />
              <span className="text-sm">Uwzględnij najnowszą (2025) podstawę LO (PL)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs mb-1">Styl</div>
                <Select
                  value={data.style || "notebook"}
                  onValueChange={(v) =>
                    setStepData("em_step1", { style: v as StepData["style"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz styl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notebook">Notatka z lekcji</SelectItem>
                    <SelectItem value="exam">Pod egzamin</SelectItem>
                    <SelectItem value="concise">Zwięzły</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs mb-1">Ton</div>
                <Select
                  value={data.tone || "friendly"}
                  onValueChange={(v) =>
                    setStepData("em_step1", { tone: v as StepData["tone"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ton" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Przystępny</SelectItem>
                    <SelectItem value="neutral">Neutralny</SelectItem>
                    <SelectItem value="formal">Formalny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="text-xs mb-1">Domyślny czas (min)</div>
              <Input
                type="number"
                min={5}
                value={data.defaultDuration ?? 20}
                onChange={(e) =>
                  setStepData("em_step1", { defaultDuration: Number(e.target.value) })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={data.includeExercises ?? true}
                onCheckedChange={(v) =>
                  setStepData("em_step1", { includeExercises: Boolean(v) })
                }
              />
              <span className="text-sm">Dodaj mini-ćwiczenia/quizy na końcu materiału</span>
            </div>

            {data.isMaturaCourse && data.alignToCurriculum && latestCurriculum && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Dokument: <strong>{latestCurriculum.label}</strong>
                  {latestCurriculum.year ? ` • ${latestCurriculum.year}` : ""}
                </AlertDescription>
              </Alert>
            )}

            <Button
              disabled={!canContinue}
              className="w-full"
              onClick={() => navigate("/admin/educational-material/step2")}
            >
              Kontynuuj
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            
            {!canContinue && (
              <p className="text-xs text-muted-foreground text-center">
                Wybierz kurs i temat aby kontynuować
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}