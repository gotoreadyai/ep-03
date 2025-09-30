// src/pages/admin/ai-tools/course-structure-wizard/CourseWizardStep1.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { callLLM } from "@/utility/llmService";
import { SnapshotBar, useStepStore } from "@/utility/formWizard";
import { Loader2, Sparkles, Info } from "lucide-react";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Checkbox,
  Alert,
  AlertDescription,
} from "@/components/ui";
import { Lead } from "@/components/reader";
import { SubPage } from "@/components/layout";
import { SUBJECTS, getLatestCurriculumForSubject } from "./curriculum";

type Step1Data = {
  title?: string;
  subject?: string;
  level?: "podstawowy" | "rozszerzony" | string;
  isMaturaCourse?: boolean;
  isGenerating?: boolean;
  outline?: any;
  alignToCurriculum?: boolean;
  useCustomTitle?: boolean;
};

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    subject: { type: "string", required: true },
    level: { type: "string", required: true },
    isMaturaCourse: { type: "boolean", required: true },
    topics: {
      type: "array",
      minItems: 5,
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

// ───────────────────────── helpers ─────────────────────────

function Row({
  label,
  children,
  muted,
}: {
  label: string;
  children?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="min-w-[110px] text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={muted ? "text-muted-foreground" : ""}>{children}</span>
    </div>
  );
}

// Porównanie dwóch nazw – prosto, bez chipów
function NamesCompare({
  custom,
  generated,
  activeIsCustom,
}: {
  custom?: string;
  generated?: string;
  activeIsCustom: boolean;
}) {
  const c = (custom || "").trim();
  const g = (generated || "").trim();
  if (!c && !g) return null;

  return (
    <div className="space-y-1">
        <span className="text-xs text-primary/80">NAZWA KURSU</span>
     
        <div>
          {" "}
          <span className={activeIsCustom ? "font-medium" : ""}>{c}</span>
          {activeIsCustom && (
            <span className="ml-2 text-xs text-primary/80">(aktywna)</span>
          )}
        </div>
     
     
        <div>
          <span className={!activeIsCustom ? "font-medium" : ""}>{g}</span>
          {!activeIsCustom && (
            <span className="ml-2 text-xs text-primary/80">(aktywna)</span>
          )}
        </div>
     
    </div>
  );
}

// Badge (chip) w stylu „aktywny”
function ActiveBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border bg-primary/10 border-primary text-primary">
      {children}
    </span>
  );
}

// Szczegóły – TYLKO 3 badge z aktywnymi wartościami
function Details({
  subjectActive,
  levelActive,
  isMatura,
}: {
  subjectActive?: string;
  levelActive?: string;
  isMatura?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        Szczegóły
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {subjectActive && <ActiveBadge>{subjectActive}</ActiveBadge>}
        {levelActive && <ActiveBadge>{levelActive}</ActiveBadge>}
        <ActiveBadge>{isMatura ? "maturalny" : "niematuralny"}</ActiveBadge>
      </div>
    </div>
  );
}

// ───────────────────────── component ─────────────────────────

export function CourseWizardStep1() {
  const { registerStep, setStepData, getStepData } = useStepStore();
  const data = (getStepData("step1") || {}) as Step1Data;

  useEffect(() => {
    registerStep("step1", SCHEMA);
    if (!data.subject) {
      setStepData("step1", {
        subject: "Matematyka",
        level: "podstawowy",
        isMaturaCourse: true,
        alignToCurriculum: true,
        useCustomTitle: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestCurriculum = useMemo(
    () => getLatestCurriculumForSubject(data.subject),
    [data.subject]
  );

  const [showOutcomes, setShowOutcomes] = useState(false);

  const generate = async () => {
    setStepData("step1", { isGenerating: true });
    try {
      const outcomes =
        latestCurriculum?.outcomes?.[data.subject as string] ?? [];
      const curriculumPrompt =
        data.isMaturaCourse && data.alignToCurriculum && latestCurriculum
          ? `
Uwzględnij zgodność z podstawą programową LO (PL).
(Dokument: ${latestCurriculum.label}${
              latestCurriculum.year ? ` • ${latestCurriculum.year}` : ""
            })
Wymagania do pokrycia:
${outcomes.map((o, i) => `${i + 1}. ${o}`).join("\n")}
Jeśli to możliwe, sygnalizuj pokrycie wymagań w nawiasie, np. "[PP]".
          `.trim()
          : "";

      const prompt = `
Wygeneruj szkic kursu dla nauczyciela:
- przedmiot: ${data.subject}
- poziom: ${data.level}
- charakter: ${data.isMaturaCourse ? "maturalny" : "niematuralny"}
${curriculumPrompt ? `\n${curriculumPrompt}\n` : ""}

Szkic ma być zwięzły, klarowny i praktyczny dla planowania lekcji. Zadbaj, by tematy były sensownie dobrane do poziomu.
      `.trim();

      const result = await callLLM(prompt, SCHEMA);
      setStepData("step1", { outline: result, isGenerating: false });
    } catch {
      setStepData("step1", { isGenerating: false });
    }
  };

  const showCurriculumHint = Boolean(
    data.isMaturaCourse && latestCurriculum && data.alignToCurriculum
  );

  // ——— aktywna nazwa + porównanie
  const formTitle = (data.title || "").trim();
  const generatedTitle = (data.outline?.title || "").trim();
  const activeIsCustom = Boolean(data.useCustomTitle && formTitle);
  const previewTitle = activeIsCustom
    ? formTitle
    : generatedTitle ||
      (data.subject && data.level
        ? `${data.subject} — kurs ${data.level}`
        : "Szkic kursu");

  const outcomesList =
    latestCurriculum?.outcomes?.[data.subject as string] ?? [];

  return (
    <SubPage>
      <Lead title="Krok 1 " description="Szkic kursu" />
      <div className="grid grid-cols-2 gap-6">
        {/* Lewy panel: parametry */}
        <Card>
          <CardHeader>
            <CardTitle>Parametry kursu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Przedmiot */}
            <Select
              value={data.subject || "Matematyka"}
              onValueChange={(value) =>
                setStepData("step1", { subject: value })
              }
              disabled={data.isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz przedmiot" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Poziom */}
            <Select
              value={data.level || "podstawowy"}
              onValueChange={(value) => setStepData("step1", { level: value })}
              disabled={data.isGenerating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz poziom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="podstawowy">Podstawowy</SelectItem>
                <SelectItem value="rozszerzony">Rozszerzony</SelectItem>
              </SelectContent>
            </Select>

            {/* Nazwa kursu */}
            <Input
              placeholder="Tytuł kursu (opcjonalnie)"
              value={data.title || ""}
              onChange={(e) => setStepData("step1", { title: e.target.value })}
              disabled={data.isGenerating}
            />

            {/* Opcje */}
            <Card className="bg-muted/40 border-dashed">
              <CardContent className="space-y-3 pt-4">
                {(data.title || "").trim() ? (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={Boolean(data.useCustomTitle)}
                      onCheckedChange={(checked) =>
                        setStepData("step1", {
                          useCustomTitle: Boolean(checked),
                        })
                      }
                      disabled={data.isGenerating}
                    />
                    <span className="text-sm">
                      Użyj <strong>mojej nazwy</strong> przy zapisie (zamiast
                      wygenerowanej)
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={data.isMaturaCourse || false}
                    onCheckedChange={(checked) =>
                      setStepData("step1", {
                        isMaturaCourse: Boolean(checked),
                        alignToCurriculum: checked
                          ? data.alignToCurriculum
                          : false,
                      })
                    }
                    disabled={data.isGenerating}
                  />
                  <span className="text-sm">Kurs maturalny</span>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={data.alignToCurriculum || false}
                    onCheckedChange={(checked) =>
                      setStepData("step1", {
                        alignToCurriculum: Boolean(checked),
                      })
                    }
                    disabled={data.isGenerating}
                  />
                  <span className="text-sm">
                    Uwzględnij <strong>najnowszą (2025)</strong> podstawę
                    programową LO (PL)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Podstawa programowa – hint + lista wymagań */}
            {showCurriculumHint && (
              <>
                <Alert>
                  <Info className="h-4 w-4" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <AlertDescription className="text-xs">
                      Dokument: <strong>{latestCurriculum?.label}</strong>
                      {latestCurriculum?.year
                        ? ` • ${latestCurriculum.year}`
                        : ""}
                    </AlertDescription>

                    {outcomesList.length > 0 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs shrink-0"
                        onClick={() => setShowOutcomes((s) => !s)}
                      >
                        {showOutcomes
                          ? "Ukryj wymagania"
                          : `Pokaż wymagania (${outcomesList.length})`}
                      </Button>
                    )}
                  </div>
                </Alert>

                {showOutcomes && (
                  <ul className="text-xs list-disc pl-5 space-y-1 max-h-40 overflow-auto rounded-md border p-2">
                    {outcomesList.map((o, i) => (
                      <li key={i} className="leading-snug">
                        {o}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <Button
              onClick={generate}
              disabled={data.isGenerating}
              className="w-full"
            >
              {data.isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generowanie...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generuj szkic
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Prawy panel: podgląd */}
        <Card>
          <CardHeader>
            <CardTitle>Podgląd szkicu</CardTitle>
          </CardHeader>
          <CardContent>
            {data.isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : data.outline ? (
              <div className="space-y-5">
              
                {/* 2) Porównanie nazw */}
                <NamesCompare
                  custom={formTitle}
                  generated={generatedTitle}
                  activeIsCustom={activeIsCustom}
                />

                {/* 3) Szczegóły – dokładnie 3 badge */}
                <Details
                  subjectActive={data.subject}
                  levelActive={data.level}
                  isMatura={data.isMaturaCourse}
                />

                {/* 4) Tematy */}
                <div className="space-y-2 max-h-96 overflow-auto pr-1">
                  {data.outline.topics?.map((t: any, i: number) => (
                    <Card key={i} className="p-3">
                      <div className="font-medium">
                        {i + 1}. {t.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t.description}
                      </div>
                    </Card>
                  ))}
                </div>

                <Button asChild className="w-full">
                  <Link to="/admin/course-structure/step2">Dalej →</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="font-medium">{previewTitle}</div>
                <div className="text-xs mt-1">Kliknij „Generuj szkic”</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SnapshotBar />
    </SubPage>
  );
}
