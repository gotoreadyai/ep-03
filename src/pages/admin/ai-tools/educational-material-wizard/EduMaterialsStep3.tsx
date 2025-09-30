// src/pages/admin/ai-tools/educational-material-wizard/EduMaterialsStep3.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCreate, useList } from "@refinedev/core";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button, Input, Switch, Alert, AlertDescription } from "@/components/ui";
import { Save, AlertCircle, CheckCircle, ArrowLeft, HelpCircle } from "lucide-react";

type Generated = {
  topic_id: number;
  position: number;
  title: string;
  duration_min?: number;
  content_markdown: string;
};

export function EduMaterialsStep3() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { mutate: createActivity } = useCreate();

  // odbiór z kroku 2
  const initialItem = useMemo<Generated | null>(
    () => location?.state?.item ?? null,
    [location?.state?.item]
  );

  const [title, setTitle] = useState<string>(initialItem?.title ?? "");
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedActivityId, setSavedActivityId] = useState<number | null>(null);

  // Pobierz ostatnią pozycję dla tego tematu
  const { data: activitiesData } = useList({
    resource: "activities",
    filters: initialItem ? [
      { field: "topic_id", operator: "eq", value: initialItem.topic_id }
    ] : [],
    sorters: [{ field: "position", order: "desc" }],
    pagination: { pageSize: 1 },
    queryOptions: { enabled: !!initialItem?.topic_id }
  });

  useEffect(() => {
    if (!initialItem) {
      navigate("/admin/educational-material/step2");
    }
  }, [initialItem, navigate]);

  const handleSave = async () => {
    if (!initialItem) return;
    
    if (!title || title.trim().length < 3) {
      setError("Tytuł musi mieć minimum 3 znaki.");
      return;
    }

    if (!initialItem.content_markdown || initialItem.content_markdown.trim().length < 50) {
      setError("Materiał jest zbyt krótki. Wróć do kroku 2 i wygeneruj ponownie.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const topicId = Number(initialItem.topic_id);
      
      // Oblicz następną pozycję
      const lastActivity = activitiesData?.data?.[0];
      const nextPosition = lastActivity?.position ? Number(lastActivity.position) + 1 : 1;

      // Zapisz aktywność
      const result = await new Promise<number>((resolve, reject) => {
        createActivity(
          {
            resource: "activities",
            values: {
              topic_id: topicId,
              type: "material",
              title: title.trim(),
              content: initialItem.content_markdown,
              duration_min: initialItem.duration_min ?? 20,
              position: nextPosition,
              is_published: isPublished,
            },
          },
          {
            onSuccess: (res: any) => {
              const newId = res?.data?.id;
              if (newId) {
                const numId = typeof newId === 'string' ? parseInt(newId, 10) : newId;
                setSavedActivityId(numId);
                resolve(numId);
              } else {
                reject(new Error("Nie otrzymano ID aktywności"));
              }
            },
            onError: (e: any) => {
              console.error("Błąd zapisu:", e);
              reject(e);
            },
          }
        );
      });

      // Sukces - nie przekierowuj automatycznie
      // setTimeout(() => {
      //   navigate(`/teacher/activities/show/${result}`, { replace: true });
      // }, 1500);
      
    } catch (e: any) {
      console.error("Błąd podczas zapisu:", e);
      
      // Szczegółowa obsługa błędów
      if (e?.code === '23505') {
        setError("Materiał o tym tytule już istnieje w tym temacie. Zmień tytuł.");
      } else if (e?.code === '23503') {
        setError("Nieprawidłowy temat. Odśwież stronę i spróbuj ponownie.");
      } else if (e?.message) {
        setError(e.message);
      } else {
        setError("Nie udało się zapisać materiału. Spróbuj ponownie.");
      }
      setSaving(false);
    }
  };

  if (!initialItem) {
    return (
      <SubPage>
        <Lead title="Krok 3" description="Zapis materiału" />
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Brak danych z poprzedniego kroku. 
                <Link to="/admin/educational-material/step2" className="underline ml-1">
                  Wróć do kroku 2
                </Link>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </SubPage>
    );
  }

  return (
    <SubPage>
      <Lead title="Krok 3" description="Zapis materiału do bazy" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formularz */}
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia zapisu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tytuł materiału <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Wprowadzenie do tematu"
                disabled={saving || savedActivityId !== null}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tytuł będzie widoczny dla uczniów
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="text-sm">
                <div className="font-medium">Opublikuj od razu</div>
                <div className="text-xs text-muted-foreground">
                  Materiał będzie widoczny dla uczniów
                </div>
              </div>
              <Switch 
                checked={isPublished} 
                onCheckedChange={setIsPublished}
                disabled={saving || savedActivityId !== null}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {savedActivityId && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  <span className="font-medium">Materiał zapisany!</span><br />
                  ID: {savedActivityId}<br />
                  <span className="text-xs">Możesz teraz dodać pytania kontrolne lub przejść do podglądu.</span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || savedActivityId !== null || !title.trim()}
                className="flex-1"
              >
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-pulse" />
                    Zapisywanie...
                  </>
                ) : savedActivityId ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Zapisano!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Zapisz materiał
                  </>
                )}
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                disabled={saving}
              >
                <Link to="/admin/educational-material/step2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Wróć
                </Link>
              </Button>
            </div>

            {/* Przyciski po zapisie */}
            {savedActivityId && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium mb-2">Co dalej?</p>
                
                <Button
                  asChild
                  variant="default"
                  className="w-full"
                >
                  <Link to="/admin/educational-material/step4">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Dodaj pytania kontrolne (krok 4)
                  </Link>
                </Button>
                
               
                
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link to="/admin/educational-material/step1">
                    Stwórz kolejny materiał
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Podsumowanie */}
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie materiału</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  ID Tematu
                </div>
                <div className="font-medium">{initialItem.topic_id}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Wygenerowany tytuł
                </div>
                <div className="font-medium">{initialItem.title}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Czas trwania
                </div>
                <div className="font-medium">{initialItem.duration_min ?? 20} minut</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Długość treści
                </div>
                <div className="font-medium">
                  {initialItem.content_markdown.length} znaków
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Pozycja w temacie
                </div>
                <div className="font-medium">
                  {activitiesData?.data?.[0]?.position 
                    ? `${Number(activitiesData.data[0].position) + 1} (po ${activitiesData.data.length} istniejących)`
                    : '1 (pierwszy materiał)'
                  }
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Po zapisie materiał będzie dostępny w module aktywności.
                Możesz go później edytować, dodać pytania kontrolne i przypisać do grup uczniów.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </SubPage>
  );
}