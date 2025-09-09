import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import StepsHero from "./StepsHero";
import { Eye, FileText, BookOpen, Info } from "lucide-react";
import StepsHeader from "./StepsHeader";
import ReactMarkdown from "react-markdown";
import { MATERIAL_UI_TEXTS, MATERIAL_PATHS } from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const MaterialWizardStep4: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const formData = getData("educational-material-wizard");
  const { steps } = MATERIAL_UI_TEXTS;

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
            {/* Podsumowanie materiału */}
            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-lg mb-3">{formData.title}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-indigo-600">
                      {formData.materialType === 'lesson' ? 'Lekcja' : 
                       formData.materialType === 'source_material' ? 'Materiały źródłowe' : 
                       'Kontekst'}
                    </div>
                    <div className="text-sm text-gray-600">typ materiału</div>
                  </div>
                  <div className="text-center">
                    <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {formData.estimatedDuration}
                    </div>
                    <div className="text-sm text-gray-600">minut</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <h4 className="font-semibold text-lg">Treść materiału - podgląd</h4>

            {/* Treść materiału */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h5 className="font-medium">Główna treść</h5>
                  <Badge variant="secondary">
                    {formData.content?.length || 0} znaków
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="prose prose-sm max-w-none max-h-96 overflow-y-auto">
                  <ReactMarkdown>{formData.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {steps[4].info}
              </AlertDescription>
            </Alert>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={() => navigate(MATERIAL_PATHS.step3)}>
                Wstecz
              </Button>
              <Button 
                onClick={() => navigate(MATERIAL_PATHS.step5)}
                className="bg-purple-600 hover:bg-purple-700"
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