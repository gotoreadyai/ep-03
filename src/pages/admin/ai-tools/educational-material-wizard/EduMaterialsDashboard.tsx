// src/pages/admin/ai-tools/educational-material-wizard/EduMaterialsDashboard.tsx
import { Link } from "react-router-dom";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, Alert, AlertDescription } from "@/components/ui";
import { Wand, Sparkles, ChevronRight, Info, BookOpen, HelpCircle } from "lucide-react";

export function EduMaterialsDashboard() {
  return (
    <SubPage>
      <Lead
        title="Kreator materiałów — panel"
        description="Generuj spójny materiał Markdown dla wybranego tematu kursu"
      />

      <div className="relative overflow-hidden rounded-2xl border mb-6">
        <div className="absolute inset-0 bg-blue-50" />
        <div className="relative px-6 py-8 flex items-center gap-3">
          <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Wand className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold leading-tight">Kreator materiałów</h1>
            <p className="text-sm text-zinc-600">
              Wygeneruj treść lekcji (Markdown) dla jednego, wskazanego tematu — z opisem, przykładami i zadaniami.
            </p>
          </div>
          <div className="hidden md:block">
            <Button asChild>
              <Link to="/admin/educational-material/step1" className="inline-flex items-center gap-2">
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
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside text-sm text-zinc-700 space-y-1">
              <li>Wybierz kurs i temat.</li>
              <li>Ustaw parametry (poziom, styl, długość, zgodność z podstawą).</li>
              <li>Wygeneruj pojedynczy materiał.</li>
              <li>Zapisz jako aktywność typu <code>material</code>.</li>
            </ol>
            <Button asChild className="w-full">
              <Link to="/admin/educational-material/step1" className="inline-flex items-center gap-2">
                Przejdź do kroku 1
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Jakie treści generujemy?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Struktura: krótki wstęp → wyjaśnienia → przykłady → mini-ćwiczenia → podsumowanie.</p>
            <p>Format: czysty Markdown (obsługujesz już w widoku materiału).</p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Jeśli kurs jest maturalny i włączysz zgodność z podstawą LO (2025), kreator
                dopasuje treści do wymagań z pliku <code>curriculum.ts</code>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Nowa karta - dodawanie pytań kontrolnych */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Dodawanie pytań kontrolnych (opcjonalne)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Po wygenerowaniu materiałów możesz przejść do kroku 4, aby dodać pytania kontrolne do każdej sekcji.
                </p>
                <ul className="text-sm text-zinc-700 space-y-1 list-disc list-inside">
                  <li>Przeglądaj wygenerowane materiały według kursów i tematów</li>
                  <li>Generuj pytania kontrolne dla każdej sekcji materiału</li>
                  <li>Pytania są automatycznie formatowane w YAML i wstawiane do treści</li>
                  <li>Uczniowie muszą odpowiedzieć poprawnie, aby odhaczyć sekcję</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to="/admin/educational-material/step4" className="inline-flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Zarządzaj pytaniami
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}