// src/pages/teacher/course-structure-wizard/CourseWizardStep3.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Info } from "lucide-react";
import {
  STRUCTURE_GENERATION_OPERATION,
  COURSE_UI_TEXTS,
  COURSE_PATHS,
  COURSE_VALIDATION,
  CourseFormData,
} from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardStep3: React.FC = () => {
  const navigate = useNavigate();
  const { getData, setData } = useFormSchemaStore();
  const formData = getData("course-structure-wizard") as CourseFormData;

  const [courseTitle, setCourseTitle] = useState(formData.courseTitle || "");
  const [description, setDescription] = useState(formData.description || "");
  const [topicsPerWeek, setTopicsPerWeek] = useState(2);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmGeneration = useLLMOperation(
    "course-structure-wizard",
    "generate-course-structure"
  );
  const { steps, errors: errorTexts } = COURSE_UI_TEXTS;

  useEffect(() => {
    llmGeneration.registerOperation(STRUCTURE_GENERATION_OPERATION);
    return () => {
      llmGeneration.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !courseTitle.trim() ||
      courseTitle.length < COURSE_VALIDATION.courseTitle.minLength
    ) {
      newErrors.courseTitle = COURSE_VALIDATION.courseTitle.errorMessage;
    }
    if (
      !description.trim() ||
      description.length < COURSE_VALIDATION.description.minLength
    ) {
      newErrors.description = COURSE_VALIDATION.description.errorMessage;
    }
    if (
      !topicsPerWeek ||
      topicsPerWeek < COURSE_VALIDATION.topicsPerWeek.min ||
      topicsPerWeek > COURSE_VALIDATION.topicsPerWeek.max
    ) {
      newErrors.topicsPerWeek = COURSE_VALIDATION.topicsPerWeek.errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    try {
      const updatedData = {
        ...formData,
        courseTitle: courseTitle.trim(),
        description: description.trim(),
        topicsPerWeek,
      };

      setData("course-structure-wizard", updatedData);
      await llmGeneration.executeOperation(updatedData);
      navigate(COURSE_PATHS.step4);
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
              <Label htmlFor="courseTitle">
                Tytuł kursu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="np. Matematyka - Przygotowanie do matury"
                className={errors.courseTitle ? "border-red-500" : ""}
              />
              {errors.courseTitle && (
                <p className="text-sm text-red-600">{errors.courseTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Opis kursu <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Szczegółowy opis kursu..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500">
                {description.length} / {COURSE_VALIDATION.description.minLength} znaków minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topicsPerWeek">
                Liczba tematów na tydzień <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topicsPerWeek"
                type="number"
                value={topicsPerWeek}
                onChange={(e) => setTopicsPerWeek(parseInt(e.target.value) || 0)}
                min={COURSE_VALIDATION.topicsPerWeek.min}
                max={COURSE_VALIDATION.topicsPerWeek.max}
                className={errors.topicsPerWeek ? "border-red-500" : ""}
              />
              {errors.topicsPerWeek && (
                <p className="text-sm text-red-600">{errors.topicsPerWeek}</p>
              )}
              <p className="text-sm text-gray-500">
                Określa tempo realizacji kursu
              </p>
            </div>

            {llmGeneration.loading && (
              <Alert className="bg-purple-50 border-purple-200">
                <Info className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  {steps[3].loadingInfo}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(COURSE_PATHS.step2)}>
                Wstecz
              </Button>

              <Button 
                onClick={handleNext} 
                disabled={llmGeneration.loading}
                className="bg-purple-600 hover:bg-purple-700"
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