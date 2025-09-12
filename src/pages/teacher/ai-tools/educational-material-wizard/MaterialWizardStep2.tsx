import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import StepsHeader from "./StepsHeader";
import { MATERIAL_UI_TEXTS, MATERIAL_PATHS } from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, Target } from "lucide-react";

export const MaterialWizardStep2: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const { steps } = MATERIAL_UI_TEXTS;

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
                      {formData.subject}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Cele nauczania
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
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Informacje</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Czas trwania:</strong> {formData.estimatedDuration} minut</p>
                          <p><strong>Poziom:</strong> {
                            formData.targetLevel === 'beginner' ? 'Początkujący' : 
                            formData.targetLevel === 'intermediate' ? 'Średniozaawansowany' : 
                            'Zaawansowany'
                          }</p>
                          <p><strong>Grupa wiekowa:</strong> {formData.ageGroup}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Wymagania wstępne</h4>
                  {formData.prerequisites?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.prerequisites.map((prereq: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Brak wymagań wstępnych</span>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(MATERIAL_PATHS.step1)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(MATERIAL_PATHS.step3)}
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