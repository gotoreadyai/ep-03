// src/pages/teacher/ai-tools/course-structure-wizard/CourseWizardStep1.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useEffect, useState } from "react";
import { z } from "zod";
import { defineJsonOperation, useLLM } from "@/utility/llmService/useLLM";
import { Loader2, Wand2, Check, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/formWizard";
import { SnapshotToggle } from "@/utility/formWizard/components/SnapshotToggle";

// ---------- Schematy ----------
const TopicSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const OutlineSchema = z.object({
  title: z.string(),
  subject: z.string(),
  level: z.enum(["podstawowy", "rozszerzony"]).or(z.string()),
  isMaturaCourse: z.boolean(),
  topics: z.array(TopicSchema).min(4).max(60),
});

type Outline = z.infer<typeof OutlineSchema>;

// ---------- Stałe ----------
const SUBJECTS = [
  "Język polski",
  "Matematyka",
  "Język angielski",
  "Informatyka",
  "Biologia",
  "Chemia",
  "Fizyka",
  "Geografia",
  "Historia",
  "WOS",
  "Język niemiecki",
];

const PROCESS_ID = "course-wizard-step1";

const DEFAULTS = {
  title: "",
  subject: "Matematyka",
  level: "podstawowy",
  isMaturaCourse: true,
  constraints:
    "Uwzględnij obowiązującą podstawę programową dla liceum ogólnokształcącego.",
  outline: null as Outline | null,
};

// ---------- Komponent ----------
export function CourseWizardStep1() {
  const { register, setData, reset } = useFormSchemaStore();

  // 1) Inicjalizacja procesu w core (raz)
  useEffect(() => {
    register({
      id: PROCESS_ID,
      title: "Generator kursów - Krok 1",
      schema: {
        title: { type: "string", label: "Tytuł kursu" },
        subject: { type: "string", label: "Przedmiot" },
        level: { type: "string", label: "Poziom" },
        isMaturaCourse: { type: "boolean", label: "Kurs maturalny" },
        constraints: { type: "string", label: "Uwagi" },
        outline: { type: "object", label: "Wygenerowany szkic" },
      },
    });
  }, [register]);

  // 2) Lokalny stan formularza (step działa jakby snapshotów nie było)
  const initialFromStore =
    useFormSchemaStore((s) => s.formData[PROCESS_ID]) ?? DEFAULTS;

  const [form, setForm] = useState({
    title: initialFromStore.title ?? DEFAULTS.title,
    subject: initialFromStore.subject ?? DEFAULTS.subject,
    level: initialFromStore.level ?? DEFAULTS.level,
    isMaturaCourse:
      typeof initialFromStore.isMaturaCourse === "boolean"
        ? initialFromStore.isMaturaCourse
        : DEFAULTS.isMaturaCourse,
    constraints: initialFromStore.constraints ?? DEFAULTS.constraints,
  });

  const [outline, setOutline] = useState<Outline | null>(
    initialFromStore.outline ?? null
  );

  // 3) Nasłuchuj zmian w STORE (np. Wczytaj snapshot) → odśwież LOCAL STATE
  const dataFromStore = useFormSchemaStore((s) => s.formData[PROCESS_ID]);
  useEffect(() => {
    if (!dataFromStore) return;
    setForm((prev) => ({
      ...prev,
      ...dataFromStore,
    }));
    if (Object.prototype.hasOwnProperty.call(dataFromStore, "outline")) {
      setOutline((dataFromStore as any).outline ?? null);
    }
  }, [dataFromStore]);

  // 4) Operacja LLM (bez zmian)
  const operation = useMemo(
    () =>
      defineJsonOperation({
        id: "generate-highschool-outline",
        name: "Wygeneruj szkic kursu licealnego (tematy + opisy)",
        system: [
          "Jesteś ekspertem dydaktyki licealnej w Polsce.",
          "Znasz obowiązującą podstawę programową (LO) i formułę egzaminu maturalnego.",
          "Zwracaj WYŁĄCZNIE poprawny JSON zgodny ze schematem.",
          "Używaj języka polskiego, nazewnictwa zgodnego z praktyką szkolną.",
          "Nie twórz treści niezgodnych z podstawą programową; unikaj szczegółów, jeśli wykraczają poza poziom.",
        ].join("\n"),
        user: [
          "Zaprojektuj szkic kursu licealnego. Generujemy wyłącznie TEMATY i ich OPISY.",
          "Uwzględnij: przedmiot, poziom (podstawowy/rozszerzony), czy to kurs maturalny, i podstawę programową (obowiązującą).",
          "",
          "Wejście:",
          `- Tytuł kursu: {{title}}`,
          `- Przedmiot: {{subject}}`,
          `- Poziom: {{level}}`,
          `- Kurs maturalny: {{isMaturaCourse}}`,
          `- Wymagania/uwagi: {{constraints}}`,
          "",
          "Zwróć JSON o strukturze:",
          "{",
          '  "title": string,',
          '  "subject": string,',
          '  "level": "podstawowy" | "rozszerzony",',
          '  "isMaturaCourse": boolean,',
          '  "topics": [',
          '    { "title": string, "description": string }',
          "  ]",
          "}",
          "",
          "Zalecenia:",
          "- Tematy mają być zgodne z podstawą programową LO oraz z poziomem (podstawowy/rozszerzony).",
          "- Jeżeli kurs maturalny = true: uwzględnij kategorie i typowe zakresy treści egzaminacyjne.",
          "- Liczba tematów: 10–25 (dostosuj do przedmiotu i poziomu).",
          "- Opisy: 1–3 zdania, operacyjne (co uczeń potrafi po temacie).",
        ].join("\n"),
        schema: OutlineSchema,
        coerce: (raw: any) => {
          if (raw?.level) {
            const v = String(raw.level).toLowerCase();
            if (["rozszerzony", "podstawowy"].includes(v)) raw.level = v;
          }
          return raw;
        },
        inputMapping: (data: any) => ({
          title: data.title,
          subject: data.subject,
          level: data.level,
          isMaturaCourse: data.isMaturaCourse,
          constraints: data.constraints,
        }),
        validation: (res) =>
          !!res?.title &&
          !!res?.subject &&
          Array.isArray(res?.topics) &&
          res.topics.length >= 4 &&
          typeof res.topics[0]?.title === "string",
      }),
    []
  );

  const { run, loading, error, clear } = useLLM("course-structure", operation);

  // 5) Handlery UI
  const updateForm = (patch: Partial<typeof form>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // zapisuj do store (merge; pozwalamy nadpisywać pustym gdy user świadomie czyści pole)
    setData(PROCESS_ID, patch, { /* merge */ preferNonEmpty: false });
  };

  const submit = async () => {
    const generated = await run(form);
    setOutline(generated);
    setData(PROCESS_ID, { outline: generated }, { /* merge */ preferNonEmpty: false });
  };

  const clearAll = () => {
    // twarde czyszczenie store + lokalnego stanu
    reset(PROCESS_ID); // zeruje persist
    setForm({
      title: DEFAULTS.title,
      subject: DEFAULTS.subject,
      level: DEFAULTS.level,
      isMaturaCourse: DEFAULTS.isMaturaCourse,
      constraints: DEFAULTS.constraints,
    });
    setOutline(null);
    clear();
  };

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto p-6 relative">
      <header className="flex items-center gap-3 mb-6">
        <Wand2 className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Krok 1 — Szkic (tematy + opisy)</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* FORM */}
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Tytuł kursu</span>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.title}
                onChange={(e) => updateForm({ title: e.target.value })}
                placeholder="np. Matematyka — matura rozszerzona"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Przedmiot</span>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.subject}
                onChange={(e) => updateForm({ subject: e.target.value })}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Poziom</span>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.level}
                onChange={(e) => updateForm({ level: e.target.value })}
              >
                <option value="podstawowy">podstawowy</option>
                <option value="rozszerzony">rozszerzony</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isMaturaCourse}
                onChange={(e) => updateForm({ isMaturaCourse: e.target.checked })}
              />
              <span className="text-sm font-medium">Kurs maturalny</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Uwagi / ograniczenia</span>
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[80px]"
                value={form.constraints}
                onChange={(e) => updateForm({ constraints: e.target.value })}
                placeholder="np. Uwzględnij aktualną podstawę, unikaj treści poza zakresem."
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={submit}
                disabled={loading || !form.title.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                Wygeneruj szkic
              </button>

              <button
                onClick={clearAll}
                className="px-3 py-2 rounded-xl border text-sm"
                title="Wyczyść formularz (kasuje też dane w pamięci)"
              >
                Wyczyść
              </button>

              <Link
                to="/teacher/course-structure"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Panel kreatora
              </Link>
            </div>

            {error && <p className="text-sm text-red-600">Błąd: {error}</p>}
          </div>
        </div>

        {/* OUTPUT */}
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-3">Wynik</h2>

          {!outline && (
            <p className="text-sm text-zinc-600">
              Wygenerowane tematy i opisy pojawią się tutaj. Następnie przejdziesz do
              doprecyzowania.
            </p>
          )}

          {outline && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <div className="font-medium">{outline.title}</div>
              </div>

              <div className="text-sm text-zinc-600">
                <div>Przedmiot: {outline.subject}</div>
                <div>Poziom: {String(outline.level)}</div>
                <div>Kurs maturalny: {outline.isMaturaCourse ? "tak" : "nie"}</div>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-medium mb-1">Tematy</h3>
                <ul className="space-y-2">
                  {outline.topics.map((t, i) => (
                    <li key={i} className="rounded-xl border p-3">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-sm text-zinc-600">{t.description}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/teacher/course-structure/step2"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-black text-white text-sm"
                state={{ outline }}
              >
                Przejdź do kroku 2
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Snapshoty – działają poza konstrukcją formularza */}
      <SnapshotToggle processId={PROCESS_ID} position="right" />
    </div>
  );
}
