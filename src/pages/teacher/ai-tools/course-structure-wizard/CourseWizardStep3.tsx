// src/pages/teacher/ai-tools/course-structure-wizard/CourseWizardStep3.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCreate, useGetIdentity, BaseKey } from "@refinedev/core";
import { Save, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";

export function CourseWizardStep3() {
  const location = useLocation() as any;
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<any>();
  
  const refined = location?.state?.refined;
  const outline = location?.state?.outline;

  // Poprawka 1: BaseKey może być string | number
  const [savedCourseId, setSavedCourseId] = useState<BaseKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveProgress, setSaveProgress] = useState<string>("");
  const [savedTopics, setSavedTopics] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const { mutate: createCourse } = useCreate();
  const { mutate: createTopic } = useCreate();

  const handleSave = async () => {
    if (!refined) {
      setError("Brak danych do zapisu");
      return;
    }

    setSaving(true);
    setError(null);
    setSavedTopics(0);
    
    try {
      // Krok 1: Utwórz kurs
      setSaveProgress("Tworzenie kursu...");
      
      const courseData = {
        title: refined.courseTitle,
        description: refined.courseDescription || "",
        vendor_id: identity?.vendor_id || 0,
        is_published: false,
        icon_emoji: outline?.icon_emoji || "📚",
      };

      createCourse(
        {
          resource: "courses",
          values: courseData,
        },
        {
          onSuccess: async (data) => {
            const courseId = data?.data?.id;
            if (!courseId) {
              throw new Error("Nie udało się utworzyć kursu");
            }
            
            setSavedCourseId(courseId);
            
            // Konwersja courseId do number jeśli potrzebna
            const courseIdNumber = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
            
            // Krok 2: Dodaj tematy sekwencyjnie
            let successCount = 0;
            const totalTopics = refined.topics.length;
            
            for (let i = 0; i < refined.topics.length; i++) {
              const topic = refined.topics[i];
              setSaveProgress(`Dodawanie tematu ${i + 1} z ${totalTopics}...`);
              
              try {
                await new Promise((resolve, reject) => {
                  createTopic(
                    {
                      resource: "topics",
                      values: {
                        course_id: courseIdNumber,
                        title: topic.title,
                        description: topic.description,
                        position: topic.position || i + 1,
                        is_published: topic.is_published || false,
                      },
                    },
                    {
                      onSuccess: () => {
                        successCount++;
                        setSavedTopics(successCount);
                        resolve(true);
                      },
                      onError: (error) => {
                        console.error(`Błąd przy temacie ${i + 1}:`, error);
                        reject(error);
                      },
                    }
                  );
                });
              } catch (topicError) {
                console.error(`Nie udało się dodać tematu ${i + 1}`, topicError);
                // Kontynuuj mimo błędu pojedynczego tematu
              }
            }
            
            setSaveProgress(`✓ Zapisano kurs z ${successCount} tematami`);
            setSaving(false);
            
            // Poczekaj 2 sekundy i przekieruj do AiToolsDashboard
            setTimeout(() => {
              navigate("/teacher/ai-tools");
            }, 2000);
          },
          onError: (error) => {
            console.error("Błąd tworzenia kursu:", error);
            setError("Nie udało się utworzyć kursu");
            setSaving(false);
          },
        }
      );
    } catch (err) {
      setError("Wystąpił błąd podczas zapisu");
      setSaving(false);
    }
  };

  if (!refined) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">Brak danych do zapisu</p>
          </div>
          <p className="text-sm text-zinc-600 mb-4">
            Wróć do kroku 2 i wygeneruj tematy przed próbą zapisu.
          </p>
          <Link
            to="/teacher/course-structure/step2"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do kroku 2
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex items-center gap-3 mb-6">
        <Save className="w-6 h-6" />
        <h1 className="text-2xl font-semibold">Krok 3 — Zapisz kurs i tematy</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PODSUMOWANIE */}
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-3">Podsumowanie kursu</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-lg mb-2">{refined.courseTitle}</h3>
              {refined.courseDescription && (
                <p className="text-sm text-zinc-600 mb-3">{refined.courseDescription}</p>
              )}
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500">Przedmiot:</span>{" "}
                  <span className="font-medium">{refined.subject}</span>
                </div>
                <div>
                  <span className="text-gray-500">Poziom:</span>{" "}
                  <span className="font-medium">{String(refined.level)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Kurs maturalny:</span>{" "}
                  <span className="font-medium">{refined.isMaturaCourse ? "Tak" : "Nie"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Liczba tematów:</span>{" "}
                  <span className="font-medium">{refined.topics.length}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Tematy do zapisania:</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {/* Poprawka 2: Dodanie typów do map */}
                {refined.topics.slice(0, 10).map((topic: any, i: number) => (
                  <div key={i} className="text-sm border-l-2 border-gray-200 pl-3">
                    <span className="text-gray-500">{topic.position || i + 1}.</span>{" "}
                    {topic.title}
                  </div>
                ))}
                {refined.topics.length > 10 && (
                  <div className="text-sm text-gray-500 italic">
                    ... i {refined.topics.length - 10} więcej
                  </div>
                )}
              </div>
            </div>

            {!saving && !savedCourseId && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800"
                >
                  <Save className="w-4 h-4" />
                  Zapisz kurs i tematy
                </button>
                <Link
                  to="/teacher/course-structure/step2"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Wstecz
                </Link>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* STATUS ZAPISU */}
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
          <h2 className="font-medium mb-3">Status zapisu</h2>
          
          {!saving && !savedCourseId && (
            <div className="text-sm text-zinc-600">
              <p>Kliknij "Zapisz kurs i tematy" aby utworzyć:</p>
              <ul className="mt-2 space-y-1">
                <li>• 1 nowy kurs</li>
                <li>• {refined.topics.length} tematów</li>
              </ul>
              <p className="mt-3 text-xs">
                Po zapisie zostaniesz przekierowany do panelu narzędzi AI.
              </p>
            </div>
          )}

          {saving && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{saveProgress}</span>
              </div>
              
              {savedTopics > 0 && (
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="text-sm">
                    Zapisano tematów: {savedTopics} / {refined.topics.length}
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(savedTopics / refined.topics.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {savedCourseId && !saving && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium text-emerald-900">Zapisano pomyślnie!</span>
                </div>
                <div className="text-sm text-emerald-700">
                  <p>Utworzono kurs ID: {savedCourseId}</p>
                  <p>Dodano {savedTopics} tematów</p>
                </div>
              </div>
              
              <p className="text-sm text-zinc-600">
                Za chwilę nastąpi przekierowanie do panelu narzędzi AI...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}