import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye, Check, X, HelpCircle, Clock, Info, Target } from "lucide-react";
import StepsHeader from "./StepsHeader";
import { QUIZ_UI_TEXTS, QUIZ_PATHS } from "./quizWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const QuizWizardStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("quiz-wizard");
  const { steps } = QUIZ_UI_TEXTS;

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "single": return "Jednokrotny wybór";
      case "multiple": return "Wielokrotny wybór";
      case "truefalse": return "Prawda/Fałsz";
      default: return type;
    }
  };

  const getQuestionTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "single": return "default" as const;
      case "multiple": return "secondary" as const;
      case "truefalse": return "outline" as const;
      default: return "default" as const;
    }
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={4} />
        <CardContent className="p-8">
          <StepsHeader
            title={
              <>
                <Eye className="w-8 h-8 text-blue-600" />
                <span>{steps[4].title}</span>
              </>
            }
            description={steps[4].description}
          />

          <div className="space-y-6">
            {/* Podsumowanie quizu */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-3">{formData.quizTitle}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <HelpCircle className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-indigo-600">
                      {formData.questions?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">pytań</div>
                  </div>
                  <div className="text-center">
                    <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {formData.passingScore}%
                    </div>
                    <div className="text-sm text-gray-600">próg zaliczenia</div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {formData.timeLimit || "∞"}
                    </div>
                    <div className="text-sm text-gray-600">minut</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Łącznie</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formData.questions?.reduce((sum: number, q: any) => sum + q.points, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">punktów</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h4 className="font-semibold text-lg">Lista pytań - podgląd</h4>

            {/* Lista pytań */}
            <div className="space-y-4">
              {formData.questions?.map((question: any, index: number) => (
                <Card key={index} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3">
                    <div className="flex items-start justify-between">
                      <h5 className="font-medium">
                        Pytanie {index + 1}
                      </h5>
                      <div className="flex gap-2">
                        <Badge variant={getQuestionTypeBadgeVariant(question.type)}>
                          {getQuestionTypeLabel(question.type)}
                        </Badge>
                        <Badge variant="outline">{question.points} pkt</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    <p className="text-gray-700">{question.question}</p>
                    
                    <div className="space-y-2">
                      {question.options?.map((option: any, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-2 p-2 rounded ${
                            option.is_correct
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50"
                          }`}
                        >
                          {option.is_correct ? (
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={option.is_correct ? "font-medium" : ""}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm">
                          <span className="font-medium">Wyjaśnienie:</span> {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {steps[4].info}
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(QUIZ_PATHS.step3)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(QUIZ_PATHS.step5)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Przejdź do zapisywania
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};