import { Link } from "react-router-dom";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button, Alert, AlertDescription } from "@/components/ui";
import { Brain, Sparkles, ChevronRight, HelpCircle, Info } from "lucide-react";

export function QuizWizardDashboard() {
  return (
    <SubPage>
      <Lead
        title="Kreator quizów — panel"
        description="Wygeneruj pytania na podstawie istniejących materiałów edukacyjnych"
      />

      <div className="relative overflow-hidden rounded-2xl border mb-6">
        <div className="absolute inset-0 bg-cyan-50" />
        <div className="relative px-6 py-8 flex items-center gap-3">
          <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Brain className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold leading-tight">Kreator quizów</h1>
            <p className="text-sm text-zinc-600">
              Wybierz kurs, temat i materiał, a potem wygeneruj zestaw pytań wielokrotnego wyboru z poprawnymi odpowiedziami i wyjaśnieniami.
            </p>
          </div>
          <div className="hidden md:block">
            <Button asChild>
              <Link to="/admin/quiz-wizard/step1" className="inline-flex items-center gap-2">
                Nowa sesja
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Szybki start
            </CardTitle>
            <CardDescription>3 kroki do gotowego quizu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ol className="list-decimal list-inside space-y-1 text-zinc-700">
              <li>Wybierz kurs → temat → materiał (Markdown).</li>
              <li>Ustaw parametry (liczba pytań, poziom trudności, wyjaśnienia).</li>
              <li>Wygeneruj pytania i zapisz quiz do bazy (Supabase) jako aktywność typu <code>quiz</code>.</li>
            </ol>
            <Button asChild className="w-full">
              <Link to="/admin/quiz-wizard/step1" className="inline-flex items-center gap-2">
                Przejdź do kroku 1
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Jak generujemy pytania?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Model analizuje treść materiału i tworzy pytania sprawdzające zrozumienie kluczowych koncepcji.</p>
            <p>Format generatu: JSON → zapis w treści aktywności jako YAML (lista pytań).</p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Quiz jest tworzony w tym samym temacie co materiał. Możesz go później przypisać do grup uczniów.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}