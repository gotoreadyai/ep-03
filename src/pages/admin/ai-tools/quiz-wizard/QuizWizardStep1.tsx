import { useEffect, useMemo, useState } from "react";
import { useList } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
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
  Badge,
} from "@/components/ui";
import { useStepStore } from "@/utility/formWizard";
import { Info, ChevronRight, Search, EyeOff, SlidersHorizontal } from "lucide-react";

type StepData = {
  courseId?: number;
  topicId?: number;
  materialId?: number;
  count?: number;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  includeExplanations?: boolean;
  randomized?: boolean;
  passingScore?: number;
  timeLimit?: number;
  maxAttempts?: number;
};

const SCHEMA = {
  type: "object",
  properties: {
    courseId: { type: "number", required: true },
    topicId: { type: "number", required: true },
    materialId: { type: "number", required: true },
    count: { type: "number" },
    difficulty: { type: "string" },
    includeExplanations: { type: "boolean" },
    randomized: { type: "boolean" },
    passingScore: { type: "number" },
    timeLimit: { type: "number" },
    maxAttempts: { type: "number" },
  },
};

export function QuizWizardStep1() {
  const { registerStep, setStepData, getStepData } = useStepStore();
  const navigate = useNavigate();
  const data = (getStepData("qw_step1") || {}) as StepData;

  const [showOnlyPublished, setShowOnlyPublished] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    registerStep("qw_step1", SCHEMA);
    if (!data.count) {
      setStepData("qw_step1", {
        count: 10,
        difficulty: "mixed",
        includeExplanations: true,
        randomized: true,
        passingScore: 70,
        timeLimit: undefined,
        maxAttempts: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Kursy
  const { data: coursesData } = useList({
    resource: "courses",
    filters: showOnlyPublished ? [{ field: "is_published", operator: "eq", value: true }] : [],
    sorters: [{ field: "created_at", order: "desc" }],
    pagination: { pageSize: 100 },
  });

  // Tematy
  const { data: topicsData } = useList({
    resource: "topics",
    filters: [{ field: "course_id", operator: "eq", value: data.courseId || -1 }],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 500 },
    queryOptions: { enabled: !!data.courseId },
  });

  // Materiały w temacie
  const { data: materialsData, isLoading: materialsLoading } = useList({
    resource: "activities",
    filters: data.topicId
      ? [
          { field: "topic_id", operator: "eq", value: data.topicId },
          { field: "type", operator: "eq", value: "material" },
        ]
      : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 1000 },
    meta: { select: "id,title,position,is_published" },
    queryOptions: { enabled: !!data.topicId },
  });

  // Filtrowanie materiałów
  const filteredMaterials = useMemo(() => {
    const list = (materialsData?.data || []) as any[];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((m) => String(m.title).toLowerCase().includes(q) || String(m.position).includes(q));
  }, [materialsData?.data, query]);

  const canContinue = !!data.courseId && !!data.topicId && !!data.materialId;

  return (
    <SubPage>
      <Lead title="Krok 1" description="Wybór materiału oraz parametrów quizu" />

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        {/* Lewa kolumna */}
        <Card>
          <CardHeader>
            <CardTitle>Kurs → temat → materiał</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <Checkbox checked={showOnlyPublished} onCheckedChange={(checked) => setShowOnlyPublished(!!checked)} />
              <label className="text-sm cursor-pointer">Tylko opublikowane kursy</label>
            </div>

            <Select
              value={data.courseId ? String(data.courseId) : ""}
              onValueChange={(v) => setStepData("qw_step1", { courseId: Number(v), topicId: undefined, materialId: undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kurs" />
              </SelectTrigger>
              <SelectContent>
                {(coursesData?.data || []).map((c: any) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    <div className="flex items-center gap-2">
                      {c.icon_emoji ? `${c.icon_emoji} ` : "📚 "}
                      <span>{c.title}</span>
                      {!c.is_published && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          <EyeOff className="w-3 h-3" />
                          Szkic
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={data.topicId ? String(data.topicId) : ""}
              onValueChange={(v) => setStepData("qw_step1", { topicId: Number(v), materialId: undefined })}
              disabled={!data.courseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz temat" />
              </SelectTrigger>
              <SelectContent>
                {(topicsData?.data || []).map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.position}. {t.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {data.topicId && (
              <div className="rounded-lg border">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/40">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtruj materiały…" className="h-8" />
                </div>

                <div className="divide-y">
                  {materialsLoading && <div className="p-3 text-xs text-muted-foreground">Ładowanie materiałów…</div>}
                  {!materialsLoading && filteredMaterials.length === 0 && (
                    <div className="p-3 text-xs text-muted-foreground">{query ? "Brak wyników dla filtru." : "Brak materiałów w tym temacie."}</div>
                  )}
                  {filteredMaterials.map((m: any) => {
                    const selected = data.materialId === m.id;

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setStepData("qw_step1", { materialId: m.id })}
                        className={["w-full text-left p-3 hover:bg-muted/50 transition", selected ? "bg-cyan-50/60 ring-1 ring-cyan-200" : ""].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium flex items-center gap-2">
                              <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-semibold">
                                {m.position}
                              </span>
                              <span className="truncate">{m.title}</span>
                              {!m.is_published && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  <EyeOff className="w-3 h-3" />
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div
                            className={["shrink-0 w-3 h-3 rounded-full border mt-1", selected ? "bg-cyan-500 border-cyan-500" : "bg-white"].join(" ")}
                            aria-hidden
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t text-[11px] text-muted-foreground">Kliknij materiał, aby go wybrać.</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prawa kolumna */}
        <Card>
          <CardHeader>
            <CardTitle>Parametry generowania</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Steruj zakresem i poziomem pytań</span>
            </div>

            <div>
              <div className="text-xs mb-1">Liczba pytań</div>
              <Input type="number" min={3} max={30} value={data.count ?? 10} onChange={(e) => setStepData("qw_step1", { count: Number(e.target.value) })} />
            </div>

            <div>
              <div className="text-xs mb-1">Poziom trudności</div>
              <Select value={data.difficulty || "mixed"} onValueChange={(v) => setStepData("qw_step1", { difficulty: v as StepData["difficulty"] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz poziom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">Mieszany</SelectItem>
                  <SelectItem value="easy">Łatwy</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="hard">Trudny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Parametry quizu</div>

              <div>
                <div className="text-xs mb-1">
                  Wynik zaliczający (%)
                  <span className="text-muted-foreground ml-1">domyślnie: 70%</span>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={data.passingScore ?? 70}
                  onChange={(e) => setStepData("qw_step1", { passingScore: Number(e.target.value) })}
                />
              </div>

              <div>
                <div className="text-xs mb-1">
                  Limit czasu (minuty)
                  <span className="text-muted-foreground ml-1">opcjonalne</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={180}
                  placeholder="Brak limitu"
                  value={data.timeLimit ?? ""}
                  onChange={(e) => setStepData("qw_step1", { timeLimit: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>

              <div>
                <div className="text-xs mb-1">
                  Max. liczba prób
                  <span className="text-muted-foreground ml-1">opcjonalne</span>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  placeholder="Bez limitu"
                  value={data.maxAttempts ?? ""}
                  onChange={(e) => setStepData("qw_step1", { maxAttempts: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={data.includeExplanations ?? true} onCheckedChange={(v) => setStepData("qw_step1", { includeExplanations: Boolean(v) })} />
                <span className="text-sm">Dodaj wyjaśnienia do poprawnych odpowiedzi</span>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox checked={data.randomized ?? true} onCheckedChange={(v) => setStepData("qw_step1", { randomized: Boolean(v) })} />
                <span className="text-sm">Losuj kolejność odpowiedzi</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Pytania będą tworzone na podstawie treści wybranego materiału. Upewnij się, że materiał jest kompletny.
              </AlertDescription>
            </Alert>

            <Button disabled={!canContinue} className="w-full" onClick={() => navigate("/admin/quiz-wizard/step2")}>
              Kontynuuj
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {!canContinue && <p className="text-xs text-muted-foreground text-center">Wybierz kurs, temat i materiał aby kontynuować</p>}
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}