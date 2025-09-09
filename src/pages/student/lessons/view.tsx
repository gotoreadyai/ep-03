/* path: src/pages/student/lessons/view.tsx */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { ArrowLeft, Clock, Lock, Check, Circle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { supabaseClient } from "@/utility";
import { invalidateRPCCache } from "@/pages/student/hooks/useRPC";
import { useStudentStats } from "@/pages/student/hooks";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { QuizDef, Section } from "./components/types";
import { extractQuizzes, splitSections } from "./components/lessonContent";
import { useLocalJson } from "./components/useLocalJson";
import { useLiveRegion } from "./components/useLiveRegion";
import { LessonSkeleton } from "./components/LessonSkeleton";
import { MDRenderers } from "./components/MDRenderers";
import { QuizModal } from "./components/QuizModal";
import { LessonSummary } from "./components/LessonSummary";

export const LessonView: React.FC = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { refetch: refetchStats } = useStudentStats();

  const { data: lessonData, isLoading } = useOne({
    resource: "activities",
    id: lessonId!,
    meta: { select: "*, topics(title, course_id, courses(title, icon_emoji))" },
  });

  const lesson = (lessonData?.data ?? {}) as any;
  const md: string | undefined = (lesson?.content_md ?? lesson?.markdown ?? lesson?.content) as string | undefined;

  const sections = React.useMemo<Section[]>(
    () => (md ? splitSections(md, lesson?.title ?? "Sekcja") : []),
    [md, lesson?.title]
  );
  const quizzes = React.useMemo(() => extractQuizzes(sections), [sections]);

  const progressKey = `lesson-progress:${lessonId}`;
  const quizKey = `lesson-quiz:${lessonId}`;

  const [sectionDone, setSectionDone] = useLocalJson<Record<string, boolean>>(
    progressKey,
    Object.fromEntries(sections.map((s) => [s.id, false]))
  );
  const [quizResults, setQuizResults] = useLocalJson<Record<string, boolean>>(quizKey, {});
  const [activeQuiz, setActiveQuiz] = React.useState<QuizDef | null>(null);
  const [showSummary, setShowSummary] = React.useState(false);
  const [startTime] = React.useState(Date.now());

  // sync keys po zmianie sekcji
  React.useEffect(() => {
    if (!sections.length) return;
    setSectionDone((prev) => {
      const next: Record<string, boolean> = {};
      sections.forEach((s) => (next[s.id] = prev[s.id] ?? false));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.id).join("|")]);

  const { ref: liveRef, say } = useLiveRegion();

  const firstUnreadIdx = sections.findIndex((s) => !sectionDone[s.id]);
  const allChecked = firstUnreadIdx === -1;

  const openQuizForSection = (sid: string) => {
    const [first] = quizzes.get(sid) ?? [];
    if (first) setActiveQuiz(first);
  };

  const handleCheckboxClick = (idx: number) => {
    const s = sections[idx];
    if (!s) return;

    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
    if (!unlocked && !sectionDone[s.id]) return;

    if (sectionDone[s.id]) {
      setSectionDone((p) => ({ ...p, [s.id]: false }));
      say(`Sekcja ${idx + 1} cofnięta.`);
      return;
    }

    const hasQuiz = (quizzes.get(s.id) ?? []).length > 0;
    if (!hasQuiz) {
      setSectionDone((p) => ({ ...p, [s.id]: true }));
      say(`Sekcja ${idx + 1} odhaczona.`);
    } else openQuizForSection(s.id);
  };

  const handlePassActiveQuiz = () => {
    const q = activeQuiz;
    setActiveQuiz(null);
    if (!q) return;
    setQuizResults((p) => ({ ...p, [q.key]: true }));
    const sectionId = q.key.split(":")[0];
    setSectionDone((p) => ({ ...p, [sectionId]: true }));
    const idx = sections.findIndex((s) => s.id === sectionId);
    say(`Sekcja ${idx + 1} odhaczona po pytaniu kontrolnym.`);
  };

  const completeLesson = async () => {
    if (!allChecked) return toast.info("Najpierw odhacz wszystkie sekcje po kolei.");
    
    console.log('Starting lesson completion...');
    
    try {
      // Start activity
      const { error: startError } = await supabaseClient.rpc("start_activity", { 
        p_activity_id: parseInt(lessonId!) 
      });
      
      if (startError) {
        console.error('Error starting activity:', startError);
        throw startError;
      }
      
      console.log('Activity started, completing material...');
      
      // Complete material
      const { data: result, error } = await supabaseClient.rpc("complete_material", { 
        p_activity_id: parseInt(lessonId!) 
      });
      
      console.log('Complete material result:', result, 'Error:', error);
      
      if (error) throw error;
      
      if (result) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        
        console.log('Material completed successfully');
        
        // Pokaż podsumowanie
        setShowSummary(true);
        
        // Wyczyść local storage
        try {
          localStorage.removeItem(progressKey);
          localStorage.removeItem(quizKey);
        } catch (err) {
          console.error("Błąd zapisu do localStorage:", err);
        }
        
        // Invaliduj cache
        invalidateRPCCache("get_course_structure");
        invalidateRPCCache("get_my_courses");
        
        // Wymuś odświeżenie statystyk - teraz używamy kontekstu
        setTimeout(() => {
          console.log('Forcing stats refresh...');
          refetchStats();
        }, 500);
        
        // Ręcznie sprawdź punkty po chwili
        setTimeout(async () => {
          console.log('Manually checking updated stats...');
          const { data: newStats, error: statsError } = await supabaseClient.rpc('get_my_stats');
          console.log('New stats after completion:', newStats, 'Error:', statsError);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast.error("Nie udało się ukończyć lekcji");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-10 pb-28 lg:pb-16">
      <div ref={liveRef} aria-live="polite" className="sr-only" />

      {/* BACK */}
      <button
        onClick={() => navigate(`/student/courses/${courseId}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Powrót do kursu</span>
      </button>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl border bg-white dark:bg-card">
        <div className="relative z-10 p-5 sm:p-7 md:p-10">
          <div className="flex items-start gap-3">
            <div className="text-4xl md:text-5xl leading-none">{lesson?.topics?.courses?.icon_emoji || "📚"}</div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                <span className="truncate">{lesson?.topics?.courses?.title || "…"}</span>
                <span>•</span>
                <span className="truncate">{lesson?.topics?.title || "…"}</span>
              </div>
              <h1 className="mt-1 text-xl md:text-3xl font-bold tracking-tight">{lesson?.title || "Ładowanie…"}</h1>
              {lesson?.duration_min && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border bg-white/70 dark:bg-background/60 px-3 py-1.5 shadow-soft">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{lesson?.duration_min} min czytania</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
        {/* CONTENT */}
        <main>
          {isLoading ? (
            <LessonSkeleton />
          ) : (
            <section>
              <div className="prose prose-neutral dark:prose-invert max-w-[72ch] mx-auto prose-headings:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:leading-relaxed prose-headings:tracking-tight prose-img:rounded-xl prose-blockquote:rounded-xl md:prose-lg">
                {sections.length ? (
                  sections.map((s, idx) => {
                    const done = !!sectionDone[s.id];
                    const isCurrent = !done && idx === firstUnreadIdx;
                    const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                    const isLocked = !unlocked && !done;
                    const q = (quizzes.get(s.id) ?? [])[0];

                    const cardBase =
                      "rounded-[20px] border p-6 sm:p-7 md:p-8 shadow-sm transition-colors duration-200";
                    const cardState = done
                      ? "bg-emerald-50 dark:bg-emerald-950/25 border-emerald-300"
                      : isCurrent
                      ? "bg-white dark:bg-background border-neutral-200 shadow-md"
                      : isLocked
                      ? "bg-white dark:bg-card border-dashed border-muted-foreground/40"
                      : "bg-white dark:bg-card border-neutral-200";

                    const contentVisualState = !done && isLocked
                      ? "filter blur-[2px] select-none pointer-events-none"
                      : "";

                    return (
                      <div key={s.id} id={s.id} className="mb-12 scroll-mt-28">
                        <div className={`${cardBase} ${cardState}`}>
                          {/* BADGE nad tytułem */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {isLocked && (
                              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground bg-white">
                                <Lock className="h-3.5 w-3.5" />
                                Zablokowana
                              </span>
                            )}
                            {done && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50/60 px-2.5 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                                <Check className="h-3.5 w-3.5" />
                                Ukończona
                              </span>
                            )}
                            {isCurrent && !done && (
                              <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-0.5 text-[11px]">
                                <Circle className="h-3.5 w-3.5" />
                                W trakcie
                              </span>
                            )}
                            {q && (
                              <button
                                type="button"
                                onClick={() => !done && !isLocked && openQuizForSection(s.id)}
                                disabled={done || isLocked}
                                className={[
                                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px]",
                                  done
                                    ? "text-emerald-700 border-emerald-300/60 bg-emerald-50/60 dark:bg-emerald-950/25"
                                    : isLocked
                                    ? "text-muted-foreground cursor-not-allowed bg-white dark:bg-background/40"
                                    : "bg-white hover:bg-muted",
                                ].join(" ")}
                                title={done ? "Pytanie rozwiązane" : isLocked ? "Najpierw odblokuj sekcję" : "Kliknij, aby odpowiedzieć"}
                                aria-label="Pytanie kontrolne"
                              >
                                <HelpCircle className="h-3.5 w-3.5" />
                                {q.question.length > 72 ? q.question.slice(0, 69) + "…" : q.question}
                              </button>
                            )}
                          </div>

                          {/* Tytuł + Treść */}
                          <div className={contentVisualState}>
                            <h2 className="text-[22px] md:text-[26px] font-semibold tracking-tight m-0 mb-4">
                              {s.title || `Sekcja ${idx + 1}`}
                            </h2>

                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MDRenderers}>
                              {s.content}
                            </ReactMarkdown>
                          </div>

                          {/* Akcja */}
                          <div className="mt-6 flex justify-end">
                            <label
                              className={[
                                "inline-flex items-center gap-3",
                                isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                              ].join(" ")}
                              title={
                                isLocked
                                  ? "Najpierw ukończ poprzednie sekcje"
                                  : done
                                  ? "Sekcja odhaczona — klik, aby cofnąć"
                                  : q
                                  ? "Kliknij, aby odpowiedzieć na pytanie"
                                  : "Odhacz sekcję"
                              }
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={done}
                                onChange={() => !isLocked && handleCheckboxClick(idx)}
                                disabled={isLocked && !done}
                                aria-label={`Odhacz sekcję: ${s.title || `Sekcja ${idx + 1}`}`}
                              />
                              <span
                                className={[
                                  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-soft transition-all",
                                  done
                                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300/60 text-emerald-700 dark:text-emerald-300"
                                    : "bg-white hover:bg-muted border-neutral-200",
                                ].join(" ")}
                              >
                                {q && !done ? (
                                  <span className="truncate max-w-[56ch]">{q.question}</span>
                                ) : (
                                  <>
                                    {done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                                    <span className="whitespace-nowrap">
                                      {String(idx + 1).padStart(2, "0")} • {done ? "Odhaczono" : q ? "Odhacz (pytanie)" : "Odhacz sekcję"}
                                    </span>
                                  </>
                                )}
                              </span>
                            </label>
                          </div>
                        </div>
                        <div className="h-8" />
                      </div>
                    );
                  })
                ) : md ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MDRenderers}>
                    {md}
                  </ReactMarkdown>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: (lesson?.content as string) || "" }} />
                )}
              </div>

              {!!sections.length && (
                <div className="mt-10 flex justify-end">
                  <button
                    onClick={completeLesson}
                    className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium shadow-soft hover:bg-muted transition-colors disabled:opacity-60"
                    disabled={!allChecked}
                    title={!allChecked ? "Najpierw odhacz wszystkie sekcje" : undefined}
                  >
                    Zakończ lekcję
                  </button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* TOC */}
        <aside>
          <nav className="border rounded-[14px] p-4 bg-white dark:bg-background/60 lg:sticky lg:top-28">
            <h2 className="text-sm font-semibold mb-3">Spis treści</h2>
            {isLoading ? (
              <div className="h-4 w-40 rounded bg-muted/60 animate-pulse" />
            ) : sections.length ? (
              <ol className="space-y-1.5 text-sm">
                {sections.map((s, idx) => {
                  const done = !!sectionDone[s.id];
                  const isCurrent = !done && idx === firstUnreadIdx;
                  const unlocked = firstUnreadIdx === -1 || idx <= firstUnreadIdx;
                  const isLocked = !unlocked && !done;
                  
                  const scrollToSection = () => {
                    if (!isLocked) {
                      document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
                    }
                  };
                  
                  return (
                    <li key={s.id} className="flex items-center gap-1.5">
                      {isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : done ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Circle className="h-3.5 w-3.5" />
                      )}
                      <button
                        onClick={scrollToSection}
                        className={[
                          "flex-1 text-left px-2 py-1 rounded transition-colors",
                          isLocked ? "text-muted-foreground cursor-not-allowed" : "hover:bg-muted",
                          done ? "text-emerald-700" : "",
                          isCurrent ? "font-semibold underline" : "",
                        ].join(" ")}
                        disabled={isLocked}
                      >
                        {String(idx + 1).padStart(2, "0")}. {s.title || `Sekcja ${idx + 1}`}
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Brak sekcji.</p>
            )}
          </nav>
        </aside>
      </div>

      {activeQuiz && <QuizModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onPass={handlePassActiveQuiz} />}
      
      {showSummary && (
        <LessonSummary
          lessonTitle={lesson?.title || "Lekcja"}
          courseId={courseId!}
          timeSpent={Math.floor((Date.now() - startTime) / 1000)}
          sectionsCount={sections.length}
          quizzesCompleted={Object.keys(quizResults).length}
          pointsEarned={5}
          nextLessonPath={undefined}
        />
      )}
    </div>
  );
};

export default LessonView;