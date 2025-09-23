// src/pages/admin/ai-tools/course-structure-wizard/CourseWizardStep2.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { callLLM } from '@/utility/llmService';
import { SnapshotBar, useStepStore } from '@/utility/formWizard';
import { Loader2, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { Input, Button, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription, ScrollArea } from '@/components/ui';

const SCHEMA = {
  type: 'object',
  properties: {
    courseTitle: { type: 'string', required: true },
    courseDescription: { type: 'string' },
    subject: { type: 'string', required: true },
    level: { type: 'string', required: true },
    isMaturaCourse: { type: 'boolean', required: true },
    topics: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', required: true },
          description: { type: 'string', required: true },
          position: { type: 'number', required: true },
          is_published: { type: 'boolean', required: true }
        }
      }
    }
  }
};

export function CourseWizardStep2() {
  const { registerStep, setStepData, getStepData } = useStepStore();
  const navigate = useNavigate();
  const step1 = getStepData('step1') || {};
  const data = getStepData('step2') || {};

  useEffect(() => {
    registerStep('step2', SCHEMA);
    if (!data.targetCount) {
      setStepData('step2', { targetCount: 15 });
    }
    // domyślne źródło tytułu: z preferencji z kroku 1
    if (!data.titleSource) {
      const defaultSource = step1.useCustomTitle && step1.title?.trim() ? 'custom' : 'generated';
      setStepData('step2', { titleSource: defaultSource });
    }
    if (!step1.outline) {
      navigate('/admin/course-structure/step1');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    if (!step1.outline) {
      setStepData('step2', { error: 'Brak danych z kroku 1' });
      return;
    }

    setStepData('step2', { isGenerating: true, error: null });

    const prompt = `
Rozwiń szkic kursu do dokładnie ${data.targetCount} tematów lekcji, logicznie uporządkowanych od podstaw do bardziej zaawansowanych.
Wygeneruj tytuły i krótkie opisy (2–3 zdania) z perspektywy nauczyciela przygotowującego plan pracy.
Kontekst:
- tytuł szkicu: ${step1.outline.title}
- przedmiot: ${step1.outline.subject}
- poziom: ${step1.outline.level}
- kurs ${step1.outline.isMaturaCourse ? 'maturalny' : 'niematuralny'}
- główne tematy szkicu: ${step1.outline.topics?.map((t: any) => t.title).join(', ')}

Zachowaj spójność terminologii i adekwatność do poziomu. Jeśli kurs maturalny — uwzględnij wymagania egzaminacyjne w zakresie doboru tematów.
    `.trim();

    try {
      const result = await callLLM(prompt, SCHEMA);

      // Tytuł wygenerowany przez LLM (fallback na szkic z kroku 1)
      const generatedTitle = result.courseTitle || result.title || step1.outline.title;

      // Aktualna preferencja użytkownika (krok 2), fallback – preferencja z kroku 1
      const titleSource = data.titleSource || (step1.useCustomTitle && step1.title?.trim() ? 'custom' : 'generated');

      // Ostateczny tytuł do zapisu
      const finalTitle =
        titleSource === 'custom' && step1.title?.trim()
          ? step1.title.trim()
          : generatedTitle;

      const refined = {
        ...result,
        courseTitle: finalTitle,
        subject: result.subject || step1.outline.subject,
        level: result.level || step1.outline.level,
        isMaturaCourse: result.isMaturaCourse ?? step1.outline.isMaturaCourse,
        topics: (result.topics || []).map((t: any, i: number) => ({
          ...t,
          position: Number(t.position || i + 1),
          is_published: false
        }))
      };

      setStepData('step2', {
        refined,
        isGenerating: false,
        error: null,
        generatedTitle, // zapisujemy do podglądu/przełącznika
      });
    } catch (e) {
      console.error('Błąd generowania:', e);
      setStepData('step2', {
        isGenerating: false,
        error: 'Nie udało się wygenerować tematów. Spróbuj ponownie.'
      });
    }
  };

  const handleSave = () => {
    navigate('/admin/course-structure/step3', {
      state: {
        refined: data.refined,
        outline: step1.outline
      }
    });
  };

  const currentSelectedTitle =
    (data.titleSource === 'custom' && step1.title?.trim())
      ? step1.title.trim()
      : (data.generatedTitle || step1.outline?.title);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Krok 2 — Szczegółowe tematy lekcji</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Konfiguracja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step1.outline && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Rozwijamy kurs:</strong> {step1.outline.title}<br />
                  <span className="text-muted-foreground">
                    {step1.outline.subject} • {step1.outline.level}
                    {step1.outline.isMaturaCourse && ' • Maturalny'}
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {/* NOWE: wybór źródła tytułu kursu */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Źródło tytułu kursu</label>
              {step1.title?.trim() ? (
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={data.titleSource === 'custom' ? 'default' : 'outline'}
                      onClick={() => setStepData('step2', { titleSource: 'custom' })}
                      className="flex-1"
                    >
                      Moja nazwa
                    </Button>
                    <Button
                      type="button"
                      variant={data.titleSource === 'generated' ? 'default' : 'outline'}
                      onClick={() => setStepData('step2', { titleSource: 'generated' })}
                      className="flex-1"
                    >
                      Wygenerowana
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Moja: <strong>{step1.title.trim()}</strong><br />
                    • Wygenerowana: <strong>{data.generatedTitle || step1.outline?.title}</strong>
                  </div>
                  <div className="text-xs">
                    Zostanie zapisane: <strong>{currentSelectedTitle}</strong>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Brak własnej nazwy z kroku 1 — zostanie użyta wygenerowana.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Liczba tematów lekcji
              </label>
              <Input
                type="number"
                min="5"
                max="50"
                value={data.targetCount || 15}
                onChange={e => setStepData('step2', { targetCount: Number(e.target.value) })}
                disabled={data.isGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Zalecane: 10-20 dla kursu podstawowego, 20-30 dla rozszerzonego
              </p>
            </div>

            {data.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{data.error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={generate}
              disabled={data.isGenerating || !step1.outline}
              className="w-full"
            >
              {data.isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generowanie tematów...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generuj {data.targetCount} tematów
                </>
              )}
            </Button>

            {data.refined && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium mb-2">Wygenerowano:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• {data.refined.topics?.length || 0} tematów</div>
                    <div>• {data.refined.courseDescription ? '✓' : '✗'} Opis kursu</div>
                    <div>• Poziom: {data.refined.level}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Podgląd tematów</CardTitle>
          </CardHeader>
          <CardContent>
            {data.isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Generowanie {data.targetCount} tematów...</p>
                <p className="text-xs mt-1">To może potrwać do 30 sekund</p>
              </div>
            ) : data.refined ? (
              <>
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <h3 className="font-bold">{data.refined.courseTitle}</h3>
                    {data.refined.courseDescription && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {data.refined.courseDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <ScrollArea className="h-[400px] mb-4">
                  <div className="space-y-2">
                    {data.refined.topics?.map((t: any) => (
                      <Card key={t.position} className="p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground text-sm">{t.position}.</span>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{t.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">{t.description}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <Button onClick={handleSave} className="w-full" variant="default">
                  <span>Przejdź do zapisu</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Tematy pojawią się tutaj po wygenerowaniu</p>
                <p className="text-xs mt-2">Wybierz liczbę tematów i kliknij "Generuj"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SnapshotBar />
    </div>
  );
}