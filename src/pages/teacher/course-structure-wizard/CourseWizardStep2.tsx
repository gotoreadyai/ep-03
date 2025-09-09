// src/pages/teacher/course-structure-wizard/CourseWizardStep2.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Users, Target, Clock, BookOpen } from "lucide-react";

export const CourseWizardStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("course-structure-wizard");
  const { steps } = COURSE_UI_TEXTS;

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
                      Proponowany tytuł
                    </label>
                    <div className="text-lg font-semibold text-gray-900">
                      {formData.courseTitle}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Opis kursu
                    </label>
                    <div className="text-gray-800 whitespace-pre-wrap">
                      {formData.description}
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
                        <h4 className="font-medium text-gray-900 mb-2">Cele kursu</h4>
                        <ul className="space-y-1">
                          {formData.objectives?.map((objective: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">
                              • {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Grupa docelowa</h4>
                        <p className="text-sm text-gray-700">{formData.targetAudience}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formData.estimatedHours}</div>
                    <div className="text-sm text-gray-600">godzin</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{formData.topicsCount}</div>
                    <div className="text-sm text-gray-600">tematów</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Wymagania</h4>
                    {formData.prerequisites?.length > 0 ? (
                      <ul className="space-y-1">
                        {formData.prerequisites.map((prereq: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700">• {prereq}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-sm text-gray-500">Brak wymagań</span>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(COURSE_PATHS.step1)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(COURSE_PATHS.step3)}
                className="bg-purple-600 hover:bg-purple-700"
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