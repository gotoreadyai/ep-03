import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { useFormSchemaStore } from "@/utility/llmFormWizard";
import {
  Check,
  Eye,
  Edit3,
  RefreshCw,
  BookOpen,
  FileText,
  GraduationCap,
  Rocket,
  Clock,
  Target,
  Users,
  ArrowRight,
  Calendar,
} from "lucide-react";
import {
  MATERIAL_UI_TEXTS,
  MATERIAL_PATHS,
} from "./educationalMaterialWizard.constants";
import { SubPage } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const MaterialWizardDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getData } = useFormSchemaStore();
  const materialData = getData("educational-material-wizard");
  const { dashboard } = MATERIAL_UI_TEXTS;

  const hasSavedMaterial = materialData && materialData.title;

  return (
    <SubPage>
      <Lead title={dashboard.title} description={dashboard.description} />

      <div className="space-y-6">
      {/* Główne akcje */}
<div className="grid md:grid-cols-2 gap-4 mb-6">
  {/* Nowy materiał */}
  <Card 
    className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-purple-400 flex flex-col"
    onClick={() => navigate(MATERIAL_PATHS.step1)}
  >
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Rocket className="w-8 h-8 text-purple-600" />
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
      <CardTitle>Stwórz nowy materiał</CardTitle>
      <CardDescription>
        Wygeneruj kompletny materiał edukacyjny z pomocą AI
      </CardDescription>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      <div className="flex flex-wrap gap-4 text-sm flex-1">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600" />
          <span>5-10 minut</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Pełna treść</span>
        </div>
      </div>
      <div className="mt-auto pt-4">
        <div className="inline-flex items-center text-sm font-medium text-purple-600">
          Rozpocznij tworzenie
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Funkcje AI */}
  <Card className="hover:shadow-lg transition-all border-2 border-gray-200 flex flex-col">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      <CardTitle>Funkcje AI</CardTitle>
      <CardDescription>Co potrafi kreator materiałów</CardDescription>
    </CardHeader>
    <CardContent className="flex-1">
      <div className="space-y-2">
        {dashboard.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</div>

        {/* Ostatni materiał */}
        {hasSavedMaterial && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-gray-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Ostatni materiał</CardTitle>
                  <CardDescription>
                    Kontynuuj pracę nad materiałem
                  </CardDescription>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Wygenerowany
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tytuł materiału</p>
                  <p className="font-medium text-gray-900">
                    {materialData.title}
                  </p>
                </div>

                {materialData.subject && (
                  <div>
                    <p className="text-sm text-gray-600">Temat</p>
                    <p className="text-gray-900">{materialData.subject}</p>
                  </div>
                )}

                {materialData.targetLevel && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {materialData.targetLevel === "beginner"
                          ? "Początkujący"
                          : materialData.targetLevel === "intermediate"
                          ? "Średni"
                          : "Zaawansowany"}
                      </div>
                      <div className="text-sm text-gray-600">poziom</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {materialData.estimatedDuration || 30}
                      </div>
                      <div className="text-sm text-gray-600">minut</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => navigate(MATERIAL_PATHS.step4)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(MATERIAL_PATHS.step5)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(MATERIAL_PATHS.step1)}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Nowy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Przydatne linki */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-200 group"
            onClick={() => navigate("/teacher/courses")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Kursy</CardTitle>
              <CardDescription>Zobacz wszystkie kursy</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-200 group"
            onClick={() => navigate("/teacher/course-structure")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Generator kursów</CardTitle>
              <CardDescription>Kreator struktury</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-green-200 group"
            onClick={() => navigate("/teacher/quiz-wizard")}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">Quizy</CardTitle>
              <CardDescription>Kreator quizów</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                Kliknij aby przejść →
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SubPage>
  );
};
