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
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { useStepStore } from "@/utility/formWizard";
import { getLatestCurriculumForSubject, SUBJECTS } from "../course-structure-wizard/curriculum";
import { Info, ChevronRight, Search, EyeOff, FileText, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CourseSelector } from "../CourseSelector";
import { MaterialContentRenderer } from "@/pages/teacher/activities/components/MaterialContentRenderer";

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

type Material = {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  position: number;
  is_published: boolean;
  duration_min?: number;
  created_at: string;
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

export function EduMaterialsStep1() {
  const { registerStep, setStepData, getStepData } = useStepStore();
  const navigate = useNavigate();
  const data = (getStepData("em_step1") || {}) as StepData;

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    material: Material | null;
  }>({
    open: false,
    material: null,
  });

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

  // Kursy
  const { data: coursesData } = useList({
    resource: "courses",
    sorters: [{ field: "created_at", order: "desc" }],
    pagination: { pageSize: 100 },
  });

  // Tematy dla wybranego kursu
  const { data: topicsData, isLoading: topicsLoading } = useList({
    resource: "topics",
    filters: [{ field: "course_id", operator: "eq", value: data.courseId || -1 }],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 500 },
    queryOptions: { enabled: !!data.courseId },
  });

  // Aktywności (materiały) w kursie — teraz z pełnymi danymi dla podglądu
  const topicIds = useMemo(() => (topicsData?.data || []).map((t: any) => t.id), [topicsData?.data]);

  const { data: activitiesData } = useList<Material>({
    resource: "activities",
    filters:
      topicIds.length > 0
        ? [
            { field: "topic_id", operator: "in", value: topicIds },
            { field: "type", operator: "eq", value: "material" },
          ]
        : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 1000 },
    meta: { select: "id,topic_id,title,type,position,content,duration_min,created_at,is_published" },
    queryOptions: { enabled: topicIds.length > 0 },
  });

  // Materiały per temat - teraz z pełnymi obiektami
  const materialsByTopic = useMemo(() => {
    const map: Record<number, { count: number; materials: Material[] }> = {};
    if (activitiesData?.data) {
      for (const activity of activitiesData.data) {
        const topicId = activity.topic_id;
        if (!map[topicId]) map[topicId] = { count: 0, materials: [] };
        map[topicId].count++;
        map[topicId].materials.push(activity);
      }
    }
    return map;
  }, [activitiesData?.data]);

  // Po zmianie kursu czyść wybrany temat
  useEffect(() => {
    setStepData("em_step1", { topicId: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.courseId]);

  // wybrany kurs z cache listy
  const selectedCourse = useMemo(() => {
    return coursesData?.data?.find((c: any) => c.id === data.courseId);
  }, [coursesData?.data, data.courseId]);

  // SYNC: po wyborze kursu ustaw automatycznie parametry generowania
  useEffect(() => {
    if (!selectedCourse) return;

    const rawLevel = String(selectedCourse.level || "").toLowerCase();
    const normalizedLevel = rawLevel === "rozszerzony" ? "rozszerzony" : "podstawowy";

    setStepData("em_step1", {
      subject: selectedCourse.subject || "Matematyka",
      level: normalizedLevel,
      isMaturaCourse: Boolean(selectedCourse.is_exam_course),
      alignToCurriculum: Boolean(selectedCourse.is_exam_course),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  // Filtrowanie listy tematów
  const [query, setQuery] = useState("");
  const filteredTopics = useMemo(() => {
    const list = (topicsData?.data || []) as any[];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((t) => String(t.title).toLowerCase().includes(q) || String(t.position).includes(q));
  }, [topicsData?.data, query]);

  const latestCurriculum = useMemo(() => getLatestCurriculumForSubject(data.subject), [data.subject]);

  const canContinue = !!data.courseId && !!data.topicId;

  const handlePreviewMaterial = (material: Material, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewModal({
      open: true,
      material,
    });
  };

  return (
    <SubPage>
      <Lead title="Krok 1" description="Wybór kursu, tematu i parametrów" />

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        {/* Lewa kolumna */}
        <Card>
          <CardHeader>
            <CardTitle>Kurs i temat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CourseSelector
              value={data.courseId || null}
              onChange={(courseId) => setStepData("em_step1", { courseId: courseId || undefined })}
              showAlert={true}
            />

            {data.courseId && (
              <div className="rounded-lg border">
                <div className="flex items-center gap-2 p-2 border-b bg-muted/40">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtruj tematy…" className="h-8" />
                </div>

                <div className="divide-y">
                  {topicsLoading && <div className="p-3 text-xs text-muted-foreground">Ładowanie tematów…</div>}
                  {!topicsLoading && filteredTopics.length === 0 && (
                    <div className="p-3 text-xs text-muted-foreground">{query ? "Brak wyników dla filtru." : "Ten kurs nie ma jeszcze tematów."}</div>
                  )}
                  {filteredTopics.map((t: any) => {
                    const materials = materialsByTopic[t.id];
                    const selected = data.topicId === t.id;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setStepData("em_step1", { topicId: t.id })}
                        className={["w-full text-left p-3 hover:bg-muted/50 transition", selected ? "bg-blue-50/60 ring-1 ring-blue-200" : ""].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium flex items-center gap-2">
                              <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-semibold">
                                {t.position}
                              </span>
                              <span className="truncate">{t.title}</span>
                              {!t.is_published && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  <EyeOff className="w-3 h-3" />
                                </Badge>
                              )}
                            </div>

                            {/* Pokaż materiały TYLKO dla zaznaczonego tematu */}
                            {selected && (
                              <div className="mt-2 ml-7">
                                {materials?.count > 0 ? (
                                  <>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                      <FileText className="w-3 h-3" />
                                      <span>Materiały:</span>
                                      <Badge variant="secondary" className="text-xs h-4 px-1">
                                        {materials.count}
                                      </Badge>
                                    </div>
                                    <ul className="space-y-0.5 ml-4">
                                      {materials.materials.map((material) => (
                                        <li key={material.id} className="text-[11px]">
                                          <button
                                            onClick={(e) => handlePreviewMaterial(material, e)}
                                            className="text-primary/70 hover:text-primary hover:underline inline-flex items-center gap-1 w-full text-left"
                                          >
                                            <span className="mr-1">•</span>
                                            <span className="truncate flex-1">{material.title}</span>
                                            <Eye className="w-3 h-3 opacity-0 hover:opacity-100 transition-opacity flex-shrink-0" />
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                ) : (
                                  <div className="text-xs text-muted-foreground/50 italic">Brak materiałów</div>
                                )}
                              </div>
                            )}
                          </div>

                          <div
                            className={["shrink-0 w-3 h-3 rounded-full border mt-1", selected ? "bg-blue-500 border-blue-500" : "bg-white"].join(" ")}
                            aria-hidden
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t text-[11px] text-muted-foreground">
                  Kliknij temat aby go wybrać i zobaczyć wszystkie materiały. Kliknij tytuł materiału aby zobaczyć podgląd.
                </div>
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
            <Select value={data.subject || "Matematyka"} onValueChange={(v) => setStepData("em_step1", { subject: v })}>
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

            <Select value={data.level || "podstawowy"} onValueChange={(v) => setStepData("em_step1", { level: v })}>
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
                onCheckedChange={(v) => setStepData("em_step1", { alignToCurriculum: Boolean(v) })}
                disabled={!data.isMaturaCourse}
              />
              <span className="text-sm">Uwzględnij najnowszą (2025) podstawę LO (PL)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs mb-1">Styl</div>
                <Select value={data.style || "notebook"} onValueChange={(v) => setStepData("em_step1", { style: v as StepData["style"] })}>
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
                <Select value={data.tone || "friendly"} onValueChange={(v) => setStepData("em_step1", { tone: v as StepData["tone"] })}>
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
                onChange={(e) => setStepData("em_step1", { defaultDuration: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={data.includeExercises ?? true} onCheckedChange={(v) => setStepData("em_step1", { includeExercises: Boolean(v) })} />
              <span className="text-sm">Dodaj mini-ćwiczenia na końcu</span>
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

            <Button disabled={!canContinue} className="w-full" onClick={() => navigate("/admin/educational-material/step2")}>
              Kontynuuj
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>

            {!canContinue && <p className="text-xs text-muted-foreground text-center">Wybierz kurs i temat aby kontynuować</p>}
          </CardContent>
        </Card>
      </div>

      {/* Modal podglądu materiału */}
      <Dialog
        open={previewModal.open}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewModal({ open: false, material: null });
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {previewModal.material?.title}
            </DialogTitle>
            <DialogDescription>Podgląd materiału • {previewModal.material?.duration_min || 20} min</DialogDescription>
          </DialogHeader>

          {previewModal.material && (
            <MaterialContentRenderer
              content={previewModal.material.content}
              metadata={{
                duration_min: previewModal.material.duration_min,
                position: previewModal.material.position,
                created_at: previewModal.material.created_at,
              }}
              showMetadata={true}
              height="500px"
            />
          )}
        </DialogContent>
      </Dialog>
    </SubPage>
  );
}