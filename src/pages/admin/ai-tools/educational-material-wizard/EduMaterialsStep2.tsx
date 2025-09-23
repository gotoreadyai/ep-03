// src/pages/admin/ai-tools/educational-material-wizard/EduMaterialsStep2.tsx
import { useEffect, useMemo, useState } from "react";
import { useList, useOne } from "@refinedev/core";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLatestCurriculumForSubject } from "../course-structure-wizard/curriculum";

type Topic = {
  id: number | string;
  position: number | string;
  title: string;
};

type Course = {
  id: number | string;
  title: string;
};

const MATERIAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", required: true },
    duration_min: { type: "number" },
    content_markdown: { type: "string", required: true },
  },
};

type Generated = {
  topic_id: number;
  position: number;
  title: string;
  duration_min?: number;
  content_markdown: string;
};

// Pomocnicze wskazówki dla różnych przedmiotów
const SUBJECT_HINTS: Record<string, string> = {
  Matematyka: "używaj wzorów matematycznych w blokach kodu, pokazuj kroki rozwiązania, dodawaj wykresy ASCII gdzie to możliwe",
  Angielski: "dodaj tabele z odmianą czasowników, przykładowe dialogi, różnice British/American English",
  Informatyka: "używaj bloków kodu z komentarzami, pokazuj input/output, best practices",
  Fizyka: "wyjaśniaj wzory krok po kroku, dodawaj jednostki, pokazuj zastosowania praktyczne",
  Chemia: "równania reakcji w blokach kodu, zasady bezpieczeństwa, przykłady z życia",
  Biologia: "używaj analogii do życia codziennego, pokazuj zależności w ekosystemach",
  Historia: "dodawaj kontekst czasowy, mapy konceptualne wydarzeń, ciekawostki",
  Geografia: "opisuj zjawiska z przykładami regionalnymi, wpływ człowieka na środowisko",
  Polski: "analizuj teksty krok po kroku, środki stylistyczne z przykładami",
};

// Wskazówki dla grup wiekowych
const AGE_GROUP_HINTS: Record<string, string> = {
  podstawowy:
    "uczniowie 12-16 lat - używaj prostych analogii z życia codziennego, gier, social mediów, unikaj abstrakcji",
  rozszerzony:
    "uczniowie 16-19 lat - mogą zrozumieć abstrakcje, zainteresowani praktycznymi zastosowaniami i karierą",
};

export function EduMaterialsStep2() {
  const { getStepData, setStepData } = useStepStore();
  const navigate = useNavigate();

  const step1 = getStepData("em_step1") as {
    courseId?: number;
    topicId?: number;
    subject?: string;
    level?: string;
    isMaturaCourse?: boolean;
    alignToCurriculum?: boolean;
    defaultDuration?: number;
    style?: "notebook" | "exam" | "concise";
    tone?: "neutral" | "friendly" | "formal";
    includeExercises?: boolean;
  };

  const courseId = step1?.courseId;
  const topicId = step1?.topicId;

  const [item, setItem] = useState<Generated | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔽 NOWE: szczegóły błędu + toggle
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);

  useEffect(() => {
    if (!courseId || !topicId) {
      navigate("/admin/educational-material/step1");
    }
  }, [courseId, topicId, navigate]);

  // Temat
  const { data: topicsData } = useList<Topic>({
    resource: "topics",
    filters: [
      { field: "course_id", operator: "eq", value: courseId || -1 },
      { field: "id", operator: "eq", value: topicId || -1 },
    ],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !!courseId && !!topicId },
  });

  const topic = useMemo<Topic | undefined>(() => (topicsData?.data || [])[0], [topicsData?.data]);

  const topicIdNum = useMemo<number | undefined>(() => {
    if (topic?.id == null) return undefined;
    return typeof topic.id === "string" ? Number(topic.id) : topic.id;
  }, [topic?.id]);

  const topicPosNum = useMemo<number>(() => {
    if (topic?.position == null) return 0;
    return typeof topic.position === "string" ? Number(topic.position) : topic.position;
  }, [topic?.position]);

  // Kurs
  const { data: course } = useOne<Course>({
    resource: "courses",
    id: String(courseId || ""),
    meta: { select: "*" },
    queryOptions: { enabled: !!courseId },
  });

  const curriculum =
    step1?.isMaturaCourse && step1?.alignToCurriculum
      ? getLatestCurriculumForSubject(step1?.subject)
      : null;

  const handleGenerate = async () => {
    if (!topic || topicIdNum == null) return;
    setError(null);
    setErrorDetails(null); // reset szczegółów
    setShowErrorDetails(false);
    setGenerating(true);
    setStepData("em_step2", { isGenerating: true });

    const curriculumBlock = curriculum
      ? `
ZGODNOŚĆ Z PODSTAWĄ PROGRAMOWĄ:
- Dokument: ${curriculum.label}${curriculum.year ? ` • ${curriculum.year}` : ""}
- Przedmiot: ${step1.subject}
Oznacz fragmenty zgodne z wymaganiami tagiem [PP].
      `.trim()
      : "";

    const subjectHint = SUBJECT_HINTS[step1.subject || ""] || "";
    const ageHint = AGE_GROUP_HINTS[step1.level || "podstawowy"] || "";

    const prompt = `
Jesteś doświadczonym nauczycielem tworzącym angażujący materiał edukacyjny.

KONTEKST:
- Kurs: ${course?.data?.title || "Kurs"}
- Temat lekcji: ${topic.title} (lekcja ${topicPosNum})
- Przedmiot: ${step1.subject}
- Poziom: ${step1.level} (${ageHint})
- Typ kursu: ${step1.isMaturaCourse ? "maturalny" : "podstawowy"}
- Czas trwania: ${step1.defaultDuration ?? 20} minut

${curriculumBlock}

WYMAGANIA PEDAGOGICZNE:
1. Język: ${step1.level === "podstawowy" ? "prosty, bezpośredni, z analogiami do życia codziennego" : "precyzyjny z terminologią fachową, ale wciąż przystępny"}
2. Ton: ${
      step1.tone === "friendly"
        ? 'przyjazny, bezpośredni (używaj "poznamy", "zobaczysz", "odkryjesz")'
        : step1.tone === "formal"
        ? "profesjonalny ale przystępny"
        : "neutralny, rzeczowy"
    }
3. Przedmiot: ${subjectHint}

STRUKTURA MATERIAŁU (zachowaj dokładnie tę kolejność):

# [Tytuł z elementem przyciągającym uwagę - użyj kreatywnego sformułowania]

[Akapit wprowadzający - 2-3 zdania ${
      step1.tone === "friendly" ? "entuzjastyczne" : "profesjonalne"
    }, 
wyjaśnij dlaczego ten temat jest ważny/ciekawy/przydatny]

## 🎯 Cele lekcji
Po tej lekcji będziesz:
- [Czasownik w formie dokonanej: poznasz/zrozumiesz/nauczysz się - konkretna wiedza]
- [Czasownik w formie dokonanej: potrafisz/zastosujesz - konkretna umiejętność]
- [Czasownik w formie dokonanej: rozróżnisz/przeanalizujesz - konkretne zastosowanie]

## 📚 Kluczowe pojęcia

**[Pojęcie 1]:** [Definicja prostym językiem, max 2 zdania]

**[Pojęcie 2]:** [Definicja z mini-przykładem w nawiasie]

**[Pojęcie 3]:** [Definicja z odniesieniem do życia codziennego]

[Dodaj 3-5 pojęć kluczowych dla tematu]

## 🔍 Szczegółowe omówienie

### [Podtemat 1 - najważniejszy koncept]

[Akapit wyjaśniający z analogią lub metaforą odpowiednią do wieku]

[Jeśli to przedmiot ścisły, dodaj wzór/równanie/kod:]
\`\`\`
[przykład]
\`\`\`

**Kluczowe zasady:**
- [Zasada 1 z krótkim wyjaśnieniem]
- [Zasada 2 z przykładem]
- [Zasada 3 - do zapamiętania]

**Przykład praktyczny:**
[Opisz konkretną sytuację gdzie to się stosuje]

### [Podtemat 2 - rozwinięcie lub drugi aspekt]

[Wyjaśnienie z kontekstem praktycznym]

${
  step1.subject === "Angielski" ||
  step1.subject === "Matematyka" ||
  step1.subject === "Chemia"
    ? `
**Tabela pomocnicza:**
| [Nagłówek 1] | [Nagłówek 2] | [Nagłówek 3] |
|--------------|--------------|--------------|
| [Przykład] | [Przykład] | [Przykład] |
| [Przykład] | [Przykład] | [Przykład] |
| [Przykład] | [Przykład] | [Przykład] |
`
    : ""
}

### [Podtemat 3 - zastosowania lub podsumowanie]

[Połączenie wszystkich elementów w całość]

## 🌟 Przykłady z życia

1. **[Sytuacja codzienna]:** [Opis jak temat występuje w codziennym życiu ucznia]

2. **[Zastosowanie praktyczne]:** [Gdzie spotkamy to w realnym świecie/karierze]

3. **[Ciekawostka]:** [Coś fascynującego co zainteresuje uczniów w tym wieku]

## ⚠️ Częste błędy i pułapki

❌ **Błąd:** [Opis typowego błędu uczniów]
✅ **Poprawnie:** [Jak zrobić to dobrze z wyjaśnieniem dlaczego]

${
  step1.includeExercises
    ? `
## 🏋️ Ćwiczenia do samodzielnej pracy

### 🟢 Rozgrzewka (poziom podstawowy)
1. [Proste ćwiczenie na zrozumienie definicji]
2. [Ćwiczenie na rozpoznawanie]

### 🟡 Trening (poziom średni)  
3. [Zadanie wymagające zastosowania wiedzy]
4. [Zadanie łączące różne elementy tematu]

### 🔴 Wyzwanie (poziom zaawansowany)
5. [Zadanie problemowe lub kreatywne wymagające myślenia]

💡 **Wskazówka do zadania 5:** [Podpowiedź nie zdradzająca rozwiązania]
`
    : ""
}

## 📝 Podsumowanie

### ✅ Najważniejsze do zapamiętania:
- **[Absolutne minimum]** - jeśli zapamiętasz tylko jedną rzecz
- **[Kluczowa zasada/wzór]** - fundament tematu
- **[Praktyczne zastosowanie]** - jak użyć tej wiedzy

### 🎯 Po tej lekcji potrafisz:
- [Konkretna umiejętność 1]
- [Konkretna umiejętność 2]
- [Konkretna umiejętność 3]

${
  step1.isMaturaCourse
    ? `
### 📊 Na maturze:
[Wskazówka jak ten temat pojawia się na egzaminie - typy zadań, na co zwrócić uwagę]
`
    : ""
}

---
*💫 Następny krok: Ten temat jest fundamentem dla [wskaż co będzie dalej]. Jeśli go opanujesz, [zachęta do dalszej nauki].*

DODATKOWE WYTYCZNE:
- Używaj emoji jako ikon sekcji (max 1-2 na sekcję)
- Formatuj kluczowe terminy **pogrubioną czcionką**
- Twórz listy dla przejrzystości
- Dodawaj tabele gdzie zwiększają zrozumienie
- Przykłady kodu/wzorów/równań w blokach \`\`\`
- Proporcje: 40% wyjaśnienia, 40% przykłady, 20% ćwiczenia
- Długość: 800-1200 słów
- Unikaj ściany tekstu - używaj akapitów, list, tabel

Generuj materiał w czystym Markdown. Bądź konkretny, praktyczny i angażujący dla grupy wiekowej ${ageHint}.
    `.trim();

    try {
      const out = await callLLM(prompt, MATERIAL_SCHEMA);
      const generated: Generated = {
        topic_id: topicIdNum,
        position: topicPosNum,
        title: out.title || topic.title,
        duration_min: out.duration_min ?? step1.defaultDuration ?? 20,
        content_markdown: out.content_markdown,
      };
      setItem(generated);
    } catch (e: any) {
      // Lepsza obsługa: komunikat + szczegóły (JSON)
      const msg =
        e?.message?.toString()?.includes("503") || e?.details?.toString()?.includes?.("503")
          ? "Błąd komunikacji z Gemini"
          : e?.message || "Nie udało się wygenerować materiału.";
      setError(msg);

      const details =
        e?.info ??
        e?.response ??
        {
          message: e?.message,
          status: e?.status || e?.statusCode,
          details: e?.details,
          hint: e?.hint,
          raw: e,
        };
      setErrorDetails(details);
    } finally {
      setGenerating(false);
      setStepData("em_step2", { isGenerating: false });
    }
  };

  const goToSave = () => {
    if (!item) return;
    navigate("/admin/educational-material/step3", { state: { item } });
  };

  return (
    <SubPage>
      <Lead title="Krok 2" description="Generowanie materiału edukacyjnego" />

      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Panel generowania
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informacje o kontekście */}
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Kurs:</span>{" "}
                <span className="font-medium">{course?.data?.title || "-"}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Temat:</span>{" "}
                <span className="font-medium">{topic ? `${topicPosNum}. ${topic.title}` : "-"}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{step1.subject}</Badge>
                <Badge variant="outline">{step1.level}</Badge>
                {step1.isMaturaCourse && <Badge variant="default">Maturalny</Badge>}
              </div>
            </div>

            {/* Parametry generowania */}
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Styl:</strong>{" "}
                {step1.style === "notebook" ? "Notatka z lekcji" : step1.style === "exam" ? "Przygotowanie do egzaminu" : "Zwięzły"}
                <br />
                <strong>Ton:</strong>{" "}
                {step1.tone === "friendly" ? "Przyjazny" : step1.tone === "formal" ? "Formalny" : "Neutralny"}
                <br />
                <strong>Ćwiczenia:</strong> {step1.includeExercises ? "Tak (3 poziomy trudności)" : "Nie"}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-2">
              <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generowanie materiału...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Wygeneruj materiał wysokiej jakości
                  </>
                )}
              </Button>

              <Button variant="default" onClick={goToSave} disabled={!item || generating} className="w-full">
                Przejdź do zapisu
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Błąd + szczegóły */}
            {error && (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>

                {/* Hint dla 503 */}
                {(() => {
                  const status =
                    errorDetails?.status ||
                    errorDetails?.statusCode ||
                    (typeof errorDetails === "object" &&
                    "error" in (errorDetails as any) &&
                    (errorDetails as any).error?.includes?.("503")
                      ? 503
                      : undefined);
                  if (status === 503) {
                    return (
                      <div className="text-xs text-muted-foreground">
                        <strong>Wskazówka:</strong> Model jest przeciążony (HTTP 503). Spróbuj ponownie za chwilę lub zmień model/zmniejsz
                        objętość kontekstu.
                      </div>
                    );
                  }
                  return null;
                })()}

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
                <p>Tworzę angażujący materiał...</p>
                <p className="text-xs">To może potrwać 20-30 sekund</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Podgląd materiału */}
        <Card>
          <CardHeader>
            <CardTitle>Podgląd materiału</CardTitle>
          </CardHeader>
          <CardContent>
            {!item ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                {generating ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-3 animate-spin" />
                    <div className="text-sm">Generowanie struktury...</div>
                    <div className="text-xs mt-2">Dodawanie przykładów...</div>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-8 h-8 mb-3 opacity-50" />
                    <div className="text-sm">Brak wygenerowanego materiału</div>
                    <div className="text-xs mt-1">Kliknij "Wygeneruj materiał"</div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Card className="mb-3 bg-muted">
                  <CardContent className="pt-6">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-2">
                      <span>⏱️ {item.duration_min ?? 20} min</span>
                      <span>📝 {item.content_markdown.length} znaków</span>
                    </div>
                  </CardContent>
                </Card>
                <ScrollArea className="h-[500px] rounded-lg border p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content_markdown}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}
