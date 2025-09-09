import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info } from "lucide-react";
import {
  QUIZ_GENERATION_OPERATION,
  QUIZ_FROM_MATERIAL_OPERATION,
  QUIZ_UI_TEXTS,
  QUIZ_PATHS,
  QUIZ_VALIDATION,
} from "./quizWizard.constants";
import { SubPage } from "@/components/layout";

export const QuizWizardStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("quiz-wizard");
  
  const [quizTitle, setQuizTitle] = useState(formData.quizTitle || "");
  const [passingScore, setPassingScore] = useState(formData.passingScore || 70);
  const [timeLimit, setTimeLimit] = useState(formData.timeLimit || "");
  const [maxAttempts, setMaxAttempts] = useState(formData.maxAttempts || "");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showExplanations, setShowExplanations] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmGeneration = useLLMOperation(
    "quiz-wizard", 
    formData.basedOnMaterial ? "generate-quiz-from-material" : "generate-quiz-questions"
  );
  const { steps, errors: errorTexts } = QUIZ_UI_TEXTS;

  useEffect(() => {
    const operation = formData.basedOnMaterial 
      ? QUIZ_FROM_MATERIAL_OPERATION 
      : QUIZ_GENERATION_OPERATION;
    
    llmGeneration.registerOperation(operation);

    return () => {
      llmGeneration.unregisterOperation();
    };
  }, [formData.basedOnMaterial]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!quizTitle.trim() || quizTitle.length < QUIZ_VALIDATION.quizTitle.minLength) {
      newErrors.quizTitle = QUIZ_VALIDATION.quizTitle.errorMessage;
    }
    if (!passingScore || passingScore < QUIZ_VALIDATION.passingScore.min || passingScore > QUIZ_VALIDATION.passingScore.max) {
      newErrors.passingScore = QUIZ_VALIDATION.passingScore.errorMessage;
    }
    if (timeLimit && (parseInt(timeLimit) < QUIZ_VALIDATION.timeLimit.min || parseInt(timeLimit) > QUIZ_VALIDATION.timeLimit.max)) {
      newErrors.timeLimit = QUIZ_VALIDATION.timeLimit.errorMessage;
    }
    if (maxAttempts && (parseInt(maxAttempts) < QUIZ_VALIDATION.maxAttempts.min || parseInt(maxAttempts) > QUIZ_VALIDATION.maxAttempts.max)) {
      newErrors.maxAttempts = QUIZ_VALIDATION.maxAttempts.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      const updatedData = {
        ...formData,
        quizTitle: quizTitle.trim(),
        passingScore,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        maxAttempts: maxAttempts ? parseInt(maxAttempts) : null,
        shuffleQuestions,
        showExplanations,
      };
      
      setData("quiz-wizard", updatedData);
      await llmGeneration.executeOperation(updatedData);
      navigate(QUIZ_PATHS.step4);
    } catch (error) {
      console.error(errorTexts.generationError, error);
    }
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={3} />
        <CardContent className="p-8">
          <StepsHeader
            title={steps[3].title}
            description={steps[3].description}
          />

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quizTitle">
                Tytuł quizu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quizTitle"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="np. Test wiedzy - Zmienne i typy danych"
                className={errors.quizTitle ? "border-red-500" : ""}
              />
              {errors.quizTitle && (
                <p className="text-sm text-red-600">{errors.quizTitle}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passingScore">
                  Próg zaliczenia (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="passingScore"
                  type="number"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                  min={QUIZ_VALIDATION.passingScore.min}
                  max={QUIZ_VALIDATION.passingScore.max}
                  className={errors.passingScore ? "border-red-500" : ""}
                />
                {errors.passingScore && (
                  <p className="text-sm text-red-600">{errors.passingScore}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Limit czasu (min)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="Pozostaw puste dla braku limitu"
                  min={QUIZ_VALIDATION.timeLimit.min}
                  max={QUIZ_VALIDATION.timeLimit.max}
                  className={errors.timeLimit ? "border-red-500" : ""}
                />
                {errors.timeLimit && (
                  <p className="text-sm text-red-600">{errors.timeLimit}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Maksymalna liczba podejść</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                placeholder="Pozostaw puste dla nieograniczonej liczby"
                min={QUIZ_VALIDATION.maxAttempts.min}
                max={QUIZ_VALIDATION.maxAttempts.max}
                className={errors.maxAttempts ? "border-red-500" : ""}
              />
              {errors.maxAttempts && (
                <p className="text-sm text-red-600">{errors.maxAttempts}</p>
              )}
            </div>

            <Card className="border-gray-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleQuestions"
                    checked={shuffleQuestions}
                    onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
                  />
                  <label htmlFor="shuffleQuestions" className="text-sm cursor-pointer">
                    Losowa kolejność pytań
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showExplanations"
                    checked={showExplanations}
                    onCheckedChange={(checked) => setShowExplanations(checked as boolean)}
                  />
                  <label htmlFor="showExplanations" className="text-sm cursor-pointer">
                    Pokazuj wyjaśnienia po odpowiedzi
                  </label>
                </div>
              </CardContent>
            </Card>

            {formData.basedOnMaterial && (
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Uwaga:</strong> Pytania będą generowane wyłącznie z treści materiału "{formData.materialTitle}".
                  AI utworzy tylko pytania, na które odpowiedzi znajdują się w materiale.
                </AlertDescription>
              </Alert>
            )}

            {llmGeneration.loading && (
              <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  {formData.basedOnMaterial 
                    ? "⚡ AI analizuje materiał i generuje pytania na podstawie jego treści..."
                    : steps[3].loadingInfo}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => navigate(QUIZ_PATHS.step2)}
              >
                Wstecz
              </Button>

              <Button
                onClick={handleNext}
                disabled={llmGeneration.loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {llmGeneration.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {steps[3].loading}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {steps[3].button}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};