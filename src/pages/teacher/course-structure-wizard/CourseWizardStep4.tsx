// src/pages/teacher/course-structure-wizard/CourseWizardStep4.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye, Calendar, BookOpen, Info } from "lucide-react";
import StepsHeader from "./StepsHeader";
import { COURSE_UI_TEXTS, COURSE_PATHS } from "./courseStructureWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CourseWizardStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("course-structure-wizard");
  const { steps } = COURSE_UI_TEXTS;

  const structure = formData.structure || [];

  return (
    <SubPage>
      <Card className="border-2 shadow-lg">
        <StepsHero step={4} />
        <CardContent className="p-8">
          <StepsHeader
            title={
              <>
                <Eye className="w-8 h-8 text-purple-600" />
                <span>{steps[4].title}</span>
              </>
            }
            description={steps[4].description}
          />

          <div className="space-y-6">
            {/* Podsumowanie kursu */}
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-3">{formData.courseTitle}</h4>
                <p className="text-gray-600 mb-6">{formData.description}</p>
                
                {formData.summary && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-indigo-600">
                        {structure.length || formData.summary.totalWeeks}
                      </div>
                      <div className="text-sm text-gray-600">tygodni</div>
                    </div>
                    <div className="text-center">
                      <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                      {structure.reduce((sum: number, week: { topics: { length: number }[] }) => sum + week.topics.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">tematów</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <h4 className="font-semibold text-lg">Struktura kursu - podgląd</h4>
            
            {/* Struktura kursu - TYLKO PODGLĄD */}
            <div className="space-y-4">
              {structure?.map((week: any, weekIndex: number) => (
                <Card key={weekIndex} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <h5 className="font-medium">Tydzień {week.weekNumber}</h5>
                      <Badge variant="secondary">
                        {week.topics.length} {week.topics.length === 1 ? "temat" : "tematów"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 space-y-3">
                    {week.topics.map((topic: any, topicIndex: number) => (
                      <div key={topicIndex} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-200">
                        <h6 className="font-medium text-gray-900 mb-2">{topic.title}</h6>
                        {topic.description && (
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Po utworzeniu kursu będziesz mógł dodawać nowe tematy w dowolnym momencie korzystając z generatora AI.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(COURSE_PATHS.step3)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(COURSE_PATHS.step5)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Przejdź do utworzenia kursu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubPage>
  );
};