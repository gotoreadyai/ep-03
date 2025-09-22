/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/teacher/ai-tools/course-structure-wizard/CourseWizardStep3.tsx
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useCreate, useGetIdentity, BaseKey } from "@refinedev/core";
import { useStepStore } from "@/utility/formWizard";
import { Save, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardContent, Alert, AlertDescription, Progress, ScrollArea } from '@/components/ui';

export function CourseWizardStep3() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { data: identity } = useGetIdentity<any>();
  const { steps, clearAll } = useStepStore();

  const refined = useMemo(
    () => location?.state?.refined ?? steps?.step2?.refined,
    [location?.state, steps]
  );

  const outline = useMemo(
    () => location?.state?.outline ?? steps?.step1?.outline,
    [location?.state, steps]
  );

  const [saving, setSaving] = useState(false);
  const [savedCourseId, setSavedCourseId] = useState<BaseKey | null>(null);
  const [savedTopics, setSavedTopics] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createCourse } = useCreate();
  const { mutate: createTopic } = useCreate();

  const handleSave = async () => {
    if (!refined) {
      setError("Brak danych kursu (refined). Wróć do kroku 2.");
      return;
    }
    setError(null);
    setSaving(true);
    setSavedTopics(0);

    try {
      const courseId = await new Promise<BaseKey>((resolve, reject) => {
        createCourse(
          {
            resource: "courses",
            values: {
              title: refined.courseTitle,
              description: refined.courseDescription || "",
              vendor_id: identity?.vendor_id ?? 0,
              is_published: false,
              icon_emoji: outline?.icon_emoji || "📚",
            },
          },
          {
            onSuccess: (res) => {
              const id = res?.data?.id;
              if (id === undefined || id === null) return reject(new Error("Brak ID kursu"));
              resolve(id);
            },
            onError: (e) => reject(e),
          }
        );
      });

      setSavedCourseId(courseId);
      const courseIdNumber = typeof courseId === "string" ? parseInt(courseId, 10) : courseId;

      const total = refined.topics?.length || 0;
      for (let i = 0; i < total; i++) {
        const t = refined.topics[i];
        await new Promise<void>((resolve) => {
          createTopic(
            {
              resource: "topics",
              values: {
                course_id: courseIdNumber,
                title: t.title,
                description: t.description,
                position: t.position || i + 1,
                is_published: t.is_published || false,
              },
            },
            {
              onSuccess: () => {
                setSavedTopics((prev) => prev + 1);
                resolve();
              },
              onError: () => {
                console.error(`Błąd zapisu tematu ${i + 1}/${total}`);
                resolve();
              },
            }
          );
        });
      }

      clearAll();
      navigate("/teacher/ai-tools", { replace: true });
    } catch (e: any) {
      console.error("Błąd zapisu:", e);
      setError(e?.message || "Nie udało się zapisać kursu.");
    } finally {
      setSaving(false);
    }
  };

  if (!refined) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Brak danych do zapisu</span><br />
                Wróć do kroku 2 i wygeneruj tematy kursu.
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link to="/teacher/course-structure/step2">
                <ArrowLeft className="w-4 h-4" />
                Wróć do kroku 2
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = refined.topics?.length > 0 ? (savedTopics / refined.topics.length) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex items-center gap-2 mb-6">
        <Save className="w-5 h-5" />
        <h1 className="text-xl font-semibold">Krok 3 — Zapis kursu</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{refined.courseTitle}</h3>
              {refined.courseDescription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {refined.courseDescription}
                </p>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {refined.subject} • {String(refined.level)} 
                {refined.isMaturaCourse ? " • Maturalny" : ""}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">
                Tematy ({refined.topics.length}):
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-1 text-sm">
                  {refined.topics.slice(0, 12).map((t: any, i: number) => (
                    <div key={i} className="border-l-2 border-muted pl-2">
                      <span className="text-muted-foreground">{t.position || i + 1}.</span> {t.title}
                    </div>
                  ))}
                  {refined.topics.length > 12 && (
                    <div className="text-xs text-muted-foreground italic">
                      ... i {refined.topics.length - 12} więcej
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Zapisywanie..." : "Zapisz kurs i tematy"}
              </Button>
              <Button asChild variant="outline">
                <Link to="/teacher/course-structure/step2">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status zapisu</CardTitle>
          </CardHeader>
          <CardContent>
            {!saving && !savedCourseId ? (
              <p className="text-sm text-muted-foreground">
                Kliknij „Zapisz kurs i tematy", aby utworzyć kurs i {refined.topics.length} tematów.
              </p>
            ) : saving ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Zapisywanie tematów: {savedTopics} / {refined.topics.length}
                </div>
                <Progress value={progressPercentage} className="w-full" />
              </div>
            ) : savedCourseId ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Zapisano pomyślnie!</span><br />
                  ID kursu: {String(savedCourseId)}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}