import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormSchemaStore, useLLMOperation } from "@/utility/llmFormWizard";
import { useList, BaseRecord } from "@refinedev/core";
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
import { Sparkles, AlertCircle, Info, BookOpen } from "lucide-react";
import {
  EDUCATIONAL_MATERIAL_SCHEMA,
  TOPIC_ANALYSIS_OPERATION,
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
  MATERIAL_VALIDATION,
} from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";

interface Course extends BaseRecord {
  id: number;
  title: string;
  icon_emoji?: string;
  is_published: boolean;
  topics?: Topic[];
}

interface Topic extends BaseRecord {
  id: number;
  title: string;
  position: number;
  course_id: number;
  is_published: boolean;
}

export const MaterialWizardStep1: React.FC = () => {
  const navigate = useNavigate();
  const { register, setData, getData } = useFormSchemaStore();
  
  const existingData = getData("educational-material-wizard");
  
  const [courseId, setCourseId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [subject, setSubject] = useState("");
  const [targetLevel, setTargetLevel] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contextInfo, setContextInfo] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const llmAnalysis = useLLMOperation("educational-material-wizard", "analyze-topic");
  const { steps, errors: errorTexts } = MATERIAL_UI_TEXTS;

  const { data: coursesData, isLoading: coursesLoading } = useList<Course>({
    resource: "courses",
    meta: {
      select: "*, topics(*)",
    },
    sorters: [
      {
        field: "created_at",
        order: "desc",
      },
    ],
  });

  const selectedCourse = coursesData?.data?.find(c => c.id.toString() === courseId);
  const topics = selectedCourse?.topics || [];

  useEffect(() => {
    register(EDUCATIONAL_MATERIAL_SCHEMA);
    llmAnalysis.registerOperation(TOPIC_ANALYSIS_OPERATION);

    return () => {
      llmAnalysis.unregisterOperation();
    };
  }, []);

  useEffect(() => {
    if (!isInitialized && coursesData?.data) {
      let initialCourseId = "";
      let initialTopicId = "";
      let initialSubject = "";
      
      const contextStr = sessionStorage.getItem('wizardContext');
      if (contextStr) {
        try {
          const context = JSON.parse(contextStr);
          setContextInfo(context);
          
          if (context.courseId) {
            initialCourseId = context.courseId.toString();
          }
          if (context.topicId) {
            initialTopicId = context.topicId.toString();
          }
          if (context.topicTitle) {
            initialSubject = context.topicTitle;
          }
        } catch (e) {
          console.error("Error parsing wizard context:", e);
        }
      }
      
      if (!initialCourseId && existingData) {
        if (existingData.courseId) {
          initialCourseId = existingData.courseId.toString();
        }
        if (existingData.topicId) {
          initialTopicId = existingData.topicId.toString();
        }
        if (existingData.subject) {
          initialSubject = existingData.subject;
        }
        if (existingData.targetLevel) {
          setTargetLevel(existingData.targetLevel);
        }
        if (existingData.ageGroup) {
          setAgeGroup(existingData.ageGroup);
        }
      }
      
      if (initialCourseId) setCourseId(initialCourseId);
      if (initialTopicId) setTopicId(initialTopicId);
      if (initialSubject) setSubject(initialSubject);
      
      setIsInitialized(true);
    }
  }, [coursesData, isInitialized, existingData]);

  useEffect(() => {
    if (topicId && topics.length > 0) {
      const selectedTopic = topics.find(t => t.id.toString() === topicId);
      if (selectedTopic) {
        setSubject(selectedTopic.title);
      }
    }
  }, [topicId, topics]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!courseId) {
      newErrors.courseId = "Wybierz kurs";
    }
    if (!topicId) {
      newErrors.topicId = "Wybierz temat z kursu";
    }
    if (!subject.trim() || subject.length < MATERIAL_VALIDATION.subject.minLength) {
      newErrors.subject = MATERIAL_VALIDATION.subject.errorMessage;
    }
    if (!targetLevel) {
      newErrors.targetLevel = "Wybierz poziom zaawansowania";
    }
    if (!ageGroup) {
      newErrors.ageGroup = "Wybierz grupę wiekową";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    try {
      const formData = {
        courseId: parseInt(courseId),
        topicId: parseInt(topicId),
        subject: subject.trim(),
        targetLevel,
        ageGroup,
        courseTitle: selectedCourse?.title,
        topicTitle: topics.find(t => t.id.toString() === topicId)?.title,
      };
      
      setData("educational-material-wizard", formData);
      await llmAnalysis.executeOperation(formData);
      navigate(MATERIAL_PATHS.step2);
    } catch (error) {
      console.error(errorTexts.analysisError, error);
    }
  };

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={1} />

        <CardContent className="p-8">
          <StepsHeader
            title={steps[1].title}
            description={steps[1].description}
          />

          {contextInfo && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Tworzysz materiał dla: <strong>{contextInfo.courseTitle}</strong>
                {contextInfo.topicTitle && (
                  <> → <strong>{contextInfo.topicTitle}</strong></>
                )}
              </AlertDescription>
            </Alert>
          )}

          {llmAnalysis.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorTexts.analysisError} {llmAnalysis.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Wybór kursu i tematu */}
            <Card className="border-2 border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Wybierz miejsce w kursie</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseId">
                      Kurs <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={courseId}
                      onValueChange={(value) => {
                        setCourseId(value);
                        setTopicId("");
                        setSubject("");
                      }}
                      disabled={llmAnalysis.loading || coursesLoading}
                    >
                      <SelectTrigger className={errors.courseId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Wybierz kurs..." />
                      </SelectTrigger>
                      <SelectContent>
                        {coursesData?.data?.map((course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            <div className="flex items-center gap-2">
                              {course.icon_emoji && <span>{course.icon_emoji}</span>}
                              <span>{course.title}</span>
                              {!course.is_published && (
                                <span className="text-xs text-muted-foreground">(szkic)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.courseId && (
                      <p className="text-sm text-red-600">{errors.courseId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topicId">
                      Temat <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={topicId}
                      onValueChange={setTopicId}
                      disabled={!courseId || llmAnalysis.loading}
                    >
                      <SelectTrigger className={errors.topicId ? "border-red-500" : ""}>
                        <SelectValue placeholder={courseId ? "Wybierz temat..." : "Najpierw wybierz kurs..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {topics
                          .sort((a, b) => a.position - b.position)
                          .map((topic) => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{topic.position}. {topic.title}</span>
                                {topic.is_published === false && (
                                  <span className="text-xs text-muted-foreground">(szkic)</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.topicId && (
                      <p className="text-sm text-red-600">{errors.topicId}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Szczegóły materiału */}
            <div className="space-y-2">
              <Label htmlFor="subject">Temat materiału</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="np. Wprowadzenie do programowania w Python"
                disabled={llmAnalysis.loading}
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-red-600">{errors.subject}</p>
              )}
              <p className="text-sm text-gray-500">
                Możesz dostosować temat materiału lub pozostawić sugerowany
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLevel">Poziom zaawansowania</Label>
              <Select
                value={targetLevel}
                onValueChange={setTargetLevel}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.targetLevel ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz poziom..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Początkujący</SelectItem>
                  <SelectItem value="intermediate">Średniozaawansowany</SelectItem>
                  <SelectItem value="advanced">Zaawansowany</SelectItem>
                </SelectContent>
              </Select>
              {errors.targetLevel && (
                <p className="text-sm text-red-600">{errors.targetLevel}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">Grupa wiekowa</Label>
              <Select
                value={ageGroup}
                onValueChange={setAgeGroup}
                disabled={llmAnalysis.loading}
              >
                <SelectTrigger className={errors.ageGroup ? "border-red-500" : ""}>
                  <SelectValue placeholder="Wybierz grupę wiekową..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-10">7-10 lat (szkoła podstawowa)</SelectItem>
                  <SelectItem value="11-14">11-14 lat (klasy 4-8)</SelectItem>
                  <SelectItem value="15-18">15-18 lat (szkoła średnia)</SelectItem>
                  <SelectItem value="18+">18+ (dorośli)</SelectItem>
                </SelectContent>
              </Select>
              {errors.ageGroup && (
                <p className="text-sm text-red-600">{errors.ageGroup}</p>
              )}
            </div>

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