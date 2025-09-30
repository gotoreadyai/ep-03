// src/pages/admin/ai-tools/course-structure-wizard/CourseWizardDashboard.tsx
import { Link, useNavigate } from "react-router-dom";
import { Wand, ChevronRight, Sparkles, Info, History, BookOpen } from "lucide-react";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { useStepStore } from "@/utility/formWizard";
import { Button, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription } from "@/components/ui";

export function CourseWizardDashboard() {
  const navigate = useNavigate();
  const { steps, clearAll } = useStepStore();

  const hasStep1 = Boolean(steps?.step1);
  const hasOutline = Boolean(steps?.step1?.outline);
  const hasStep2 = Boolean(steps?.step2);
  const refined = steps?.step2?.refined;

  const handleResume = () => {
    if (hasStep2 && refined) {
      navigate("/admin/course-structure/step2");
    } else if (hasStep1) {
      navigate("/admin/course-structure/step1");
    } else {
      navigate("/admin/course-structure/step1");
    }
  };

  // NOWE: pełne czyszczenie stanu przed startem nowego kursu
  const handleStartNew = () => {
    clearAll();
    navigate("/admin/course-structure/step1", { replace: true });
  };

  return (
    <SubPage>
      <div className="relative overflow-hidden rounded-2xl border mb-6">
        <div className="absolute inset-0 bg-purple-50" />
        <div className="relative px-6 py-8 flex items-center gap-3">
          <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Wand className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold leading-tight">Generator kursów — panel</h1>
            <p className="text-sm text-zinc-600">
              W 2 krokach wygenerujesz szkic kursu i rozpiszesz tematy lekcji z pomocą LLM.
            </p>
          </div>
          <div className="hidden md:block">
            {/* zamiast Link -> przycisk wywołujący clear + navigate */}
            <Button onClick={handleStartNew} className="inline-flex items-center gap-2">
              Nowy kurs
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start / Resume */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Szybki start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border p-4">
              <ol className="list-decimal list-inside text-sm text-zinc-700 space-y-1">
                <li>Krok 1 — podstawy kursu (temat, grupa docelowa, poziom).</li>
                <li>Krok 2 — doprecyzowanie listy modułów i lekcji.</li>
              </ol>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
  {/* Rozpocznij — czyści stan i przechodzi do Kroku 1 */}
  <Button onClick={handleStartNew} className="flex-1 inline-flex items-center gap-2">
    Rozpocznij
    <ChevronRight className="w-4 h-4" />
  </Button>

  {/* 🔽 Usunięty guzik „Wznów pracę” */}

  {/* Podsumowanie */}
  <Button asChild variant="secondary" className="flex-1">
    <Link to="/admin/course-structure/step4" className="inline-flex items-center gap-2">
      Edytuj istniejące kursy
      <ChevronRight className="w-4 h-4" />
    </Link>
  </Button>
</div>
            </div>

            {(hasStep1 || hasStep2) ? (
              <Card className="bg-muted/40">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Ostatnia sesja
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {refined ? (
                      <>
                        <div className="font-medium text-foreground">{refined.courseTitle}</div>
                        <div className="text-xs">
                          {refined.subject} • {String(refined.level)}
                          {refined.isMaturaCourse ? " • Maturalny" : ""}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" onClick={() => navigate("/admin/course-structure/step2")}>
                            Kontynuuj w kroku 2
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => navigate("/admin/course-structure/step1")}>
                            Podgląd kroku 1
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => clearAll()}
                            className="text-red-600 hover:text-red-700"
                          >
                            Wyczyść sesję
                          </Button>
                        </div>
                      </>
                    ) : hasOutline ? (
                      <>
                        <div className="font-medium text-foreground">
                          {(steps?.step1?.outline?.title as string) || "Szkic kursu"}
                        </div>
                        <div className="text-xs">
                          {(steps?.step1?.outline?.subject as string) || steps?.step1?.subject} •{" "}
                          {(steps?.step1?.outline?.level as string) || steps?.step1?.level}
                        </div>
                        <div className="mt-3">
                          <Button size="sm" onClick={() => navigate("/admin/course-structure/step2")}>
                            Przejdź do kroku 2
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm">Brak zapisanych szkiców do wznowienia.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </CardContent>
        </Card>

        {/* How it works / help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Jak to działa?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Kreator może uwzględnić najnowszą (2025) podstawę programową LO (PL) dla kursów maturalnych.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <span className="font-medium text-foreground">Krok 1:</span> podaj parametry kursu,
                wybierz poziom i (opcjonalnie) zgodność z podstawą.
              </p>
              <p>
                <span className="font-medium text-foreground">Krok 2:</span> wygeneruj listę lekcji
                (z opisami), zweryfikuj i zapisz.
              </p>
            </div>

            <div className="pt-2">
              {/* również czyści przed wejściem */}
              <Button onClick={handleStartNew} variant="outline" className="w-full inline-flex items-center justify-center gap-2">
                Przejdź do kroku 1
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}
