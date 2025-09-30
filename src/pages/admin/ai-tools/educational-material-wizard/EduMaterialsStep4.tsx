// src/pages/admin/ai-tools/educational-material-wizard/EduMaterialsStep4.tsx
import { useState } from "react";
import { useList, useUpdate } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { SubPage } from "@/components/layout";
import { Lead } from "@/components/reader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Button, 
  Alert, 
  AlertDescription,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from "@/components/ui";
import { 
  HelpCircle, 
  Plus, 
  Loader2, 
  CheckCircle,
  Eye,
  FileText,
  RefreshCw,
  Save,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { callLLM } from "@/utility/llmService";
import { toast } from "sonner";
import YAML from "yaml";
import { MaterialContentRenderer } from "@/pages/teacher/activities/components/MaterialContentRenderer";
import { CourseSelector } from "../CourseSelector";


// Typy
type Activity = {
  id: number;
  topic_id: number;
  title: string;
  content: string;
  type: string;
  is_published: boolean;
  position: number;
  duration_min?: number;
  created_at: string;
  updated_at?: string;
  topics?: {
    title: string;
    position: number;
    courses?: {
      title: string;
    };
  };
};

type Quiz = {
  question: string;
  options: string[];
  answerIndex: number;
};

type GeneratingState = {
  activityId: number | null;
  sectionId: string | null;
};

// Schema dla generowania pytania
const QUIZ_SCHEMA = {
  type: "object",
  properties: {
    question: { type: "string", required: true },
    options: { 
      type: "array", 
      items: { type: "string" },
      minItems: 4,
      maxItems: 4,
      required: true 
    },
    answerIndex: { 
      type: "number", 
      minimum: 0,
      maximum: 3,
      required: true 
    },
    explanation: { type: "string" }
  }
};

export function EduMaterialsStep4() {
  const navigate = useNavigate();
  const { mutate: updateActivity } = useUpdate();
  
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [expandedActivity, setExpandedActivity] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, string | null>>({});
  const [generating, setGenerating] = useState<GeneratingState>({ 
    activityId: null, 
    sectionId: null 
  });
  const [savingActivity, setSavingActivity] = useState<number | null>(null);
  
  // Modal podglądu materiału
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    activity: Activity | null;
  }>({
    open: false,
    activity: null
  });
  
  // Modal quizu
  const [quizModal, setQuizModal] = useState<{
    open: boolean;
    quiz: Quiz | null;
    activityId: number | null;
    sectionId: string | null;
    sectionTitle: string | null;
    sectionContent: string | null;
  }>({
    open: false,
    quiz: null,
    activityId: null,
    sectionId: null,
    sectionTitle: null,
    sectionContent: null
  });

  // Pobierz tematy dla wybranego kursu
  const { data: topicsData } = useList({
    resource: "topics",
    filters: selectedCourseId ? [
      { field: "course_id", operator: "eq", value: selectedCourseId }
    ] : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 500 },
    queryOptions: { enabled: !!selectedCourseId }
  });

  // Pobierz materiały dla wybranego tematu
  const { data: activitiesData, refetch: refetchActivities } = useList<Activity>({
    resource: "activities",
    filters: selectedTopicId ? [
      { field: "topic_id", operator: "eq", value: selectedTopicId },
      { field: "type", operator: "eq", value: "material" }
    ] : [],
    sorters: [{ field: "position", order: "asc" }],
    pagination: { pageSize: 100 },
    meta: {
      select: "*, topics(title, position, courses(title))"
    },
    queryOptions: { enabled: !!selectedTopicId }
  });

  // Parsowanie sekcji z materiału
  const parseContentSections = (content: string) => {
    const sections = content.split(/\n(?=##\s+)/g);
    return sections.map((section, index) => {
      const titleMatch = section.match(/^##\s+(.+?)$/m);
      const title = titleMatch ? titleMatch[1].trim() : `Sekcja ${index + 1}`;
      const cleanContent = section.replace(/^##\s+.+?\n/, "").trim();
      const id = title.toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, "-").replace(/(^-|-$)/g, "") || `section-${index}`;
      
      // Sprawdź czy sekcja zawiera już quiz
      const hasQuiz = /```quiz[\s\S]*?```/g.test(cleanContent);
      
      return { id, title, content: cleanContent, hasQuiz };
    });
  };

  // Parsowanie istniejących quizów
  const extractQuizFromSection = (content: string): Quiz | null => {
    const quizMatch = content.match(/```quiz\s*?\n([\s\S]*?)```/);
    if (!quizMatch) return null;
    
    try {
      const yamlContent = quizMatch[1];
      const parsed = YAML.parse(yamlContent) as Quiz;
      if (parsed.question && Array.isArray(parsed.options) && typeof parsed.answerIndex === 'number') {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse quiz:", e);
    }
    
    return null;
  };

  // Toggle sekcji (accordion)
  const toggleSection = (activityId: number, sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [activityId]: prev[activityId] === sectionId ? null : sectionId
    }));
  };

  // Generowanie pytania kontrolnego
  const generateQuiz = async (
    activity: Activity, 
    sectionId: string, 
    sectionTitle: string,
    sectionContent: string
  ) => {
    setGenerating({ activityId: activity.id, sectionId });
    
    try {
      const prompt = `
Jesteś ekspertem od tworzenia pytań kontrolnych do materiałów edukacyjnych.

KONTEKST LEKCJI:
- Tytuł materiału: ${activity.title}
- Kurs: ${activity.topics?.courses?.title || "Kurs"}
- Temat: ${activity.topics?.title || "Temat"}

SEKCJA DO KTÓREJ TWORZYSZ PYTANIE:
- Tytuł sekcji: ${sectionTitle}
- Treść sekcji:
"""
${sectionContent}
"""

WYTYCZNE:
1. Pytanie MUSI sprawdzać zrozumienie KLUCZOWEGO konceptu z tej konkretnej sekcji
2. Pytanie powinno być jasne i jednoznaczne
3. Opcje odpowiedzi powinny być wiarygodne (dystraktory podobne do poprawnej odpowiedzi)
4. Poziom trudności: średni (nie za łatwe, nie za trudne)
5. Unikaj pytań typu "wszystkie powyższe" lub "żadne z powyższych"
6. Pytanie powinno testować ZROZUMIENIE, nie pamięć faktów
7. Język pytania dopasuj do wieku uczniów (liceum/technikum)

WAŻNE:
- answerIndex to indeks poprawnej odpowiedzi (0-3)
- options to dokładnie 4 opcje odpowiedzi
- explanation to krótkie wyjaśnienie dlaczego ta odpowiedź jest poprawna

Wygeneruj jedno pytanie kontrolne w formacie JSON.
      `.trim();

      const result = await callLLM(prompt, QUIZ_SCHEMA);
      
      if (result && result.question && result.options && typeof result.answerIndex === 'number') {
        setQuizModal({
          open: true,
          quiz: {
            question: result.question,
            options: result.options,
            answerIndex: result.answerIndex
          },
          activityId: activity.id,
          sectionId,
          sectionTitle,
          sectionContent
        });
      } else {
        throw new Error("Nieprawidłowa struktura wygenerowanego pytania");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Nie udało się wygenerować pytania");
    } finally {
      setGenerating({ activityId: null, sectionId: null });
    }
  };

  // Zapisywanie pytania do materiału
  const saveQuizToActivity = async () => {
    if (!quizModal.quiz || !quizModal.activityId || !quizModal.sectionId) return;
    
    setSavingActivity(quizModal.activityId);
    
    try {
      const activity = activitiesData?.data?.find(a => a.id === quizModal.activityId);
      if (!activity) throw new Error("Nie znaleziono aktywności");
      
      const sections = parseContentSections(activity.content);
      const sectionIndex = sections.findIndex(s => s.id === quizModal.sectionId);
      
      if (sectionIndex === -1) throw new Error("Nie znaleziono sekcji");
      
      const quizYaml = `\`\`\`quiz
question: "${quizModal.quiz.question}"
options:
${quizModal.quiz.options.map(opt => `  - "${opt}"`).join('\n')}
answerIndex: ${quizModal.quiz.answerIndex}
\`\`\``;
      
      let newContent = activity.content;
      const sectionParts = newContent.split(/\n(?=##\s+)/g);
      
      if (sectionParts[sectionIndex]) {
        sectionParts[sectionIndex] = sectionParts[sectionIndex].replace(/```quiz[\s\S]*?```/g, '');
        sectionParts[sectionIndex] = sectionParts[sectionIndex].trim() + '\n\n' + quizYaml;
      }
      
      newContent = sectionParts.join('\n');
      
      await new Promise<void>((resolve, reject) => {
        updateActivity(
          {
            resource: "activities",
            id: quizModal.activityId!.toString(),
            values: { content: newContent }
          },
          {
            onSuccess: () => {
              toast.success("Pytanie kontrolne zostało dodane!");
              setQuizModal({
                open: false,
                quiz: null,
                activityId: null,
                sectionId: null,
                sectionTitle: null,
                sectionContent: null
              });
              refetchActivities();
              resolve();
            },
            onError: (error) => {
              console.error("Error updating activity:", error);
              reject(error);
            }
          }
        );
      });
      
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error("Nie udało się zapisać pytania");
    } finally {
      setSavingActivity(null);
    }
  };

  // Otwórz modal podglądu
  const handlePreview = (activity: Activity) => {
    setPreviewModal({
      open: true,
      activity
    });
  };

  return (
    <SubPage>
      <Lead 
        title="Krok 4 (opcjonalny)" 
        description="Dodaj pytania kontrolne do wygenerowanych materiałów" 
      />

      <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
        {/* Panel wyboru */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Wybór materiałów</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CourseSelector
              value={selectedCourseId}
              onChange={(courseId) => {
                setSelectedCourseId(courseId);
                setSelectedTopicId(null);
                setExpandedActivity(null);
                setExpandedSections({});
              }}
              label="Kurs"
              showAlert={false}
            />

            {selectedCourseId && (
              <div>
                <label className="text-xs font-medium mb-1 block">Temat</label>
                <select
                  value={selectedTopicId || ""}
                  onChange={(e) => {
                    setSelectedTopicId(e.target.value ? Number(e.target.value) : null);
                    setExpandedActivity(null);
                    setExpandedSections({});
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Wybierz temat</option>
                  {(topicsData?.data || []).map((topic: any) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.position}. {topic.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedTopicId && activitiesData?.data && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Znaleziono <strong>{activitiesData.data.length}</strong> materiałów
                </AlertDescription>
              </Alert>
            )}

            <Button
              variant="outline"
              onClick={() => navigate("/admin/educational-material")}
              className="w-full"
              size="sm"
            >
              Powrót do panelu
            </Button>
          </CardContent>
        </Card>

        {/* Lista materiałów */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Materiały do uzupełnienia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTopicId ? (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Wybierz kurs i temat aby zobaczyć materiały</p>
              </div>
            ) : !activitiesData?.data?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Brak materiałów w wybranym temacie</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activitiesData.data.map((activity) => {
                  const sections = parseContentSections(activity.content);
                  const quizCount = sections.filter(s => s.hasQuiz).length;
                  const isExpanded = expandedActivity === activity.id;
                  
                  return (
                    <div
                      key={activity.id}
                      className="rounded-lg border overflow-hidden"
                    >
                      {/* Nagłówek materiału */}
                      <button
                        onClick={() => setExpandedActivity(isExpanded ? null : activity.id)}
                        className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{activity.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {sections.length} sekcji
                              </span>
                              {quizCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <HelpCircle className="w-3 h-3 mr-1" />
                                  {quizCount} {quizCount === 1 ? 'pytanie' : 'pytań'}
                                </Badge>
                              )}
                              {activity.is_published && (
                                <Badge variant="default" className="text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Opublikowany
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight 
                            className={`w-5 h-5 text-muted-foreground transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </button>
                      
                      {/* Rozwinięta treść */}
                      {isExpanded && (
                        <div className="border-t">
                          <Tabs defaultValue="sections" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b">
                              <TabsTrigger value="sections">Sekcje i pytania</TabsTrigger>
                              <TabsTrigger value="preview">Podgląd</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="sections" className="p-4 space-y-3">
                              {sections.map((section) => {
                                const existingQuiz = extractQuizFromSection(section.content);
                                const isGenerating = generating.activityId === activity.id && 
                                                   generating.sectionId === section.id;
                                const isSectionExpanded = expandedSections[activity.id] === section.id;
                                
                                return (
                                  <div
                                    key={section.id}
                                    className="rounded-lg border overflow-hidden"
                                  >
                                    {/* Nagłówek sekcji */}
                                    <div className="flex items-start justify-between p-3 gap-3">
                                      <button
                                        onClick={() => toggleSection(activity.id, section.id)}
                                        className="flex-1 flex items-start gap-2 text-left hover:opacity-70 transition-opacity"
                                      >
                                        {isSectionExpanded ? (
                                          <ChevronDown className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                        )}
                                        <div className="flex-1">
                                          <h4 className="font-medium text-sm">{section.title}</h4>
                                          {existingQuiz && (
                                            <Badge variant="secondary" className="text-xs mt-1">
                                              <HelpCircle className="w-3 h-3 mr-1" />
                                              Zawiera pytanie
                                            </Badge>
                                          )}
                                        </div>
                                      </button>
                                      
                                      <div className="flex-shrink-0">
                                        {existingQuiz ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => generateQuiz(activity, section.id, section.title, section.content)}
                                            disabled={isGenerating}
                                          >
                                            {isGenerating ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <RefreshCw className="w-3 h-3" />
                                            )}
                                            <span className="ml-1">Zamień</span>
                                          </Button>
                                        ) : (
                                          <Button
                                            size="sm"
                                            onClick={() => generateQuiz(activity, section.id, section.title, section.content)}
                                            disabled={isGenerating}
                                          >
                                            {isGenerating ? (
                                              <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <Plus className="w-3 h-3" />
                                            )}
                                            <span className="ml-1">Dodaj pytanie</span>
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Rozwinięta treść sekcji (accordion) */}
                                    {isSectionExpanded && (
                                      <div className="border-t bg-muted/30">
                                        <ScrollArea className="max-h-[300px]">
                                          <div className="p-4">
                                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {section.content.replace(/```quiz[\s\S]*?```/g, '')}
                                              </ReactMarkdown>
                                            </div>
                                            
                                            {existingQuiz && (
                                              <div className="mt-4 p-3 bg-background rounded-lg border">
                                                <div className="flex items-start gap-2">
                                                  <HelpCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                                  <div className="flex-1">
                                                    <p className="font-medium text-sm mb-2">{existingQuiz.question}</p>
                                                    <div className="space-y-1">
                                                      {existingQuiz.options.map((opt, idx) => (
                                                        <div 
                                                          key={idx}
                                                          className={`text-xs p-2 rounded ${
                                                            idx === existingQuiz.answerIndex 
                                                              ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 font-medium' 
                                                              : 'bg-muted'
                                                          }`}
                                                        >
                                                          {idx + 1}. {opt}
                                                          {idx === existingQuiz.answerIndex && ' ✓'}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </ScrollArea>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </TabsContent>
                            
                            <TabsContent value="preview" className="p-4">
                              <Button
                                variant="outline"
                                className="w-full mb-4"
                                onClick={() => handlePreview(activity)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Otwórz podgląd w pełnym oknie
                              </Button>
                              
                              <ScrollArea className="h-[400px] rounded-lg border p-4">
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {activity.content}
                                  </ReactMarkdown>
                                </div>
                              </ScrollArea>
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal podglądu materiału */}
      <Dialog open={previewModal.open} onOpenChange={(open) => {
        if (!open) {
          setPreviewModal({ open: false, activity: null });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewModal.activity?.title}</DialogTitle>
            <DialogDescription>
              {previewModal.activity?.topics?.courses?.title} → {previewModal.activity?.topics?.title}
            </DialogDescription>
          </DialogHeader>
          
          {previewModal.activity && (
            <MaterialContentRenderer
              content={previewModal.activity.content}
              metadata={{
                duration_min: previewModal.activity.duration_min,
                position: previewModal.activity.position,
                created_at: previewModal.activity.created_at,
                updated_at: previewModal.activity.updated_at
              }}
              showMetadata={true}
              height="500px"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal z quizem */}
      <Dialog open={quizModal.open} onOpenChange={(open) => {
        if (!open && !savingActivity) {
          setQuizModal({
            open: false,
            quiz: null,
            activityId: null,
            sectionId: null,
            sectionTitle: null,
            sectionContent: null
          });
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Wygenerowane pytanie kontrolne</DialogTitle>
            <DialogDescription>
              Sekcja: {quizModal.sectionTitle}
            </DialogDescription>
          </DialogHeader>
          
          {quizModal.quiz && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="font-medium mb-3">{quizModal.quiz.question}</p>
                <div className="space-y-2">
                  {quizModal.quiz.options.map((option, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded ${
                        idx === quizModal.quiz?.answerIndex 
                          ? 'bg-green-100 dark:bg-green-900/30 border border-green-300' 
                          : ''
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        idx === quizModal.quiz?.answerIndex 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {idx === quizModal.quiz?.answerIndex && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Kod YAML (do wstawienia):</p>
                <div className="rounded-lg border bg-background p-3 font-mono text-xs overflow-x-auto">
                  <pre>{`\`\`\`quiz
question: "${quizModal.quiz.question}"
options:
${quizModal.quiz.options.map(opt => `  - "${opt}"`).join('\n')}
answerIndex: ${quizModal.quiz.answerIndex}
\`\`\``}</pre>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setQuizModal({
                    open: false,
                    quiz: null,
                    activityId: null,
                    sectionId: null,
                    sectionTitle: null,
                    sectionContent: null
                  })}
                  disabled={savingActivity !== null}
                >
                  Anuluj
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (quizModal.activityId && quizModal.sectionId && quizModal.sectionTitle && quizModal.sectionContent) {
                      const activity = activitiesData?.data?.find(a => a.id === quizModal.activityId);
                      if (activity) {
                        generateQuiz(activity, quizModal.sectionId, quizModal.sectionTitle, quizModal.sectionContent);
                      }
                    }
                  }}
                  disabled={savingActivity !== null}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Wygeneruj ponownie
                </Button>
                <Button
                  onClick={saveQuizToActivity}
                  disabled={savingActivity !== null}
                >
                  {savingActivity ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Zapisywanie...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Zapisz pytanie
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SubPage>
  );
}