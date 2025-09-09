// src/pages/teacher/course-structure-wizard/CourseWizardStep1.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, AlertCircle, Info } from "lucide-react";
import {
  COURSE_STRUCTURE_SCHEMA,
  COURSE_ANALYSIS_OPERATION,
  COURSE_UI_TEXTS,
  COURSE_PATHS,
  COURSE_VALIDATION,
} from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";

export const CourseWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData } = useFormSchemaStore();
  const [courseType, setCourseType] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [curriculum, setCurriculum] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const llmAnalysis = useLLMOperation("course-structure-wizard", "analyze-course-requirements");
  const { steps, errors: errorTexts } = COURSE_UI_TEXTS;

  useEffect(() => {
    register(COURSE_STRUCTURE_SCHEMA);
    llmAnalysis.registerOperation(COURSE_ANALYSIS_OPERATION);

    return () => {
      llmAnalysis.unregisterOperation();
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courseType) {
      newErrors.courseType = "Wybierz typ kursu";
    }
    if (!subject.trim() || subject.length < COURSE_VALIDATION.subject.minLength) {
      newErrors.subject = COURSE_VALIDATION.subject.errorMessage;
    }
    if (!level) {
      newErrors.level = "Wybierz poziom kursu";
    }
    if (!duration) {
      newErrors.duration = "Wybierz czas trwania";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        courseType,
        subject: subject.trim(),
        level,
        duration,
        curriculum: curriculum.trim(),
      };
      
      setData("course-structure-wizard", formData);
      await llmAnalysis.executeOperation(formData);
      navigate(COURSE_PATHS.step2);
    } catch (error) {
      console.error(errorTexts.analysisError, error);
    }
  };

  // Pokaż pole podstawy programowej tylko dla kursów maturalnych i akademickich
  const showCurriculum = courseType === 'matura' || courseType === 'academic';

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={1} />

        <CardContent className="p-8">
          <StepsHeader
            title={steps[1].title}
            description={steps[1].description}
          />

          {llmAnalysis.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorTexts.analysisError} {llmAnalysis.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="courseType">Typ kursu</Label>
              <Select
                value={courseType}
                onValueChange={setCourseType}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.courseType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz typ kursu..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matura">Kurs maturalny</SelectItem>
                  <SelectItem value="academic">Kurs akademicki</SelectItem>
                  <SelectItem value="professional">Kurs zawodowy</SelectItem>
                  <SelectItem value="hobby">Kurs hobbystyczny</SelectItem>
                  <SelectItem value="certification">Kurs certyfikacyjny</SelectItem>
                </SelectContent>
              </Select>
              {errors.courseType && (
                <p className="text-sm text-red-600">{errors.courseType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Przedmiot/Dziedzina</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="np. Matematyka, Programowanie Python, Język angielski"
                disabled={llmAnalysis.loading}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Poziom kursu</Label>
              <Select
                value={level}
                onValueChange={setLevel}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.level ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz poziom..." />
                </SelectTrigger>
                <SelectContent>
                  {courseType === "matura" ? (
                    <>
                      <SelectItem value="basic">Podstawowy</SelectItem>
                      <SelectItem value="extended">Rozszerzony</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="beginner">Początkujący</SelectItem>
                      <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                      <SelectItem value="advanced">Zaawansowany</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-600">{errors.level}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Planowany czas trwania</Label>
              <Select
                value={duration}
                onValueChange={setDuration}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz czas trwania..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 miesiąc</SelectItem>
                  <SelectItem value="3months">3 miesiące</SelectItem>
                  <SelectItem value="6months">6 miesięcy</SelectItem>
                  <SelectItem value="1year">1 rok</SelectItem>
                  <SelectItem value="2years">2 lata</SelectItem>
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration}</p>
              )}
            </div>

            {showCurriculum && (
              <div className="space-y-2">
                <Label htmlFor="curriculum">
                  Podstawa programowa 
                  <span className="text-gray-500 text-sm ml-2">(opcjonalnie [TODO] uzupełnij DB o zarządzanie podstawą programową)</span>
                </Label>
                <Textarea
                  id="curriculum"
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value)}
                  placeholder={courseType === 'matura' 
                    ? "Wklej fragmenty podstawy programowej MEN, które chcesz uwzględnić w kursie..."
                    : "Wklej sylabus lub program nauczania..."
                  }
                  disabled={llmAnalysis.loading}
                  rows={4}
                  className="font-mono text-sm"
                />
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    {courseType === 'matura' 
                      ? "Dodanie podstawy programowej pomoże AI stworzyć kurs zgodny z wymaganiami egzaminacyjnymi."
                      : "Dodanie sylabusa pomoże AI lepiej dopasować tematy do wymagań uczelni."
                    }
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={llmAnalysis.loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              {llmAnalysis.loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {steps[1].loading}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {steps[1].button}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};