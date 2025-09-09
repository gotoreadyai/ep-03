import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import { useCreate, useList, BaseRecord } from "@refinedev/core";
import { Save, ArrowLeft, HelpCircle, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { StepsHero } from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  QUIZ_VALIDATION,
  QUIZ_UI_TEXTS,
  QUIZ_PATHS,
} from "./quizWizard.constants";
import { SubPage } from "@/components/layout";
import { toast } from "sonner";
import { Badge } from "@/components/ui";

interface Activity extends BaseRecord {
  id: number;
  position: number;
}

export const QuizWizardStep5: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const { mutate: createActivity } = useCreate();
  const { mutate: createQuestion } = useCreate();
  const formData = getData("quiz-wizard");

  const [finalTitle, setFinalTitle] = useState(formData.quizTitle || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { steps, errors: errorTexts } = QUIZ_UI_TEXTS;

  const { data: activitiesData } = useList<Activity>({
    resource: "activities",
    filters: [
      {
        field: "topic_id",
        operator: "eq",
        value: formData.topicId,
      },
    ],
    sorters: [
      {
        field: "position",
        order: "desc",
      },
    ],
    pagination: {
      pageSize: 1,
    },
    queryOptions: {
      enabled: !!formData.topicId,
    },
  });

  const nextPosition = activitiesData?.data?.[0]?.position 
    ? activitiesData.data[0].position + 1 
    : 1;

  useEffect(() => {
    if (!formData.courseId || !formData.topicId || !formData.questions) {
      toast.error("Brak danych z poprzednich kroków. Wracam do początku...");
      navigate(QUIZ_PATHS.step1);
    }
  }, [formData, navigate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!finalTitle.trim() || finalTitle.length < QUIZ_VALIDATION.quizTitle.minLength) {
      newErrors.finalTitle = QUIZ_VALIDATION.quizTitle.errorMessage;
    }
    if (!formData.questions || formData.questions.length === 0) {
      newErrors.questions = errorTexts.noQuestions;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setSaved(false);

    try {
      createActivity(
        {
          resource: "activities",
          values: {
            topic_id: parseInt(formData.topicId),
            type: "quiz",
            title: finalTitle.trim(),
            position: nextPosition,
            duration_min: formData.suggestedTime || formData.timeLimit || 30,
            is_published: false,
            passing_score: formData.passingScore,
            time_limit: formData.timeLimit || null,
            max_attempts: formData.maxAttempts || null,
          },
        },
        {
          onSuccess: async (activityData) => {
            const activityId = activityData.data.id;
 
            try {
              for (let index = 0; index < formData.questions.length; index++) {
                const question = formData.questions[index];
                await new Promise((resolve, reject) => {
                  createQuestion(
                    {
                      resource: "questions",
                      values: {
                        activity_id: activityId,
                        question: question.question,
                        explanation: question.explanation,
                        points: question.points,
                        position: index + 1,
                        options: question.options.map((opt: any, optIndex: number) => ({
                          id: optIndex + 1,
                          text: opt.text,
                          is_correct: opt.is_correct,
                        })),
                      },
                    },
                    {
                      onSuccess: resolve,
                      onError: reject,
                    }
                  );
                });
              }
 
              setData("quiz-wizard", {
                ...formData,
                finalTitle: finalTitle.trim(),
                activityId,
                saved: true,
              });
 
              setSaving(false);
              setSaved(true);
 
              const returnUrl = sessionStorage.getItem('returnUrl');

              setTimeout(() => {
                sessionStorage.removeItem('wizardContext');
                if (returnUrl) {
                  sessionStorage.removeItem('returnUrl');
                  navigate(returnUrl);
                } else {
                  navigate(`/teacher/courses/show/${formData.courseId}?expanded=${formData.topicId}`);
                }
              }, 1000);
            } catch (error) {
              setSaving(false);
              setSaved(false);
              console.error("Błąd podczas zapisywania pytań:", error);
              toast.error("Wystąpił błąd podczas zapisywania pytań. Spróbuj ponownie.");
            }
          },
          onError: (error: any) => {
            setSaving(false);
            setSaved(false);
            console.error(errorTexts.saveError, error);
            
            if (error?.code === '42501') {
              toast.error("Brak uprawnień do tworzenia quizów. Sprawdź swoje uprawnienia.");
            } else if (error?.code === '23505') {
              toast.error("Quiz o takiej nazwie już istnieje.");
            } else {
              toast.error(errorTexts.saveError);
            }
          },
        }
      );
    } catch (error) {
      setSaving(false);
      setSaved(false);
      console.error(errorTexts.unexpectedError, error);
      toast.error(errorTexts.unexpectedError);
    }
  };
 
  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={5} />
 
        <CardContent className="p-8">
          <StepsHeader
            title={
              <>
                <HelpCircle className="w-8 h-8 text-blue-600" />
                <span>{steps[5].title}</span>
              </>
            }
            description={steps[5].description}
          />
 
          {saved && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {steps[5].success}
              </AlertDescription>
            </Alert>
          )}
 
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Informacja o lokalizacji quizu */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Lokalizacja quizu:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Kurs:</strong> {formData.courseTitle}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Temat:</strong> {formData.topicTitle}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span><strong>Pozycja:</strong> {nextPosition}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
 
            {/* Tytuł quizu */}
            <div className="space-y-2">
              <Label htmlFor="finalTitle">
                Tytuł quizu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="finalTitle"
                type="text"
                value={finalTitle}
                onChange={(e) => setFinalTitle(e.target.value)}
                placeholder="Tytuł quizu"
                maxLength={QUIZ_VALIDATION.quizTitle.maxLength}
                className={errors.finalTitle ? "border-red-500" : ""}
              />
              {errors.finalTitle && (
                <p className="text-sm text-red-600">{errors.finalTitle}</p>
              )}
              <p className="text-sm text-gray-500">
                Możesz dostosować tytuł quizu przed zapisaniem
              </p>
            </div>
 
            {/* Podsumowanie quizu */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Podsumowanie quizu</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Liczba pytań:</span>
                    <span className="ml-2 font-medium">{formData.questions?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Próg zaliczenia:</span>
                    <span className="ml-2 font-medium">{formData.passingScore}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Limit czasu:</span>
                    <span className="ml-2 font-medium">
                      {formData.timeLimit ? `${formData.timeLimit} min` : "Brak"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Łączna liczba punktów:</span>
                    <span className="ml-2 font-medium">
                      {formData.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
 
            {/* Lista pytań (skrócona) */}
            <div className="space-y-2">
              <h4 className="font-medium">Pytania ({formData.questions?.length || 0})</h4>
              <Card className="max-h-64 overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-y-auto max-h-64">
                    {formData.questions?.map((question: any, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 hover:bg-gray-50 border-b"
                      >
                        <span className="text-sm truncate flex-1">
                          {index + 1}. {question.question}
                        </span>
                        <Badge variant="outline" className="ml-2">{question.points} pkt</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
 
            {/* Ostrzeżenie o edycji */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-800" />
              <AlertDescription className="text-yellow-800">
                Po zapisaniu będziesz mógł edytować pytania w panelu zarządzania quizem
              </AlertDescription>
            </Alert>
 
            {/* Informacja o zapisie */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                {steps[5].saveInfo}
              </AlertDescription>
            </Alert>
 
            <Separator />
 
            {/* Przyciski nawigacji */}
            <footer className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(QUIZ_PATHS.step4)}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Wstecz
              </Button>
 
              <Button
                type="submit"
                disabled={saving || saved}
                className="flex items-center gap-2 min-w-[160px] bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {steps[5].loading}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {steps[5].button}
                  </>
                )}
              </Button>
            </footer>
          </form>
        </CardContent>
      </Card>
    </SubPage>
  );
 };