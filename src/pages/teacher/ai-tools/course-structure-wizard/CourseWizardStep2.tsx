// src/pages/teacher/ai-tools/course-structure-wizard/CourseWizardStep2.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { defineJsonOperation, useLLM } from "@/utility/llmService/useLLM";
import { Settings2, Loader2, CheckCircle2, ArrowLeft, ChevronRight } from "lucide-react";
import { useFormSchemaStore } from "@/utility/formWizard";
import { SnapshotToggle } from "@/utility/formWizard/components/SnapshotToggle";

const TopicSchema = z.object({
  title: z.string(),
  description: z.string(),
  position: z.number().optional(),
  is_published: z.boolean().optional(),
});

const RefinedSchema = z.object({
  courseTitle: z.string(),
  courseDescription: z.string().optional(),
  subject: z.string(),
  level: z.enum(["podstawowy", "rozszerzony"]).or(z.string()),
  isMaturaCourse: z.boolean(),
  topics: z.array(TopicSchema).min(4).max(80),
});

type Refined = z.infer<typeof RefinedSchema>;

const PROCESS_ID = "course-wizard-step2";

export function CourseWizardStep2() {
  const location = useLocation() as any;
  const { register, setData, getData } = useFormSchemaStore();
  
  // Pobierz dane z kroku 1
  const step1Data = getData("course-wizard-step1");
  const initialOutline = location?.state?.outline || step1Data?.outline;

  // Rejestracja procesu
  useEffect(() => {
    register({
      id: PROCESS_ID,
      title: "Generator kursów - Krok 2",
      schema: {
        refineParams: { type: "object", label: "Parametry doprecyzowania" },
        refined: { type: "object", label: "Doprecyzowane tematy" },
      },
    });
  }, [register]);

  // Stan lokalny
  const initialFromStore = useFormSchemaStore((s) => s.formData[PROCESS_ID]) || {};
  
  const [refineParams, setRefineParams] = useState({
    targetTopicsCount: initialFromStore.refineParams?.targetTopicsCount || 
      Math.min(Math.max((initialOutline?.topics?.length as number) || 15, 8), 30),
    styleHints: initialFromStore.refineParams?.styleHints || 
      "krótkie, operacyjne opisy; wyrównanie do podstawy programowej; język matury",
    includeExamAngles: initialFromStore.refineParams?.includeExamAngles ?? 
      Boolean(initialOutline?.isMaturaCourse),
  });

  const [refined, setRefined] = useState<Refined | null>(
    initialFromStore.refined || null
  );

  // Synchronizacja ze store
  useEffect(() => {
    const dataFromStore = useFormSchemaStore.getState().formData[PROCESS_ID];
    if (dataFromStore?.refined) {
      setRefined(dataFromStore.refined);
    }
    if (dataFromStore?.refineParams) {
      setRefineParams(dataFromStore.refineParams);
    }
  }, []);

  const operation = useMemo(
    () =>
      defineJsonOperation({
        id: "refine-highschool-topics",
        name: "Generuj tematy dla studentów",
        system: [
          "Jesteś ekspertem dydaktyki licealnej w Polsce.",
          "Tworzysz KONKRETNE TEMATY lekcji dla uczniów z pełnymi opisami.",
          "Każdy temat to samodzielna jednostka dydaktyczna.",
          "Opisy muszą być jasne, operacyjne i wskazywać co uczeń będzie umiał.",
          "Zwracaj WYŁĄCZNIE poprawny JSON zgodny ze schematem."
        ].join("\n"),
        user: [
          "Na podstawie szkicu kursu wygeneruj PEŁNĄ LISTĘ TEMATÓW dla uczniów.",
          "Każdy temat to osobna lekcja/jednostka w systemie e-learningowym.",
          "",
          "Szkic kursu:",
          JSON.stringify(initialOutline ?? {}, null, 2),
          "",
          "Parametry generowania:",
          "- Docelowa liczba tematów: {{targetTopicsCount}}",
          "- Styl opisów: {{styleHints}}",
          "- Akcent egzaminacyjny: {{includeExamAngles}}",
          "",
          "Zwróć JSON:",
          "{",
          '  "courseTitle": string, // tytuł całego kursu',
          '  "courseDescription": string, // opis kursu dla uczniów',
          '  "subject": string,',
          '  "level": "podstawowy" | "rozszerzony",',
          '  "isMaturaCourse": boolean,',
          '  "topics": [',
          '    {',
          '      "title": string, // tytuł tematu/lekcji',
          '      "description": string, // co uczeń nauczy się w tym temacie',
          '      "position": number, // kolejność tematu (1, 2, 3...)',
          '      "is_published": boolean // domyślnie false',
          '    }',
          '  ]',
          "}",
          "",
          "Wymagania:",
          "- Tytuły tematów: konkretne, zrozumiałe dla ucznia",
          "- Opisy: 2-3 zdania, wskazują efekty uczenia się",
          "- Zachowaj logiczną kolejność tematów (od podstaw do zaawansowanych)",
          "- Pozycje numeruj od 1",
          "- Wszystkie tematy mają is_published: false (nauczyciel sam zdecyduje)",
        ].join("\n"),
        schema: RefinedSchema,
        coerce: (raw: any) => {
          if (raw?.level) {
            const v = String(raw.level).toLowerCase();
            if (["rozszerzony", "podstawowy"].includes(v)) raw.level = v;
          }
          // Automatyczne numerowanie pozycji jeśli brak
          if (Array.isArray(raw?.topics)) {
            raw.topics = raw.topics.map((t: any, idx: number) => ({
              ...t,
              position: t.position ?? idx + 1,
              is_published: t.is_published ?? false
            }));
          }
          return raw;
        },
        inputMapping: (data: any) => ({
          targetTopicsCount: data.targetTopicsCount,
          styleHints: data.styleHints,
          includeExamAngles: data.includeExamAngles,
        }),
        validation: (res) => {
          // Poprawiona walidacja - zwraca tylko boolean
          return Boolean(
            res?.courseTitle &&
            Array.isArray(res?.topics) &&
            res.topics.length > 0 &&
            res.topics[0]?.title &&
            typeof res.topics[0].title === "string"
          );
        },
      }),
    [initialOutline]
  );

  const { run, loading, error, clear } = useLLM("course-structure", operation);

  const updateParams = (patch: Partial<typeof refineParams>) => {
    const next = { ...refineParams, ...patch };
    setRefineParams(next);
    setData(PROCESS_ID, { refineParams: next }, { preferNonEmpty: false });
  };

  const submit = async () => {
    const out = await run(refineParams);
    setRefined(out);
    setData(PROCESS_ID, { refined: out }, { preferNonEmpty: false });
  };

  const clearAll = () => {
    clear();
    setRefined(null);
    setData(PROCESS_ID, { refined: null }, { preferNonEmpty: false });
  };

  if (!initialOutline) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <p className="text-red-600">
            Brak danych z kroku 1. Wróć do kroku 1 i wygeneruj szkic kursu.
          </p>
          <Link
            to="/teacher/course-structure/step1"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-black text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do kroku 1
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <header className="flex items-center gap-3 mb-6">
        <Settings2 className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Krok 2 — Generuj tematy dla uczniów</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PARAMETRY */}
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-3">Parametry generowania</h2>

          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="text-sm text-zinc-600">
              <div><strong>Szkic kursu:</strong> {initialOutline.title}</div>
              <div>Przedmiot: {initialOutline.subject}, Poziom: {initialOutline.level}</div>
              <div>Liczba obszarów w szkicu: {initialOutline.topics?.length || 0}</div>
            </div>
          </div>

          <label className="block mb-3">
            <span className="text-sm font-medium">Docelowa liczba tematów</span>
            <input
              type="number"
              min={5}
              max={60}
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={refineParams.targetTopicsCount}
              onChange={(e) =>
                updateParams({ targetTopicsCount: Number(e.target.value || 10) })
              }
            />
            <span className="text-xs text-gray-500">
              Każdy temat to osobna lekcja w systemie
            </span>
          </label>

          <label className="block mb-3">
            <span className="text-sm font-medium">Styl opisów</span>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[60px]"
              value={refineParams.styleHints}
              onChange={(e) => updateParams({ styleHints: e.target.value })}
              placeholder="np. krótkie, operacyjne; język zrozumiały dla ucznia"
            />
          </label>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={refineParams.includeExamAngles}
              onChange={(e) =>
                updateParams({ includeExamAngles: e.target.checked })
              }
            />
            <span className="text-sm font-medium">
              Uwzględnij wymagania maturalne w opisach
            </span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Settings2 className="w-4 h-4" />
              )}
              Generuj tematy
            </button>
            
            <button
              onClick={clearAll}
              className="px-3 py-2 rounded-xl border text-sm"
            >
              Wyczyść
            </button>
            
            <Link
              to="/teacher/course-structure/step1"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Krok 1
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">Błąd: {error}</p>
          )}
        </div>

        {/* WYNIK */}
        <div className="rounded-2xl border p-4 bg-white shadow-sm max-h-[80vh] overflow-y-auto">
          <h2 className="font-medium mb-3">Wygenerowane tematy</h2>

          {!refined && (
            <p className="text-sm text-zinc-600">
              Po wygenerowaniu zobaczysz tutaj listę tematów gotowych do zapisu jako lekcje w systemie.
            </p>
          )}

          {refined && (
            <div className="space-y-3">
              <div className="bg-emerald-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div className="font-medium">{refined.courseTitle}</div>
                </div>
                {refined.courseDescription && (
                  <p className="text-sm text-zinc-600 mb-2">{refined.courseDescription}</p>
                )}
                <div className="text-sm text-zinc-600">
                  <div>Przedmiot: {refined.subject}</div>
                  <div>Poziom: {String(refined.level)}</div>
                  <div>Kurs maturalny: {refined.isMaturaCourse ? "tak" : "nie"}</div>
                  <div className="font-medium mt-1">
                    Liczba tematów: {refined.topics.length}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Lista tematów:</h3>
                {refined.topics.map((topic, i) => (
                  <div key={i} className="rounded-xl border p-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <span className="text-sm font-medium text-gray-500 mt-0.5">
                        {topic.position || i + 1}.
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">{topic.title}</div>
                        <div className="text-sm text-zinc-600 mt-1">
                          {topic.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Status: {topic.is_published ? "opublikowany" : "niepublikowany"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/teacher/course-structure/step3"
                state={{ refined, outline: initialOutline }}
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-black text-white text-sm w-full justify-center"
              >
                Przejdź do zapisu (krok 3)
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <SnapshotToggle processId={PROCESS_ID} position="right" />
    </div>
  );
} 