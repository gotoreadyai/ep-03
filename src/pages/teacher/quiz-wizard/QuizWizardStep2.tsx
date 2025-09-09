import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { QUIZ_UI_TEXTS, QUIZ_PATHS } from "./quizWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, Target, FileText, Calendar } from "lucide-react";

export const QuizWizardStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("quiz-wizard");
  const { steps } = QUIZ_UI_TEXTS;

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "Łatwy";
      case "medium": return "Średni";
      case "hard": return "Trudny";
      default: return difficulty;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "single": return "Jednokrotny wybór";
      case "multiple": return "Wielokrotny wybór";
      case "truefalse": return "Prawda/Fałsz";
      default: return type;
    }
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={2} />
        <CardContent className="p-8">
          <StepsHeader
            title={steps[2].title}
            description={steps[2].description}
          />

          <div className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {steps[2].success}
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Temat
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.topic}
                    </div>
                  </div>

                  {/* Informacja o materiale źródłowym jeśli istnieje */}
                  {formData.basedOnMaterial && formData.materialTitle && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Materiał źródłowy
                      </label>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-800">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{formData.materialTitle}</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          Pytania będą generowane wyłącznie z treści tego materiału
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Cele sprawdzające
                    </label>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {formData.learningObjectives}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-purple-200 bg-purple-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Kluczowe zagadnienia</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.keyTopics?.map((topic: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {topic}
                            </span>
                          ))}
                        </div>
                        {formData.basedOnMaterial && (
                          <p className="text-xs text-gray-500 mt-2">
                            * Zagadnienia wyodrębnione z materiału źródłowego
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Parametry quizu</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Poziom:</strong> {getDifficultyLabel(formData.difficulty)}</p>
                          <p><strong>Liczba pytań:</strong> {formData.questionsCount}</p>
                          <p><strong>Typy pytań:</strong> {formData.questionTypes?.map((type: string) => getQuestionTypeLabel(type)).join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formData.suggestedTime}</div>
                    <div className="text-sm text-gray-600">minut</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formData.passingScore}%</div>
                    <div className="text-sm text-gray-600">próg zaliczenia</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Lokalizacja</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{formData.courseTitle}</p>
                      <p className="text-xs">→ {formData.topicTitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(QUIZ_PATHS.step1)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(QUIZ_PATHS.step3)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Kontynuuj
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};